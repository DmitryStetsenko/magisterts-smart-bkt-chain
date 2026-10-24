import { BktEngine } from '../bkt/bkt-engine';

export interface SkillNodeDomain {
  id: string;
  slug: string;
  title: string;
  parentSkillIds: string[];
}

export interface TaskDomain {
  id: string;
  skillId: string;
  title: string;
  difficulty: string;
  taskType?: string | null;
  topic?: string | null;
  subConcept?: string | null;
}

export interface StudentSkillState {
  skillId: string;
  pMastery: number;
}

export interface SequencingRecommendation {
  recommendedSkill: SkillNodeDomain;
  recommendedTask: TaskDomain;
  reason: 'PRACTICE_CURRENT_SKILL' | 'ADVANCE_NEXT_SKILL' | 'REVIEW_COMPLETED' | 'MODULE_TASKS_EXHAUSTED';
  currentMastery: number;
  isExhausted?: boolean;
  isDifficultyDegraded?: boolean;
  maxScoreCap?: number; // e.g. 70 for degraded level, 100 for standard
}

export class TaskSequencer {
  /**
   * Recommends the next optimal task for a student based on skill graph DAG,
   * BKT mastery state (0.75 Bloom Proficient threshold), topic matching, modality consistency, and difficulty scaling.
   */
  public static recommendNextTask(params: {
    skills: SkillNodeDomain[];
    studentStates: Record<string, number>; // skillId -> pMastery
    tasks: TaskDomain[];
    completedTaskIds: string[];
    preferredTopic?: string | null;
    preferredDifficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
    preferredTaskType?: string | null;
    excludeTaskId?: string | null;
  }): SequencingRecommendation | null {
    const {
      skills,
      studentStates,
      tasks,
      completedTaskIds,
      preferredTopic,
      preferredDifficulty,
      preferredTaskType,
      excludeTaskId,
    } = params;

    if (!skills.length || !tasks.length) {
      return null;
    }

    const completedSet = new Set(completedTaskIds);

    // 1. Find all skills whose dependencies are met (unlocked skills)
    // In accordance with Bloom's Mastery Learning theory, 0.75 (isProficient) unlocks next nodes
    const isSkillUnlocked = (skill: SkillNodeDomain): boolean => {
      if (!skill.parentSkillIds || skill.parentSkillIds.length === 0) {
        return true; // Root skill in DAG
      }
      return skill.parentSkillIds.every((parentId) => {
        const parentMastery = studentStates[parentId] ?? 0;
        return BktEngine.isProficient(parentMastery);
      });
    };

    const unlockedSkills = skills.filter(isSkillUnlocked);

    // 2. Determine current active skill:
    // A module remains active while it is either:
    // a) not yet proficient (< 0.75), OR
    // b) has uncompleted tasks and has not yet achieved mastery (>= 0.90)
    // This prevents premature leaps to next module while student is still learning the current module!
    const currentActiveSkill = unlockedSkills.find((skill) => {
      const mastery = studentStates[skill.id] ?? 0;
      if (!BktEngine.isProficient(mastery)) return true;
      if (BktEngine.isMastered(mastery)) return false; // >= 0.90 Mastery: allow advancing to next module
      // If proficient (0.75 - 0.89), check if this skill still has uncompleted tasks
      const skillTasks = tasks.filter((t) => t.skillId === skill.id);
      const hasUncompleted = skillTasks.some((t) => !completedSet.has(t.id));
      return hasUncompleted;
    }) || unlockedSkills[0];

    // Helper: sort/pick task by difficulty priority and topic relevance
    const pickBestTask = (skillTasks: TaskDomain[]): TaskDomain | undefined => {
      // Filter uncompleted tasks, also excluding the currently failed/excluded task
      const uncompleted = skillTasks.filter(
        (t) => !completedSet.has(t.id) && (!excludeTaskId || t.id !== excludeTaskId)
      );

      // If graceful degradation to EASY was requested:
      if (preferredDifficulty === 'EASY') {
        // Modality Guard: if student struggled on a quiz, do NOT fallback to a CODE task!
        const matchesModality = (t: TaskDomain): boolean => {
          if (!preferredTaskType) return true;
          const isQuiz = (type?: string | null) => type === 'SINGLE_CHOICE' || type === 'MULTIPLE_CHOICE';
          if (isQuiz(preferredTaskType)) {
            return isQuiz(t.taskType);
          }
          return t.taskType === preferredTaskType;
        };

        // 1. First priority: uncompleted EASY task on preferredTopic matching modality
        if (preferredTopic) {
          const sameTopicEasy = uncompleted.find(
            (t) => t.topic === preferredTopic && t.difficulty === 'EASY' && matchesModality(t)
          );
          if (sameTopicEasy) return sameTopicEasy;
        }

        // 2. Second priority: any uncompleted EASY task in this active skill module matching modality
        const skillEasy = uncompleted.find((t) => t.difficulty === 'EASY' && matchesModality(t));
        if (skillEasy) return skillEasy;

        // 3. Third priority (Remediation / Review): if student previously completed the topic's EASY task matching modality,
        // re-offer it as an auxiliary remediation review drill (excluding current failed task)
        if (preferredTopic) {
          const topicEasyReview = skillTasks.find(
            (t) => t.topic === preferredTopic && t.difficulty === 'EASY' && matchesModality(t) && (!excludeTaskId || t.id !== excludeTaskId)
          );
          if (topicEasyReview) return topicEasyReview;
        }

        // 4. Fourth priority: any EASY task in this module matching modality for remediation review
        const moduleEasyReview = skillTasks.find(
          (t) => t.difficulty === 'EASY' && matchesModality(t) && (!excludeTaskId || t.id !== excludeTaskId)
        );
        if (moduleEasyReview) return moduleEasyReview;
      }

      if (uncompleted.length === 0) return undefined;

      // 1. If preferredTopic is provided, prioritize tasks on the same topic
      if (preferredTopic) {
        const sameTopic = uncompleted.filter((t) => t.topic === preferredTopic);
        if (sameTopic.length > 0) {
          if (preferredDifficulty) {
            const exactDiff = sameTopic.find((t) => t.difficulty === preferredDifficulty);
            if (exactDiff) return exactDiff;
          }
          return sameTopic[0];
        }
      }

      // 2. If preferredDifficulty is specified, try to find task with that difficulty across this skill
      if (preferredDifficulty) {
        const matchDiff = uncompleted.find((t) => t.difficulty === preferredDifficulty);
        if (matchDiff) return matchDiff;
      }

      // 3. Sequential Topic-First & Cognitive Triad Progression:
      // Tasks are ordered naturally by topic sequence in the syllabus, progressing EASY -> MEDIUM -> HARD
      // This guarantees that a student begins with knowledge verification (EASY), then applies skills (MEDIUM), then masters them (HARD).
      const diffOrder: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
      return uncompleted.sort((a, b) => {
        // If topics differ, maintain original syllabus order of tasks
        if (a.topic && b.topic && a.topic !== b.topic) {
          return 0;
        }
        return (diffOrder[a.difficulty] || 2) - (diffOrder[b.difficulty] || 2);
      })[0];
    };

    if (currentActiveSkill) {
      const activeSkillTasks = tasks.filter((t) => t.skillId === currentActiveSkill.id);
      if (activeSkillTasks.length > 0) {
        const recommendedTask = pickBestTask(activeSkillTasks);

        if (!recommendedTask) {
          const mastery = studentStates[currentActiveSkill.id] ?? 0;
          if (!BktEngine.isProficient(mastery)) {
            // All tasks in active module completed, but mastery is still < 0.75
            return {
              recommendedSkill: currentActiveSkill,
              recommendedTask: activeSkillTasks[0],
              reason: 'MODULE_TASKS_EXHAUSTED',
              currentMastery: mastery,
              isExhausted: true,
            };
          }
        } else {
          const isDegraded = preferredDifficulty === 'EASY' && recommendedTask.difficulty === 'EASY';

          return {
            recommendedSkill: currentActiveSkill,
            recommendedTask,
            reason: 'PRACTICE_CURRENT_SKILL',
            currentMastery: studentStates[currentActiveSkill.id] ?? 0,
            isExhausted: false,
            isDifficultyDegraded: isDegraded,
            maxScoreCap: isDegraded ? 70 : 100,
          };
        }
      }
    }

    // 3. Fallback: If current active module has all tasks done, check remaining unlocked skills that have uncompleted tasks
    for (const unlockedSkill of unlockedSkills) {
      const sTasks = tasks.filter((t) => t.skillId === unlockedSkill.id);
      const recommendedTask = pickBestTask(sTasks);
      if (recommendedTask) {
        const isDegraded = preferredDifficulty === 'EASY' && recommendedTask.difficulty === 'EASY';
        return {
          recommendedSkill: unlockedSkill,
          recommendedTask,
          reason: 'ADVANCE_NEXT_SKILL',
          currentMastery: studentStates[unlockedSkill.id] ?? 0,
          isDifficultyDegraded: isDegraded,
          maxScoreCap: isDegraded ? 70 : 100,
        };
      }
    }

    // 4. Ultimate Fallback: All unlocked skills are proficient & completed. Review completed tasks from unlocked skills.
    const lastUnlocked = unlockedSkills[unlockedSkills.length - 1] || skills[0];
    const lastSkillTasks = tasks.filter((t) => t.skillId === lastUnlocked.id);
    const fallbackTask = lastSkillTasks[0] || tasks[0];

    return {
      recommendedSkill: lastUnlocked,
      recommendedTask: fallbackTask,
      reason: 'REVIEW_COMPLETED',
      currentMastery: studentStates[lastUnlocked.id] ?? 0,
    };
  }
}
