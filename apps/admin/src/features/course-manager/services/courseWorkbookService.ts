import * as XLSX from 'xlsx';
import type { CourseDto, CourseModuleDto, SkillNodeDto } from '@sbc/types';
import { parseMarkdownToBlocks } from '../ui/TheoryLessonBuilderModal';
import { formatCleanSkillTitle } from '../ui/CourseStudioView';

/**
 * Канонічні назви вкладок стандарту SBC Course Workbook (5 вкладок)
 */
export const WORKBOOK_SHEETS = {
  COURSE: 'Course',
  MODULES: 'Modules',
  SKILLS: 'Skills',
  THEORY: 'Theory',
  TASKS: 'Tasks',
} as const;

/**
 * 1. Sheet "Course": Загальний паспорт курсу
 */
export interface CourseSheetRow {
  title: string;
  slug: string;
  category: string;
  description: string;
  targetAudience: string;
  difficultyLevel: string;
  bktMasteryThreshold: number;
  icon: string;
}

/**
 * 2. Sheet "Modules": Тематичні модулі курсу
 */
export interface ModuleSheetRow {
  orderIndex: number;
  title: string;
  slug: string;
  theoryUrl: string;
  bktThreshold: number;
  description: string;
}

/**
 * 3. Sheet "Skills": Граф компетентностей BKT (DAG)
 */
export interface SkillSheetRow {
  moduleSlug: string;
  orderIndex: number;
  title: string;
  slug: string;
  difficulty: string;
  prerequisites: string;
  pL0: number;
  pT: number;
  pS: number;
  pG: number;
}

/**
 * 4. Sheet "Theory": 5-блочні конспекти Zen Focus для apps/study
 */
export interface TheorySheetRow {
  moduleSlug: string;
  hookIntro: string;
  conceptsMarkdown: string;
  codeLang: string;
  codeSnippet: string;
  codeExplanation: string;
  misconceptionTitle: string;
  misconceptionExplanation: string;
  takeawaysList: string;
}

/**
 * 5. Sheet "Tasks": Банк адаптивних завдань для пісочниці apps/student
 */
export interface TaskSheetRow {
  skillSlug: string;
  orderIndex: number;
  taskType: string;
  difficulty: string;
  title: string;
  prompt: string;
  starterCode: string;
  testCasesJson: string;
  hintsList: string;
}

/**
 * Налаштовує оптимальну ширину колонок для аркуша SheetJS
 */
function setWorksheetColWidths(ws: XLSX.WorkSheet, widths: number[]) {
  ws['!cols'] = widths.map((wch) => ({ wch }));
}

/**
 * Генерує еталонний приклад курсу (SBC Canonical Reference Template)
 * Містить повні 5 вкладок із реальними дидактичними даними та підказками.
 */
export function generateCourseTemplateWorkbook(): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. Вкладка Course
  const courseRows: CourseSheetRow[] = [
    {
      title: 'Основи веб-розробки: Frontend (HTML/CSS/JS)',
      slug: 'web-dev-basics',
      category: 'Інформатика & IT',
      description: 'Комплексний вступ до сучасної клієнтської розробки: від семантичної структури DOM до інтерактивних веб-інтерфейсів та роботи з подіями.',
      targetAudience: '10-11 класи, Студенти коледжів',
      difficultyLevel: 'BEGINNER',
      bktMasteryThreshold: 0.85,
      icon: 'Globe',
    },
  ];
  const wsCourse = XLSX.utils.json_to_sheet(courseRows);
  setWorksheetColWidths(wsCourse, [35, 20, 20, 50, 25, 15, 20, 15]);
  XLSX.utils.book_append_sheet(wb, wsCourse, WORKBOOK_SHEETS.COURSE);

  // 2. Вкладка Modules
  const moduleRows: ModuleSheetRow[] = [
    {
      orderIndex: 1,
      title: 'Семантична структура та анатомія HTML5',
      slug: 'semantychna-struktura-ta-anatomiya-html5',
      theoryUrl: '/learn/web-dev-basics/semantychna-struktura-ta-anatomiya-html5',
      bktThreshold: 0.85,
      description: 'Вивчення структури DOM-дерева, сучасного стандарту HTML5, метатегів та семантичних орієнтирів.',
    },
    {
      orderIndex: 2,
      title: 'Сучасна стилізація: Flexbox & Grid лаконічність',
      slug: 'suchasna-stylizatsiya-flexbox-and-grid',
      theoryUrl: '/learn/web-dev-basics/suchasna-stylizatsiya-flexbox-and-grid',
      bktThreshold: 0.85,
      description: 'Побудова гнучких та адаптивних інтерфейсів за допомогою CSS Flexbox і CSS Grid без сторонніх бібліотек.',
    },
  ];
  const wsModules = XLSX.utils.json_to_sheet(moduleRows);
  setWorksheetColWidths(wsModules, [12, 40, 35, 45, 15, 50]);
  XLSX.utils.book_append_sheet(wb, wsModules, WORKBOOK_SHEETS.MODULES);

  // 3. Вкладка Skills (DAG Граф компетентностей)
  const skillRows: SkillSheetRow[] = [
    {
      moduleSlug: 'semantychna-struktura-ta-anatomiya-html5',
      orderIndex: 1,
      title: 'Базова розмітка та DOCTYPE HTML5',
      slug: 'html5-doctype-and-root',
      difficulty: 'EASY',
      prerequisites: '', // Коренева навичка
      pL0: 0.10,
      pT: 0.20,
      pS: 0.10,
      pG: 0.20,
    },
    {
      moduleSlug: 'semantychna-struktura-ta-anatomiya-html5',
      orderIndex: 2,
      title: 'Семантичні секції (header, nav, main, footer)',
      slug: 'semantic-section-tags',
      difficulty: 'MEDIUM',
      prerequisites: 'html5-doctype-and-root', // Залежить від кореневої
      pL0: 0.10,
      pT: 0.20,
      pS: 0.10,
      pG: 0.20,
    },
    {
      moduleSlug: 'suchasna-stylizatsiya-flexbox-and-grid',
      orderIndex: 1,
      title: 'Flexbox контейнер та вирівнювання осей',
      slug: 'flexbox-axes-alignment',
      difficulty: 'MEDIUM',
      prerequisites: 'semantic-section-tags', // Міжмодульний пререквізит
      pL0: 0.10,
      pT: 0.20,
      pS: 0.10,
      pG: 0.20,
    },
  ];
  const wsSkills = XLSX.utils.json_to_sheet(skillRows);
  setWorksheetColWidths(wsSkills, [35, 12, 35, 30, 12, 30, 10, 10, 10, 10]);
  XLSX.utils.book_append_sheet(wb, wsSkills, WORKBOOK_SHEETS.SKILLS);

  // 4. Вкладка Theory (5-блочні конспекти Zen Focus)
  const theoryRows: TheorySheetRow[] = [
    {
      moduleSlug: 'semantychna-struktura-ta-anatomiya-html5',
      hookIntro: 'Веб-сторінка — це не просто статичний текст, а інтерактивне дерево обʼєктів (DOM), яке браузер рендерить рядок за рядком.',
      conceptsMarkdown: 'Тег <!DOCTYPE html> гарантує стандартний режим рендерингу (No-Quirks Mode). Тег <head> містить службову інформацію для парсера (кодування utf-8, viewport), а <body> — видимий вміст для користувача.',
      codeLang: 'html',
      codeSnippet: '<!DOCTYPE html>\n<html lang="uk">\n<head>\n  <meta charset="UTF-8">\n  <title>Мій перший сайт</title>\n</head>\n<body>\n  <header>\n    <h1>Вітаю на порталі!</h1>\n  </header>\n</body>\n</html>',
      codeExplanation: 'Атрибут lang="uk" допомагає скрінрідерам правильно озвучувати контент українською мовою.',
      misconceptionTitle: 'Плутанина між тегами <head> та <header>',
      misconceptionExplanation: '<head> — це метадані для браузера (не відображаються у вікні перегляду). <header> — це видима семантична шапка сторінки або секції всередині <body>.',
      takeawaysList: 'DOCTYPE обовʼязковий для режиму HTML5 | Метадані поміщаються у <head> | Видима верстка знаходиться суворо у <body>',
    },
    {
      moduleSlug: 'suchasna-stylizatsiya-flexbox-and-grid',
      hookIntro: 'Забудьте про старі хаки з float та табличну верстку: Flexbox дає тотальний контроль над вирівнюванням елементів в один рядок коду.',
      conceptsMarkdown: 'Властивість display: flex активує flex-контейнер. Головна вісь (main axis) регулюється через justify-content, а поперечна (cross axis) — через align-items.',
      codeLang: 'css',
      codeSnippet: '.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 1rem;\n}',
      codeExplanation: 'space-between автоматично розсуває логотип вліво, а меню навігації — вправо.',
      misconceptionTitle: 'Зміна напрямку осей при flex-direction: column',
      misconceptionExplanation: 'Коли flex-direction стає column, головна вісь стає вертикальною (Y), тому justify-content тепер вирівнює по вертикалі, а align-items — по горизонталі.',
      takeawaysList: 'display: flex вмикає гнучкий контекст | justify-content керує головною віссю | align-items керує поперечною віссю',
    },
  ];
  const wsTheory = XLSX.utils.json_to_sheet(theoryRows);
  setWorksheetColWidths(wsTheory, [35, 40, 50, 12, 45, 35, 30, 45, 50]);
  XLSX.utils.book_append_sheet(wb, wsTheory, WORKBOOK_SHEETS.THEORY);

  // 5. Вкладка Tasks (Банк завдань)
  const taskRows: TaskSheetRow[] = [
    {
      skillSlug: 'html5-doctype-and-root',
      orderIndex: 1,
      taskType: 'CODE',
      difficulty: 'EASY',
      title: 'Створення базової HTML5 розмітки',
      prompt: 'Оголосіть сучасний стандарт документа HTML5, огорніть його в тег `html` з українською мовою `uk`, додайте блок `head` з кодуванням `utf-8` та порожній `body`.',
      starterCode: '<!-- Напишіть розмітку нижче -->\n',
      testCasesJson: JSON.stringify([
        { input: '', expectedOutput: '<!DOCTYPE html>', isSecret: false },
        { input: '', expectedOutput: 'lang="uk"', isSecret: false },
      ]),
      hintsList: 'Розпочніть з <!DOCTYPE html> | Вкажіть тег <html lang="uk"> | Додайте метатег <meta charset="UTF-8"> у <head>',
    },
    {
      skillSlug: 'semantic-section-tags',
      orderIndex: 1,
      taskType: 'CODE',
      difficulty: 'MEDIUM',
      title: 'Семантична верстка шапки сайту',
      prompt: 'Створіть семантичну структуру шапки: тег `<header>`, всередині якого розмістіть `<nav>` з трьома посиланнями: Головна, Курси, Контакти.',
      starterCode: '<header>\n  <!-- Додайте nav та посилання -->\n</header>',
      testCasesJson: JSON.stringify([
        { input: '', expectedOutput: '<nav>', isSecret: false },
        { input: '', expectedOutput: 'Головна', isSecret: false },
      ]),
      hintsList: 'Використовуйте <nav> всередині <header> | Кожне посилання створюється через тег <a href="#">',
    },
  ];
  const wsTasks = XLSX.utils.json_to_sheet(taskRows);
  setWorksheetColWidths(wsTasks, [25, 12, 12, 12, 35, 50, 40, 35, 50]);
  XLSX.utils.book_append_sheet(wb, wsTasks, WORKBOOK_SHEETS.TASKS);

  return wb;
}

/**
 * Експортує наявний курс у канонічну 5-вкладкову книгу Excel (.xlsx)
 */
export function exportCourseToWorkbook(
  course: CourseDto,
  allCourseSkills?: SkillNodeDto[]
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // 1. Вкладка Course
  const categoryTitle =
    typeof course.category === 'object' && course.category
      ? (course.category as any).title || 'Загальний курс'
      : typeof course.category === 'string'
      ? course.category
      : 'Інформатика & IT';

  const courseRows: CourseSheetRow[] = [
    {
      title: course.title || 'Новий навчальний курс',
      slug: course.slug || 'new-course',
      category: categoryTitle,
      description: course.description || '',
      targetAudience: course.targetAudience || '10-11 класи, Студенти коледжів',
      difficultyLevel: (course as any).difficultyLevel || 'BEGINNER',
      bktMasteryThreshold: course.defaultMasteryThreshold ?? 0.85,
      icon: course.icon || 'BookOpen',
    },
  ];
  const wsCourse = XLSX.utils.json_to_sheet(courseRows);
  setWorksheetColWidths(wsCourse, [35, 20, 20, 50, 25, 15, 20, 15]);
  XLSX.utils.book_append_sheet(wb, wsCourse, WORKBOOK_SHEETS.COURSE);

  // 2. Вкладка Modules
  const modulesList = course.modules || [];
  const moduleRows: ModuleSheetRow[] = modulesList.map((mod, idx) => ({
    orderIndex: mod.orderIndex ?? idx + 1,
    title: mod.title,
    slug: mod.slug,
    theoryUrl: mod.theoryUrl || `/learn/${course.slug}/${mod.slug}`,
    bktThreshold: mod.minMasteryThreshold ?? (course.defaultMasteryThreshold ?? 0.85),
    description: mod.description ? mod.description.slice(0, 300) : '',
  }));
  const wsModules = XLSX.utils.json_to_sheet(moduleRows.length > 0 ? moduleRows : [{
    orderIndex: 1,
    title: 'Модуль 1',
    slug: 'module-1',
    theoryUrl: `/learn/${course.slug}/module-1`,
    bktThreshold: course.defaultMasteryThreshold ?? 0.85,
    description: '',
  }]);
  setWorksheetColWidths(wsModules, [12, 40, 35, 45, 15, 50]);
  XLSX.utils.book_append_sheet(wb, wsModules, WORKBOOK_SHEETS.MODULES);

  // Карта навичок: формуємо пул усіх компетенцій для розв'язання пререквізитів
  const skillsPool: SkillNodeDto[] = [
    ...(allCourseSkills || []),
    ...(course.skills || []),
    ...modulesList.flatMap((m) => m.skills || []),
  ];
  const uniqueSkillsMap = new Map<string, SkillNodeDto>();
  skillsPool.forEach((s) => {
    if (s.id && !uniqueSkillsMap.has(s.id)) uniqueSkillsMap.set(s.id, s);
    if (s.slug && !uniqueSkillsMap.has(s.slug)) uniqueSkillsMap.set(s.slug, s);
  });

  // Карта модуля для кожної навички
  const skillModuleSlugMap = new Map<string, string>();
  modulesList.forEach((m) => {
    (m.skills || []).forEach((s) => {
      skillModuleSlugMap.set(s.id, m.slug);
      skillModuleSlugMap.set(s.slug, m.slug);
    });
  });

  // 3. Вкладка Skills
  const skillRows: SkillSheetRow[] = [];
  const exportedSkillSlugs = new Set<string>();

  modulesList.forEach((mod) => {
    (mod.skills || []).forEach((skill, idx) => {
      if (exportedSkillSlugs.has(skill.slug)) return;
      exportedSkillSlugs.add(skill.slug);

      // Витягуємо пререквізити (батьківські слаги)
      const parentSlugs: string[] = [];
      if (skill.parentDependencies && Array.isArray(skill.parentDependencies)) {
        skill.parentDependencies.forEach((dep: any) => {
          if (dep.parentSkill?.slug) {
            parentSlugs.push(dep.parentSkill.slug);
          } else if (dep.parentSkillId) {
            const parent = uniqueSkillsMap.get(dep.parentSkillId);
            if (parent?.slug) parentSlugs.push(parent.slug);
          }
        });
      }

      skillRows.push({
        moduleSlug: mod.slug,
        orderIndex: skill.orderIndex ?? idx + 1,
        title: formatCleanSkillTitle(skill.title, mod.title),
        slug: skill.slug,
        difficulty: typeof skill.difficulty === 'string' ? skill.difficulty : 'EASY',
        prerequisites: parentSlugs.join(', '),
        pL0: skill.pInit ?? 0.10,
        pT: skill.pTransit ?? 0.20,
        pS: skill.pSlip ?? 0.10,
        pG: skill.pGuess ?? 0.20,
      });
    });
  });

  // Додаємо вільні навички курсу, якщо вони не були прив'язані до модулів
  (course.skills || []).forEach((skill, idx) => {
    if (exportedSkillSlugs.has(skill.slug)) return;
    exportedSkillSlugs.add(skill.slug);

    const modSlug = skill.moduleId
      ? modulesList.find((m) => m.id === skill.moduleId)?.slug || 'general'
      : 'general';

    const parentSlugs: string[] = [];
    if (skill.parentDependencies && Array.isArray(skill.parentDependencies)) {
      skill.parentDependencies.forEach((dep: any) => {
        if (dep.parentSkill?.slug) {
          parentSlugs.push(dep.parentSkill.slug);
        } else if (dep.parentSkillId) {
          const parent = uniqueSkillsMap.get(dep.parentSkillId);
          if (parent?.slug) parentSlugs.push(parent.slug);
        }
      });
    }

    skillRows.push({
      moduleSlug: modSlug,
      orderIndex: skill.orderIndex ?? idx + 1,
      title: skill.title,
      slug: skill.slug,
      difficulty: typeof skill.difficulty === 'string' ? skill.difficulty : 'EASY',
      prerequisites: parentSlugs.join(', '),
      pL0: skill.pInit ?? 0.10,
      pT: skill.pTransit ?? 0.20,
      pS: skill.pSlip ?? 0.10,
      pG: skill.pGuess ?? 0.20,
    });
  });

  const wsSkills = XLSX.utils.json_to_sheet(
    skillRows.length > 0
      ? skillRows
      : [
          {
            moduleSlug: 'module-1',
            orderIndex: 1,
            title: 'Базова компетенція',
            slug: 'basic-skill',
            difficulty: 'EASY',
            prerequisites: '',
            pL0: 0.10,
            pT: 0.20,
            pS: 0.10,
            pG: 0.20,
          },
        ]
  );
  setWorksheetColWidths(wsSkills, [35, 12, 35, 30, 12, 30, 10, 10, 10, 10]);
  XLSX.utils.book_append_sheet(wb, wsSkills, WORKBOOK_SHEETS.SKILLS);

  // 4. Вкладка Theory (розбір конспектів за блоками Zen Focus)
  const theoryRows: TheorySheetRow[] = modulesList.map((mod) => {
    const rawMarkdown = mod.description || '';
    const parsed = parseMarkdownToBlocks(rawMarkdown, mod.title);

    let misconceptionExpl = parsed.realityExplanation || '';
    if (parsed.fixTip) {
      misconceptionExpl += (misconceptionExpl ? ' ' : '') + `Порада: ${parsed.fixTip}`;
    }

    return {
      moduleSlug: mod.slug,
      hookIntro: parsed.summary || '',
      conceptsMarkdown: parsed.conceptExplanation || rawMarkdown,
      codeLang: parsed.codeLang || 'html',
      codeSnippet: parsed.codeSnippet || '',
      codeExplanation: parsed.codeExplanation || '',
      misconceptionTitle: parsed.wrongBelief || '',
      misconceptionExplanation: misconceptionExpl,
      takeawaysList: (parsed.takeaways || []).filter(Boolean).join(' | '),
    };
  });

  const wsTheory = XLSX.utils.json_to_sheet(
    theoryRows.length > 0
      ? theoryRows
      : [
          {
            moduleSlug: 'module-1',
            hookIntro: 'Вступ до теми',
            conceptsMarkdown: 'Основні теоретичні поняття...',
            codeLang: 'html',
            codeSnippet: '',
            codeExplanation: '',
            misconceptionTitle: '',
            misconceptionExplanation: '',
            takeawaysList: '',
          },
        ]
  );
  setWorksheetColWidths(wsTheory, [35, 40, 50, 12, 45, 35, 30, 45, 50]);
  XLSX.utils.book_append_sheet(wb, wsTheory, WORKBOOK_SHEETS.THEORY);

  // 5. Вкладка Tasks
  const taskRows: TaskSheetRow[] = [];
  const processedTaskIds = new Set<string>();

  const allSkillsList = Array.from(uniqueSkillsMap.values());
  allSkillsList.forEach((skill) => {
    const tasks = skill.tasks || [];
    tasks.forEach((task: any, idx: number) => {
      const taskId = task.id || `${skill.slug}-${idx}`;
      if (processedTaskIds.has(taskId)) return;
      processedTaskIds.add(taskId);

      // Форматування тест-кейсів у валідний JSON
      let testCasesJson = '[]';
      if (task.testCases && Array.isArray(task.testCases) && task.testCases.length > 0) {
        testCasesJson = JSON.stringify(
          task.testCases.map((tc: any) => ({
            input: tc.input || '',
            expectedOutput: tc.expectedOutput || '',
            isSecret: !!tc.isSecret,
          }))
        );
      }

      // Форматування Сократівських підказок через |
      let hintsList = '';
      if (task.socraticHints && Array.isArray(task.socraticHints)) {
        hintsList = task.socraticHints
          .map((h: any) => (typeof h === 'string' ? h : h.hint || ''))
          .filter(Boolean)
          .join(' | ');
      }

      taskRows.push({
        skillSlug: skill.slug,
        orderIndex: idx + 1,
        taskType: task.taskType || 'CODE',
        difficulty: task.difficulty || 'EASY',
        title: task.title || 'Навчальне завдання',
        prompt: task.description || '',
        starterCode: task.starterCode || '',
        testCasesJson,
        hintsList,
      });
    });
  });

  const wsTasks = XLSX.utils.json_to_sheet(
    taskRows.length > 0
      ? taskRows
      : [
          {
            skillSlug: 'basic-skill',
            orderIndex: 1,
            taskType: 'CODE',
            difficulty: 'EASY',
            title: 'Базове тренувальне завдання',
            prompt: 'Напишіть першу програму...',
            starterCode: '',
            testCasesJson: '[]',
            hintsList: '',
          },
        ]
  );
  setWorksheetColWidths(wsTasks, [25, 12, 12, 12, 35, 50, 40, 35, 50]);
  XLSX.utils.book_append_sheet(wb, wsTasks, WORKBOOK_SHEETS.TASKS);

  return wb;
}

/**
 * Ініціює завантаження файлу книги Excel у браузері
 */
export function downloadWorkbook(wb: XLSX.WorkBook, filename: string): void {
  try {
    XLSX.writeFile(wb, filename);
  } catch (err) {
    console.error('Помилка при завантаженні Excel файлу:', err);
    // Фолбек через Blob
    try {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 200);
    } catch (fallbackErr) {
      console.error('Критична помилка фолбеку завантаження Excel:', fallbackErr);
      throw fallbackErr;
    }
  }
}

/**
 * Завантажує готовий канонічний еталонний шаблон курсу
 */
export function downloadCourseTemplate(filename: string = 'sbc-course-template.xlsx'): void {
  const wb = generateCourseTemplateWorkbook();
  downloadWorkbook(wb, filename);
}

/**
 * Експортує та завантажує поточний курс
 */
export function downloadCourseExport(
  course: CourseDto,
  allCourseSkills?: SkillNodeDto[],
  filename?: string
): void {
  const safeSlug = course.slug || 'course';
  const targetFilename = filename || `sbc-course-${safeSlug}.xlsx`;
  const wb = exportCourseToWorkbook(course, allCourseSkills);
  downloadWorkbook(wb, targetFilename);
}
