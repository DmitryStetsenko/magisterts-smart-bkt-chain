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
   * Recommends the next optimal task for a student based on skill graph DAG and BKT mastery state
   */
  public static recommendNextTask(params: {
    skills: SkillNodeDomain[];
    studentStates: Record<string, number>; // skillId -> pMastery
    tasks: TaskDomain[];
    completedTaskIds: string[];
  }): SequencingRecommendation | null {
    const { skills, studentStates, tasks, completedTaskIds } = params;

    if (!skills.length || !tasks.length) {
      return null;
    }

    const completedSet = new Set(completedTaskIds);

    // 1. Find all skills whose dependencies are met (unlocked skills)
    const isSkillUnlocked = (skill: SkillNodeDomain): boolean => {
      if (!skill.parentSkillIds || skill.parentSkillIds.length === 0) {
        return true; // Root skill in DAG
      }
      return skill.parentSkillIds.every((parentId) => {
        const parentMastery = studentStates[parentId] ?? 0;
        return BktEngine.isMastered(parentMastery);
      });
    };

    const unlockedSkills = skills.filter(isSkillUnlocked);

    // 2. Look for the first unlocked skill that is NOT yet mastered
    const currentActiveSkill = unlockedSkills.find((skill) => {
      const mastery = studentStates[skill.id] ?? 0;
      return !BktEngine.isMastered(mastery);
    });

    if (currentActiveSkill) {
      const activeSkillTasks = tasks.filter((t) => t.skillId === currentActiveSkill.id);
      if (activeSkillTasks.length > 0) {
        const uncompletedInActive = activeSkillTasks.find((t) => !completedSet.has(t.id));

        if (!uncompletedInActive) {
          // All tasks in active module completed, but mastery is still < 0.95
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
          recommendedTask: uncompletedInActive,
          reason: 'PRACTICE_CURRENT_SKILL',
          currentMastery: studentStates[currentActiveSkill.id] ?? 0,
          isExhausted: false,
        };
      }
    }

    // 3. Fallback: If all unlocked skills are mastered, check if any remaining unlocked skills have uncompleted tasks
    for (const unlockedSkill of unlockedSkills) {
      const sTasks = tasks.filter((t) => t.skillId === unlockedSkill.id);
      const uncompleted = sTasks.find((t) => !completedSet.has(t.id));
      if (uncompleted) {
        return {
          recommendedSkill: unlockedSkill,
          recommendedTask: uncompleted,
          reason: 'PRACTICE_CURRENT_SKILL',
          currentMastery: studentStates[unlockedSkill.id] ?? 0,
        };
      }
    }

    // 4. Ultimate Fallback: All unlocked skills are mastered. Review completed tasks from unlocked skills.
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
