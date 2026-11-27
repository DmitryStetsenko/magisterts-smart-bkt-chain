/**
 * Очищує назву навички від дублюючого префікса «Модуль N:» та запобігає повторенню назви батьківського модуля.
 */
export const formatCleanSkillTitle = (skillTitle?: string | null, moduleTitle?: string | null): string => {
  if (!skillTitle) return 'Компетенція BKT';
  const clean = skillTitle.replace(/^(?:Модуль|Module)\s*\d+:\s*/i, '').trim();
  const cleanMod = (moduleTitle || '').replace(/^(?:Модуль|Module)\s*\d+:\s*/i, '').trim();
  if (!clean || (cleanMod && clean.toLowerCase() === cleanMod.toLowerCase())) {
    return clean || 'Базова навичка модуля';
  }
  return clean;
};

/**
 * Запобігає дублюванню однакового тексту опису модуля і навички.
 */
export const getCleanSkillDescription = (
  skillDesc?: string | null,
  modDesc?: string | null,
  taskCount: number = 0,
): string | null => {
  if (!skillDesc || !skillDesc.trim()) {
    return taskCount > 0 ? `Атомарна BKT компетенція • ${taskCount} завд. у банку` : null;
  }
  const isDuplicate = modDesc && modDesc.trim().toLowerCase() === skillDesc.trim().toLowerCase();
  if (isDuplicate) {
    return taskCount > 0 ? `Атомарна BKT компетенція • ${taskCount} завд. у банку` : 'Атомарна BKT компетенція модуля';
  }
  return skillDesc.trim();
};
