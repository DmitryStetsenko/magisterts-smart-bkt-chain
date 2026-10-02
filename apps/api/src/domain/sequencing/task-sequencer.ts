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
    });

    if (currentActiveSkill) {
      // Find tasks for current active skill
      const skillTasks = tasks.filter((t) => t.skillId === currentActiveSkill.id);
      const uncompletedTask = skillTasks.find((t) => !completedSet.has(t.id));
      const targetTask = uncompletedTask || skillTasks[0];

      return {
        recommendedSkill: currentActiveSkill,
        recommendedTask: targetTask,
        reason: uncompletedTask ? 'PRACTICE_CURRENT_SKILL' : 'REVIEW_COMPLETED',
        currentMastery: studentStates[currentActiveSkill.id] ?? 0,
      };
    }

    // 3. If all unlocked skills are mastered, pick the next unlocked skill in DAG order
    const nextMasteredSkill = unlockedSkills[unlockedSkills.length - 1] || skills[0];
    const skillTasks = tasks.filter((t) => t.skillId === nextMasteredSkill.id);
    const uncompletedTask = skillTasks.find((t) => !completedSet.has(t.id));
    const targetTask = uncompletedTask || skillTasks[0];

    return {
      recommendedSkill: nextMasteredSkill,
      recommendedTask: targetTask,
      reason: 'ADVANCE_NEXT_SKILL',
      currentMastery: studentStates[nextMasteredSkill.id] ?? 0,
    };
  }
}
