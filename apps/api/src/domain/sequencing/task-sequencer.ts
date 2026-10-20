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
}

export class TaskSequencer {
  /**
   * Recommends the next optimal task for a student based on skill graph DAG,
   * BKT mastery state (0.75 Bloom Proficient threshold), topic matching and difficulty scaling.
   */
  public static recommendNextTask(params: {
    skills: SkillNodeDomain[];
    studentStates: Record<string, number>; // skillId -> pMastery
    tasks: TaskDomain[];
    completedTaskIds: string[];
    preferredTopic?: string | null;
    preferredDifficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
  }): SequencingRecommendation | null {
    const { skills, studentStates, tasks, completedTaskIds, preferredTopic, preferredDifficulty } = params;

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

    // 2. Look for the first unlocked skill that is NOT yet proficient (mastery < 0.75)
    const currentActiveSkill = unlockedSkills.find((skill) => {
      const mastery = studentStates[skill.id] ?? 0;
      return !BktEngine.isProficient(mastery);
    });

    // Helper: sort/pick task by difficulty priority and topic relevance
    const pickBestTask = (skillTasks: TaskDomain[]): TaskDomain | undefined => {
      const uncompleted = skillTasks.filter((t) => !completedSet.has(t.id));
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

      // 2. If preferredDifficulty is specified, try to find task with that difficulty
      if (preferredDifficulty) {
        const matchDiff = uncompleted.find((t) => t.difficulty === preferredDifficulty);
        if (matchDiff) return matchDiff;
      }

      // 3. Natural order: EASY -> MEDIUM -> HARD progression
      const diffWeight: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3 };
      return uncompleted.sort((a, b) => (diffWeight[a.difficulty] || 2) - (diffWeight[b.difficulty] || 2))[0];
    };

    if (currentActiveSkill) {
      const activeSkillTasks = tasks.filter((t) => t.skillId === currentActiveSkill.id);
      if (activeSkillTasks.length > 0) {
        const recommendedTask = pickBestTask(activeSkillTasks);

        if (!recommendedTask) {
          // All tasks in active module completed, but mastery is still < 0.75
          return {
            recommendedSkill: currentActiveSkill,
            recommendedTask: activeSkillTasks[0],
            reason: 'MODULE_TASKS_EXHAUSTED',
            currentMastery: studentStates[currentActiveSkill.id] ?? 0,
            isExhausted: true,
          };
        }

        return {
          recommendedSkill: currentActiveSkill,
          recommendedTask,
          reason: 'PRACTICE_CURRENT_SKILL',
          currentMastery: studentStates[currentActiveSkill.id] ?? 0,
          isExhausted: false,
        };
      }
    }

    // 3. Fallback: If all unlocked skills are proficient, check if any remaining unlocked skills have uncompleted tasks
    for (const unlockedSkill of unlockedSkills) {
      const sTasks = tasks.filter((t) => t.skillId === unlockedSkill.id);
      const recommendedTask = pickBestTask(sTasks);
      if (recommendedTask) {
        return {
          recommendedSkill: unlockedSkill,
          recommendedTask,
          reason: 'PRACTICE_CURRENT_SKILL',
          currentMastery: studentStates[unlockedSkill.id] ?? 0,
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
