import { TaskSequencer, SkillNodeDomain, TaskDomain } from './task-sequencer';

describe('TaskSequencer (Adaptive Task Sequencing Engine)', () => {
  const skills: SkillNodeDomain[] = [
    { id: 's1', slug: 'js-basics', title: 'Модуль 1: Основи JS', parentSkillIds: [] },
    { id: 's2', slug: 'js-arrays', title: 'Модуль 2: Масиви', parentSkillIds: ['s1'] },
    { id: 's3', slug: 'js-async', title: 'Модуль 3: Асинхронність', parentSkillIds: ['s2'] },
  ];

  const tasks: TaskDomain[] = [
    { id: 't1_1', skillId: 's1', title: 'Сума двох чисел', difficulty: 'EASY' },
    { id: 't1_2', skillId: 's1', title: 'Перевірка парності', difficulty: 'EASY' },
    { id: 't2_1', skillId: 's2', title: 'Фільтрація парних', difficulty: 'MEDIUM' },
    { id: 't3_1', skillId: 's3', title: 'Async user fetch', difficulty: 'HARD' },
  ];

  it('should recommend task from first skill (js-basics) when student has no mastery yet', () => {
    const studentStates = { s1: 0.5, s2: 0, s3: 0 };
    const recommendation = TaskSequencer.recommendNextTask({
      skills,
      studentStates,
      tasks,
      completedTaskIds: [],
    });

    expect(recommendation).not.toBeNull();
    expect(recommendation?.recommendedSkill.slug).toBe('js-basics');
    expect(recommendation?.recommendedTask.id).toBe('t1_1');
    expect(recommendation?.reason).toBe('PRACTICE_CURRENT_SKILL');
  });

  it('should advance to Module 2 (js-arrays) when Module 1 reaches P(L) >= 0.95', () => {
    const studentStates = { s1: 0.96, s2: 0.2, s3: 0 };
    const recommendation = TaskSequencer.recommendNextTask({
      skills,
      studentStates,
      tasks,
      completedTaskIds: ['t1_1', 't1_2'],
    });

    expect(recommendation).not.toBeNull();
    expect(recommendation?.recommendedSkill.slug).toBe('js-arrays');
    expect(recommendation?.recommendedTask.id).toBe('t2_1');
    expect(recommendation?.reason).toBe('PRACTICE_CURRENT_SKILL');
  });

  it('should advance to Module 3 (js-async) when Module 2 reaches P(L) >= 0.95', () => {
    const studentStates = { s1: 0.98, s2: 0.96, s3: 0.1 };
    const recommendation = TaskSequencer.recommendNextTask({
      skills,
      studentStates,
      tasks,
      completedTaskIds: ['t1_1', 't1_2', 't2_1'],
    });

    expect(recommendation).not.toBeNull();
    expect(recommendation?.recommendedSkill.slug).toBe('js-async');
    expect(recommendation?.recommendedTask.id).toBe('t3_1');
  });

  it('should not recommend the same failed task when degrading difficulty with excludeTaskId', () => {
    const topicTasks: TaskDomain[] = [
      { id: 't_easy', skillId: 's1', title: 'Оголошення const', difficulty: 'EASY', topic: 'variables' },
      { id: 't_med', skillId: 's1', title: 'Область видимості let', difficulty: 'MEDIUM', topic: 'variables' },
      { id: 't_hard', skillId: 's1', title: 'Temporal Dead Zone', difficulty: 'HARD', topic: 'variables' },
    ];

    // Student has completed EASY task, but failed MEDIUM task and clicked auxiliary task
    const recommendation = TaskSequencer.recommendNextTask({
      skills,
      studentStates: { s1: 0.4 },
      tasks: topicTasks,
      completedTaskIds: ['t_easy'],
      preferredTopic: 'variables',
      preferredDifficulty: 'EASY',
      excludeTaskId: 't_med',
    });

    expect(recommendation).not.toBeNull();
    // Must NOT be the failed medium task!
    expect(recommendation?.recommendedTask.id).not.toBe('t_med');
    // Must provide auxiliary EASY remediation review task
    expect(recommendation?.recommendedTask.id).toBe('t_easy');
    expect(recommendation?.isDifficultyDegraded).toBe(true);
    expect(recommendation?.maxScoreCap).toBe(70);
  });

  it('should strictly avoid falling back to CODE tasks when degrading from a failed quiz (Fallback Modality Guard)', () => {
    const mixedTasks: TaskDomain[] = [
      { id: 't_quiz_failed', skillId: 's1', title: 'Quiz: const syntax', difficulty: 'MEDIUM', taskType: 'SINGLE_CHOICE', topic: 'variables' },
      { id: 't_code_easy', skillId: 's1', title: 'Code: declare variable', difficulty: 'EASY', taskType: 'CODE', topic: 'variables' },
      { id: 't_code_med', skillId: 's1', title: 'Code: calculate sum', difficulty: 'MEDIUM', taskType: 'CODE', topic: 'variables' },
    ];

    // Student failed a SINGLE_CHOICE quiz on variables. There are NO easy quizzes available, only CODE tasks.
    const recommendation = TaskSequencer.recommendNextTask({
      skills,
      studentStates: { s1: 0.3 },
      tasks: mixedTasks,
      completedTaskIds: [],
      preferredTopic: 'variables',
      preferredDifficulty: 'EASY',
      preferredTaskType: 'SINGLE_CHOICE',
      excludeTaskId: 't_quiz_failed',
    });

    // Guardrail: must NOT recommend a CODE task (returns null to trigger theory recommendation)
    expect(recommendation).toBeNull();
  });

  it('should recommend matching isomorphic quiz blitz when degrading from failed quiz', () => {
    const mixedTasks: TaskDomain[] = [
      { id: 't_quiz_failed', skillId: 's1', title: 'Quiz: const syntax', difficulty: 'MEDIUM', taskType: 'SINGLE_CHOICE', topic: 'variables' },
      { id: 't_quiz_blitz', skillId: 's1', title: 'Quiz: let vs const basic', difficulty: 'EASY', taskType: 'SINGLE_CHOICE', topic: 'variables' },
      { id: 't_code_easy', skillId: 's1', title: 'Code: declare variable', difficulty: 'EASY', taskType: 'CODE', topic: 'variables' },
    ];

    const recommendation = TaskSequencer.recommendNextTask({
      skills,
      studentStates: { s1: 0.3 },
      tasks: mixedTasks,
      completedTaskIds: [],
      preferredTopic: 'variables',
      preferredDifficulty: 'EASY',
      preferredTaskType: 'SINGLE_CHOICE',
      excludeTaskId: 't_quiz_failed',
    });

    expect(recommendation).not.toBeNull();
    expect(recommendation?.recommendedTask.id).toBe('t_quiz_blitz');
    expect(recommendation?.recommendedTask.taskType).toBe('SINGLE_CHOICE');
    expect(recommendation?.isDifficultyDegraded).toBe(true);
  });
});

