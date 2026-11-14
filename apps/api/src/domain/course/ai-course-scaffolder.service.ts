import { Injectable, Logger } from '@nestjs/common';
import type { AiCourseScaffoldRequestDto, ParsedCourseImportDto } from '@sbc/types';

/**
 * Таблиця українсько-латинської транслітерації (стандарт КМУ №55).
 */
const UKRAINIAN_TRANSLIT_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ye',
  ж: 'zh', з: 'z', и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l',
  м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'yu', я: 'ya',
  ё: 'yo', ы: 'y', э: 'e', ъ: '', "'": '', '’': '', '`': '',
};

function slugifyUkrainian(text: string): string {
  if (!text) return 'item';
  const lower = text.trim().toLowerCase();
  let transliterated = '';
  for (const ch of lower) {
    if (UKRAINIAN_TRANSLIT_MAP[ch] !== undefined) {
      transliterated += UKRAINIAN_TRANSLIT_MAP[ch];
    } else {
      transliterated += ch;
    }
  }
  return transliterated
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';
}

@Injectable()
export class AiCourseScaffolderService {
  private readonly logger = new Logger(AiCourseScaffolderService.name);

  /**
   * Створення повноцінного каркасу навчального курсу (One-Shot Scaffold)
   * Використовує Gemini 2.5 Flash API з автоматичним семантичним евристичним фолбеком.
   */
  async scaffoldCourse(dto: AiCourseScaffoldRequestDto): Promise<ParsedCourseImportDto> {
    const prompt = (dto.prompt || '').trim();
    if (!prompt) {
      throw new Error('Опишіть тему або концепцію курсу для генерації ШІ');
    }

    const apiKey = dto.apiKey || process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 10) {
      try {
        this.logger.log(`Attempting LLM one-shot course generation via Gemini API for prompt: "${prompt.slice(0, 60)}..."`);
        const llmResult = await this.callGeminiApi(prompt, dto, apiKey.trim());
        if (llmResult && this.validateGeneratedStructure(llmResult)) {
          this.logger.log(`Gemini API successfully scaffolded course "${llmResult.course.title}" (${llmResult.modules.length} modules, ${llmResult.skills.length} skills)`);
          return llmResult;
        }
      } catch (err: any) {
        this.logger.warn(`Gemini API scaffolding failed or timed out: ${err.message}. Falling back to deterministic Semantic Heuristic Engine.`);
      }
    } else {
      this.logger.log(`No GEMINI_API_KEY configured. Utilizing built-in Semantic Heuristic Engine.`);
    }

    // Семантичний евристичний генератор курсу
    return this.generateHeuristicCourse(dto);
  }

  /**
   * Виклик Google Gemini API для генерації курсу у строгому форматі JSON
   */
  private async callGeminiApi(
    userPrompt: string,
    dto: AiCourseScaffoldRequestDto,
    apiKey: string
  ): Promise<ParsedCourseImportDto | null> {
    const moduleCount = Math.max(2, Math.min(5, dto.moduleCount || 3));
    const targetPl = dto.targetPl || 0.85;
    const targetAudience = dto.targetAudience || '10-11 класи, Студенти коледжів';
    const category = dto.category || 'Інформатика & IT';

    const systemInstruction = `Ти — провідний експерт-методист адаптивної навчальної системи Smart-BKT-Chain.
Твоє завдання — згенерувати повну, дидактично бездоганну структуру курсу у форматі JSON з 5 взаємопов'язаними розділами:
1. course: паспорт курсу (title, slug, category, description, targetAudience, difficultyLevel, bktMasteryThreshold, icon)
2. modules: рівно ${moduleCount} модулів (orderIndex, title, slug, theoryUrl, bktThreshold, description)
3. skills: по 2-3 компетентності на модуль. ВАЖЛИВО: граф передумов prerequisites повинен бути строго ациклічним DAG (можна посилатися лише на попередні slug навичок через кому або лишати пустим).
   Параметри BKT (Bayesian Knowledge Tracing): pL0 (0.05-0.2), pT (0.15-0.3), pS (0.1), pG (0.2).
4. theories: по 1 конспекту на кожен модуль за 5-блочною моделлю Zen Focus:
   - hookIntro: життєвий мотивуючий хук
   - conceptsMarkdown: глибоке пояснення понять із форматуванням Markdown
   - codeLang: мова програмування (наприклад, python, javascript, html)
   - codeSnippet: чистий робочий зразок коду
   - codeExplanation: покроковий розбір коду
   - misconceptionTitle: назва типової омани учнів
   - misconceptionExplanation: детальне педагогічне розвінчання омани
   - takeawaysList: 3-4 ключових висновки через крапку з комою або |
5. tasks: по 1 практичній задачі для кожної навички (skillSlug, orderIndex, taskType: "CODE", difficulty, title, prompt, starterCode, testCasesJson (валідний JSON-масив тестів [{"input":"...","expectedOutput":"...","isSecret":false}]), hintsList (підказки через |)).

Слаги (slug) повинні бути у латинському kebab-case за стандартом транслітерації КМУ №55.
Відповідай ВИКЛЮЧНО валідним об'єктом JSON без зайвого тексту навколо.`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${systemInstruction}\n\nТема курсу: "${userPrompt}"\nКатегорія: "${category}"\nЦільова аудиторія: "${targetAudience}"\nПоріг BKT: ${targetPl}\nКількість модулів: ${moduleCount}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    };

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API HTTP ${res.status}: ${errText}`);
    }

    const data = await res.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Empty response from Gemini API');
    }

    // Очищення можливих markdown fences
    const cleanJson = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleanJson);

    return this.normalizeAndSanitizeParsed(parsed, dto);
  }

  /**
   * Нормалізація та санітизація згенерованих даних від LLM
   */
  private normalizeAndSanitizeParsed(parsed: any, dto: AiCourseScaffoldRequestDto): ParsedCourseImportDto {
    const targetPl = dto.targetPl || 0.85;

    const course = {
      title: String(parsed.course?.title || dto.prompt).trim(),
      slug: slugifyUkrainian(parsed.course?.slug || parsed.course?.title || dto.prompt),
      category: String(parsed.course?.category || dto.category || 'Інформатика & IT').trim(),
      description: String(parsed.course?.description || `Навчальний адаптивний курс: ${dto.prompt}`).trim(),
      targetAudience: String(parsed.course?.targetAudience || dto.targetAudience || '10-11 класи, Студенти коледжів').trim(),
      difficultyLevel: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(parsed.course?.difficultyLevel)
        ? parsed.course.difficultyLevel
        : 'BEGINNER',
      bktMasteryThreshold: Number(parsed.course?.bktMasteryThreshold || targetPl),
      icon: String(parsed.course?.icon || 'Code').trim(),
      isPublished: false,
    };

    const modules = (parsed.modules || []).map((m: any, idx: number) => {
      const orderIndex = Number(m.orderIndex) || idx + 1;
      const title = String(m.title || `Модуль ${orderIndex}`).trim();
      const slug = slugifyUkrainian(m.slug || title);
      return {
        orderIndex,
        title,
        slug,
        theoryUrl: `/learn/${course.slug}/${slug}`,
        bktThreshold: Number(m.bktThreshold || targetPl),
        description: String(m.description || `Тематичний модуль: ${title}`).trim(),
      };
    });

    const moduleSlugs = new Set(modules.map((m: any) => m.slug));
    const firstModuleSlug = modules[0]?.slug || 'module-1';

    const seenSkillSlugs = new Set<string>();
    const skills = (parsed.skills || []).map((s: any, idx: number) => {
      const title = String(s.title || `Компетенція ${idx + 1}`).trim();
      let slug = slugifyUkrainian(s.slug || title);
      if (seenSkillSlugs.has(slug)) {
        slug = `${slug.slice(0, 50)}-${idx + 1}`;
      }
      seenSkillSlugs.add(slug);
      let moduleSlug = String(s.moduleSlug || '').trim();
      if (!moduleSlugs.has(moduleSlug)) {
        moduleSlug = firstModuleSlug;
      }
      return {
        moduleSlug,
        orderIndex: Number(s.orderIndex) || idx + 1,
        title,
        slug,
        difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(s.difficulty) ? s.difficulty : 'EASY',
        prerequisites: String(s.prerequisites || '').trim(),
        pL0: Number(s.pL0 || 0.15),
        pT: Number(s.pT || 0.20),
        pS: Number(s.pS || 0.10),
        pG: Number(s.pG || 0.20),
      };
    });

    const theories = (parsed.theories || []).map((th: any, idx: number) => {
      let moduleSlug = String(th.moduleSlug || '').trim();
      if (!moduleSlugs.has(moduleSlug)) {
        moduleSlug = modules[idx]?.slug || firstModuleSlug;
      }
      return {
        moduleSlug,
        hookIntro: String(th.hookIntro || 'Вітаємо у новому розділі! Пориньмо у практичні кейси.').trim(),
        conceptsMarkdown: String(th.conceptsMarkdown || '### Ключові концепції теми\n\nОпануйте базові поняття та взаємозвʼязки.').trim(),
        codeLang: String(th.codeLang || 'python').trim(),
        codeSnippet: String(th.codeSnippet || '# Приклад розвʼязку завдання\n').trim(),
        codeExplanation: String(th.codeExplanation || 'Покроковий коментар до структури коду.').trim(),
        misconceptionTitle: String(th.misconceptionTitle || 'Поширена омана новачків').trim(),
        misconceptionExplanation: String(th.misconceptionExplanation || 'Зверніть увагу на коректну типізацію та межі циклу.').trim(),
        takeawaysList: String(th.takeawaysList || 'Завжди тестуйте граничні значення | Дотримуйтесь чистих назв змінних').trim(),
      };
    });

    const skillSlugs = new Set(skills.map((s: any) => s.slug));
    const firstSkillSlug = skills[0]?.slug || 'basic-skill';

    const tasks = (parsed.tasks || []).map((t: any, idx: number) => {
      let skillSlug = String(t.skillSlug || '').trim();
      if (!skillSlugs.has(skillSlug)) {
        skillSlug = firstSkillSlug;
      }
      return {
        skillSlug,
        orderIndex: Number(t.orderIndex) || idx + 1,
        taskType: 'CODE',
        difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(t.difficulty) ? t.difficulty : 'EASY',
        title: String(t.title || `Практична задача ${idx + 1}`).trim(),
        prompt: String(t.prompt || 'Напишіть функцію згідно з умовами задачі.').trim(),
        starterCode: String(t.starterCode || '// Введіть ваш розвʼязок тут\n').trim(),
        testCasesJson: typeof t.testCasesJson === 'string' ? t.testCasesJson : JSON.stringify(t.testCasesJson || []),
        hintsList: String(t.hintsList || 'Уважно прочитайте умову | Перевірте базові типи даних').trim(),
      };
    });

    return { course, modules, skills, theories, tasks };
  }

  /**
   * Перевірка мінімальної цілісності отриманої структури
   */
  private validateGeneratedStructure(data: ParsedCourseImportDto): boolean {
    return (
      Boolean(data?.course?.title && data.course.slug) &&
      Array.isArray(data.modules) &&
      data.modules.length >= 2 &&
      Array.isArray(data.skills) &&
      data.skills.length >= 2
    );
  }

  /**
   * Детерміністичний евристичний генератор навчальних курсів
   * Створює дидактично збалансований курс з гарантією ациклічності графа BKT та 100% готовністю до імпорту.
   */
  private generateHeuristicCourse(dto: AiCourseScaffoldRequestDto): ParsedCourseImportDto {
    const rawPrompt = (dto.prompt || '').trim();
    const promptLower = rawPrompt.toLowerCase();
    const moduleCount = Math.max(2, Math.min(5, dto.moduleCount || 3));
    const targetPl = dto.targetPl || 0.85;
    const targetAudience = dto.targetAudience || '10-11 класи, Студенти коледжів';
    const category = dto.category || 'Інформатика & IT';

    // ── Визначення предметної області ──
    const isPython = promptLower.includes('python') || promptLower.includes('пайтон') || promptLower.includes('пітон');
    const isWeb = promptLower.includes('web') || promptLower.includes('веб') || promptLower.includes('html') || promptLower.includes('react') || promptLower.includes('javascript') || promptLower.includes('css');
    const isDb = promptLower.includes('sql') || promptLower.includes('баз') || promptLower.includes('database') || promptLower.includes('даних');
    const isSecurity = promptLower.includes('безпек') || promptLower.includes('cyber') || promptLower.includes('кібер') || promptLower.includes('захист');

    let courseTitle = rawPrompt.split(/[:\n—]/)[0].trim() || rawPrompt;
    let icon = 'Code';
    let codeLang = 'python';

    // Шаблони модулів для різних напрямків
    let moduleTemplates: Array<{
      title: string;
      desc: string;
      skills: Array<{ title: string; difficulty: string; pL0: number; pT: number }>;
      theory: {
        hook: string;
        concepts: string;
        snippet: string;
        explanation: string;
        miscTitle: string;
        miscExpl: string;
        takeaways: string;
      };
      task: {
        title: string;
        prompt: string;
        starter: string;
        tests: Array<{ input: string; expectedOutput: string; isSecret?: boolean }>;
        hints: string;
      };
    }> = [];

    if (isPython) {
      courseTitle = courseTitle.length > 5 ? courseTitle : 'Алгоритми та структури даних у Python';
      icon = 'Cpu';
      codeLang = 'python';
      moduleTemplates = [
        {
          title: 'Основи алгоритмізації та аналіз складності O(N)',
          desc: 'Вивчення базових принципів проектування алгоритмів, оцінка часової та просторової складності за нотацією Big-O.',
          skills: [
            { title: 'Асимптотичний аналіз Big-O', difficulty: 'EASY', pL0: 0.20, pT: 0.25 },
            { title: 'Оптимізація ітеративних циклів', difficulty: 'MEDIUM', pL0: 0.15, pT: 0.20 },
          ],
          theory: {
            hook: 'Чому програма, що працює 0.1 секунди на 10 елементах, зависає на пів години при 100 000 записів? Відповідь криється в асимптотичній складності.',
            concepts: '### Асимптотичний аналіз алгоритмів\n\nНотація **Big-O** описує поведінку функції при прямуванні розміру вхідних даних $N$ до нескінченності:\n- $O(1)$ — константний час (доступ до елемента списку за індексом)\n- $O(\\log N)$ — логарифмічний час (бінарний пошук)\n- $O(N)$ — лінійний час (один прохід масивом)\n- $O(N^2)$ — квадратичний час (вкладені цикли)',
            snippet: 'def find_max(numbers: list[int]) -> int:\n    if not numbers:\n        raise ValueError("Список не може бути порожнім")\n    max_val = numbers[0]\n    for num in numbers[1:]:\n        if num > max_val:\n            max_val = num\n    return max_val',
            explanation: 'Алгоритм виконує рівно один прохід списком довжиною N-1 операцій, тому має лінійну складність O(N) за часом та O(1) за памʼяттю.',
            miscTitle: 'Плутанина між середнім та найгіршим випадком',
            miscExpl: 'Учні часто вважають, що якщо алгоритм швидко завершується на випадкових даних, він завжди має малу складність. Big-O вимірює поведінку саме в найгіршому сценарії (Worst-case).',
            takeaways: 'Big-O описує верхню межу складності | Уникайте вкладених циклів O(N^2) на великих масивах | Завжди оцінюйте як час, так і витрати памʼяті',
          },
          task: {
            title: 'Пошук максимального елемента списку',
            prompt: 'Реалізуйте функцію find_max_linear(arr), яка знаходить найбільше ціле число у переданому непорожньому списку за лінійний час O(N).',
            starter: 'def find_max_linear(arr: list[int]) -> int:\n    # Ваш код тут\n    pass\n',
            tests: [
              { input: '[1, 5, 3, 9, 2]', expectedOutput: '9', isSecret: false },
              { input: '[-10, -5, -20]', expectedOutput: '-5', isSecret: false },
              { input: '[42]', expectedOutput: '42', isSecret: true },
            ],
            hints: 'Ініціалізуйте максимум першим елементом arr[0] | Пройдіться циклом for по решті елементів | Не використовуйте вкладені цикли',
          },
        },
        {
          title: 'Лінійні структури: Списки, Стеки та Черги (LIFO/FIFO)',
          desc: 'Принципи організації памʼяті, швидкість доступу та типові сценарії застосування абстрактних типів даних Stack і Queue.',
          skills: [
            { title: 'Реалізація стека за принципом LIFO', difficulty: 'EASY', pL0: 0.15, pT: 0.22 },
            { title: 'Валідація дужок за допомогою стека', difficulty: 'MEDIUM', pL0: 0.10, pT: 0.18 },
          ],
          theory: {
            hook: 'Кнопка "Скасувати" (Ctrl+Z) в улюбленому текстовому редакторі використовує саме Стек — дію, додану останньою, скасовують першою.',
            concepts: '### Стеки та черги в памʼяті\n\n- **Стек (Stack)** реалізує принцип **LIFO** (Last In, First Out). Основні операції: `push()` (додавання) та `pop()` (вилучення з вершини) за $O(1)$.\n- **Черга (Queue)** працює за принципом **FIFO** (First In, First Out), як черга в касу супермаркету.',
            snippet: 'class Stack:\n    def __init__(self):\n        self._items = []\n    def push(self, item):\n        self._items.append(item)\n    def pop(self):\n        return self._items.pop() if self._items else None\n    def is_empty(self):\n        return len(self._items) == 0',
            explanation: 'Клас Stack огортає динамічний масив Python. Метод append та pop з кінця списку працюють за амортизований O(1).',
            miscTitle: 'Використання pop(0) замість колекції deque для черг',
            miscExpl: 'Виклик pop(0) для звичайного списку Python призводить до зсуву всіх наступних елементів, що має складність O(N). Для черг слід використовувати collections.deque з O(1) popleft().',
            takeaways: 'Стек — LIFO, додавання та видалення лише з верхівки | Черга — FIFO, перший прийшов — перший пішов | Для високонавантажених черг використовуйте collections.deque',
          },
          task: {
            title: 'Перевірка збалансованості круглих дужок',
            prompt: 'Напишіть функцію is_balanced_brackets(s: str) -> bool, яка повертає True, якщо всі круглі дужки у рядку збалансовані, та False у протилежному випадку.',
            starter: 'def is_balanced_brackets(s: str) -> bool:\n    # Використайте стек або лічильник глибини\n    pass\n',
            tests: [
              { input: '"((()))"', expectedOutput: 'True', isSecret: false },
              { input: '"(()())"', expectedOutput: 'True', isSecret: false },
              { input: '"(()"', expectedOutput: 'False', isSecret: false },
              { input: '")("', expectedOutput: 'False', isSecret: true },
            ],
            hints: 'Відкриваюча дужка додається в стек | Закриваюча дужка повинна знімати елемент зі стека | Якщо стек порожній, а дужка закривається — рядок незбалансований',
          },
        },
        {
          title: 'Алгоритми пошуку та хешування: Хеш-таблиці та O(1) доступ',
          desc: 'Механізм роботи хеш-функцій, розвʼязання колізій та застосування словників (dict/set) для оптимізації задач з O(N^2) до O(N).',
          skills: [
            { title: 'Принципи хешування та колізії', difficulty: 'MEDIUM', pL0: 0.12, pT: 0.20 },
            { title: 'Пошук двох чисел із заданою сумою (Two Sum)', difficulty: 'HARD', pL0: 0.08, pT: 0.15 },
          ],
          theory: {
            hook: 'Як телефонна книга миттєво знаходить контакт серед 10 000 номерів? Хеш-таблиці перетворюють будь-який ключ на числову адресу в памʼяті за лічені наносекунди.',
            concepts: '### Як працює хеш-таблиця\n\nХеш-функція перетворює довільний обʼєкт на ціле число. За цим індексом елемент розміщується у внутрішньому масиві (бакетах).\n- Пошук за ключем у хеш-таблиці (словнику dict) займає в середньому **$O(1)$**.\n- Для порівняння, лінійний пошук у списку займає $O(N)$.',
            snippet: 'def two_sum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
            explanation: 'Замість подвійного вкладеного циклу O(N^2), збереження вже побачених чисел у хеш-таблиці дозволяє розвʼязати задачу Two Sum за O(N) часу та O(N) памʼяті.',
            miscTitle: 'Використання списку для перевірки "in" замість множини set',
            miscExpl: 'Вираз "x in list" сканує весь список за O(N), тоді як "x in set" виконується миттєво за O(1). Ніколи не робіть перевірку входження у великих списках всередині циклів.',
            takeaways: 'Хеш-таблиця забезпечує середній пошук за O(1) | Ключі хеш-таблиці повинні бути незмінними (immutable) | Хешування розмінює памʼять на колосальну швидкість роботи',
          },
          task: {
            title: 'Знаходження першого дубліката за O(N)',
            prompt: 'Напишіть функцію first_duplicate(nums: list[int]) -> int, яка знаходить перше число, що повторюється. Якщо дублікатів немає, поверніть -1.',
            starter: 'def first_duplicate(nums: list[int]) -> int:\n    # Використайте множину set для O(1) перевірки\n    pass\n',
            tests: [
              { input: '[2, 1, 3, 5, 3, 2]', expectedOutput: '3', isSecret: false },
              { input: '[1, 2, 3, 4]', expectedOutput: '-1', isSecret: false },
              { input: '[7, 7]', expectedOutput: '7', isSecret: true },
            ],
            hints: 'Створіть порожню множину seen = set() | Для кожного числа перевірте "if x in seen" | Якщо число є — поверніть його одразу',
          },
        },
        {
          title: 'Динамічне програмування та мемоїзація',
          desc: 'Метод зведення складних задач до повторюваних підзадач з оптимізацією кешування результатів.',
          skills: [
            { title: 'Рекурсія з мемоїзацією (Top-down)', difficulty: 'MEDIUM', pL0: 0.10, pT: 0.18 },
            { title: 'Табуляція та простір станів (Bottom-up)', difficulty: 'HARD', pL0: 0.05, pT: 0.14 },
          ],
          theory: {
            hook: 'Ті, хто не памʼятають свого минулого, приречені повторювати його. Динамічне програмування — це саме запамʼятовування вже знайдених відповідей.',
            concepts: '### Сутність динамічного програмування\n\nДинамічне програмування (ДП) застосовується, коли задача має:\n1. **Оптимальну підструктуру** — розвʼязок задачі виражається через розвʼязки менших підзадач.\n2. **Підзадачі, що перекриваються** — ті самі значення обчислюються багаторазово (як у наївних числах Фібоначчі $O(2^N)$).',
            snippet: 'def fib_memo(n: int, memo = {}) -> int:\n    if n <= 1:\n        return n\n    if n not in memo:\n        memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)\n    return memo[n]',
            explanation: 'Завдяки словнику memo кожне число Фібоначчі обчислюється лише один раз, знижуючи складність з експоненційної O(2^N) до лінійної O(N).',
            miscTitle: 'Використання наївної рекурсії без мемоїзації',
            miscExpl: 'Без збереження проміжних станів стек викликів переповнюється (RecursionError), а час обчислення для N=50 становить години.',
            takeaways: 'Шукайте підзадачі, що перекриваються | Мемоїзація: зверху вниз (Top-down) | Табуляція: знизу вгору (Bottom-up)',
          },
          task: {
            title: 'Обчислення n-го числа Фібоначчі за O(N)',
            prompt: 'Реалізуйте функцію fib_fast(n: int) -> int, яка обчислює n-е число Фібоначчі (fib_fast(0)=0, fib_fast(1)=1) за лінійний час без переповнення стека.',
            starter: 'def fib_fast(n: int) -> int:\n    # Обчисліть n-е число Фібоначчі\n    pass\n',
            tests: [
              { input: '6', expectedOutput: '8', isSecret: false },
              { input: '10', expectedOutput: '55', isSecret: false },
              { input: '0', expectedOutput: '0', isSecret: true },
            ],
            hints: 'Використайте дві змінні a, b = 0, 1 | У циклі for _ in range(n): a, b = b, a + b | Поверніть a',
          },
        },
        {
          title: 'Графові моделі та пошук шляхів (BFS / DFS)',
          desc: 'Представлення графів у вигляді списків суміжності, обхід у ширину для найкоротшого шляху та обхід у глибину.',
          skills: [
            { title: 'Обхід графа в ширину (BFS)', difficulty: 'HARD', pL0: 0.08, pT: 0.16 },
            { title: 'Виявлення циклів у графі (DFS)', difficulty: 'HARD', pL0: 0.05, pT: 0.12 },
          ],
          theory: {
            hook: 'GPS-навігатор у вашому авто розглядає перехрестя як вершини, а вулиці — як ребра графа, прокладаючи ідеальний маршрут за долі секунди.',
            concepts: '### Структури даних для графів\n\n- **BFS (Breadth-First Search)**: використовує чергу FIFO. Знаходить найкоротший шлях у невиваженому графі хвильовим методом.\n- **DFS (Depth-First Search)**: використовує стек LIFO або рекурсію. Ідеально підходить для перевірки звʼязності та пошуку циклів.',
            snippet: 'from collections import deque\ndef bfs_shortest_path(graph, start, goal):\n    queue = deque([[start]])\n    visited = {start}\n    while queue:\n        path = queue.popleft()\n        node = path[-1]\n        if node == goal:\n            return path\n        for neighbor in graph.get(node, []):\n            if neighbor not in visited:\n                visited.add(neighbor)\n                queue.append(path + [neighbor])\n    return []',
            explanation: 'BFS гарантовано знаходить шлях з найменшою кількістю переходів завдяки пошаровому розширенню черги.',
            miscTitle: 'Забування про множину visited',
            miscExpl: 'Якщо не фіксувати відвідані вершини у visited, алгоритм потрапить у нескінченний цикл на першому ж циклічному ребрі.',
            takeaways: 'BFS — найкоротший шлях (черга) | DFS — глибинний аналіз та топологічне сортування (стек) | Завжди відстежуйте visited вершини',
          },
          task: {
            title: 'Перевірка досяжності вершини у графі',
            prompt: 'Реалізуйте функцію has_path(graph: dict, start: str, end: str) -> bool, яка перевіряє, чи існує шлях між вершинами start та end.',
            starter: 'def has_path(graph: dict, start: str, end: str) -> bool:\n    # Перевірте існування шляху між вершинами\n    pass\n',
            tests: [
              { input: '{"A": ["B"], "B": ["C"], "C": []}, "A", "C"', expectedOutput: 'True', isSecret: false },
              { input: '{"A": ["B"], "B": [], "C": []}, "A", "C"', expectedOutput: 'False', isSecret: false },
              { input: '{"X": ["X"]}, "X", "X"', expectedOutput: 'True', isSecret: true },
            ],
            hints: 'Використайте чергу deque та множину visited | Якщо поточна вершина дорівнює end — поверніть True | Якщо черга спорожніла — поверніть False',
          },
        },
      ];
    } else if (isWeb) {
      courseTitle = courseTitle.length > 5 ? courseTitle : 'Сучасна веб-розробка: HTML5, CSS3 та JavaScript';
      icon = 'Globe';
      codeLang = 'javascript';
      moduleTemplates = [
        {
          title: 'Семантична структура та анатомія HTML5',
          desc: 'Сучасні стандарти побудови доступних та пошуково-оптимізованих веб-сторінок за стандартом W3C.',
          skills: [
            { title: 'Семантичні теги header, main, section', difficulty: 'EASY', pL0: 0.25, pT: 0.30 },
            { title: 'Форми та атрибути валідації HTML5', difficulty: 'EASY', pL0: 0.20, pT: 0.25 },
          ],
          theory: {
            hook: 'Для програми екранного диктора (Screen Reader) веб-сторінка без семантичних тегів виглядає як суцільна каша з однакових div-блоків.',
            concepts: '### Семантика HTML5\n\nСемантичні теги несуть сенсове навантаження для браузерів, пошукових роботів та людей з порушеннями зору:\n- `<header>` — вступна частина або навігація\n- `<main>` — унікальний основний зміст документа\n- `<article>` — незалежний, самодостатній контент\n- `<section>` — логічна тематична секція',
            snippet: '<article class="card">\n  <header>\n    <h2>Заголовок статті</h2>\n  </header>\n  <p>Основний зміст матеріалу...</p>\n  <footer>\n    <time datetime="2026-11-14">14 Листопада 2026</time>\n  </footer>\n</article>',
            explanation: 'Використання тегів article, header та footer робить структуру коду зрозумілою та доступною без надлишкових класів div.',
            miscTitle: 'Використання <div> для кнопок замість <button>',
            miscExpl: 'Блок <div onclick="..."> не підтримує керування клавіатурою (Enter/Space) та не фокусується через Tab без спеціальних aria-атрибутів.',
            takeaways: 'Семантика забезпечує доступність (a11y) та SEO | Тег <main> має бути єдиним на сторінці | Використовуйте нативні <button> та <form>',
          },
          task: {
            title: 'Форматування URL-посилання з безпечним атрибутом',
            prompt: 'Напишіть функцію build_safe_link(url: string, text: string): string, яка повертає HTML-рядок <a> з атрибутами target="_blank" та rel="noopener noreferrer".',
            starter: 'function build_safe_link(url, text) {\n  // Сформуйте безпечне посилання\n  return "";\n}',
            tests: [
              { input: '"https://example.com", "Example"', expectedOutput: '"<a href=\\"https://example.com\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">Example</a>"', isSecret: false },
              { input: '"https://sbc.ua", "Portal"', expectedOutput: '"<a href=\\"https://sbc.ua\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">Portal</a>"', isSecret: true },
            ],
            hints: 'Використайте шаблонний рядок зворотних лапок `` | Обовʼязково вкажіть rel="noopener noreferrer" для безпеки проти tabnabbing',
          },
        },
        {
          title: 'Сучасна верстка: Flexbox та CSS Grid',
          desc: 'Створення адаптивних компонентів та макетів без використання сторонніх громіздких CSS-бібліотек.',
          skills: [
            { title: 'Одновимірне позиціонування Flexbox', difficulty: 'EASY', pL0: 0.18, pT: 0.22 },
            { title: 'Двовимірні сітки CSS Grid', difficulty: 'MEDIUM', pL0: 0.12, pT: 0.18 },
          ],
          theory: {
            hook: 'Памʼятаєте часи, коли центрування тексту по вертикалі в CSS вимагало трюків з таблицями чи відʼємними відступами? Сьогодні це робиться у 2 рядки Flexbox.',
            concepts: '### Flexbox vs Grid\n\n- **Flexbox**: одновимірна модель (або рядок, або колонка). Ідеально підходить для навігаційних панелей, кнопок, карток.\n- **CSS Grid**: двовимірна система (рядки + колонки одночасно). Ідеальна для глобальних макетів сторінок.',
            snippet: '.container {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 1rem;\n}',
            explanation: 'Властивості justify-content керують розподілом вздовж головної осі, а align-items — вздовж поперечної.',
            miscTitle: 'Використання float для побудови сучасних сіток',
            miscExpl: 'Властивість float призначена виключно для обтікання тексту навколо зображень. Для колонок та сіток використовуйте тільки Grid та Flexbox.',
            takeaways: 'Flexbox — для лінійних компонентів | Grid — для складних двовимірних макетів | gap замінює складні margin-хаки',
          },
          task: {
            title: 'Генерація CSS-класу гнучкого центрування',
            prompt: 'Напишіть функцію get_flex_center_css(): string, яка повертає рядок із трьома правилами Flexbox для ідеального центрування вмісту.',
            starter: 'function get_flex_center_css() {\n  return "";\n}',
            tests: [
              { input: '""', expectedOutput: '"display: flex; justify-content: center; align-items: center;"', isSecret: false },
            ],
            hints: 'Рядок повинен містити display: flex; justify-content: center; align-items: center;',
          },
        },
        {
          title: 'Інтерактивність у JavaScript: DOM, Події та Стан',
          desc: 'Маніпуляція вузлами DOM-дерева, патерн слухачів подій (Event Listeners) та обробка дій користувача.',
          skills: [
            { title: 'Селектори DOM та зміна класів', difficulty: 'EASY', pL0: 0.15, pT: 0.20 },
            { title: 'Делегування подій (Event Delegation)', difficulty: 'MEDIUM', pL0: 0.10, pT: 0.15 },
          ],
          theory: {
            hook: 'Кожен клік, натискання клавіші чи рух пальцем на екрані генерує подію в браузері. Вміння ними керувати — суперсила фронтенд-розробника.',
            concepts: '### Модель подій у браузері\n\nПодії спливають (Event Bubbling) від цільового елемента (`event.target`) вгору по дереву DOM до кореня `document`.\n- **Делегування подій**: замість навішування 100 слухачів на кожен елемент списку, ми вішаємо один слухач на батьківський `<ul>`.',
            snippet: 'const list = document.querySelector("#todo-list");\nlist.addEventListener("click", (event) => {\n  if (event.target.matches("button.delete")) {\n    event.target.closest("li").remove();\n  }\n});',
            explanation: 'Завдяки перевірці event.target.matches обробник спрацьовує навіть для динамічно доданих нових пунктів списку.',
            miscTitle: 'Навішування обробників подій в атрибутах onclick HTML',
            miscExpl: 'Інлайн обробники onclick="..." забруднюють розмітку, порушують CSP-безпеку та не дозволяють призначити кілька слухачів на одну дію. Завжди використовуйте addEventListener.',
            takeaways: 'addEventListener дозволяє чисту сепарацію коду | Делегування подій економить памʼять браузера | Використовуйте closest() для пошуку батьків',
          },
          task: {
            title: 'Фільтрація списку за пошуковим словом',
            prompt: 'Напишіть функцію filter_items(items: string[], query: string): string[], яка повертає елементи, що містять шуканий рядок без урахування регістру.',
            starter: 'function filter_items(items, query) {\n  // Відфільтруйте елементи\n  return [];\n}',
            tests: [
              { input: '["Apple", "Banana", "Orange"], "an"', expectedOutput: '["Banana", "Orange"]', isSecret: false },
              { input: '["HTML", "CSS", "JS"], "py"', expectedOutput: '[]', isSecret: false },
            ],
            hints: 'Приведіть обидва рядки до нижнього регістру через .toLowerCase() | Використайте метод .includes()',
          },
        },
      ];
    } else {
      // Універсальний дидактичний шаблон для будь-якої теми
      courseTitle = courseTitle.length > 5 ? courseTitle : `Основи дисципліни: ${rawPrompt}`;
      icon = 'BookOpen';
      codeLang = 'python';
      moduleTemplates = [
        {
          title: 'Фундаментальні концепції та теоретичний базис',
          desc: `Вступний модуль, присвячений базовим визначенням, термінології та фундаментальним законам теми "${rawPrompt}".`,
          skills: [
            { title: 'Базові поняття та термінологія', difficulty: 'EASY', pL0: 0.25, pT: 0.30 },
            { title: 'Класифікація та структурні моделі', difficulty: 'MEDIUM', pL0: 0.15, pT: 0.22 },
          ],
          theory: {
            hook: `Чому важливо опанувати фундаментальні основи дисципліни "${rawPrompt}" перш ніж переходити до складних прикладних кейсів?`,
            concepts: `### Фундаментальні основи теми\n\nУ цьому розділі ми вивчаємо концептуальний апарат та ключові принципи:\n1. Системний підхід до аналізу обʼєктів.\n2. Взаємозвʼязок між компонентами та даними.\n3. Критерії ефективності та надійності.`,
            snippet: '# Базова перевірка цілісності вхідних даних\ndef validate_input(val):\n    return val is not None and len(str(val)) > 0',
            explanation: 'Функція виконує первинну перевірку наявності даних перед подальшою аналітичною обробкою.',
            miscTitle: 'Поспішні висновки без перевірки граничних умов',
            miscExpl: 'Учні часто ігнорують перевірку порожніх значень та екстремальних параметрів, що призводить до помилок часу виконання.',
            takeaways: 'Завжди валідуйте вхідні дані | Розумійте базову термінологію | Побудуйте міцний фундамент перед оптимізаціями',
          },
          task: {
            title: 'Перевірка коректності вхідного значення',
            prompt: 'Напишіть функцію is_valid_input(data), яка повертає True, якщо передане значення не є None і не є порожнім рядком, інакше False.',
            starter: 'def is_valid_input(data):\n    pass\n',
            tests: [
              { input: '"Hello"', expectedOutput: 'True', isSecret: false },
              { input: '""', expectedOutput: 'False', isSecret: false },
              { input: 'None', expectedOutput: 'False', isSecret: true },
            ],
            hints: 'Перевірте data is not None | Перевірте str(data).strip() != ""',
          },
        },
        {
          title: 'Практичні методики та алгоритми розвʼязання задач',
          desc: `Формування практичних умінь та навичок застосування інструментарію на реальних прикладних прикладах.`,
          skills: [
            { title: 'Застосування типових патернів', difficulty: 'MEDIUM', pL0: 0.12, pT: 0.20 },
            { title: 'Аналіз та виправлення помилок', difficulty: 'MEDIUM', pL0: 0.10, pT: 0.18 },
          ],
          theory: {
            hook: 'Теорія без практики мертва. Розгляньмо, як сухі формули перетворюються на реальний робочий інструмент.',
            concepts: '### Практичні патерни проектування\n\n- Розбиття монолітної задачі на незалежні підзадачі (Decomposition).\n- Перевикористання перевірених шаблонів та абстракцій.\n- Логування проміжних станів для швидкого налагодження.',
            snippet: 'def process_pipeline(items):\n    result = []\n    for item in items:\n        if item > 0:\n            result.append(item * 2)\n    return result',
            explanation: 'Конвеєр фільтрує некоректні дані та трансформує лише валідні елементи.',
            miscTitle: 'Спроба вирішити все одним велетенським блоком',
            miscExpl: 'Складні конструкції важко читати й тестувати. Розбивайте логіку на компактні чисті функції.',
            takeaways: 'Декомпозиція спрощує розуміння | Чисті функції легше тестувати | Практикуйтеся на реальних кейсах',
          },
          task: {
            title: 'Подвоєння додатних елементів списку',
            prompt: 'Напишіть функцію double_positives(nums: list[int]) -> list[int], яка повертає список, що містить подвоєні значення лише додатних чисел (> 0).',
            starter: 'def double_positives(nums):\n    pass\n',
            tests: [
              { input: '[-2, 0, 3, 5]', expectedOutput: '[6, 10]', isSecret: false },
              { input: '[-1, -5]', expectedOutput: '[]', isSecret: false },
            ],
            hints: 'Використайте list comprehension [x * 2 for x in nums if x > 0]',
          },
        },
        {
          title: 'Комплексний аналіз, оптимізація та підсумки',
          desc: `Узагальнення знань, оцінка якості рішень, пошук вузьких місць та підготовка до фінальної сертифікації.`,
          skills: [
            { title: 'Оптимізація та рефакторинг', difficulty: 'HARD', pL0: 0.08, pT: 0.15 },
            { title: 'Комплексна валідація системи', difficulty: 'HARD', pL0: 0.05, pT: 0.12 },
          ],
          theory: {
            hook: 'Рішення працює — це лише половина справи. Справжня майстерність полягає в тому, щоб воно було швидким, надійним та підтримуваним.',
            concepts: '### Критерії якості інженерного розвʼязку\n\n1. **Коректність**: проходження всіх валідаційних тестів, включаючи приховані граничні кейси.\n2. **Читабельність**: самодокументований код зі змістовними іменами змінних.\n3. **Масштабованість**: збереження продуктивності при збільшенні обсягів даних.',
            snippet: 'def calculate_efficiency(total, successful):\n    if total <= 0:\n        return 0.0\n    return round(successful / total, 2)',
            explanation: 'Функція враховує потенційне ділення на нуль і повертає нормалізований коефіцієнт.',
            miscTitle: 'Передчасна оптимізація (Premature Optimization)',
            miscExpl: 'Не намагайтеся оптимізувати те, що ще не працює коректно. Спочатку зробіть код правильним, потім зрозумілим, і лише за потреби — швидким.',
            takeaways: 'Правильність завжди передує швидкодії | Тестуйте крайні випадки | Чистий код легше супроводжувати',
          },
          task: {
            title: 'Розрахунок коефіцієнта успішності',
            prompt: 'Реалізуйте функцію get_success_rate(total: int, success: int) -> float, яка повертає частку успішних спроб, округлену до 2 знаків після коми. Якщо total <= 0, поверніть 0.0.',
            starter: 'def get_success_rate(total, success):\n    pass\n',
            tests: [
              { input: '10, 8', expectedOutput: '0.8', isSecret: false },
              { input: '0, 0', expectedOutput: '0.0', isSecret: false },
              { input: '3, 1', expectedOutput: '0.33', isSecret: true },
            ],
            hints: 'Обовʼязково перевірте if total <= 0 | Використайте round(success / total, 2)',
          },
        },
      ];
    }

    // Обрізаємо або дублюємо модулі до запитаної кількості
    const chosenModules = moduleTemplates.slice(0, moduleCount);
    while (chosenModules.length < moduleCount) {
      const idx = chosenModules.length + 1;
      chosenModules.push({
        title: `Модуль ${idx}: Поглиблені аспекти та практичні проекти`,
        desc: `Поглиблений розділ курсу, спрямований на закріплення знань через реалізацію комплексних практичних завдань.`,
        skills: [
          { title: `Практичне проектування (частина ${idx})`, difficulty: 'MEDIUM', pL0: 0.10, pT: 0.18 },
          { title: `Фінальне тестування знань ${idx}`, difficulty: 'HARD', pL0: 0.06, pT: 0.14 },
        ],
        theory: {
          hook: `Перевірте власні сили на складному комплексному кейсі рівня ${idx}!`,
          concepts: `### Поглиблені аспекти теми\n\nЗакріплення матеріалу через синтез попередніх концепцій.`,
          snippet: '# Комплексний підсумковий скрипт\ndef solve_advanced():\n    return True',
          explanation: 'Підсумкова реалізація з інтеграцією всіх вивчених модулів.',
          miscTitle: 'Неуважність до деталей на фінальному етапі',
          miscExpl: 'Перевірте всі взаємозвʼязки між раніше створеними компонентами.',
          takeaways: 'Синтезуйте знання | Звертайте увагу на архітектуру | Проводьте регресійне тестування',
        },
        task: {
          title: `Комплексна задача модуля ${idx}`,
          prompt: 'Напишіть функцію solve_step(x), яка повертає x * 2, якщо x > 0, інакше 0.',
          starter: 'def solve_step(x):\n    pass\n',
          tests: [
            { input: '5', expectedOutput: '10', isSecret: false },
            { input: '-3', expectedOutput: '0', isSecret: false },
          ],
          hints: 'Перевірте умову x > 0',
        },
      });
    }

    // ── 1. Паспорт курсу ──
    const courseSlug = slugifyUkrainian(courseTitle);
    const course = {
      title: courseTitle,
      slug: courseSlug,
      category,
      description: `Адаптивний інтерактивний курс: ${courseTitle}. Побудований на засадах когнітивного моделювання BKT (Bayesian Knowledge Tracing), 5-блочного читання Zen Focus та практичного програмування в Monaco Editor.`,
      targetAudience,
      difficultyLevel: 'BEGINNER',
      bktMasteryThreshold: targetPl,
      icon,
      isPublished: false,
    };

    // ── 2. Модулі курсу ──
    const modules: ParsedCourseImportDto['modules'] = [];
    const skills: ParsedCourseImportDto['skills'] = [];
    const theories: ParsedCourseImportDto['theories'] = [];
    const tasks: ParsedCourseImportDto['tasks'] = [];

    let previousSkillSlug = ''; // Для побудови гарантовано ациклічного DAG

    chosenModules.forEach((m, mIdx) => {
      const orderIndex = mIdx + 1;
      const modSlug = slugifyUkrainian(m.title);

      modules.push({
        orderIndex,
        title: m.title,
        slug: modSlug,
        theoryUrl: `/learn/${courseSlug}/${modSlug}`,
        bktThreshold: targetPl,
        description: m.desc,
      });

      // ── 3. Компетентності BKT (DAG) ──
      m.skills.forEach((s, sIdx) => {
        const cleanSkillSlug = slugifyUkrainian(s.title).slice(0, 30);
        const skillSlug = `${modSlug.slice(0, 20)}-${cleanSkillSlug}-${sIdx + 1}`;
        const prerequisites = previousSkillSlug ? previousSkillSlug : '';
        previousSkillSlug = skillSlug; // наступна навичка спирається на цю

        skills.push({
          moduleSlug: modSlug,
          orderIndex: sIdx + 1,
          title: s.title,
          slug: skillSlug,
          difficulty: s.difficulty,
          prerequisites,
          pL0: s.pL0,
          pT: s.pT,
          pS: 0.10,
          pG: 0.20,
        });

        // ── 5. Практичні завдання до кожної компетенції ──
        tasks.push({
          skillSlug,
          orderIndex: 1,
          taskType: 'CODE',
          difficulty: s.difficulty,
          title: m.task.title,
          prompt: m.task.prompt,
          starterCode: m.task.starter,
          testCasesJson: JSON.stringify(m.task.tests),
          hintsList: m.task.hints,
        });
      });

      // ── 4. 5-блочна теорія Zen Focus ──
      theories.push({
        moduleSlug: modSlug,
        hookIntro: m.theory.hook,
        conceptsMarkdown: m.theory.concepts,
        codeLang,
        codeSnippet: m.theory.snippet,
        codeExplanation: m.theory.explanation,
        misconceptionTitle: m.theory.miscTitle,
        misconceptionExplanation: m.theory.miscExpl,
        takeawaysList: m.theory.takeaways,
      });
    });

    return { course, modules, skills, theories, tasks };
  }
}
