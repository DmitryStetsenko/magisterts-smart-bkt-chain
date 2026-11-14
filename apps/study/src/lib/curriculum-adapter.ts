import {
  CourseCurriculumDto,
  CurriculumModuleDto,
  LessonUnitDto,
  LessonSectionDto,
} from '@sbc/types';

/**
 * Витягує короткий огляд з тексту опису модуля
 */
export function extractSummary(text: string): string {
  if (!text) return '';
  const quoteMatch = text.match(/>\s*📌?\s*(?:\*\*[^*]+\*\*:?)?\s*([^\n]+)/);
  if (quoteMatch && quoteMatch[1]) {
    return quoteMatch[1].trim();
  }
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.startsWith('>'));
  return lines[0] || '';
}

/**
 * Парсер 5-блочного Markdown конспекту (Zen Focus) у типізовані секції LessonSectionDto
 */
export function parseMarkdownToSections(
  rawMarkdown: string,
  moduleTitle: string
): LessonSectionDto[] {
  if (!rawMarkdown || rawMarkdown.trim().length === 0) {
    return [
      {
        id: 'sec-overview',
        title: `Вступний огляд: ${moduleTitle}`,
        badge: 'Огляд теми',
        summary: `Огляд ключових дидактичних цілей та понять для теми "${moduleTitle}".`,
        conceptExplanation: `У цьому розділі розглядаються фундаментальні алгоритмічні принципи та практичні шаблони модуля "${moduleTitle}".`,
        keyTakeaways: [`Базове розуміння теми ${moduleTitle}`],
      },
    ];
  }

  const sections: LessonSectionDto[] = [];
  const text = rawMarkdown.replace(/\r\n/g, '\n');

  // 1. Блок Огляду / Вступу (Hook)
  const overviewMatch = text.match(/>\s*📌?\s*(?:\*\*[^*]+\*\*:?)?\s*([\s\S]*?)(?=\n###|\n##|$)/);
  const overviewText = overviewMatch ? overviewMatch[1].trim() : '';

  if (overviewText) {
    sections.push({
      id: 'sec-hook',
      title: '1. Дидактичний огляд та практична мета',
      badge: 'Огляд теми',
      summary: overviewText.split('\n')[0] || `Практичне значення теми ${moduleTitle}`,
      conceptExplanation: overviewText,
      keyTakeaways: ['Практична актуальність та контекст застосування.'],
    });
  }

  // 2. Блок Теоретичних Понять (Concepts)
  const conceptMatch = text.match(/###\s*📖?\s*Теоретичні поняття([\s\S]*?)(?=\n###|\n##|```|$)/i);
  const conceptText = conceptMatch ? conceptMatch[1].trim() : '';

  // 3. Блок Коду (Code Snippet)
  const codeMatch = text.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/);
  const codeLang = codeMatch && codeMatch[1] ? codeMatch[1].trim() : 'javascript';
  const codeContent = codeMatch && codeMatch[2] ? codeMatch[2].trim() : '';

  if (conceptText || codeContent) {
    sections.push({
      id: 'sec-theory',
      title: '2. Теоретичні поняття та правила побудови',
      badge: 'Теорія & Поняття',
      summary: 'Фундаментальні визначення, принципи роботи та алгоритмічні структури.',
      conceptExplanation:
        conceptText ||
        `Основні концепції та синтаксичні правила для опрацювання теми "${moduleTitle}".`,
      codeSnippet: codeContent
        ? {
            language: codeLang,
            code: codeContent,
            explanation: `Зразок програмного коду за темою "${moduleTitle}". Модифікуйте змінні та перевірте результат.`,
          }
        : undefined,
      keyTakeaways: [
        'Розуміння фундаментальних принципів.',
        'Правильний синтаксис та структура розв\'язку.',
      ],
    });
  }

  // 4. Блок Оман та Типових Помилок (Misconceptions)
  const miscMatch = text.match(/###\s*⚠️?\s*Типові помилки та омани([\s\S]*?)(?=\n###|\n##|$)/i);
  if (miscMatch && miscMatch[1]) {
    const miscText = miscMatch[1].trim();

    const wrongMatch = miscText.match(/[-*]\s*(?:\*\*Омана:\*\*|\*Хибне уявлення:\*)\s*([^\n]+)/i);
    const realityMatch = miscText.match(/[-*]\s*(?:\*\*Реальність:\*\*|\*Реальність:\*)\s*([^\n]+)/i);
    const tipMatch = miscText.match(/[-*]\s*(?:\*\*Як думати правильно:\*\*|\*Порада:\*)\s*([^\n]+)/i);

    const wrongBelief = wrongMatch
      ? wrongMatch[1].trim()
      : miscText.split('\n')[0]?.replace(/^[-*]\s*/, '') || '';
    const realityExplanation = realityMatch
      ? realityMatch[1].trim()
      : 'Важливо розрізняти концептуальну логіку та технічні обмеження синтаксису.';
    const fixTip = tipMatch
      ? tipMatch[1].trim()
      : 'Завжди аналізуйте типи даних та послідовність виконання коду.';

    sections.push({
      id: 'sec-misconception',
      title: '3. Діагностика типових оман початківців',
      badge: 'Аналіз оман',
      summary: 'Аналіз поширених помилок мислення та шляхи їх уникнення.',
      conceptExplanation: miscText,
      misconceptionAlert: {
        wrongBelief,
        realityExplanation,
        fixTip,
      },
      keyTakeaways: [fixTip],
    });
  }

  // 5. Блок Ключових Висновків (Takeaways)
  const takeMatch = text.match(/###\s*🎯?\s*Ключові висновки([\s\S]*?)(?=\n###|\n##|$)/i);
  if (takeMatch && takeMatch[1]) {
    const takeText = takeMatch[1].trim();
    const takeawaysList = takeText
      .split('\n')
      .map((l) => l.trim().replace(/^[-*]\s*/, ''))
      .filter((l) => l.length > 0);

    sections.push({
      id: 'sec-takeaways',
      title: '4. Ключові висновки та чек-ліст знань',
      badge: 'Підсумок',
      summary: 'Стислий підсумок опрацьованого навчального блоку.',
      conceptExplanation: takeText,
      keyTakeaways:
        takeawaysList.length > 0 ? takeawaysList : ['Опанування основних принципів розділу.'],
    });
  }

  // Якщо стандартні блоки не розпізнано, створюємо цілісну секцію з наявного тексту
  if (sections.length === 0) {
    sections.push({
      id: 'sec-content',
      title: `Навчальний матеріал: ${moduleTitle}`,
      badge: 'Конспект уроку',
      summary: extractSummary(rawMarkdown) || `Теоретичний матеріал модуля ${moduleTitle}`,
      conceptExplanation: rawMarkdown,
      codeSnippet: codeContent
        ? {
            language: codeLang,
            code: codeContent,
            explanation: `Практичний зразок коду для теми ${moduleTitle}`,
          }
        : undefined,
      keyTakeaways: [`Ключові положення теми ${moduleTitle}`],
    });
  }

  return sections;
}

/**
 * Адаптує сутність курсу з бази даних у повний DTO навчальної програми CourseCurriculumDto
 */
export function adaptCourseToCurriculum(courseData: any): CourseCurriculumDto {
  const modules: CurriculumModuleDto[] = (courseData.modules || []).map(
    (mod: any, mIdx: number) => {
      const rawDesc = mod.description || '';
      const sections = parseMarkdownToSections(rawDesc, mod.title);
      const unitSlug = mod.slug;

      const unit: LessonUnitDto = {
        slug: unitSlug,
        moduleSlug: mod.slug,
        moduleNumber: mod.orderIndex || mIdx + 1,
        title: mod.title,
        gradeLevel: courseData.targetAudience || '10–11 класи',
        estimatedMinutes: Math.max(8, sections.length * 3),
        summary:
          extractSummary(rawDesc) ||
          `Теоретичні поняття, огляд синтаксису та практичні приклади для розділу "${mod.title}".`,
        sections,
      };

      return {
        moduleNumber: mod.orderIndex || mIdx + 1,
        moduleSlug: mod.slug,
        title: mod.title,
        description: extractSummary(rawDesc) || mod.description || '',
        units: [unit],
      };
    }
  );

  return {
    courseSlug: courseData.slug,
    courseTitle: courseData.title,
    description: courseData.description || '',
    gradeLevel: courseData.targetAudience || '10–11 класи',
    modules,
  };
}
