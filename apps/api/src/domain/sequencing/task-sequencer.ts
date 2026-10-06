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
  reason: 'PRACTICE_CURRENT_SKILL' | 'ADVANCE_NEXT_SKILL' | 'REVIEW_COMPLETED';
  currentMastery: number;
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
    }) || unlockedSkills[unlockedSkills.length - 1] || skills[0];

    // Try finding an uncompleted task in the current active skill
    const activeSkillTasks = tasks.filter((t) => t.skillId === currentActiveSkill.id);
    const uncompletedInActive = activeSkillTasks.find((t) => !completedSet.has(t.id));

    if (uncompletedInActive) {
      return {
        recommendedSkill: currentActiveSkill,
        recommendedTask: uncompletedInActive,
        reason: 'PRACTICE_CURRENT_SKILL',
        currentMastery: studentStates[currentActiveSkill.id] ?? 0,
      };
    }

    // If all tasks in currentActiveSkill are completed, search across all unlocked skills for any uncompleted task
    for (const unlockedSkill of unlockedSkills) {
      const sTasks = tasks.filter((t) => t.skillId === unlockedSkill.id);
      const uncompleted = sTasks.find((t) => !completedSet.has(t.id));
      if (uncompleted) {
        return {
          recommendedSkill: unlockedSkill,
          recommendedTask: uncompleted,
          reason: 'ADVANCE_NEXT_SKILL',
          currentMastery: studentStates[unlockedSkill.id] ?? 0,
        };
      }
    }

    // Search across ALL skills in course for any uncompleted task
    const anyUncompleted = tasks.find((t) => !completedSet.has(t.id));
    if (anyUncompleted) {
      const targetSkill = skills.find((s) => s.id === anyUncompleted.skillId) || currentActiveSkill;
      return {
        recommendedSkill: targetSkill,
        recommendedTask: anyUncompleted,
        reason: 'ADVANCE_NEXT_SKILL',
        currentMastery: studentStates[targetSkill.id] ?? 0,
      };
    }

    // Fallback: All tasks in the course are completed
    const fallbackTask = activeSkillTasks[0] || tasks[0];
    return {
      recommendedSkill: currentActiveSkill,
      recommendedTask: fallbackTask,
      reason: 'REVIEW_COMPLETED',
      currentMastery: studentStates[currentActiveSkill.id] ?? 0,
    };
  }
}
