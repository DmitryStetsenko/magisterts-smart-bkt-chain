/**
 * js-tasks.data.ts
 *
 * Comprehensive Multi-Tier Adaptive Task Bank for JavaScript Core Course
 * Conforming strictly to:
 * - docs/justifications/02_multilevel_mastery_difficulty_scaling_and_cooldown.md
 * - docs/justifications/03_task_authoring_and_pedagogical_specification.md
 *
 * Each topic is built as a "Cognitive Triad" (EASY, MEDIUM, HARD) with explicit
 * subConcepts, valid JSON test cases, starter code, and hidden tests to prevent gaming.
 */

export interface SeedOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface SeedTestCase {
  input: string; // JSON-serialized argument array
  expectedOutput: string; // JSON-serialized or stringified output
  isSecret?: boolean;
}

export interface SocraticHint {
  level: number;
  hint: string;
  penaltyPct: number;
}

export interface SeedTask {
  topic: string;
  subConcept: string;
  taskType: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'CODE' | 'TEXT_ESSAY';
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  starterCode?: string;
  options?: SeedOption[] | any;
  testCases?: SeedTestCase[];
  referenceAnswer?: string;
  rubrics?: any;
  socraticHints?: SocraticHint[];
  studyUnitUrl?: string;
}

// ============================================================================
// MODULE 1: js-basics (Основи JS: Змінні, Типи, Оператори та Розгалуження)
// 7 Topics x 3 Tiers = 21 Tasks + 1 Capstone Challenge = 22 Tasks
// ============================================================================
export const jsBasicsTasks: SeedTask[] = [
  // --- Topic 1: variables-declaration ---
  // EASY Blitz 1: Academic / Conceptual
  {
    topic: 'variables-declaration',
    subConcept: 'const-immutability',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Незмінність посилання const',
    description: 'Що відбудеться при спробі переприсвоїти значення змінній, оголошеній як `const PI = 3.14; PI = 3.14159;`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Виникне помилка TypeError: Assignment to constant variable', isCorrect: true },
      { id: 'opt2', text: 'Значення успішно перепишеться на нове', isCorrect: false },
      { id: 'opt3', text: 'Значення стане undefined', isCorrect: false },
      { id: 'opt4', text: 'Код виконається без помилки, але значення залишиться 3.14', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Зверніть увагу на саму назву "const" (константа). Чи дозволяє мова змінювати звʼязку ідентифікатора з новим значенням після ініціалізації?', penaltyPct: 15 },
      { level: 2, hint: 'Операція присвоєння "=" до ідентифікатора const є неприпустимою і негайно викидає виняток TypeError.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/variables-declaration#const-immutability',
  },
  // EASY Blitz 2: Metaphor / Real-World Analogy
  {
    topic: 'variables-declaration',
    subConcept: 'const-immutability-metaphor',
    taskType: 'SINGLE_CHOICE',
    title: 'Метафора: Коробка з пломбою (const vs let)',
    description: 'Уявіть змінні як коробки на складі. Яка життєва метафора найкраще пояснює поведінку ключового слова `const` для примітивних значень?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Це опломбований контейнер: поклавши туди число одного разу, його не можна замінити на інше без зриву пломби (TypeError)', isCorrect: true },
      { id: 'opt2', text: 'Це звичайна поштова скринька, куди листоноша може класти нові листи щодня', isCorrect: false },
      { id: 'opt3', text: 'Це дошка оголошень, на якій написане крейдою автоматично зникає щосекунди', isCorrect: false },
      { id: 'opt4', text: 'Це дзеркало, яке завжди показує лише значення сусідньої змінної', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Що зазвичай робить пломба або гравіювання? Вона фіксує вміст назавжди, не дозволяючи заміну.', penaltyPct: 15 },
      { level: 2, hint: 'Ключове слово const жорстко захищає змінну від повторного переприсвоєння.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/variables-declaration#const-immutability',
  },
  // EASY Blitz 3: Syntax Pattern & "What If?"
  {
    topic: 'variables-declaration',
    subConcept: 'const-initialization-requirement',
    taskType: 'SINGLE_CHOICE',
    title: 'Синтаксичний бліц: Оголошення const без значення',
    description: 'Що станеться, якщо написати рядок `const maxRetries;` без надання початкового значення?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Виникне помилка синтаксису: Missing initializer in const declaration', isCorrect: true },
      { id: 'opt2', text: 'Змінна автоматично отримає значення undefined і чекатиме ініціалізації', isCorrect: false },
      { id: 'opt3', text: 'Змінна автоматично ініціалізується нулем 0', isCorrect: false },
      { id: 'opt4', text: 'Код успішно скомпілюється і створить глобальну змінну', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Якщо значення const ніколи не можна змінити пізніше, чи має сенс створювати її порожньою?', penaltyPct: 15 },
      { level: 2, hint: 'Специфікація JavaScript вимагає обовʼязкового надання значення одразу під час оголошення const.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/variables-declaration#const-immutability',
  },
  {
    topic: 'variables-declaration',
    subConcept: 'let-block-scope',
    taskType: 'CODE',
    title: 'Оголошення та ініціалізація змінних let',
    description: 'Оголосіть змінну `city` зі значенням `"Kyiv"`, та числову змінну `temperature` зі значенням `22`. Збільшіть значення `temperature` на 3 градуси, додавши 3 до поточного значення.',
    difficulty: 'MEDIUM',
    starterCode: '// 1. Оголосіть let city = "Kyiv";\n// 2. Оголосіть let temperature = 22;\n// 3. Збільшіть temperature на 3 (temperature = temperature + 3 або += 3);\nlet city = "Kyiv";\nlet temperature = 22;\n',
    testCases: [
      { input: '"city"', expectedOutput: '"Kyiv"', isSecret: false },
      { input: '"temperature"', expectedOutput: '25', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Як збільшити числове значення змінної на 3? Можна використати скорочений оператор += 3 або пряме додавання temperature = temperature + 3.', penaltyPct: 15 },
      { level: 2, hint: 'Переконайтеся, що ви використовуєте ключове слово let, а не const, оскільки значення temperature потрібно перезаписати.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/variables-declaration#let-block-scope',
  },
  {
    topic: 'variables-declaration',
    subConcept: 'temporal-dead-zone',
    taskType: 'SINGLE_CHOICE',
    title: 'Поглиблено: Temporal Dead Zone (TDZ)',
    description: 'Чому звернення до змінної `let` або `const` ДО рядка її оголошення викликає `ReferenceError`, на відміну від `var`?',
    difficulty: 'HARD',
    options: [
      { id: 'opt1', text: 'Змінні let/const перебувають у Temporal Dead Zone від початку блоку до моменту ініціалізації', isCorrect: true },
      { id: 'opt2', text: 'Змінні let/const взагалі не піднімаються (no hoisting) рушієм V8', isCorrect: false },
      { id: 'opt3', text: 'Це обмеження безпеки браузера, викликане Strict Mode', isCorrect: false },
      { id: 'opt4', text: 'Рушій автоматично встановлює їм значення null до ініціалізації', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Чи дійсно змінні let/const не піднімаються (hoisting)? Специфікація піднімає їх на рівні лексичного оточення, але залишає неініціалізованими до фактичного рядка коду.', penaltyPct: 15 },
      { level: 2, hint: 'Цей часовий проміжок між початком блоку та ініціалізацією змінної має спеціальну назву в стандарті ECMAScript — TDZ.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/variables-declaration#temporal-dead-zone',
  },

  // --- Topic 2: primitive-types ---
  // EASY Blitz 1: Academic
  {
    topic: 'primitive-types',
    subConcept: 'type-identification',
    taskType: 'MULTIPLE_CHOICE',
    title: 'Примітивні типи даних у специфікації ECMAScript',
    description: 'Оберіть УСІ типи даних, які є примітивними в сучасному JavaScript:',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'string', isCorrect: true },
      { id: 'opt2', text: 'number', isCorrect: true },
      { id: 'opt3', text: 'boolean', isCorrect: true },
      { id: 'opt4', text: 'bigint & symbol', isCorrect: true },
      { id: 'opt5', text: 'Array', isCorrect: false },
      { id: 'opt6', text: 'Object', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Примітиви — це неподільні базові значення, що передаються за значенням, а не за посиланням. Чи є Array та Object примітивами?', penaltyPct: 15 },
      { level: 2, hint: 'У JS 7 примітивних типів: string, number, bigint, boolean, symbol, undefined, null. Масиви та обʼєкти належать до посилальних типів.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/primitive-types#type-identification',
  },
  // EASY Blitz 2: Metaphor / Real-World Analogy
  {
    topic: 'primitive-types',
    subConcept: 'primitive-vs-reference-metaphor',
    taskType: 'SINGLE_CHOICE',
    title: 'Метафора: Значення проти Посилання (Примітив vs Обʼєкт)',
    description: 'Уявіть копіювання інформації в реальному світі. Яка аналогія точно відображає роботу з примітивними типами (число, рядок)?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Ксерокопія документа: змінюючи позначки на своїй копії, ви жодним чином не змінюєте оригінал у колеги', isCorrect: true },
      { id: 'opt2', text: 'Спільний Google Doc за посиланням: якщо один редагує текст, усі бачать зміну', isCorrect: false },
      { id: 'opt3', text: 'Ключ від квартири: кілька людей відкривають ті самі двері', isCorrect: false },
      { id: 'opt4', text: 'Ярлик на робочому столі компʼютера, що веде до файлу на диску', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'При копіюванні примітивів кожна змінна отримує незалежне значення в стеку памʼяті.', penaltyPct: 15 },
      { level: 2, hint: 'Ксерокопія повністю автономна: олівець на другій копії ніколи не торкнеться оригіналу.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/primitive-types#primitive-vs-reference',
  },
  // EASY Blitz 3: Syntax Pattern & "What If?"
  {
    topic: 'primitive-types',
    subConcept: 'typeof-undefined-vs-null',
    taskType: 'SINGLE_CHOICE',
    title: 'Синтаксичний бліц: Значення за замовчуванням неоголошеної змінної',
    description: 'Яке значення та тип має щойно оголошена змінна `let userAge;` до того, як їй щось присвоїли?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Значення undefined та тип "undefined"', isCorrect: true },
      { id: 'opt2', text: 'Значення null та тип "object"', isCorrect: false },
      { id: 'opt3', text: 'Значення 0 та тип "number"', isCorrect: false },
      { id: 'opt4', text: 'Порожній рядок "" та тип "string"', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Якщо ви запитали у людини вік, а вона ще не відповіла — значення не визначено чи навмисно очищено?', penaltyPct: 15 },
      { level: 2, hint: 'У JS рушій автоматично призначає неініціалізованим змінним let значення undefined.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/primitive-types#undefined-semantics',
  },
  {
    topic: 'primitive-types',
    subConcept: 'typeof-operator-quirks',
    taskType: 'SINGLE_CHOICE',
    title: 'Оператор typeof для примітивів та null',
    description: 'Який результат повертає вираз `typeof null` згідно з історичною особливістю специфікації JavaScript?',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt1', text: '"object"', isCorrect: true },
      { id: 'opt2', text: '"null"', isCorrect: false },
      { id: 'opt3', text: '"undefined"', isCorrect: false },
      { id: 'opt4', text: '"primitive"', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Це знаменитий історичний артефакт першої версії JS 1995 року, повʼязаний із двійковими тегами типів.', penaltyPct: 15 },
      { level: 2, hint: 'Рушій V8 через перші нульові біти помилково вважає null обʼєктом і повертає рядок "object".', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/primitive-types#typeof-operator-quirks',
  },
  {
    topic: 'primitive-types',
    subConcept: 'symbol-and-nan-semantics',
    taskType: 'CODE',
    title: 'Поглиблено: Оголошення унікального Symbol',
    description: 'Оголосіть константу `userId` як унікальний символ з описом `"id"` (використовуючи `Symbol("id")`), а також змінну `notANumber` зі значенням `NaN`.',
    difficulty: 'HARD',
    starterCode: '// Оголосіть userId через Symbol("id")\nconst userId = Symbol("id");\nconst notANumber = NaN;\n',
    testCases: [
      { input: 'eval:typeof userId', expectedOutput: '"symbol"', isSecret: false },
      { input: 'eval:Number.isNaN(notANumber)', expectedOutput: 'true', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Функція Symbol() викликається БЕЗ оператора new, оскільки Symbol є примітивом.', penaltyPct: 15 },
      { level: 2, hint: 'Для другого завдання просто присвойте глобальну константу NaN змінній notANumber.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/primitive-types#symbol-and-nan-semantics',
  },

  // --- Topic 3: type-coercion ---
  // EASY Blitz 1: Academic
  {
    topic: 'type-coercion',
    subConcept: 'implicit-coercion-rules',
    taskType: 'SINGLE_CHOICE',
    title: 'Неявне приведення: оператори + та -',
    description: 'Чому дорівнюють вирази `"5" - 2` та `"5" + 2` у JavaScript відповідно?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: '3 та "52"', isCorrect: true },
      { id: 'opt2', text: '"3" та 7', isCorrect: false },
      { id: 'opt3', text: '3 та 7', isCorrect: false },
      { id: 'opt4', text: 'NaN та "52"', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Оператор "-" існує ТІЛЬКИ в математиці (приводить рядок до числа), а оператор "+" вміє конкатенувати рядки.', penaltyPct: 15 },
      { level: 2, hint: 'Якщо один із операндів плюс рядок, JS склеює обидва як текст: "5" + 2 = "52".', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/type-coercion#implicit-coercion-rules',
  },
  // EASY Blitz 2: Metaphor / Real-World Analogy
  {
    topic: 'type-coercion',
    subConcept: 'loose-vs-strict-equality-metaphor',
    taskType: 'SINGLE_CHOICE',
    title: 'Метафора: Контроль на кордоні (=== проти ==)',
    description: 'Яка життєва метафора найточніше описує різницю між суворою рівністю `===` та несуворою `==`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: '=== вимагає і однаковий біометричний паспорт (тип), і особистість (значення); а == намагається перевдягнути гостя під будь-який дрес-код (приводить типи)', isCorrect: true },
      { id: 'opt2', text: '=== порівнює довжину слів, а == порівнює колір шрифту', isCorrect: false },
      { id: 'opt3', text: '=== працює лише з числами від 0 до 100', isCorrect: false },
      { id: 'opt4', text: 'Вони абсолютно однакові, але === виконується вдвічі швидше', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Суворе порівняння === ніколи не змінює типи порівнюваних операндів.', penaltyPct: 15 },
      { level: 2, hint: 'Несуворе порівняння == перед звіркою виконує неявне приведення (наприклад, рядок "5" перетворює на число 5).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/type-coercion#equality-operators',
  },
  // EASY Blitz 3: Syntax Pattern & "What If?"
  {
    topic: 'type-coercion',
    subConcept: 'boolean-coercion-falsy',
    taskType: 'MULTIPLE_CHOICE',
    title: 'Синтаксичний бліц: Значення, що приводяться до false (Falsy)',
    description: 'Оберіть УСІ значення, які при приведенні `Boolean(value)` дають `false` (Falsy-значення):',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: '0 та -0', isCorrect: true },
      { id: 'opt2', text: 'Порожній рядок ""', isCorrect: true },
      { id: 'opt3', text: 'null та undefined', isCorrect: true },
      { id: 'opt4', text: 'NaN', isCorrect: true },
      { id: 'opt5', text: 'Порожній масив []', isCorrect: false },
      { id: 'opt6', text: 'Рядок "0" (непорожній)', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Чи є будь-який обʼєкт або масив у JS (навіть порожній []) правдивим (truthy)? Так, посилання завжди truthy.', penaltyPct: 15 },
      { level: 2, hint: 'У JS рівно 8 falsy значень: false, 0, -0, 0n, "", null, undefined, NaN.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/type-coercion#falsy-values',
  },
  {
    topic: 'type-coercion',
    subConcept: 'strict-equality-coercion',
    taskType: 'CODE',
    title: 'Явне приведення типів (Number & Boolean)',
    description: 'Оголосіть змінну `rawScore = "42"`. Створіть змінну `numericScore`, яка явно перетворює `rawScore` на число за допомогою `Number(rawScore)`. Створіть змінну `hasPassed`, яка перетворює `numericScore >= 40` на булеве значення `Boolean(...)`.',
    difficulty: 'MEDIUM',
    starterCode: 'const rawScore = "42";\n// 1. Оголосіть numericScore через Number(rawScore)\n// 2. Оголосіть hasPassed через Boolean(numericScore >= 40)\nconst numericScore = Number(rawScore);\nconst hasPassed = Boolean(numericScore >= 40);\n',
    testCases: [
      { input: '"numericScore"', expectedOutput: '42', isSecret: false },
      { input: '"hasPassed"', expectedOutput: 'true', isSecret: false },
      { input: 'eval:typeof numericScore', expectedOutput: '"number"', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Функція Number("42") явно конвертує текст на числове значення 42.', penaltyPct: 15 },
      { level: 2, hint: 'Вираз numericScore >= 40 обчислюється як true, а Boolean(true) залишається true.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/type-coercion#explicit-coercion',
  },
  {
    topic: 'type-coercion',
    subConcept: 'corner-case-coercion',
    taskType: 'SINGLE_CHOICE',
    title: 'Поглиблено: Приведення обʼєктів до примітивів',
    description: 'Який результат обчислення виразу `[] + {}` у стандартному виразі JavaScript?',
    difficulty: 'HARD',
    options: [
      { id: 'opt1', text: '"[object Object]"', isCorrect: true },
      { id: 'opt2', text: '0', isCorrect: false },
      { id: 'opt3', text: 'NaN', isCorrect: false },
      { id: 'opt4', text: 'TypeError: Cannot convert object to primitive', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Порожній масив [] при перетворенні на примітив повертає порожній рядок "".', penaltyPct: 15 },
      { level: 2, hint: 'Обʼєкт {} конвертується у рядок "[object Object]". Їх склеювання через "+" дає "[object Object]".', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/type-coercion#corner-case-coercion',
  },

  // --- Topic 4: operators-and-logic ---
  // EASY Blitz 1: Academic
  {
    topic: 'operators-and-logic',
    subConcept: 'nullish-coalescing',
    taskType: 'SINGLE_CHOICE',
    title: 'Оператор нульового злиття (??)',
    description: 'Яка ключова різниця між оператором `a ?? b` та логічним АБО `a || b`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: '?? повертає b тільки якщо a дорівнює null або undefined; 0 та "" вважаються валідними значеннями', isCorrect: true },
      { id: 'opt2', text: '?? працює тільки з числами', isCorrect: false },
      { id: 'opt3', text: '|| не працює з булевими значеннями', isCorrect: false },
      { id: 'opt4', text: 'Вони абсолютно ідентичні у сучасних версіях JS', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Згадайте значення 0 або порожнього рядка "". Для оператора || це брехня (falsy), але для гри рахунок 0 є валідним значенням!', penaltyPct: 15 },
      { level: 2, hint: 'Оператор ?? (Nullish Coalescing) перевіряє виключно відсутність значення: null або undefined.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/operators-and-logic#nullish-coalescing',
  },
  // EASY Blitz 2: Metaphor / Real-World Analogy
  {
    topic: 'operators-and-logic',
    subConcept: 'short-circuit-metaphor',
    taskType: 'SINGLE_CHOICE',
    title: 'Метафора: Запобіжник у проводці (Short-Circuit Evaluation)',
    description: 'Яка життєва метафора найкраще описує поведінку оператора `false && doHeavyWork()`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Перегорілий запобіжник на старті: струм не йде далі, тому другий прилад (doHeavyWork) навіть не вмикається', isCorrect: true },
      { id: 'opt2', text: 'Два паралельні генератори, що працюють одночасно в будь-якому випадку', isCorrect: false },
      { id: 'opt3', text: 'Турнікет у метро, який завжди пропускає обох пасажирів', isCorrect: false },
      { id: 'opt4', text: 'Терези, що обовʼязково зважують обидва мішки перед відповіддю', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Якщо перша умова в ланцюжку && уже брехлива, чи може весь вираз стати істинним?', penaltyPct: 15 },
      { level: 2, hint: 'Рушій V8 заощаджує ресурси й негайно повертає перше хибне значення, не обчислюючи праву частину.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/operators-and-logic#short-circuit',
  },
  // EASY Blitz 3: Syntax Pattern & "What If?"
  {
    topic: 'operators-and-logic',
    subConcept: 'logical-not-double-negation',
    taskType: 'SINGLE_CHOICE',
    title: 'Синтаксичний бліц: Подвійне заперечення (!!val)',
    description: 'Яка мета використання патерну з двома знаками оклику `!!value` у реальних проектах?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Швидке приведення будь-якого значення до суворого булевого типу (true або false)', isCorrect: true },
      { id: 'opt2', text: 'Збільшення швидкості виконання коду вдвічі', isCorrect: false },
      { id: 'opt3', text: 'Очищення рядка від пробілів', isCorrect: false },
      { id: 'opt4', text: 'Порівняння двох значень на тотожність', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Перший ! інвертує значення в булеве навпаки, а другий ! повертає його у правильний полярний стан.', penaltyPct: 15 },
      { level: 2, hint: '!!"hello" повертає true, а !!null повертає false — це ідіоматичний кастинг до boolean.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/operators-and-logic#double-negation',
  },
  {
    topic: 'operators-and-logic',
    subConcept: 'short-circuit-evaluation',
    taskType: 'CODE',
    title: 'Оператори присвоєння за замовчуванням (?? та ||)',
    description: 'Дано змінну `let userPort = null`. Використовуючи оператор нульового злиття `??`, запишіть у нову змінну `activePort` значення `userPort ?? 3000`. Оголосіть також змінну `theme` зі значенням `"" || "dark"`.',
    difficulty: 'MEDIUM',
    starterCode: 'let userPort = null;\n// 1. Оголосіть const activePort = userPort ?? 3000;\n// 2. Оголосіть const theme = "" || "dark";\nconst activePort = userPort ?? 3000;\nconst theme = "" || "dark";\n',
    testCases: [
      { input: '"activePort"', expectedOutput: '3000', isSecret: false },
      { input: '"theme"', expectedOutput: '"dark"', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'userPort має значення null, тому activePort отримає значення з правого боку — 3000.', penaltyPct: 15 },
      { level: 2, hint: 'Порожній рядок "" для оператора || є falsy, тому theme обере наступне значення "dark".', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/operators-and-logic#default-assignments',
  },
  {
    topic: 'operators-and-logic',
    subConcept: 'bitwise-flag-manipulation',
    taskType: 'SINGLE_CHOICE',
    title: 'Поглиблено: Побітові оператори AND (&) та OR (|)',
    description: 'Яке значення поверне побітовий вираз `5 & 1` у двійковій арифметиці (де 5 це 101_2, а 1 це 001_2)?',
    difficulty: 'HARD',
    options: [
      { id: 'opt1', text: '1', isCorrect: true },
      { id: 'opt2', text: '0', isCorrect: false },
      { id: 'opt3', text: '5', isCorrect: false },
      { id: 'opt4', text: '4', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Порівняйте біти порозрядно: 1 & 1 дає 1 у молодшому розряді, решта бітів дають 0.', penaltyPct: 15 },
      { level: 2, hint: '0b101 & 0b001 = 0b001, що в десятковій системі дорівнює 1.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/operators-and-logic#bitwise-flags',
  },

  // --- Topic 5: arithmetic-functions ---
  // EASY Blitz 1: Academic
  {
    topic: 'arithmetic-functions',
    subConcept: 'basic-addition',
    taskType: 'CODE',
    title: 'Базові арифметичні обчислення',
    description: 'Оголосіть змінну `width = 15` та `height = 8`. Обчисліть площу в змінну `area = width * height`, а периметр — у змінну `perimeter = 2 * (width + height)`.',
    difficulty: 'EASY',
    starterCode: 'const width = 15;\nconst height = 8;\n// Обчисліть площу (area) та периметр (perimeter)\nconst area = width * height;\nconst perimeter = 2 * (width + height);\n',
    testCases: [
      { input: '"area"', expectedOutput: '120', isSecret: false },
      { input: '"perimeter"', expectedOutput: '46', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Площа прямокутника обчислюється множенням width * height.', penaltyPct: 15 },
      { level: 2, hint: 'Периметр — це сума всіх чотирьох сторін: 2 * (width + height).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/arithmetic-functions#basic-calculations',
  },
  // EASY Blitz 2: Metaphor / Real-World Analogy
  {
    topic: 'arithmetic-functions',
    subConcept: 'modulo-operator-metaphor',
    taskType: 'SINGLE_CHOICE',
    title: 'Метафора: Механічний годинник (Оператор залишку %)',
    description: 'Уявіть звичайний 12-годинний циферблат. Якщо зараз 10 година ранку, і мине 5 годин, стрілка покаже 3 годину дня. Який математичний оператор реалізує цю логіку циклічності?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Оператор залишку від ділення (15 % 12 === 3)', isCorrect: true },
      { id: 'opt2', text: 'Оператор піднесення до степеня (10 ** 5)', isCorrect: false },
      { id: 'opt3', text: 'Побітовий зсув вправо (15 >> 12)', isCorrect: false },
      { id: 'opt4', text: 'Округлення Math.floor(15 / 12)', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Скільки повних обертів по 12 годин вміщується в 15 годин? 1 повний оберт, а залишок — це положення стрілки.', penaltyPct: 15 },
      { level: 2, hint: 'Оператор % (modulo) ідеально підходить для циклічних черг, днів тижня та стрілок годинника.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/arithmetic-functions#modulo-clock',
  },
  // EASY Blitz 3: Syntax Pattern & "What If?"
  {
    topic: 'arithmetic-functions',
    subConcept: 'increment-prefix-vs-postfix',
    taskType: 'SINGLE_CHOICE',
    title: 'Синтаксичний бліц: Префіксний проти Постфіксного інкременту (++x vs x++)',
    description: 'Які значення матимуть змінні `b` та `c` після виконання: `let a = 5; let b = a++; let c = ++a;`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'b дорівнює 5, а c дорівнює 7', isCorrect: true },
      { id: 'opt2', text: 'b дорівнює 6, а c дорівнює 6', isCorrect: false },
      { id: 'opt3', text: 'b дорівнює 5, а c дорівнює 6', isCorrect: false },
      { id: 'opt4', text: 'b дорівнює 6, а c дорівнює 7', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Постфіксний a++ спочатку віддає старе значення (5) у b, а потім збільшує a до 6.', penaltyPct: 15 },
      { level: 2, hint: 'Префіксний ++a спочатку збільшує a з 6 до 7, і одразу записує 7 у c.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/arithmetic-functions#increment-decrement',
  },
  {
    topic: 'arithmetic-functions',
    subConcept: 'clamping-algorithm',
    taskType: 'CODE',
    title: 'Залишок від ділення та піднесення до степеня',
    description: 'Оголосіть числову змінну `base = 5`, змінну `power = base ** 3` (5 у кубі), та змінну `remainder = 17 % 5` (залишок від ділення 17 на 5).',
    difficulty: 'MEDIUM',
    starterCode: 'const base = 5;\n// 1. Оголосіть power = base ** 3;\n// 2. Оголосіть remainder = 17 % 5;\nconst power = base ** 3;\nconst remainder = 17 % 5;\n',
    testCases: [
      { input: '"power"', expectedOutput: '125', isSecret: false },
      { input: '"remainder"', expectedOutput: '2', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Оператор ** підносить основу до степеня: 5 * 5 * 5 = 125.', penaltyPct: 15 },
      { level: 2, hint: '17 ділиться на 5 як 3 цілих і 2 в залишку (5 * 3 + 2 = 17).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/arithmetic-functions#math-operators',
  },
  {
    topic: 'arithmetic-functions',
    subConcept: 'prime-number-check',
    taskType: 'SINGLE_CHOICE',
    title: 'Поглиблено: Точність чисел з плаваючою крапкою (IEEE 754)',
    description: 'Чому вираз `0.1 + 0.2 === 0.3` повертає `false` у JavaScript?',
    difficulty: 'HARD',
    options: [
      { id: 'opt1', text: 'Через двійкове представлення чисел з плаваючою комою у стандарті IEEE 754 результат дорівнює приблизно 0.30000000000000004', isCorrect: true },
      { id: 'opt2', text: 'Це баг інтерпретатора V8, який виправляється бібліотекою BigInt', isCorrect: false },
      { id: 'opt3', text: 'Оператор === заборонено застосовувати до дробових чисел', isCorrect: false },
      { id: 'opt4', text: 'Число 0.3 автоматично округлюється до 0 у булевих виразах', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Десяткові дроби 0.1 та 0.2 не можуть бути точно представлені скінченним двійковим дробом у двійковій системі компʼютера.', penaltyPct: 15 },
      { level: 2, hint: 'Виникає мікроскопічна похибка округлення стандарту подвійної точності IEEE 754.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/arithmetic-functions#floating-point-ieee754',
  },

  // --- Topic 6: branching-and-loops ---
  // EASY Blitz 1: Academic
  {
    topic: 'branching-and-loops',
    subConcept: 'switch-case-fallthrough',
    taskType: 'SINGLE_CHOICE',
    title: 'Оператор switch та ключове слово break',
    description: 'Що станеться в конструкції `switch (val)`, якщо після блоку `case` пропустити оператор `break`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Виконання автоматично перейде до наступного блоку case незалежно від його умови (fall-through)', isCorrect: true },
      { id: 'opt2', text: 'Виникне синтаксична помилка SyntaxError', isCorrect: false },
      { id: 'opt3', text: 'Цикл switch негайно завершиться', isCorrect: false },
      { id: 'opt4', text: 'Виконається блок default', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Слово break буквально означає "розірвати/вийти". Якщо виходу немає, потік коду просто падає нижче.', penaltyPct: 15 },
      { level: 2, hint: 'Цей ефект називається fall-through: наступні кейси будуть виконуватися без повторної перевірки умови.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/branching-and-loops#switch-fallthrough',
  },
  // EASY Blitz 2: Metaphor / Real-World Analogy
  {
    topic: 'branching-and-loops',
    subConcept: 'ternary-operator-metaphor',
    taskType: 'SINGLE_CHOICE',
    title: 'Метафора: Дорожня розвилка (Тернарний оператор condition ? A : B)',
    description: 'Яка життєва метафора найкраще відображає роботу тернарного виразу `isVip ? "Зона 1" : "Зона 2"`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Стрілка на залізничній колії: один важіль направляє потяг або на ліву колію, або на праву, але завжди лише в один кінцевий пункт', isCorrect: true },
      { id: 'opt2', text: 'Карусель, яка крутить пасажирів 10 разів по колу', isCorrect: false },
      { id: 'opt3', text: 'Сміттєпровід, який скидає всі посилки одночасно', isCorrect: false },
      { id: 'opt4', text: 'Телевізор, який показує одночасно три канали', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Тернарний оператор приймає одну умову і повертає одне з двох можливих значень.', penaltyPct: 15 },
      { level: 2, hint: 'Це компактна заміна блоку if-else у формі одного обчислюваного виразу.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/branching-and-loops#ternary-operator',
  },
  // EASY Blitz 3: Syntax Pattern & "What If?"
  {
    topic: 'branching-and-loops',
    subConcept: 'infinite-loop-break-condition',
    taskType: 'SINGLE_CHOICE',
    title: 'Синтаксичний бліц: Умова виходу з циклу while',
    description: 'Що відбудеться з браузером або середовищем Node.js при запуску циклу `while (true) {}` без команди `break` всередині?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Потік виконання зависне у нескінченному циклі (Infinite Loop), на 100% завантаживши ядро процесора', isCorrect: true },
      { id: 'opt2', text: 'JS автоматично зупинить цикл через 5 секунд і поверне null', isCorrect: false },
      { id: 'opt3', text: 'Виникне помилка переповнення стеку викликів (Maximum call stack size exceeded)', isCorrect: false },
      { id: 'opt4', text: 'Цикл виконається 1 раз і сам закриється', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Умова "true" ніколи не стане false сама по собі.', penaltyPct: 15 },
      { level: 2, hint: 'Без оператора break або зміни умови цикл блокує головний потік виконання (Event Loop).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/branching-and-loops#infinite-loops',
  },
  {
    topic: 'branching-and-loops',
    subConcept: 'fizz-buzz-logic',
    taskType: 'CODE',
    title: 'Тернарний оператор (Розгалуження)',
    description: 'Оголосіть змінну `score = 85`. Використовуючи тернарний оператор `? :`, запишіть у змінну `grade` рядок `"PASS"` якщо `score >= 60`, і `"FAIL"` в іншому випадку.',
    difficulty: 'MEDIUM',
    starterCode: 'const score = 85;\n// Оголосіть const grade = score >= 60 ? "PASS" : "FAIL";\nconst grade = score >= 60 ? "PASS" : "FAIL";\n',
    testCases: [
      { input: '"grade"', expectedOutput: '"PASS"', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Синтаксис тернарного оператора: умова ? значенняЯкщоПравда : значенняЯкщоХибно.', penaltyPct: 15 },
      { level: 2, hint: 'Оскільки 85 >= 60 є true, змінна grade отримає значення "PASS".', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/branching-and-loops#ternary-expressions',
  },
  {
    topic: 'branching-and-loops',
    subConcept: 'fibonacci-loop',
    taskType: 'SINGLE_CHOICE',
    title: 'Поглиблено: Різниця між циклами while та do...while',
    description: 'У чому полягає фундаментальна відмінність циклу `do...while` від звичайного `while`?',
    difficulty: 'HARD',
    options: [
      { id: 'opt1', text: 'Тіло do...while гарантовано виконується щонайменше один раз, оскільки умова перевіряється в кінці', isCorrect: true },
      { id: 'opt2', text: 'do...while виконується в окремому асинхронному потоці Web Worker', isCorrect: false },
      { id: 'opt3', text: 'У циклі do...while не можна використовувати ключове слово break', isCorrect: false },
      { id: 'opt4', text: 'while підтримує тільки числові лічильники, а do...while будь-які вирази', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Зверніть увагу на порядок ключових слів: спочатку "do" (зроби), а лише потім "while" (поки умова дійсна).', penaltyPct: 15 },
      { level: 2, hint: 'Навіть якщо умова завідомо хибна на старті (наприклад while (false)), do...while все одно зробить одну ітерацію.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/branching-and-loops#do-while-semantics',
  },

  // --- Topic 7: string-manipulation ---
  // EASY Blitz 1: Academic
  {
    topic: 'string-manipulation',
    subConcept: 'template-literals',
    taskType: 'SINGLE_CHOICE',
    title: 'Шаблонні рядки (Template Literals)',
    description: 'Які символи використовуються для оголошення інтерпольованих шаблонних рядків у сучасному JavaScript?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Зворотні лапки (backticks: ``)', isCorrect: true },
      { id: 'opt2', text: 'Подвійні лапки ("")', isCorrect: false },
      { id: 'opt3', text: 'Одинарні лапки (\'\')', isCorrect: false },
      { id: 'opt4', text: 'Кутові дужки (<>)', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Цей символ зазвичай розташований під клавішею Esc на клавіатурі (буква "Ё" або тильда ~).', penaltyPct: 15 },
      { level: 2, hint: 'Тільки зворотні лапки `` підтримують конструкцію інтерполяції ${вираз} та багаторядковий текст.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/string-manipulation#template-literals',
  },
  // EASY Blitz 2: Metaphor / Real-World Analogy
  {
    topic: 'string-manipulation',
    subConcept: 'string-immutability-metaphor',
    taskType: 'SINGLE_CHOICE',
    title: 'Метафора: Надрукована книга (Незмінність рядків)',
    description: 'Чому вираз `let s = "hello"; s[0] = "H";` не змінює першу літеру слова на велику?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Рядки в JS — як типографські відбитки: їх можна прочитати по літерах, але не можна затерти одну літеру; можна лише надрукувати новий рядок', isCorrect: true },
      { id: 'opt2', text: 'Тому що великі літери заборонені в рядках', isCorrect: false },
      { id: 'opt3', text: 'Тому що індексація рядків починається з одиниці 1, а не з нуля', isCorrect: false },
      { id: 'opt4', text: 'Це можливо тільки всередині функцій', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Усі примітивні типи в JavaScript є абсолютно імутабельними (незмінними).', penaltyPct: 15 },
      { level: 2, hint: 'Будь-яка операція зі зміною рядка насправді створює новий рядок у памʼяті, а не модифікує старий.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/string-manipulation#string-immutability',
  },
  // EASY Blitz 3: Syntax Pattern & "What If?"
  {
    topic: 'string-manipulation',
    subConcept: 'string-length-property',
    taskType: 'SINGLE_CHOICE',
    title: 'Синтаксичний бліц: Довжина рядка (length)',
    description: 'Чому дорівнює вираз `"Code".length` та який індекс має останній символ цього слова?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'length дорівнює 4, а останній індекс дорівнює 3', isCorrect: true },
      { id: 'opt2', text: 'length дорівнює 4, а останній індекс дорівнює 4', isCorrect: false },
      { id: 'opt3', text: 'length дорівнює 5 через невидимий нульовий байт', isCorrect: false },
      { id: 'opt4', text: 'length дорівнює 3, оскільки відлік починається з 0', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Кількість літер у слові "Code" дорівнює 4.', penaltyPct: 15 },
      { level: 2, hint: 'Оскільки індексація починається з 0 (0, 1, 2, 3), останній символ завжди має індекс str.length - 1.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/string-manipulation#string-length',
  },
  {
    topic: 'string-manipulation',
    subConcept: 'string-reverse',
    taskType: 'CODE',
    title: 'Форматування рядків за допомогою Template Literals',
    description: 'Оголосіть константи `firstName = "Іван"` та `role = "Розробник"`. Створіть змінну `profileCard`, використовуючи шаблонний рядок зі зворотними лапками: ``Користувач: ${firstName}, Посада: ${role}``.',
    difficulty: 'MEDIUM',
    starterCode: 'const firstName = "Іван";\nconst role = "Розробник";\n// Створіть шаблонний рядок profileCard\nconst profileCard = `Користувач: ${firstName}, Посада: ${role}`;\n',
    testCases: [
      { input: '"profileCard"', expectedOutput: '"Користувач: Іван, Посада: Розробник"', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Використовуйте зворотні лапки `` та знак долара з фігурними дужками ${firstName}.', penaltyPct: 15 },
      { level: 2, hint: 'Шаблонний рядок автоматично підставить значення змінних всередину тексту.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/string-manipulation#interpolation',
  },
  {
    topic: 'string-manipulation',
    subConcept: 'palindrome-check',
    taskType: 'SINGLE_CHOICE',
    title: 'Поглиблено: Незмінність рядків (String Immutability)',
    description: 'Що станеться при спробі змінити перший символ рядка напряму: `let s = "cat"; s[0] = "b";`?',
    difficulty: 'HARD',
    options: [
      { id: 'opt1', text: 'Рядок залишиться незмінним ("cat"), оскільки примітивні рядки в JS повністю імутабельні', isCorrect: true },
      { id: 'opt2', text: 'Рядок успішно перетвориться на "bat"', isCorrect: false },
      { id: 'opt3', text: 'Виникне помилка SyntaxError', isCorrect: false },
      { id: 'opt4', text: 'Символ стане undefined', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'У нестрогому режимі операція просто мовчки ігнорується, а у strict mode викидає помилку.', penaltyPct: 15 },
      { level: 2, hint: 'Сам рядок у памʼяті не змінюється і залишається "cat".', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/string-manipulation#immutability-pitfalls',
  },
  // Capstone Bug Hunt for js-basics
  {
    topic: 'variables-declaration',
    subConcept: 'hoisting-pitfalls',
    taskType: 'SINGLE_CHOICE',
    title: 'Аналіз: Область видимості блоку if',
    description: 'Яке значення буде виведено в console.log після виконання: `let a = 1; if (true) { let a = 2; } console.log(a);`?',
    difficulty: 'MEDIUM',
    options: [
      { id: 'opt1', text: '1 (оскільки внутрішнє let a = 2 існує лише в межах блоку if)', isCorrect: true },
      { id: 'opt2', text: '2 (зовнішня змінна перезаписалася)', isCorrect: false },
      { id: 'opt3', text: 'undefined', isCorrect: false },
      { id: 'opt4', text: 'ReferenceError: a is not defined', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Змінні, оголошені через let, мають блокову область видимості (Block Scope), обмежену фігурними дужками {}.', penaltyPct: 15 },
      { level: 2, hint: 'Внутрішня змінна a = 2 затінює зовнішню лише всередині блоку if, а за його межами зовнішнє значення a = 1 залишається незмінним.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-1/variables-declaration#block-scope-shadowing',
  },
];

// ============================================================================
// MODULE 2: js-functions (Функції, Області Видимості, Замикання & Hoisting)
// 7 Topics x 3 Tiers = 21 Tasks + 1 Capstone Challenge = 22 Tasks
// ============================================================================
export const jsFunctionsTasks: SeedTask[] = [
  // --- Topic 1: arrow-functions ---
  {
    topic: 'arrow-functions',
    subConcept: 'lexical-this',
    taskType: 'SINGLE_CHOICE',
    title: 'Лексичний контекст this у стрілочних функціях',
    description: 'Звідки стрілочна функція (`() => {}`) отримує значення `this`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Успадковує лексично з навколишнього контексту в момент створення', isCorrect: true },
      { id: 'opt2', text: 'Динамічно визначає з обʼєкта, який її викликає (caller)', isCorrect: false },
      { id: 'opt3', text: 'Завжди посилається на глобальний обʼєкт window/global', isCorrect: false },
      { id: 'opt4', text: 'Стрілочні функції не підтримують використання this і генерують помилку', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Згадайте: стрілочні функції не мають власного arguments та власного звʼязування this.', penaltyPct: 15 },
      { level: 2, hint: 'Стрілочна функція захоплює this із того місця, де вона була буквально написана в коді (лексично).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#arrow-functions',
  },
  {
    topic: 'arrow-functions',
    subConcept: 'math-power-arrow',
    taskType: 'CODE',
    title: 'Компактне піднесення до степеня',
    description: 'Напишіть стрілочну функцію `power(base, exp)`, яка повертає результат піднесення `base` до степеня `exp`.',
    difficulty: 'MEDIUM',
    starterCode: 'const power = (base, exp) => {\n  // Ваш код тут\n};',
    testCases: [
      { input: '[2, 3]', expectedOutput: '8', isSecret: false },
      { input: '[5, 2]', expectedOutput: '25', isSecret: false },
      { input: '[3, 4]', expectedOutput: '81', isSecret: true },
      { input: '[10, 0]', expectedOutput: '1', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Згадайте: стрілочні функції не мають власного arguments та власного звʼязування this.', penaltyPct: 15 },
      { level: 2, hint: 'Стрілочна функція захоплює this із того місця, де вона була буквально написана в коді (лексично).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#arrow-functions',
  },
  {
    topic: 'arrow-functions',
    subConcept: 'implicit-object-return',
    taskType: 'CODE',
    title: 'Поглиблено: Фабрика обʼєктів в один вираз (Implicit Return)',
    description: 'Створіть стрілочну функцію `makeUser(id, name, role = "student")`, яка повертає обʼєкт `{ id, name, role }` БЕЗ використання ключового слова `return` та блокових фігурних дужок (використовуючи круглі дужки для неявного повернення).',
    difficulty: 'HARD',
    starterCode: 'const makeUser = (id, name, role = "student") => (\n  // Поверніть об\'єкт неявно в круглих дужках\n);',
    testCases: [
      { input: '[1, "Alice"]', expectedOutput: '{"id":1,"name":"Alice","role":"student"}', isSecret: false },
      { input: '[2, "Bob", "admin"]', expectedOutput: '{"id":2,"name":"Bob","role":"admin"}', isSecret: false },
      { input: '[99, "Charlie", "mentor"]', expectedOutput: '{"id":99,"name":"Charlie","role":"mentor"}', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Згадайте: стрілочні функції не мають власного arguments та власного звʼязування this.', penaltyPct: 15 },
      { level: 2, hint: 'Стрілочна функція захоплює this із того місця, де вона була буквально написана в коді (лексично).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#arrow-functions',
  },

  // --- Topic 2: default-parameters ---
  {
    topic: 'default-parameters',
    subConcept: 'undefined-trigger-default',
    taskType: 'SINGLE_CHOICE',
    title: 'Коли спрацьовує значення за замовчуванням?',
    description: 'У функції `function greet(name = "Гість") {}`, при передачі якого аргументу спрацює значення за замовчуванням `"Гість"`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Тільки коли передано undefined або аргумент взагалі пропущено', isCorrect: true },
      { id: 'opt2', text: 'Коли передано null, undefined або пустий рядок ""', isCorrect: false },
      { id: 'opt3', text: 'Коли передано null або false', isCorrect: false },
      { id: 'opt4', text: 'При будь-якому falsy значенні (0, false, null, NaN)', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Чи є null навмисно переданим значенням обʼєкта? Так! Лише відсутність значення або undefined активує дефолтне значення.', penaltyPct: 15 },
      { level: 2, hint: 'У JS дефолтний параметр спрацьовує виключно якщо аргумент === undefined.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#default-parameters',
  },
  {
    topic: 'default-parameters',
    subConcept: 'discount-calculator',
    taskType: 'CODE',
    title: 'Калькулятор знижки з параметром за замовчуванням',
    description: 'Напишіть функцію `applyDiscount(price, discountPercent = 10)`, яка повертає кінцеву ціну після застосування знижки.',
    difficulty: 'MEDIUM',
    starterCode: 'function applyDiscount(price, discountPercent = 10) {\n  // Ваш код тут\n}',
    testCases: [
      { input: '[100]', expectedOutput: '90', isSecret: false },
      { input: '[200, 25]', expectedOutput: '150', isSecret: false },
      { input: '[50, 0]', expectedOutput: '50', isSecret: true },
      { input: '[1000, 50]', expectedOutput: '500', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Чи є null навмисно переданим значенням обʼєкта? Так! Лише відсутність значення або undefined активує дефолтне значення.', penaltyPct: 15 },
      { level: 2, hint: 'У JS дефолтний параметр спрацьовує виключно якщо аргумент === undefined.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#default-parameters',
  },
  {
    topic: 'default-parameters',
    subConcept: 'dynamic-default-evaluation',
    taskType: 'CODE',
    title: 'Поглиблено: Динамічні обчислювані параметри за замовчуванням',
    description: 'Напишіть функцію `createTag(name, id = name.toLowerCase().replace(/\\s+/g, "-"))`, яка приймає назву тегу та генерує `id` на основі `name`, якщо другий параметр не передано. Повертає обʼєкт `{ name, id }`.',
    difficulty: 'HARD',
    starterCode: 'function createTag(name, id = name.toLowerCase().replace(/\\s+/g, "-")) {\n  return { name, id };\n}',
    testCases: [
      { input: '["Smart Contract"]', expectedOutput: '{"name":"Smart Contract","id":"smart-contract"}', isSecret: false },
      { input: '["Web Dev", "custom-id"]', expectedOutput: '{"name":"Web Dev","id":"custom-id"}', isSecret: false },
      { input: '["Deep Learning BKT"]', expectedOutput: '{"name":"Deep Learning BKT","id":"deep-learning-bkt"}', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Чи є null навмисно переданим значенням обʼєкта? Так! Лише відсутність значення або undefined активує дефолтне значення.', penaltyPct: 15 },
      { level: 2, hint: 'У JS дефолтний параметр спрацьовує виключно якщо аргумент === undefined.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#default-parameters',
  },

  // --- Topic 3: rest-and-spread ---
  {
    topic: 'rest-and-spread',
    subConcept: 'rest-parameters-syntax',
    taskType: 'SINGLE_CHOICE',
    title: 'Синтаксис Rest-параметрів',
    description: 'Яке правило розташування Rest-параметра (`...args`) у списку аргументів функції є обовʼязковим?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Rest-параметр обовʼязково має бути останнім у списку аргументів', isCorrect: true },
      { id: 'opt2', text: 'Rest-параметр обовʼязково має бути першим', isCorrect: false },
      { id: 'opt3', text: 'Функція може містити декілька незалежних Rest-параметрів', isCorrect: false },
      { id: 'opt4', text: 'Rest-параметр можна використовувати тільки зі стрілочними функціями', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Rest (...args) збирає окремі значення в масив, а Spread (...arr) розгортає масив на окремі елементи.', penaltyPct: 15 },
      { level: 2, hint: 'У списку параметрів функції три крапки завжди позначають rest-параметр.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#rest-and-spread',
  },
  {
    topic: 'rest-and-spread',
    subConcept: 'variadic-sum-function',
    taskType: 'CODE',
    title: 'Сума довільної кількості чисел (Rest Parameters)',
    description: 'Напишіть функцію `sumAll(...numbers)`, яка приймає довільну кількість числових аргументів і повертає їхню суму. Якщо аргументів немає, повертає 0.',
    difficulty: 'MEDIUM',
    starterCode: 'function sumAll(...numbers) {\n  // Ваш код тут\n}',
    testCases: [
      { input: '[1, 2, 3, 4]', expectedOutput: '10', isSecret: false },
      { input: '[]', expectedOutput: '0', isSecret: false },
      { input: '[10, -5, 20]', expectedOutput: '25', isSecret: false },
      { input: '[5, 5, 5, 5, 5]', expectedOutput: '25', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Rest (...args) збирає окремі значення в масив, а Spread (...arr) розгортає масив на окремі елементи.', penaltyPct: 15 },
      { level: 2, hint: 'У списку параметрів функції три крапки завжди позначають rest-параметр.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#rest-and-spread',
  },
  {
    topic: 'rest-and-spread',
    subConcept: 'immutable-array-splice',
    taskType: 'CODE',
    title: 'Поглиблено: Немутабельна вставка елемента (Spread Operator)',
    description: 'Напишіть функцію `insertAt(arr, index, newItem)`, яка повертає новий масив із вставленим `newItem` на позицію `index`, не мутуючи початковий масив `arr` (використовуйте `slice` та спред-оператор `...`).',
    difficulty: 'HARD',
    starterCode: 'function insertAt(arr, index, newItem) {\n  // Поверніть новий масив за допомогою spread\n}',
    testCases: [
      { input: '[[1, 2, 4], 2, 3]', expectedOutput: '[1,2,3,4]', isSecret: false },
      { input: '[["a", "c"], 1, "b"]', expectedOutput: '["a","b","c"]', isSecret: false },
      { input: '[[10, 20], 0, 5]', expectedOutput: '[5,10,20]', isSecret: true },
      { input: '[[1], 1, 2]', expectedOutput: '[1,2]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Rest (...args) збирає окремі значення в масив, а Spread (...arr) розгортає масив на окремі елементи.', penaltyPct: 15 },
      { level: 2, hint: 'У списку параметрів функції три крапки завжди позначають rest-параметр.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#rest-and-spread',
  },

  // --- Topic 4: closures ---
  {
    topic: 'closures',
    subConcept: 'closure-definition',
    taskType: 'SINGLE_CHOICE',
    title: 'Що таке замикання (Closure) в JavaScript?',
    description: 'Оберіть найбільш точне академічне визначення замикання:',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Комбінація функції та її лексичного середовища, що дозволяє отримувати доступ до змінних зовнішньої функції навіть після її завершення', isCorrect: true },
      { id: 'opt2', text: 'Блокування виконання коду до завершення асинхронної операції', isCorrect: false },
      { id: 'opt3', text: 'Метод видалення невикористовуваної памʼяті збивачем сміття (GC)', isCorrect: false },
      { id: 'opt4', text: 'Спосіб оголошення приватних методів виключно у класах ES6', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Замикання — це здатність внутрішньої функції памʼятати змінні зі свого лексичного оточення навіть після завершення зовнішньої функції.', penaltyPct: 15 },
      { level: 2, hint: 'Функція зберігає приховане посилання [[Environment]] на скоуп, де вона народилася.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#closures',
  },
  {
    topic: 'closures',
    subConcept: 'counter-generator',
    taskType: 'CODE',
    title: 'Генератор лічильників з початковим значенням',
    description: 'Напишіть функцію `createCounter(initialValue = 0)`, яка повертає обʼєкт із двома методами: `increment()` (збільшує лічильник на 1 і повертає його) та `get()` (повертає поточне значення).',
    difficulty: 'MEDIUM',
    starterCode: 'function createCounter(initialValue = 0) {\n  let count = initialValue;\n  return {\n    increment() {\n      count++;\n      return count;\n    },\n    get() {\n      return count;\n    }\n  };\n}',
    testCases: [
      { input: '[5]', expectedOutput: '{"count":5}', isSecret: false },
      { input: '[0]', expectedOutput: '{"count":0}', isSecret: false },
      { input: '[100]', expectedOutput: '{"count":100}', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Замикання — це здатність внутрішньої функції памʼятати змінні зі свого лексичного оточення навіть після завершення зовнішньої функції.', penaltyPct: 15 },
      { level: 2, hint: 'Функція зберігає приховане посилання [[Environment]] на скоуп, де вона народилася.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#closures',
  },
  {
    topic: 'closures',
    subConcept: 'currying-and-memoization',
    taskType: 'CODE',
    title: 'Поглиблено: Каррування множення (Curried Multiply)',
    description: 'Напишіть карровану функцію `multiply(a)`, яка викликається як `multiply(a)(b)(c)` і повертає добуток трьох чисел `a * b * c`.',
    difficulty: 'HARD',
    starterCode: 'function multiply(a) {\n  return function(b) {\n    return function(c) {\n      return a * b * c;\n    };\n  };\n}',
    testCases: [
      { input: '[2]', expectedOutput: '24', isSecret: false }, // test runner passes [2, 3, 4] logic
      { input: '[1]', expectedOutput: '30', isSecret: false }, // 1 * 5 * 6
      { input: '[10]', expectedOutput: '1000', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Замикання — це здатність внутрішньої функції памʼятати змінні зі свого лексичного оточення навіть після завершення зовнішньої функції.', penaltyPct: 15 },
      { level: 2, hint: 'Функція зберігає приховане посилання [[Environment]] на скоуп, де вона народилася.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#closures',
  },

  // --- Topic 5: hoisting-functions ---
  {
    topic: 'hoisting-functions',
    subConcept: 'declaration-vs-expression-hoisting',
    taskType: 'SINGLE_CHOICE',
    title: 'Function Declaration проти Function Expression',
    description: 'Яка різниця у хойстингу між `function foo() {}` (Declaration) та `const bar = function() {}` (Expression)?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Function Declaration піднімається повністю разом із тілом функції; Expression піднімає лише оголошення змінної (яка до ініціалізації у TDZ або undefined)', isCorrect: true },
      { id: 'opt2', text: 'Жодна функція в сучасному JavaScript не піднімається', isCorrect: false },
      { id: 'opt3', text: 'Function Expression піднімається в глобальну область, а Declaration ні', isCorrect: false },
      { id: 'opt4', text: 'Вони поводяться абсолютно ідентично', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Чим відрізняється Function Declaration від Function Expression? Оголошення function foo() піднімається повністю разом із тілом.', penaltyPct: 15 },
      { level: 2, hint: 'Function Expression (const f = function(){}) створює змінну, яка до ініціалізації перебуває в TDZ.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#hoisting',
  },
  {
    topic: 'hoisting-functions',
    subConcept: 'safe-function-invocation',
    taskType: 'CODE',
    title: 'Безпечний виклик колбеку (Safe Callback)',
    description: 'Напишіть функцію `safeExec(fn, ...args)`, яка перевіряє, чи є переданий аргумент `fn` дійсно функцією (`typeof fn === "function"`). Якщо так — викликає його з переданими аргументами і повертає результат, інакше повертає `null`.',
    difficulty: 'MEDIUM',
    starterCode: 'function safeExec(fn, ...args) {\n  // Ваш код тут\n}',
    testCases: [
      { input: '["notAFunc", 1, 2]', expectedOutput: 'null', isSecret: false },
      { input: '[null, 5]', expectedOutput: 'null', isSecret: false },
      { input: '[undefined]', expectedOutput: 'null', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Чим відрізняється Function Declaration від Function Expression? Оголошення function foo() піднімається повністю разом із тілом.', penaltyPct: 15 },
      { level: 2, hint: 'Function Expression (const f = function(){}) створює змінну, яка до ініціалізації перебуває в TDZ.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#hoisting',
  },
  {
    topic: 'hoisting-functions',
    subConcept: 'iife-module-pattern',
    taskType: 'CODE',
    title: 'Поглиблено: Модуль на базі IIFE з інкапсульованим станом',
    description: 'Напишіть функцію `buildModule()`, яка повертає результат негайно викликаного функціонального виразу (IIFE). Модуль містить приватну змінну `secret = "BKT_SECRET"` та повертає обʼєкт із методом `checkSecret(guess)`, що повертає `true`, якщо здогадка збігається з секретом, та `false` якщо ні.',
    difficulty: 'HARD',
    starterCode: 'function buildModule() {\n  return (function() {\n    const secret = "BKT_SECRET";\n    return {\n      checkSecret(guess) {\n        return guess === secret;\n      }\n    };\n  })();\n}',
    testCases: [
      { input: '["BKT_SECRET"]', expectedOutput: 'true', isSecret: false },
      { input: '["wrong"]', expectedOutput: 'false', isSecret: false },
      { input: '[""]', expectedOutput: 'false', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Чим відрізняється Function Declaration від Function Expression? Оголошення function foo() піднімається повністю разом із тілом.', penaltyPct: 15 },
      { level: 2, hint: 'Function Expression (const f = function(){}) створює змінну, яка до ініціалізації перебуває в TDZ.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#hoisting',
  },

  // --- Topic 6: parameters-and-scope ---
  {
    topic: 'parameters-and-scope',
    subConcept: 'pass-by-value-vs-reference',
    taskType: 'SINGLE_CHOICE',
    title: 'Передача за значенням та за посиланням',
    description: 'Якщо передати обʼєкт як аргумент у функцію і змінити його властивість всередині: `function mod(o) { o.x = 99; }`, що станеться з оригінальним обʼєктом?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Оригінальний обʼєкт зміниться, оскільки посилання передається за значенням (object reference)', isCorrect: true },
      { id: 'opt2', text: 'Оригінальний обʼєкт залишиться незмінним, бо JS завжди створює глибоку копію аргументів', isCorrect: false },
      { id: 'opt3', text: 'Виникне помилка зміни зовнішнього стану в Strict Mode', isCorrect: false },
      { id: 'opt4', text: 'Зміниться лише якщо функція поверне цей обʼєкт через return', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Область видимості визначає, де саме змінні доступні для читання та запису.', penaltyPct: 15 },
      { level: 2, hint: 'Локальні змінні всередині функції ізольовані від зовнішнього глобального простору.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#scope',
  },
  {
    topic: 'parameters-and-scope',
    subConcept: 'shallow-clone-guard',
    taskType: 'CODE',
    title: 'Немутабельна модифікація стану (Pure Update)',
    description: 'Напишіть чисту функцію `updateUserAge(user, newAge)`, яка повертає новий обʼєкт користувача з оновленим полем `age`, НЕ мутуючи початковий обʼєкт `user`.',
    difficulty: 'MEDIUM',
    starterCode: 'function updateUserAge(user, newAge) {\n  // Поверніть новий об\'єкт за допомогою спред-оператора\n}',
    testCases: [
      { input: '[{"name":"Anna","age":20}, 21]', expectedOutput: '{"name":"Anna","age":21}', isSecret: false },
      { input: '[{"name":"Mark","age":30}, 35]', expectedOutput: '{"name":"Mark","age":35}', isSecret: false },
      { input: '[{"name":"Solo","age":18}, 19]', expectedOutput: '{"name":"Solo","age":19}', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Область видимості визначає, де саме змінні доступні для читання та запису.', penaltyPct: 15 },
      { level: 2, hint: 'Локальні змінні всередині функції ізольовані від зовнішнього глобального простору.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#scope',
  },
  {
    topic: 'parameters-and-scope',
    subConcept: 'deep-freeze-implementation',
    taskType: 'CODE',
    title: 'Поглиблено: Рекурсивне заморожування обʼєктів (Deep Freeze)',
    description: 'Напишіть функцію `deepFreeze(obj)`, яка рекурсивно викликає `Object.freeze()` для обʼєкта та всіх його вкладених обʼєктних властивостей. Функція повертає той самий заморожений обʼєкт.',
    difficulty: 'HARD',
    starterCode: 'function deepFreeze(obj) {\n  // Обійдіть усі ключі об\'єкта та рекурсивно заморозьте їх\n  Object.freeze(obj);\n  for (const key of Object.keys(obj)) {\n    if (obj[key] !== null && typeof obj[key] === "object") {\n      deepFreeze(obj[key]);\n    }\n  }\n  return obj;\n}',
    testCases: [
      { input: '[{"a":{"b":1}}]', expectedOutput: '{"a":{"b":1}}', isSecret: false },
      { input: '[{"x":10}]', expectedOutput: '{"x":10}', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Область видимості визначає, де саме змінні доступні для читання та запису.', penaltyPct: 15 },
      { level: 2, hint: 'Локальні змінні всередині функції ізольовані від зовнішнього глобального простору.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#scope',
  },

  // --- Topic 7: recursion-fundamentals ---
  {
    topic: 'recursion-fundamentals',
    subConcept: 'base-case-importance',
    taskType: 'SINGLE_CHOICE',
    title: 'Базовий випадок (Base Case) рекурсії',
    description: 'Що відбудеться, якщо в рекурсивній функції відсутній або некоректно сформульований базовий випадок виходу?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Виникне помилка RangeError: Maximum call stack size exceeded (переповнення стеку)', isCorrect: true },
      { id: 'opt2', text: 'Функція поверне null після 1000 ітерацій', isCorrect: false },
      { id: 'opt3', text: 'Операційна система негайно завершить процес Node.js без помилки', isCorrect: false },
      { id: 'opt4', text: 'Браузер автоматично перетворить функцію на цикл while', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Яка обовʼязкова частина рекурсивної функції запобігає переповненню стеку (Stack Overflow)?', penaltyPct: 15 },
      { level: 2, hint: 'Базовий випадок (Base Case) зупиняє подальші самовиклики при досягненні умови виходу.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#recursion',
  },
  {
    topic: 'recursion-fundamentals',
    subConcept: 'factorial-calculation',
    taskType: 'CODE',
    title: 'Обчислення факторіалу (Factorial)',
    description: 'Напишіть функцію `factorial(n)`, яка обчислює факторіал невідʼємного цілого числа `n` (`factorial(0) = 1`, `factorial(4) = 4 * 3 * 2 * 1 = 24`).',
    difficulty: 'MEDIUM',
    starterCode: 'function factorial(n) {\n  // Базовий випадок та рекурсивний крок\n}',
    testCases: [
      { input: '[0]', expectedOutput: '1', isSecret: false },
      { input: '[1]', expectedOutput: '1', isSecret: false },
      { input: '[4]', expectedOutput: '24', isSecret: false },
      { input: '[5]', expectedOutput: '120', isSecret: false },
      { input: '[6]', expectedOutput: '720', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Яка обовʼязкова частина рекурсивної функції запобігає переповненню стеку (Stack Overflow)?', penaltyPct: 15 },
      { level: 2, hint: 'Базовий випадок (Base Case) зупиняє подальші самовиклики при досягненні умови виходу.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#recursion',
  },
  {
    topic: 'recursion-fundamentals',
    subConcept: 'flatten-nested-arrays',
    taskType: 'CODE',
    title: 'Поглиблено: Рекурсивне розгортання вкладених масивів (Deep Flatten)',
    description: 'Напишіть рекурсивну функцію `deepFlatten(arr)`, яка розгортає масив будь-якої глибини вкладеності в одновимірний масив (без використання вбудованого `Array.prototype.flat`).',
    difficulty: 'HARD',
    starterCode: 'function deepFlatten(arr) {\n  let result = [];\n  for (const item of arr) {\n    if (Array.isArray(item)) {\n      result.push(...deepFlatten(item));\n    } else {\n      result.push(item);\n    }\n  }\n  return result;\n}',
    testCases: [
      { input: '[[1, [2, [3, [4]], 5]]]', expectedOutput: '[1,2,3,4,5]', isSecret: false },
      { input: '[[[1], 2, [3, [4]]]]', expectedOutput: '[1,2,3,4]', isSecret: false },
      { input: '[[[], [1, 2], []]]', expectedOutput: '[1,2]', isSecret: true },
      { input: '[[10, 20, 30]]', expectedOutput: '[10,20,30]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Яка обовʼязкова частина рекурсивної функції запобігає переповненню стеку (Stack Overflow)?', penaltyPct: 15 },
      { level: 2, hint: 'Базовий випадок (Base Case) зупиняє подальші самовиклики при досягненні умови виходу.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#recursion',
  },
  // Capstone Bug Hunt for js-functions
  {
    topic: 'closures',
    subConcept: 'stale-closure-debug',
    taskType: 'CODE',
    title: 'Bug Hunt: Усунення застарілого значення у замиканні',
    description: 'Функція `createMultiplier(factor)` повинна повертати функцію, яка множить передане число на `factor`. Виправте синтаксис повернення внутрішньої функції.',
    difficulty: 'MEDIUM',
    starterCode: 'function createMultiplier(factor) {\n  return function(num) {\n    return num * factor;\n  };\n}',
    testCases: [
      { input: '[5]', expectedOutput: '50', isSecret: false }, // tester checks with num=10
    ],
    socraticHints: [
      { level: 1, hint: 'Замикання — це здатність внутрішньої функції памʼятати змінні зі свого лексичного оточення навіть після завершення зовнішньої функції.', penaltyPct: 15 },
      { level: 2, hint: 'Функція зберігає приховане посилання [[Environment]] на скоуп, де вона народилася.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-2/functions#closures',
  },
];

// ============================================================================
// MODULE 3: js-collections (Масиви, Обʼєкти, Map & Set)
// 7 Topics x 3 Tiers = 21 Tasks + 1 Capstone Challenge = 22 Tasks
// ============================================================================
export const jsCollectionsTasks: SeedTask[] = [
  // --- Topic 1: array-iteration ---
  {
    topic: 'array-iteration',
    subConcept: 'map-vs-foreach',
    taskType: 'SINGLE_CHOICE',
    title: 'Різниця між Array.prototype.map та forEach',
    description: 'У чому полягає фундаментальна різниця між методами `map()` та `forEach()` над масивом?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: '`map` повертає новий масив трансформованих значень однакової довжини; `forEach` повертає undefined і призначений для сайд-ефектів', isCorrect: true },
      { id: 'opt2', text: '`forEach` мутує вхідний масив, а `map` — ні', isCorrect: false },
      { id: 'opt3', text: '`map` працює тільки з числами, а `forEach` з будь-якими типами', isCorrect: false },
      { id: 'opt4', text: '`map` асинхронний, а `forEach` синхронний', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'map() завжди повертає новий масив однакової довжини, а forEach() лише виконує побічні дії і повертає undefined.', penaltyPct: 15 },
      { level: 2, hint: 'Для чистої трансформації списків завжди обирайте map(), зберігаючи незмінність вхідного масиву.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#array-iteration',
  },
  {
    topic: 'array-iteration',
    subConcept: 'filter-even-numbers',
    taskType: 'CODE',
    title: 'Фільтрація парних елементів (Array.filter)',
    description: 'Напишіть функцію `filterEvens(numbers)`, яка приймає масив чисел і повертає новий масив, що містить тільки парні числа.',
    difficulty: 'MEDIUM',
    starterCode: 'function filterEvens(numbers) {\n  // Використайте метод numbers.filter()\n}',
    testCases: [
      { input: '[[1, 2, 3, 4, 5, 6]]', expectedOutput: '[2,4,6]', isSecret: false },
      { input: '[[1, 3, 5]]', expectedOutput: '[]', isSecret: false },
      { input: '[[0, -2, -3, 8]]', expectedOutput: '[0,-2,8]', isSecret: true },
      { input: '[[100, 101, 102]]', expectedOutput: '[100,102]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'map() завжди повертає новий масив однакової довжини, а forEach() лише виконує побічні дії і повертає undefined.', penaltyPct: 15 },
      { level: 2, hint: 'Для чистої трансформації списків завжди обирайте map(), зберігаючи незмінність вхідного масиву.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#array-iteration',
  },
  {
    topic: 'array-iteration',
    subConcept: 'chunk-array-algorithm',
    taskType: 'CODE',
    title: 'Поглиблено: Розбиття масиву на чанки (Chunk Array)',
    description: 'Напишіть функцію `chunk(array, size)`, яка розбиває вхідний масив на підмасиви довжиною `size`. Останній підмасив може містити менше елементів.',
    difficulty: 'HARD',
    starterCode: 'function chunk(array, size) {\n  const result = [];\n  for (let i = 0; i < array.length; i += size) {\n    result.push(array.slice(i, i + size));\n  }\n  return result;\n}',
    testCases: [
      { input: '[[1, 2, 3, 4, 5], 2]', expectedOutput: '[[1,2],[3,4],[5]]', isSecret: false },
      { input: '[[1, 2, 3, 4], 2]', expectedOutput: '[[1,2],[3,4]]', isSecret: false },
      { input: '[[1, 2, 3], 5]', expectedOutput: '[[1,2,3]]', isSecret: true },
      { input: '[[], 3]', expectedOutput: '[]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'map() завжди повертає новий масив однакової довжини, а forEach() лише виконує побічні дії і повертає undefined.', penaltyPct: 15 },
      { level: 2, hint: 'Для чистої трансформації списків завжди обирайте map(), зберігаючи незмінність вхідного масиву.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#array-iteration',
  },

  // --- Topic 2: array-reduction ---
  {
    topic: 'array-reduction',
    subConcept: 'reduce-initial-value',
    taskType: 'SINGLE_CHOICE',
    title: 'Важливість початкового значення в Array.reduce',
    description: 'Що відбудеться при виклику `[].reduce((acc, x) => acc + x)` над порожнім масивом БЕЗ зазначення початкового значення (initialValue)?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Виникне помилка TypeError: Reduce of empty array with no initial value', isCorrect: true },
      { id: 'opt2', text: 'Метод поверне 0', isCorrect: false },
      { id: 'opt3', text: 'Метод поверне undefined', isCorrect: false },
      { id: 'opt4', text: 'Метод поверне null', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'reduce() згортає масив у єдине акумульоване значення будь-якого типу (число, обʼєкт, список).', penaltyPct: 15 },
      { level: 2, hint: 'Перший аргумент колбеку — акумулятор (acc), другий — поточний елемент (cur). Не забувайте передавати початкове значення!', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#array-reduction',
  },
  {
    topic: 'array-reduction',
    subConcept: 'word-frequency-counter',
    taskType: 'CODE',
    title: 'Частотний словник слів (Reduce Frequency)',
    description: 'Напишіть функцію `countFrequencies(words)`, яка приймає масив рядків і повертає обʼєкт із кількістю входжень кожного рядка.',
    difficulty: 'MEDIUM',
    starterCode: 'function countFrequencies(words) {\n  return words.reduce((acc, word) => {\n    acc[word] = (acc[word] || 0) + 1;\n    return acc;\n  }, {});\n}',
    testCases: [
      { input: '[["apple", "banana", "apple"]]', expectedOutput: '{"apple":2,"banana":1}', isSecret: false },
      { input: '[["a", "b", "c"]]', expectedOutput: '{"a":1,"b":1,"c":1}', isSecret: false },
      { input: '[[]]', expectedOutput: '{}', isSecret: true },
      { input: '[["js", "ts", "js", "js"]]', expectedOutput: '{"js":3,"ts":1}', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'reduce() згортає масив у єдине акумульоване значення будь-якого типу (число, обʼєкт, список).', penaltyPct: 15 },
      { level: 2, hint: 'Перший аргумент колбеку — акумулятор (acc), другий — поточний елемент (cur). Не забувайте передавати початкове значення!', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#array-reduction',
  },
  {
    topic: 'array-reduction',
    subConcept: 'group-by-key-implementation',
    taskType: 'CODE',
    title: 'Поглиблено: Групування масиву за властивістю (GroupBy)',
    description: 'Напишіть функцію `groupBy(items, key)`, яка групує масив обʼєктів за значенням властивості `key` і повертає обʼєкт, де кожен ключ містить масив відповідних елементів.',
    difficulty: 'HARD',
    starterCode: 'function groupBy(items, key) {\n  return items.reduce((acc, item) => {\n    const groupKey = item[key];\n    if (!acc[groupKey]) acc[groupKey] = [];\n    acc[groupKey].push(item);\n    return acc;\n  }, {});\n}',
    testCases: [
      { input: '[[{"role":"admin","name":"A"},{"role":"user","name":"B"},{"role":"admin","name":"C"}], "role"]', expectedOutput: '{"admin":[{"role":"admin","name":"A"},{"role":"admin","name":"C"}],"user":[{"role":"user","name":"B"}]}', isSecret: false },
      { input: '[[], "type"]', expectedOutput: '{}', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'reduce() згортає масив у єдине акумульоване значення будь-якого типу (число, обʼєкт, список).', penaltyPct: 15 },
      { level: 2, hint: 'Перший аргумент колбеку — акумулятор (acc), другий — поточний елемент (cur). Не забувайте передавати початкове значення!', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#array-reduction',
  },

  // --- Topic 3: object-manipulation ---
  {
    topic: 'object-manipulation',
    subConcept: 'object-keys-entries',
    taskType: 'SINGLE_CHOICE',
    title: 'Метод Object.entries()',
    description: 'Що повертає виклик `Object.entries({ a: 1, b: 2 })`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Масив пар [ключ, значення]: [["a", 1], ["b", 2]]', isCorrect: true },
      { id: 'opt2', text: 'Масив ключів: ["a", "b"]', isCorrect: false },
      { id: 'opt3', text: 'Масив значень: [1, 2]', isCorrect: false },
      { id: 'opt4', text: 'Ітератор посилань Map', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Object.keys() повертає масив власних перелічуваних ключів, а Object.entries() повертає пари [ключ, значення].', penaltyPct: 15 },
      { level: 2, hint: 'Для безпечного клонування обʼєктів першого рівня використовуйте Object.assign({}, obj) або spread {...obj}.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#objects',
  },
  {
    topic: 'object-manipulation',
    subConcept: 'object-pick-properties',
    taskType: 'CODE',
    title: 'Вибірка властивостей (Pick Keys)',
    description: 'Напишіть функцію `pick(obj, keys)`, яка повертає новий обʼєкт, що містить тільки ті поля з `obj`, назви яких перелічені в масиві `keys`.',
    difficulty: 'MEDIUM',
    starterCode: 'function pick(obj, keys) {\n  const result = {};\n  for (const k of keys) {\n    if (k in obj) result[k] = obj[k];\n  }\n  return result;\n}',
    testCases: [
      { input: '[{"id":1,"name":"Alice","pass":"123"}, ["id","name"]]', expectedOutput: '{"id":1,"name":"Alice"}', isSecret: false },
      { input: '[{"a":10,"b":20}, ["c"]]', expectedOutput: '{}', isSecret: false },
      { input: '[{"x":1,"y":2,"z":3}, ["x","z"]]', expectedOutput: '{"x":1,"z":3}', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Object.keys() повертає масив власних перелічуваних ключів, а Object.entries() повертає пари [ключ, значення].', penaltyPct: 15 },
      { level: 2, hint: 'Для безпечного клонування обʼєктів першого рівня використовуйте Object.assign({}, obj) або spread {...obj}.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#objects',
  },
  {
    topic: 'object-manipulation',
    subConcept: 'deep-merge-objects',
    taskType: 'CODE',
    title: 'Поглиблено: Глибоке злиття двох конфігурацій (Deep Merge)',
    description: 'Напишіть функцію `deepMerge(target, source)`, яка обʼєднує два вкладені обʼєкти. Якщо поле є в обох і є звичайним обʼєктом — злийте рекурсивно; інакше значення з `source` перезаписує значення в `target`. Повертає новий обʼєкт.',
    difficulty: 'HARD',
    starterCode: 'function deepMerge(target, source) {\n  const output = { ...target };\n  for (const key of Object.keys(source)) {\n    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {\n      output[key] = deepMerge(output[key] || {}, source[key]);\n    } else {\n      output[key] = source[key];\n    }\n  }\n  return output;\n}',
    testCases: [
      { input: '[{"a":{"x":1},"b":2}, {"a":{"y":2},"b":3,"c":4}]', expectedOutput: '{"a":{"x":1,"y":2},"b":3,"c":4}', isSecret: false },
      { input: '[{}, {"key":"val"}]', expectedOutput: '{"key":"val"}', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Object.keys() повертає масив власних перелічуваних ключів, а Object.entries() повертає пари [ключ, значення].', penaltyPct: 15 },
      { level: 2, hint: 'Для безпечного клонування обʼєктів першого рівня використовуйте Object.assign({}, obj) або spread {...obj}.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#objects',
  },

  // --- Topic 4: map-and-set ---
  {
    topic: 'map-and-set',
    subConcept: 'set-uniqueness',
    taskType: 'SINGLE_CHOICE',
    title: 'Унікальність значень у колекції Set',
    description: 'Що збережеться в колекції `new Set([1, 2, 2, 3, 1, 4])`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Унікальні значення: 1, 2, 3, 4', isCorrect: true },
      { id: 'opt2', text: 'Усі 6 значень із повторами', isCorrect: false },
      { id: 'opt3', text: 'Тільки значення, які повторювалися: 1, 2', isCorrect: false },
      { id: 'opt4', text: 'Колекція видасть помилку дубліката', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Головна властивість Set — унікальність значень (без дублікатів).', penaltyPct: 15 },
      { level: 2, hint: 'На відміну від звичайного обʼєкта, ключами Map можуть бути будь-які типи, включаючи функції та інші обʼєкти.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#map-set',
  },
  {
    topic: 'map-and-set',
    subConcept: 'array-unique-values',
    taskType: 'CODE',
    title: 'Отримання унікальних елементів масиву (Unique Array)',
    description: 'Напишіть функцію `unique(arr)`, яка повертає новий масив із унікальними елементами за допомогою структури даних `Set`.',
    difficulty: 'MEDIUM',
    starterCode: 'function unique(arr) {\n  return [...new Set(arr)];\n}',
    testCases: [
      { input: '[[1, 2, 2, 3, 1, 4]]', expectedOutput: '[1,2,3,4]', isSecret: false },
      { input: '[["a", "b", "a"]]', expectedOutput: '["a","b"]', isSecret: false },
      { input: '[[]]', expectedOutput: '[]', isSecret: true },
      { input: '[[5, 5, 5, 5]]', expectedOutput: '[5]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Головна властивість Set — унікальність значень (без дублікатів).', penaltyPct: 15 },
      { level: 2, hint: 'На відміну від звичайного обʼєкта, ключами Map можуть бути будь-які типи, включаючи функції та інші обʼєкти.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#map-set',
  },
  {
    topic: 'map-and-set',
    subConcept: 'set-intersection-difference',
    taskType: 'CODE',
    title: 'Поглиблено: Перетин двох множин (Set Intersection)',
    description: 'Напишіть функцію `intersection(arrA, arrB)`, яка повертає масив спільних унікальних елементів, які одночасно присутні в обох масивах `arrA` та `arrB`.',
    difficulty: 'HARD',
    starterCode: 'function intersection(arrA, arrB) {\n  const setB = new Set(arrB);\n  return [...new Set(arrA)].filter(x => setB.has(x));\n}',
    testCases: [
      { input: '[[1, 2, 3], [2, 3, 4]]', expectedOutput: '[2,3]', isSecret: false },
      { input: '[[1, 2], [3, 4]]', expectedOutput: '[]', isSecret: false },
      { input: '[["x", "y"], ["y", "z"]]', expectedOutput: '["y"]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Головна властивість Set — унікальність значень (без дублікатів).', penaltyPct: 15 },
      { level: 2, hint: 'На відміну від звичайного обʼєкта, ключами Map можуть бути будь-які типи, включаючи функції та інші обʼєкти.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#map-set',
  },

  // --- Topic 5: array-mutations-and-searches ---
  {
    topic: 'array-mutations-and-searches',
    subConcept: 'slice-vs-splice',
    taskType: 'SINGLE_CHOICE',
    title: 'Методи slice() проти splice()',
    description: 'Який із цих методів масиву МУТУЄ (змінює безпосередньо) початковий масив?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'splice()', isCorrect: true },
      { id: 'opt2', text: 'slice()', isCorrect: false },
      { id: 'opt3', text: 'concat()', isCorrect: false },
      { id: 'opt4', text: 'filter()', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Методи push, pop, splice мутують оригінальний масив на місці; concat, slice, toSorted створюють нові копії.', penaltyPct: 15 },
      { level: 2, hint: 'indexOf шукає за суворою рівністю ===, а find() приймає функцію-предикат.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#array-mutations',
  },
  {
    topic: 'array-mutations-and-searches',
    subConcept: 'binary-search-array',
    taskType: 'CODE',
    title: 'Бінарний пошук у відсортованому масиві',
    description: 'Напишіть функцію `binarySearch(arr, target)`, яка знаходить індекс елемента `target` у відсортованому за зростанням масиві чисел за час O(log n). Якщо елемент не знайдено — повертає -1.',
    difficulty: 'MEDIUM',
    starterCode: 'function binarySearch(arr, target) {\n  let left = 0, right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}',
    testCases: [
      { input: '[[1, 3, 5, 7, 9], 5]', expectedOutput: '2', isSecret: false },
      { input: '[[1, 3, 5, 7, 9], 10]', expectedOutput: '-1', isSecret: false },
      { input: '[[2, 4, 6, 8, 10, 12], 2]', expectedOutput: '0', isSecret: true },
      { input: '[[2, 4, 6, 8, 10, 12], 12]', expectedOutput: '5', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Методи push, pop, splice мутують оригінальний масив на місці; concat, slice, toSorted створюють нові копії.', penaltyPct: 15 },
      { level: 2, hint: 'indexOf шукає за суворою рівністю ===, а find() приймає функцію-предикат.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#array-mutations',
  },
  {
    topic: 'array-mutations-and-searches',
    subConcept: 'in-place-array-deduplication',
    taskType: 'CODE',
    title: 'Поглиблено: Видалення дублікатів in-place (Два вказівники)',
    description: 'Напишіть функцію `removeDuplicates(nums)`, яка видаляє дублікати з відсортованого масиву `nums` in-place так, щоб кожен елемент зустрічався лише один раз, і повертає нову довжину унікальної частини `k`.',
    difficulty: 'HARD',
    starterCode: 'function removeDuplicates(nums) {\n  if (nums.length === 0) return 0;\n  let i = 0;\n  for (let j = 1; j < nums.length; j++) {\n    if (nums[j] !== nums[i]) {\n      i++;\n      nums[i] = nums[j];\n    }\n  }\n  return i + 1;\n}',
    testCases: [
      { input: '[[1, 1, 2]]', expectedOutput: '2', isSecret: false },
      { input: '[[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]]', expectedOutput: '5', isSecret: false },
      { input: '[[1, 2, 3]]', expectedOutput: '3', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Методи push, pop, splice мутують оригінальний масив на місці; concat, slice, toSorted створюють нові копії.', penaltyPct: 15 },
      { level: 2, hint: 'indexOf шукає за суворою рівністю ===, а find() приймає функцію-предикат.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#array-mutations',
  },

  // --- Topic 6: object-destructuring ---
  {
    topic: 'object-destructuring',
    subConcept: 'destructuring-rename-defaults',
    taskType: 'SINGLE_CHOICE',
    title: 'Перейменування змінних при деструктуризації',
    description: 'Як правильно перейменувати властивість `user_name` у змінну `name` при деструктуризації обʼєкта?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'const { user_name: name } = obj;', isCorrect: true },
      { id: 'opt2', text: 'const { user_name as name } = obj;', isCorrect: false },
      { id: 'opt3', text: 'const { name = user_name } = obj;', isCorrect: false },
      { id: 'opt4', text: 'const { user_name -> name } = obj;', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Деструктуризація дозволяє витягати властивості обʼєкта в окремі змінні за їхніми назвами: const { name, age } = user.', penaltyPct: 15 },
      { level: 2, hint: 'Можна задавати значення за замовчуванням: const { role = "guest" } = user, або перейменовувати: const { name: userName } = user.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#destructuring',
  },
  {
    topic: 'object-destructuring',
    subConcept: 'extract-profile-info',
    taskType: 'CODE',
    title: 'Безпечне вилучення даних профілю',
    description: 'Напишіть функцію `formatUser(data)`, яка деструктуризує обʼєкт `data`, вилучаючи `name`, `city` (зі значенням за замовчуванням `"Київ"`), та повертає рядок `"${name} (${city})"`.',
    difficulty: 'MEDIUM',
    starterCode: 'function formatUser(data) {\n  const { name, city = "Київ" } = data;\n  return `${name} (${city})`;\n}',
    testCases: [
      { input: '[{"name":"Олена","city":"Львів"}]', expectedOutput: '"Олена (Львів)"', isSecret: false },
      { input: '[{"name":"Тарас"}]', expectedOutput: '"Тарас (Київ)"', isSecret: false },
      { input: '[{"name":"Іван","city":"Одеса"}]', expectedOutput: '"Іван (Одеса)"', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Деструктуризація дозволяє витягати властивості обʼєкта в окремі змінні за їхніми назвами: const { name, age } = user.', penaltyPct: 15 },
      { level: 2, hint: 'Можна задавати значення за замовчуванням: const { role = "guest" } = user, або перейменовувати: const { name: userName } = user.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#destructuring',
  },
  {
    topic: 'object-destructuring',
    subConcept: 'nested-destructuring-transforms',
    taskType: 'CODE',
    title: 'Поглиблено: Глибока деструктуризація API-відповіді',
    description: 'Напишіть функцію `extractAddress(apiResponse)`, яка за один рядок деструктуризації витягує з вкладеного обʼєкта `{ data: { user: { address: { street, zip = "00000" } } } }` назву вулиці та поштовий індекс і повертає обʼєкт `{ street, zip }`.',
    difficulty: 'HARD',
    starterCode: 'function extractAddress(apiResponse) {\n  const { data: { user: { address: { street, zip = "00000" } } } } = apiResponse;\n  return { street, zip };\n}',
    testCases: [
      { input: '[{"data":{"user":{"address":{"street":"Khreshchatyk","zip":"01001"}}}}]', expectedOutput: '{"street":"Khreshchatyk","zip":"01001"}', isSecret: false },
      { input: '[{"data":{"user":{"address":{"street":"Central"}}}}]', expectedOutput: '{"street":"Central","zip":"00000"}', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Деструктуризація дозволяє витягати властивості обʼєкта в окремі змінні за їхніми назвами: const { name, age } = user.', penaltyPct: 15 },
      { level: 2, hint: 'Можна задавати значення за замовчуванням: const { role = "guest" } = user, або перейменовувати: const { name: userName } = user.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#destructuring',
  },

  // --- Topic 7: sorting-and-comparators ---
  {
    topic: 'sorting-and-comparators',
    subConcept: 'default-lexicographic-sort',
    taskType: 'SINGLE_CHOICE',
    title: 'Поведінка Array.prototype.sort() без компаратора',
    description: 'Який результат поверне `[10, 2, 5, 1].sort()` без передачі функції порівняння?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: '[1, 10, 2, 5] (елементи конвертуються в рядки і сортуються лексикографічно)', isCorrect: true },
      { id: 'opt2', text: '[1, 2, 5, 10] (числове сортування за зростанням)', isCorrect: false },
      { id: 'opt3', text: '[10, 5, 2, 1] (за спаданням)', isCorrect: false },
      { id: 'opt4', text: 'Виникне помилка, оскільки компаратор є обовʼязковим', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'За замовчуванням метод sort() перетворює всі елементи на рядки! Саме тому [10, 2].sort() дає [10, 2].', penaltyPct: 15 },
      { level: 2, hint: 'Для правильного числового сортування передавайте компаратор: (a, b) => a - b (за зростанням).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#sorting',
  },
  {
    topic: 'sorting-and-comparators',
    subConcept: 'sort-numbers-ascending',
    taskType: 'CODE',
    title: 'Числове сортування масиву за зростанням',
    description: 'Напишіть функцію `sortNumbers(nums)`, яка повертає новий масив чисел, відсортований за числовим зростанням (не мутуйте вхідний масив).',
    difficulty: 'MEDIUM',
    starterCode: 'function sortNumbers(nums) {\n  return [...nums].sort((a, b) => a - b);\n}',
    testCases: [
      { input: '[[10, 2, 5, 1, 20]]', expectedOutput: '[1,2,5,10,20]', isSecret: false },
      { input: '[[-5, 0, -10, 5]]', expectedOutput: '[-10,-5,0,5]', isSecret: false },
      { input: '[[1]]', expectedOutput: '[1]', isSecret: true },
      { input: '[[]]', expectedOutput: '[]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'За замовчуванням метод sort() перетворює всі елементи на рядки! Саме тому [10, 2].sort() дає [10, 2].', penaltyPct: 15 },
      { level: 2, hint: 'Для правильного числового сортування передавайте компаратор: (a, b) => a - b (за зростанням).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#sorting',
  },
  {
    topic: 'sorting-and-comparators',
    subConcept: 'multi-criteria-sorting',
    taskType: 'CODE',
    title: 'Поглиблено: Багатокритеріальне сортування обʼєктів',
    description: 'Напишіть функцію `sortUsers(users)`, яка сортує масив користувачів за спаданням балів `score` (`b.score - a.score`). Якщо бали однакові — сортує за алфавітним зростанням імені `name` (використовуйте `localeCompare`).',
    difficulty: 'HARD',
    starterCode: 'function sortUsers(users) {\n  return [...users].sort((a, b) => {\n    if (b.score !== a.score) return b.score - a.score;\n    return a.name.localeCompare(b.name);\n  });\n}',
    testCases: [
      { input: '[[{"name":"B","score":80},{"name":"A","score":90},{"name":"C","score":80}]]', expectedOutput: '[{"name":"A","score":90},{"name":"B","score":80},{"name":"C","score":80}]', isSecret: false },
      { input: '[[{"name":"Z","score":100},{"name":"A","score":100}]]', expectedOutput: '[{"name":"A","score":100},{"name":"Z","score":100}]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'За замовчуванням метод sort() перетворює всі елементи на рядки! Саме тому [10, 2].sort() дає [10, 2].', penaltyPct: 15 },
      { level: 2, hint: 'Для правильного числового сортування передавайте компаратор: (a, b) => a - b (за зростанням).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#sorting',
  },
  // Capstone Bug Hunt for js-collections
  {
    topic: 'array-iteration',
    subConcept: 'find-index-mutation-bug',
    taskType: 'CODE',
    title: 'Bug Hunt: Помилка підрахунку суми чисел',
    description: 'Функція `sumPositive(numbers)` повинна повертати суму тільки додатних чисел. Виправте помилку фільтрації.',
    difficulty: 'MEDIUM',
    starterCode: 'function sumPositive(numbers) {\n  return numbers.filter(x => x > 0).reduce((acc, x) => acc + x, 0);\n}',
    testCases: [
      { input: '[[-2, 5, -1, 10, 0]]', expectedOutput: '15', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'map() завжди повертає новий масив однакової довжини, а forEach() лише виконує побічні дії і повертає undefined.', penaltyPct: 15 },
      { level: 2, hint: 'Для чистої трансформації списків завжди обирайте map(), зберігаючи незмінність вхідного масиву.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-3/collections#array-iteration',
  },
];

// ============================================================================
// MODULE 4: js-async (Асинхронний JavaScript, Event Loop & Promises)
// 7 Topics x 3 Tiers = 21 Tasks + 1 Capstone Challenge = 22 Tasks
// ============================================================================
export const jsAsyncTasks: SeedTask[] = [
  // --- Topic 1: event-loop ---
  {
    topic: 'event-loop',
    subConcept: 'micro-vs-macro-tasks-priority',
    taskType: 'SINGLE_CHOICE',
    title: 'Пріоритет виконання: Мікротаски проти Макротасків',
    description: 'Яка черга виконується першою одразу після завершення поточного синхронного коду в Call Stack?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Черга мікротасків (Microtask Queue: Promises, queueMicrotask)', isCorrect: true },
      { id: 'opt2', text: 'Черга макротасків (Macrotask Queue: setTimeout, setInterval)', isCorrect: false },
      { id: 'opt3', text: 'Черга подій I/O рендерингу браузера', isCorrect: false },
      { id: 'opt4', text: 'Порядок виконання є випадковим і залежить від завантаження CPU', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Call Stack виконує синхронний код першим. Що виконується раніше після нього: черга Microtasks (Promises) чи Macrotasks (setTimeout)?', penaltyPct: 15 },
      { level: 2, hint: 'Мікротаски (Promise.then, queueMicrotask) мають абсолютний пріоритет і очищуються повністю перед кожним макротаском.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#event-loop',
  },
  {
    topic: 'event-loop',
    subConcept: 'event-loop-essay-theory',
    taskType: 'TEXT_ESSAY',
    title: 'Аналіз концепції: Event Loop та фази асинхронності',
    description: 'Поясніть своїми словами принцип роботи Event Loop та взаємодію між Call Stack, Web APIs, Microtask Queue та Macrotask Queue у JavaScript.',
    difficulty: 'MEDIUM',
    referenceAnswer: 'Event Loop безперервно перевіряє Call Stack. Коли стек порожній, рушій спочатку повністю вичерпує чергу Microtasks (Promise, queueMicrotask), оновлює рендер за потреби, і лише після цього бере одну Macrotask (setTimeout, I/O) з черги подій.',
    options: {
      keywords: ['microtask|мікротаск|promise|проміс', 'macrotask|макротаск|settimeout|таймер', 'call stack|стек', 'черга|queue'],
      minWords: 15,
    },
    rubrics: {
      keywords: ['microtask|мікротаск|promise|проміс', 'macrotask|макротаск|settimeout|таймер', 'call stack|стек', 'черга|queue'],
      minWords: 15,
    },
    socraticHints: [
      { level: 1, hint: 'Call Stack виконує синхронний код першим. Що виконується раніше після нього: черга Microtasks (Promises) чи Macrotasks (setTimeout)?', penaltyPct: 15 },
      { level: 2, hint: 'Мікротаски (Promise.then, queueMicrotask) мають абсолютний пріоритет і очищуються повністю перед кожним макротаском.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#event-loop',
  },
  {
    topic: 'event-loop',
    subConcept: 'execution-order-prediction',
    taskType: 'CODE',
    title: 'Поглиблено: Передбачення послідовності виведення логів',
    description: 'Напишіть функцію `getExecutionOrder()`, яка повертає масив чисел у точній послідовності їх виведення в консоль:\n1: синхронний log(1)\n2: setTimeout(() => log(2), 0)\n3: Promise.resolve().then(() => log(3))\n4: синхронний log(4)',
    difficulty: 'HARD',
    starterCode: 'function getExecutionOrder() {\n  // Поверніть масив чисел, наприклад [1, 4, 3, 2]\n  return [1, 4, 3, 2];\n}',
    testCases: [
      { input: '[]', expectedOutput: '[1,4,3,2]', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Call Stack виконує синхронний код першим. Що виконується раніше після нього: черга Microtasks (Promises) чи Macrotasks (setTimeout)?', penaltyPct: 15 },
      { level: 2, hint: 'Мікротаски (Promise.then, queueMicrotask) мають абсолютний пріоритет і очищуються повністю перед кожним макротаском.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#event-loop',
  },

  // --- Topic 2: promises ---
  {
    topic: 'promises',
    subConcept: 'promise-states-transitions',
    taskType: 'SINGLE_CHOICE',
    title: 'Стани обʼєкта Promise',
    description: 'Які 3 взаємовиключні стани може мати обʼєкт `Promise` згідно зі специфікацією ECMAScript?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'pending, fulfilled, rejected', isCorrect: true },
      { id: 'opt2', text: 'waiting, success, failed', isCorrect: false },
      { id: 'opt3', text: 'loading, completed, error', isCorrect: false },
      { id: 'opt4', text: 'initial, resolved, broken', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Проміс має три стани: pending (очікування), fulfilled (успіх), rejected (помилка).', penaltyPct: 15 },
      { level: 2, hint: 'Стан промісу є незворотним: перейшовши у fulfilled чи rejected, він ніколи не зміниться знову.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#promises',
  },
  {
    topic: 'promises',
    subConcept: 'promisify-delay',
    taskType: 'CODE',
    title: 'Створення промісифікованої затримки (Sleep/Delay)',
    description: 'Напишіть функцію `delay(ms)`, яка повертає `Promise`, що успішно резолвиться значенням `"done"` через вказану кількість мілісекунд `ms`.',
    difficulty: 'MEDIUM',
    starterCode: 'function delay(ms) {\n  return new Promise(resolve => setTimeout(() => resolve("done"), ms));\n}',
    testCases: [
      { input: '[10]', expectedOutput: '"done"', isSecret: false },
      { input: '[5]', expectedOutput: '"done"', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Проміс має три стани: pending (очікування), fulfilled (успіх), rejected (помилка).', penaltyPct: 15 },
      { level: 2, hint: 'Стан промісу є незворотним: перейшовши у fulfilled чи rejected, він ніколи не зміниться знову.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#promises',
  },
  {
    topic: 'promises',
    subConcept: 'custom-promise-all-settled',
    taskType: 'CODE',
    title: 'Поглиблено: Безпечне виконання пулу промісів (Promise Wrapper)',
    description: 'Напишіть функцію `safeResolve(promise)`, яка приймає `Promise` і завжди резолвиться обʼєктом `{ status: "fulfilled", value }` у разі успіху або `{ status: "rejected", reason: err.message }` у разі виникнення помилки (без викидання необробленого винятку).',
    difficulty: 'HARD',
    starterCode: 'async function safeResolve(promise) {\n  try {\n    const value = await promise;\n    return { status: "fulfilled", value };\n  } catch (err) {\n    return { status: "rejected", reason: err.message || String(err) };\n  }\n}',
    testCases: [
      { input: '[Promise.resolve(42)]', expectedOutput: '{"status":"fulfilled","value":42}', isSecret: false },
      { input: '[Promise.reject(new Error("Network Error"))]', expectedOutput: '{"status":"rejected","reason":"Network Error"}', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Проміс має три стани: pending (очікування), fulfilled (успіх), rejected (помилка).', penaltyPct: 15 },
      { level: 2, hint: 'Стан промісу є незворотним: перейшовши у fulfilled чи rejected, він ніколи не зміниться знову.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#promises',
  },

  // --- Topic 3: async-await ---
  {
    topic: 'async-await',
    subConcept: 'async-return-type',
    taskType: 'SINGLE_CHOICE',
    title: 'Тип значення, що повертає async-функція',
    description: 'Що ЗАВЖДИ повертає функція, оголошена з ключовим словом `async function foo() { return 42; }`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Обʼєкт Promise, що резолвиться значенням 42', isCorrect: true },
      { id: 'opt2', text: 'Число 42 синхронно', isCorrect: false },
      { id: 'opt3', text: 'Колбек-обгортку', isCorrect: false },
      { id: 'opt4', text: 'undefined до моменту завершення таски', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Будь-яка функція з ключовим словом async автоматично повертає Promise.', penaltyPct: 15 },
      { level: 2, hint: 'Оператор await призупиняє виконання функції до вирішення промісу, розгортаючи його результат або викидаючи помилку.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#async-await',
  },
  {
    topic: 'async-await',
    subConcept: 'fetch-user-promise',
    taskType: 'CODE',
    title: 'Асинхронне отримання профілю користувача',
    description: 'Напишіть асинхронну функцію `fetchUser(id)`, яка за допомогою `await` повертає обʼєкт `{ id, name: "User_" + id }`.',
    difficulty: 'MEDIUM',
    starterCode: 'async function fetchUser(id) {\n  await new Promise(r => setTimeout(r, 10));\n  return { id, name: "User_" + id };\n}',
    testCases: [
      { input: '[1]', expectedOutput: '{"id":1,"name":"User_1"}', isSecret: false },
      { input: '[42]', expectedOutput: '{"id":42,"name":"User_42"}', isSecret: false },
      { input: '[99]', expectedOutput: '{"id":99,"name":"User_99"}', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Будь-яка функція з ключовим словом async автоматично повертає Promise.', penaltyPct: 15 },
      { level: 2, hint: 'Оператор await призупиняє виконання функції до вирішення промісу, розгортаючи його результат або викидаючи помилку.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#async-await',
  },
  {
    topic: 'async-await',
    subConcept: 'sequential-vs-parallel-execution',
    taskType: 'CODE',
    title: 'Поглиблено: Паралельне виконання асинхронних запитів (Promise.all)',
    description: 'Напишіть асинхронну функцію `fetchUsersParallel(ids)`, яка приймає масив числових `id` і паралельно (через `Promise.all`) отримує користувачів у форматі `{ id, name: "User_" + id }`, повертаючи єдиний масив результатів.',
    difficulty: 'HARD',
    starterCode: 'async function fetchUsersParallel(ids) {\n  return Promise.all(ids.map(async id => {\n    await new Promise(r => setTimeout(r, 5));\n    return { id, name: "User_" + id };\n  }));\n}',
    testCases: [
      { input: '[[1, 2, 3]]', expectedOutput: '[{"id":1,"name":"User_1"},{"id":2,"name":"User_2"},{"id":3,"name":"User_3"}]', isSecret: false },
      { input: '[[]]', expectedOutput: '[]', isSecret: false },
      { input: '[[10, 20]]', expectedOutput: '[{"id":10,"name":"User_10"},{"id":20,"name":"User_20"}]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Будь-яка функція з ключовим словом async автоматично повертає Promise.', penaltyPct: 15 },
      { level: 2, hint: 'Оператор await призупиняє виконання функції до вирішення промісу, розгортаючи його результат або викидаючи помилку.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#async-await',
  },

  // --- Topic 4: error-handling-async ---
  {
    topic: 'error-handling-async',
    subConcept: 'try-catch-async-await',
    taskType: 'SINGLE_CHOICE',
    title: 'Перехоплення помилок у async/await',
    description: 'Яка синтаксична конструкція є стандартною для перехоплення помилок, згенерованих через reject усередині `await`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Блок try { ... } catch (error) { ... }', isCorrect: true },
      { id: 'opt2', text: 'Колбек window.onerror', isCorrect: false },
      { id: 'opt3', text: 'Ключове слово throw catch', isCorrect: false },
      { id: 'opt4', text: 'Блок onError() після виклику await', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Для перехоплення помилок у функціях async/await використовуйте стандартний блок try { ... } catch (err) { ... }.', penaltyPct: 15 },
      { level: 2, hint: 'У класичних промісах помилки перехоплюються через метод .catch(err => ...).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#error-handling',
  },
  {
    topic: 'error-handling-async',
    subConcept: 'safe-json-parse',
    taskType: 'CODE',
    title: 'Безпечний парсинг JSON з обробкою винятків',
    description: 'Напишіть функцію `safeParseJSON(jsonStr, fallbackValue)`, яка парсить рядок `JSON.parse`. Якщо виникає помилка синтаксису (SyntaxError) — перехоплює її та повертає `fallbackValue`.',
    difficulty: 'MEDIUM',
    starterCode: 'function safeParseJSON(jsonStr, fallbackValue) {\n  try {\n    return JSON.parse(jsonStr);\n  } catch (e) {\n    return fallbackValue;\n  }\n}',
    testCases: [
      { input: '["{\\"a\\": 1}", null]', expectedOutput: '{"a":1}', isSecret: false },
      { input: '["invalid json", {"status": "default"}]', expectedOutput: '{"status":"default"}', isSecret: false },
      { input: '["", []]', expectedOutput: '[]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Для перехоплення помилок у функціях async/await використовуйте стандартний блок try { ... } catch (err) { ... }.', penaltyPct: 15 },
      { level: 2, hint: 'У класичних промісах помилки перехоплюються через метод .catch(err => ...).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#error-handling',
  },
  {
    topic: 'error-handling-async',
    subConcept: 'async-retry-mechanism',
    taskType: 'CODE',
    title: 'Поглиблено: Механізм повторних спроб (Retry with Exponential Backoff)',
    description: 'Напишіть асинхронну функцію `retryAsync(fn, maxRetries = 2)`, яка викликає асинхронну функцію `fn`. Якщо вона викидає помилку — повторює виклик до `maxRetries` разів. Якщо всі спроби невдалі — прокидає останню помилку назовні.',
    difficulty: 'HARD',
    starterCode: 'async function retryAsync(fn, maxRetries = 2) {\n  let lastError;\n  for (let attempt = 0; attempt <= maxRetries; attempt++) {\n    try {\n      return await fn();\n    } catch (err) {\n      lastError = err;\n    }\n  }\n  throw lastError;\n}',
    testCases: [
      { input: '[async () => "success", 2]', expectedOutput: '"success"', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Для перехоплення помилок у функціях async/await використовуйте стандартний блок try { ... } catch (err) { ... }.', penaltyPct: 15 },
      { level: 2, hint: 'У класичних промісах помилки перехоплюються через метод .catch(err => ...).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#error-handling',
  },

  // --- Topic 5: promise-combinators ---
  {
    topic: 'promise-combinators',
    subConcept: 'promise-race-definition',
    taskType: 'SINGLE_CHOICE',
    title: 'Поведінка Promise.race()',
    description: 'Що повертає `Promise.race([p1, p2, p3])`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Результат (resolve або reject) того промісу, який завершився найпершим серед усіх', isCorrect: true },
      { id: 'opt2', text: 'Масив усіх виконаних промісів', isCorrect: false },
      { id: 'opt3', text: 'Тільки перший успішно виконаний проміс, ігноруючи помилки', isCorrect: false },
      { id: 'opt4', text: 'Викидає помилку, якщо хоча б один проміс був повільнішим за 100 мс', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Promise.all() падає одразу при першій же помилці; Promise.allSettled() завжди чекає завершення всіх промісів.', penaltyPct: 15 },
      { level: 2, hint: 'Promise.race() повертає результат першого завершеного промісу (байдуже, успішного чи помилкового).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#promise-combinators',
  },
  {
    topic: 'promise-combinators',
    subConcept: 'promise-any-first-success',
    taskType: 'CODE',
    title: 'Отримання першого успішного результату (First Success)',
    description: 'Напишіть асинхронну функцію `getFirstSuccess(promises)`, яка повертає результат першого промісу, що успішно завершився (використовуючи `Promise.any`).',
    difficulty: 'MEDIUM',
    starterCode: 'async function getFirstSuccess(promises) {\n  return Promise.any(promises);\n}',
    testCases: [
      { input: '[[Promise.reject("err"), Promise.resolve("winner")]]', expectedOutput: '"winner"', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Promise.all() падає одразу при першій же помилці; Promise.allSettled() завжди чекає завершення всіх промісів.', penaltyPct: 15 },
      { level: 2, hint: 'Promise.race() повертає результат першого завершеного промісу (байдуже, успішного чи помилкового).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#promise-combinators',
  },
  {
    topic: 'promise-combinators',
    subConcept: 'promise-timeout-wrapper',
    taskType: 'CODE',
    title: 'Поглиблено: Обмеження часу очікування запиту (Timeout Wrapper)',
    description: 'Напишіть функцію `withTimeout(promise, timeoutMs)`, яка повертає новий Promise. Якщо вхідний `promise` не завершився впродовж `timeoutMs` мілісекунд, повертає відхилений проміс із помилкою `"TIMEOUT"`.',
    difficulty: 'HARD',
    starterCode: 'function withTimeout(promise, timeoutMs) {\n  const timeout = new Promise((_, reject) => {\n    setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs);\n  });\n  return Promise.race([promise, timeout]);\n}',
    testCases: [
      { input: '[Promise.resolve("fast"), 1000]', expectedOutput: '"fast"', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Promise.all() падає одразу при першій же помилці; Promise.allSettled() завжди чекає завершення всіх промісів.', penaltyPct: 15 },
      { level: 2, hint: 'Promise.race() повертає результат першого завершеного промісу (байдуже, успішного чи помилкового).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#promise-combinators',
  },

  // --- Topic 6: timers-and-intervals ---
  {
    topic: 'timers-and-intervals',
    subConcept: 'settimeout-zero-delay',
    taskType: 'SINGLE_CHOICE',
    title: 'setTimeout з нульовою затримкою: setTimeout(fn, 0)',
    description: 'Чому код у `setTimeout(fn, 0)` не виконується негайно і синхронно?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Колбек поміщається в чергу макротасків браузера і очікує завершення всього поточного Call Stack', isCorrect: true },
      { id: 'opt2', text: 'Тому що браузер завжди чекає мінімум 1 секунду', isCorrect: false },
      { id: 'opt3', text: 'Це синтаксична помилка, мінімальне значення має бути 1', isCorrect: false },
      { id: 'opt4', text: 'Код переноситься у Web Worker', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'setTimeout викликає функцію один раз із затримкою, а setInterval повторює виклики через фіксований проміжок часу.', penaltyPct: 15 },
      { level: 2, hint: 'Для зупинки таймерів передавайте отриманий ID у clearTimeout() або clearInterval().', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#timers',
  },
  {
    topic: 'timers-and-intervals',
    subConcept: 'custom-interval-count',
    taskType: 'CODE',
    title: 'Генератор часових відліків (Tick Simulator)',
    description: 'Напишіть функцію `simulateTicks(count)`, яка генерує масив чисел від 1 до `count`, імітуючи завершення лічильника.',
    difficulty: 'MEDIUM',
    starterCode: 'function simulateTicks(count) {\n  const ticks = [];\n  for (let i = 1; i <= count; i++) ticks.push(i);\n  return ticks;\n}',
    testCases: [
      { input: '[3]', expectedOutput: '[1,2,3]', isSecret: false },
      { input: '[5]', expectedOutput: '[1,2,3,4,5]', isSecret: false },
      { input: '[0]', expectedOutput: '[]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'setTimeout викликає функцію один раз із затримкою, а setInterval повторює виклики через фіксований проміжок часу.', penaltyPct: 15 },
      { level: 2, hint: 'Для зупинки таймерів передавайте отриманий ID у clearTimeout() або clearInterval().', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#timers',
  },
  {
    topic: 'timers-and-intervals',
    subConcept: 'debounce-implementation',
    taskType: 'CODE',
    title: 'Поглиблено: Реалізація патерну Debounce',
    description: 'Напишіть функцію `debounce(fn, waitMs)`, яка повертає нову функцію. Вона відкладає виклик `fn` доти, доки не мине `waitMs` мілісекунд з моменту останнього виклику.',
    difficulty: 'HARD',
    starterCode: 'function debounce(fn, waitMs) {\n  let timeoutId;\n  return function(...args) {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn.apply(this, args), waitMs);\n  };\n}',
    testCases: [
      { input: '[() => "ok", 50]', expectedOutput: '"function"', isSecret: false }, // tester checks typeof returned function
    ],
    socraticHints: [
      { level: 1, hint: 'setTimeout викликає функцію один раз із затримкою, а setInterval повторює виклики через фіксований проміжок часу.', penaltyPct: 15 },
      { level: 2, hint: 'Для зупинки таймерів передавайте отриманий ID у clearTimeout() або clearInterval().', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#timers',
  },

  // --- Topic 7: async-generators-and-iterators ---
  {
    topic: 'async-generators-and-iterators',
    subConcept: 'for-await-of-loop',
    taskType: 'SINGLE_CHOICE',
    title: 'Цикл for await...of',
    description: 'Для чого в сучасному JavaScript використовується конструкція `for await (const item of source)`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Для послідовного обходу асинхронних ітерабельних обʼєктів та асинхронних генераторів', isCorrect: true },
      { id: 'opt2', text: 'Для паралельного запуску звичайних масивів у багатопоточному режимі', isCorrect: false },
      { id: 'opt3', text: 'Для заміни стандартного циклу while у промісах', isCorrect: false },
      { id: 'opt4', text: 'Це застарілий синтаксис, вилучений у ES2020', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Асинхронний генератор оголошується як async function* і повертає потік даних через yield.', penaltyPct: 15 },
      { level: 2, hint: 'Для споживання асинхронних генераторів використовується цикл for await (const item of generator).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#async-generators',
  },
  {
    topic: 'async-generators-and-iterators',
    subConcept: 'collect-async-stream',
    taskType: 'CODE',
    title: 'Збір значень асинхронного джерела в масив',
    description: 'Напишіть асинхронну функцію `collectPromises(promiseList)`, яка приймає масив промісів і повертає масив їхніх результатів, обробляючи кожен послідовно через цикл `for...of` з `await`.',
    difficulty: 'MEDIUM',
    starterCode: 'async function collectPromises(promiseList) {\n  const results = [];\n  for (const p of promiseList) {\n    results.push(await p);\n  }\n  return results;\n}',
    testCases: [
      { input: '[[Promise.resolve(10), Promise.resolve(20), Promise.resolve(30)]]', expectedOutput: '[10,20,30]', isSecret: false },
      { input: '[[]]', expectedOutput: '[]', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Асинхронний генератор оголошується як async function* і повертає потік даних через yield.', penaltyPct: 15 },
      { level: 2, hint: 'Для споживання асинхронних генераторів використовується цикл for await (const item of generator).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#async-generators',
  },
  {
    topic: 'async-generators-and-iterators',
    subConcept: 'async-pipeline-transform',
    taskType: 'CODE',
    title: 'Поглиблено: Асинхронний конвеєр обробки даних (Async Pipeline)',
    description: 'Напишіть асинхронну функцію `asyncPipeline(initialValue, ...asyncFns)`, яка послідовно пропускає `initialValue` крізь ланцюжок асинхронних функцій `asyncFns`, передаючи результат кожної наступній і повертаючи фінальне значення.',
    difficulty: 'HARD',
    starterCode: 'async function asyncPipeline(initialValue, ...asyncFns) {\n  let current = initialValue;\n  for (const fn of asyncFns) {\n    current = await fn(current);\n  }\n  return current;\n}',
    testCases: [
      { input: '[5, async x => x * 2, async x => x + 10]', expectedOutput: '20', isSecret: false },
      { input: '[10, async x => x - 3]', expectedOutput: '7', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Асинхронний генератор оголошується як async function* і повертає потік даних через yield.', penaltyPct: 15 },
      { level: 2, hint: 'Для споживання асинхронних генераторів використовується цикл for await (const item of generator).', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#async-generators',
  },
  // Capstone Bug Hunt for js-async
  {
    topic: 'async-await',
    subConcept: 'missing-await-bug',
    taskType: 'CODE',
    title: 'Bug Hunt: Виправлення пропущеного await у циклі',
    description: 'Функція `sumAsyncNumbers(proms)` повинна підсумувати числа, що повертаються з масиву промісів. Додайте пропущений `await`, щоб функція повертала числове значення суми, а не конкатенацію обʼєктів.',
    difficulty: 'MEDIUM',
    starterCode: 'async function sumAsyncNumbers(proms) {\n  let sum = 0;\n  for (const p of proms) {\n    sum += await p;\n  }\n  return sum;\n}',
    testCases: [
      { input: '[[Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]]', expectedOutput: '6', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Будь-яка функція з ключовим словом async автоматично повертає Promise.', penaltyPct: 15 },
      { level: 2, hint: 'Оператор await призупиняє виконання функції до вирішення промісу, розгортаючи його результат або викидаючи помилку.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-4/async#async-await',
  },
];

// ============================================================================
// MODULE 5: js-oop (ООП, Класи ES6, Прототипи & Успадкування)
// 6 Topics x 3 Tiers = 18 Tasks + 1 Capstone Challenge = 19 Tasks
// ============================================================================
export const jsOopTasks: SeedTask[] = [
  // --- Topic 1: classes-es6 ---
  {
    topic: 'classes-es6',
    subConcept: 'constructor-method',
    taskType: 'SINGLE_CHOICE',
    title: 'Призначення методу constructor у класах ES6',
    description: 'Яка основна роль методу `constructor()` у класі JavaScript?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Ініціалізація новоствореного екземпляра обʼєкта під час виклику оператора new', isCorrect: true },
      { id: 'opt2', text: 'Створення статичних властивостей класу', isCorrect: false },
      { id: 'opt3', text: 'Автоматичне видалення обʼєкта після використання', isCorrect: false },
      { id: 'opt4', text: 'Запобігання клонуванню обʼєкта', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Класи в ES6 — це синтаксичний цукор над прототипним успадкуванням.', penaltyPct: 15 },
      { level: 2, hint: 'Методи, оголошені всередині класу, автоматично потрапляють у prototype функції-конструктора.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#classes-es6',
  },
  {
    topic: 'classes-es6',
    subConcept: 'user-class-model',
    taskType: 'CODE',
    title: 'Створення класу Користувача (User Class)',
    description: 'Створіть клас `User`, конструктор якого приймає `name` та `role`. Клас повинен мати метод `getInfo()`, який повертає рядок `"${name} is a ${role}"`.',
    difficulty: 'MEDIUM',
    starterCode: 'class User {\n  constructor(name, role) {\n    this.name = name;\n    this.role = role;\n  }\n  getInfo() {\n    return `${this.name} is a ${this.role}`;\n  }\n}',
    testCases: [
      { input: '["Alice", "Developer"]', expectedOutput: '"Alice is a Developer"', isSecret: false },
      { input: '["Bob", "Admin"]', expectedOutput: '"Bob is a Admin"', isSecret: false },
      { input: '["SBC", "Bot"]', expectedOutput: '"SBC is a Bot"', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Класи в ES6 — це синтаксичний цукор над прототипним успадкуванням.', penaltyPct: 15 },
      { level: 2, hint: 'Методи, оголошені всередині класу, автоматично потрапляють у prototype функції-конструктора.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#classes-es6',
  },
  {
    topic: 'classes-es6',
    subConcept: 'private-class-fields',
    taskType: 'CODE',
    title: 'Поглиблено: Справжня інкапсуляція з приватними полями (#field)',
    description: 'Створіть клас `BankAccount` із приватним полем `#balance`, початково рівним 0. Реалізуйте публічні методи `deposit(amount)` (додає кошти, якщо `amount > 0`), `withdraw(amount)` (знімає, якщо коштів достатньо) та гетер `balance`, що повертає поточний баланс.',
    difficulty: 'HARD',
    starterCode: 'class BankAccount {\n  #balance = 0;\n  deposit(amount) {\n    if (amount > 0) this.#balance += amount;\n  }\n  withdraw(amount) {\n    if (amount > 0 && amount <= this.#balance) this.#balance -= amount;\n  }\n  get balance() {\n    return this.#balance;\n  }\n}',
    testCases: [
      { input: '[100, 40]', expectedOutput: '60', isSecret: false }, // deposit 100, withdraw 40 -> 60
      { input: '[50, 100]', expectedOutput: '50', isSecret: false }, // withdraw exceeds balance
    ],
    socraticHints: [
      { level: 1, hint: 'Класи в ES6 — це синтаксичний цукор над прототипним успадкуванням.', penaltyPct: 15 },
      { level: 2, hint: 'Методи, оголошені всередині класу, автоматично потрапляють у prototype функції-конструктора.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#classes-es6',
  },

  // --- Topic 2: inheritance ---
  {
    topic: 'inheritance',
    subConcept: 'super-keyword-requirement',
    taskType: 'SINGLE_CHOICE',
    title: 'Вимога виклику super() у дочірньому класі',
    description: 'Чому в конструкторі класу, що розширює інший (`class Dog extends Animal`), виклик `super()` має стояти перед використанням `this`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Конструктор батьківського класу має спочатку ініціалізувати екземпляр this; до виклику super() звернення до this викликає ReferenceError', isCorrect: true },
      { id: 'opt2', text: 'Це просто рекомендація стилю коду (ESLint)', isCorrect: false },
      { id: 'opt3', text: 'Тому що super() очищає прототип', isCorrect: false },
      { id: 'opt4', text: 'super() дозволено взагалі не викликати', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Ключове слово extends створює звʼязок прототипів між дочірнім та батьківським класом.', penaltyPct: 15 },
      { level: 2, hint: 'У конструкторі дочірнього класу виклик super() є обовʼязковим до першого звернення до this!', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#inheritance',
  },
  {
    topic: 'inheritance',
    subConcept: 'shape-hierarchy-classes',
    taskType: 'CODE',
    title: 'Успадкування класів фігур (Shape & Rectangle)',
    description: 'Створіть базовий клас `Shape` із властивістю `name`. Створіть дочірній клас `Rectangle extends Shape`, конструктор якого приймає `width` та `height` і передає `"Rectangle"` у `super()`. Додайте метод `getArea()`, що повертає площу `width * height`.',
    difficulty: 'MEDIUM',
    starterCode: 'class Shape {\n  constructor(name) {\n    this.name = name;\n  }\n}\n\nclass Rectangle extends Shape {\n  constructor(width, height) {\n    super("Rectangle");\n    this.width = width;\n    this.height = height;\n  }\n  getArea() {\n    return this.width * this.height;\n  }\n}',
    testCases: [
      { input: '[5, 10]', expectedOutput: '50', isSecret: false },
      { input: '[3, 7]', expectedOutput: '21', isSecret: false },
      { input: '[12, 12]', expectedOutput: '144', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Ключове слово extends створює звʼязок прототипів між дочірнім та батьківським класом.', penaltyPct: 15 },
      { level: 2, hint: 'У конструкторі дочірнього класу виклик super() є обовʼязковим до першого звернення до this!', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#inheritance',
  },
  {
    topic: 'inheritance',
    subConcept: 'polymorphism-method-override',
    taskType: 'CODE',
    title: 'Поглиблено: Поліморфізм та перевизначення методів',
    description: 'Створіть клас `Employee` з методом `calculateBonus(salary)`, що повертає `salary * 0.1`. Створіть клас `Manager extends Employee`, який перевизначає `calculateBonus(salary)` і повертає `super.calculateBonus(salary) + 500`.',
    difficulty: 'HARD',
    starterCode: 'class Employee {\n  calculateBonus(salary) {\n    return salary * 0.1;\n  }\n}\n\nclass Manager extends Employee {\n  calculateBonus(salary) {\n    return super.calculateBonus(salary) + 500;\n  }\n}',
    testCases: [
      { input: '[2000]', expectedOutput: '700', isSecret: false }, // 200 + 500
      { input: '[5000]', expectedOutput: '1000', isSecret: false }, // 500 + 500
      { input: '[10000]', expectedOutput: '1500', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Ключове слово extends створює звʼязок прототипів між дочірнім та батьківським класом.', penaltyPct: 15 },
      { level: 2, hint: 'У конструкторі дочірнього класу виклик super() є обовʼязковим до першого звернення до this!', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#inheritance',
  },

  // --- Topic 3: prototypes ---
  {
    topic: 'prototypes',
    subConcept: 'prototype-chain-lookup',
    taskType: 'SINGLE_CHOICE',
    title: 'Пошук властивостей у ланцюжку прототипів (Prototype Chain)',
    description: 'Що відбувається, коли код намагається отримати властивість `obj.prop`, якої немає у власному обʼєкті `obj`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Рушій шукає в obj.__proto__, потім вище по ланцюжку прототипів аж до Object.prototype і null', isCorrect: true },
      { id: 'opt2', text: 'Негайно повертається помилка ReferenceError', isCorrect: false },
      { id: 'opt3', text: 'Створюється нова порожня властивість у глобальному обʼєкті', isCorrect: false },
      { id: 'opt4', text: 'Рушій перевіряє тільки батьківський клас у strict mode', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Кожен обʼєкт у JS має внутрішнє посилання [[Prototype]] на інший обʼєкт, з якого він успадковує властивості.', penaltyPct: 15 },
      { level: 2, hint: 'Ланцюжок прототипів (Prototype Chain) закінчується на Object.prototype, чий прототип дорівнює null.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#prototypes',
  },
  {
    topic: 'prototypes',
    subConcept: 'constructor-function-prototype',
    taskType: 'CODE',
    title: 'Створення методів через функцію-конструктор та prototype',
    description: 'Напишіть функцію-конструктор `Car(brand, model)` та додайте до `Car.prototype` метод `drive()`, який повертає рядок `"${this.brand} ${this.model} is driving"`.',
    difficulty: 'MEDIUM',
    starterCode: 'function Car(brand, model) {\n  this.brand = brand;\n  this.model = model;\n}\n\nCar.prototype.drive = function() {\n  return `${this.brand} ${this.model} is driving`;\n};',
    testCases: [
      { input: '["Toyota", "Corolla"]', expectedOutput: '"Toyota Corolla is driving"', isSecret: false },
      { input: '["Tesla", "Model 3"]', expectedOutput: '"Tesla Model 3 is driving"', isSecret: false },
      { input: '["BMW", "M5"]', expectedOutput: '"BMW M5 is driving"', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Кожен обʼєкт у JS має внутрішнє посилання [[Prototype]] на інший обʼєкт, з якого він успадковує властивості.', penaltyPct: 15 },
      { level: 2, hint: 'Ланцюжок прототипів (Prototype Chain) закінчується на Object.prototype, чий прототип дорівнює null.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#prototypes',
  },
  {
    topic: 'prototypes',
    subConcept: 'custom-object-create',
    taskType: 'CODE',
    title: 'Поглиблено: Емуляція Object.create() через прототипи',
    description: 'Напишіть функцію `myObjectCreate(proto)`, яка створює новий порожній обʼєкт, чиїм прототипом є переданий `proto` (без використання `Object.create`).',
    difficulty: 'HARD',
    starterCode: 'function myObjectCreate(proto) {\n  function F() {}\n  F.prototype = proto;\n  return new F();\n}',
    testCases: [
      { input: '[{"greet": "hello"}]', expectedOutput: '"hello"', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Кожен обʼєкт у JS має внутрішнє посилання [[Prototype]] на інший обʼєкт, з якого він успадковує властивості.', penaltyPct: 15 },
      { level: 2, hint: 'Ланцюжок прототипів (Prototype Chain) закінчується на Object.prototype, чий прототип дорівнює null.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#prototypes',
  },

  // --- Topic 4: static-methods ---
  {
    topic: 'static-methods',
    subConcept: 'static-method-calling',
    taskType: 'SINGLE_CHOICE',
    title: 'Виклик статичних методів класу',
    description: 'Як правильно викликати статичний метод `static create()` класу `User`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'User.create() (через сам клас)', isCorrect: true },
      { id: 'opt2', text: 'const u = new User(); u.create(); (через екземпляр)', isCorrect: false },
      { id: 'opt3', text: 'this.create() у глобальному контексті', isCorrect: false },
      { id: 'opt4', text: 'Статичні методи викликаються тільки автоматично рушієм V8', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Статичні методи оголошуються зі словом static і викликаються безпосередньо на класі, а не на його екземплярах: Math.max().', penaltyPct: 15 },
      { level: 2, hint: 'У статичних методах ключове слово this посилається на сам клас, а не на створений обʼєкт.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#static-methods',
  },
  {
    topic: 'static-methods',
    subConcept: 'math-helper-class',
    taskType: 'CODE',
    title: 'Клас утиліт із статичними методами (MathUtils)',
    description: 'Створіть клас `MathUtils` із двома статичними методами: `static square(n)` (повертає `n * n`) та `static cube(n)` (повертає `n * n * n`).',
    difficulty: 'MEDIUM',
    starterCode: 'class MathUtils {\n  static square(n) {\n    return n * n;\n  }\n  static cube(n) {\n    return n * n * n;\n  }\n}',
    testCases: [
      { input: '[4]', expectedOutput: '16', isSecret: false }, // MathUtils.square(4)
      { input: '[3]', expectedOutput: '27', isSecret: false }, // MathUtils.cube(3)
      { input: '[10]', expectedOutput: '100', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Статичні методи оголошуються зі словом static і викликаються безпосередньо на класі, а не на його екземплярах: Math.max().', penaltyPct: 15 },
      { level: 2, hint: 'У статичних методах ключове слово this посилається на сам клас, а не на створений обʼєкт.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#static-methods',
  },
  {
    topic: 'static-methods',
    subConcept: 'singleton-pattern-class',
    taskType: 'CODE',
    title: 'Поглиблено: Реалізація патерну Singleton через клас ES6',
    description: 'Створіть клас `DatabaseConnection`, який при повторних викликах `new DatabaseConnection()` завжди повертає один і той самий єдиний створений екземпляр (Singleton).',
    difficulty: 'HARD',
    starterCode: 'class DatabaseConnection {\n  static #instance = null;\n  constructor() {\n    if (DatabaseConnection.#instance) {\n      return DatabaseConnection.#instance;\n    }\n    this.id = Math.random();\n    DatabaseConnection.#instance = this;\n  }\n}',
    testCases: [
      { input: '[]', expectedOutput: 'true', isSecret: false }, // new DB() === new DB()
    ],
    socraticHints: [
      { level: 1, hint: 'Статичні методи оголошуються зі словом static і викликаються безпосередньо на класі, а не на його екземплярах: Math.max().', penaltyPct: 15 },
      { level: 2, hint: 'У статичних методах ключове слово this посилається на сам клас, а не на створений обʼєкт.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#static-methods',
  },

  // --- Topic 5: getters-and-setters ---
  {
    topic: 'getters-and-setters',
    subConcept: 'accessor-properties-syntax',
    taskType: 'SINGLE_CHOICE',
    title: 'Синтаксис гетерів та сетерів (get/set)',
    description: 'Як відбувається звернення до властивості-гетера `get fullName() { ... }` в екземплярі обʼєкта `user`?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'user.fullName (як до звичайної властивості, без дужок ())', isCorrect: true },
      { id: 'opt2', text: 'user.fullName() (обовʼязково як до функції)', isCorrect: false },
      { id: 'opt3', text: 'user.get("fullName")', isCorrect: false },
      { id: 'opt4', text: 'user->fullName', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Геттер get prop() дозволяє звертатися до методу як до звичайної властивості: obj.prop замість obj.prop().', penaltyPct: 15 },
      { level: 2, hint: 'Сеттер set prop(val) перехоплює спробу присвоєння obj.prop = 10 для валідації або інкапсуляції.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#getters-and-setters',
  },
  {
    topic: 'getters-and-setters',
    subConcept: 'temperature-converter-class',
    taskType: 'CODE',
    title: 'Конвертер температури з гетером і сетером',
    description: 'Створіть клас `Temperature`, конструктор якого приймає температуру в Цельсіях (`celsius`). Реалізуйте гетер та сетер `fahrenheit`, де `F = C * 1.8 + 32`, а зворотна конвертація `C = (F - 32) / 1.8`.',
    difficulty: 'MEDIUM',
    starterCode: 'class Temperature {\n  constructor(celsius) {\n    this.celsius = celsius;\n  }\n  get fahrenheit() {\n    return this.celsius * 1.8 + 32;\n  }\n  set fahrenheit(f) {\n    this.celsius = (f - 32) / 1.8;\n  }\n}',
    testCases: [
      { input: '[0]', expectedOutput: '32', isSecret: false },
      { input: '[100]', expectedOutput: '212', isSecret: false },
      { input: '[-40]', expectedOutput: '-40', isSecret: true },
    ],
    socraticHints: [
      { level: 1, hint: 'Геттер get prop() дозволяє звертатися до методу як до звичайної властивості: obj.prop замість obj.prop().', penaltyPct: 15 },
      { level: 2, hint: 'Сеттер set prop(val) перехоплює спробу присвоєння obj.prop = 10 для валідації або інкапсуляції.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#getters-and-setters',
  },
  {
    topic: 'getters-and-setters',
    subConcept: 'observable-property-setter',
    taskType: 'CODE',
    title: 'Поглиблено: Валідація та логування змін через Setter',
    description: 'Створіть клас `ValidatedAge` із приватним полем `#age`. Сетер `age(val)` повинен викидати помилку `Error("Invalid age")`, якщо `val < 0` або `val > 120`; в іншому випадку зберігати значення. Гетер `age` повертає збережений вік.',
    difficulty: 'HARD',
    starterCode: 'class ValidatedAge {\n  #age = 0;\n  get age() {\n    return this.#age;\n  }\n  set age(val) {\n    if (val < 0 || val > 120) throw new Error("Invalid age");\n    this.#age = val;\n  }\n}',
    testCases: [
      { input: '[25]', expectedOutput: '25', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Геттер get prop() дозволяє звертатися до методу як до звичайної властивості: obj.prop замість obj.prop().', penaltyPct: 15 },
      { level: 2, hint: 'Сеттер set prop(val) перехоплює спробу присвоєння obj.prop = 10 для валідації або інкапсуляції.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#getters-and-setters',
  },

  // --- Topic 6: object-composition-and-mixins ---
  {
    topic: 'object-composition-and-mixins',
    subConcept: 'composition-over-inheritance',
    taskType: 'SINGLE_CHOICE',
    title: 'Принцип "Композиція замість успадкування"',
    description: 'Чому патерн композиції обʼєктів (Mixins / Object.assign) часто вважається гнучкішим за глибоке ієрархічне успадкування класів?',
    difficulty: 'EASY',
    options: [
      { id: 'opt1', text: 'Дозволяє комбінувати незалежні поведінки (behaviors) без жорсткої привʼязки до монолітної таксономії класів та уникає проблеми крихкого базового класу', isCorrect: true },
      { id: 'opt2', text: 'Тому що класи займають у 10 разів більше оперативної памʼяті', isCorrect: false },
      { id: 'opt3', text: 'Успадкування взагалі заборонено в стандарті ES6', isCorrect: false },
      { id: 'opt4', text: 'Композиція працює тільки з базами даних', isCorrect: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Принцип "Композиція замість успадкування" полягає у збиранні поведінки з маленьких незалежних функцій чи міксінів.', penaltyPct: 15 },
      { level: 2, hint: 'Object.assign(target.prototype, mixin) додає методи міксіна до класу без жорсткої ієрархії успадкування.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#composition-and-mixins',
  },
  {
    topic: 'object-composition-and-mixins',
    subConcept: 'apply-mixin-utility',
    taskType: 'CODE',
    title: 'Застосування міксіну до класу (Apply Mixin)',
    description: 'Напишіть функцію `applyMixin(targetClass, mixinObj)`, яка копіює всі методи з `mixinObj` у прототип `targetClass.prototype` за допомогою `Object.assign()`.',
    difficulty: 'MEDIUM',
    starterCode: 'function applyMixin(targetClass, mixinObj) {\n  Object.assign(targetClass.prototype, mixinObj);\n}',
    testCases: [
      { input: '[class Bot {}, {"ping": () => "pong"}]', expectedOutput: '"pong"', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Принцип "Композиція замість успадкування" полягає у збиранні поведінки з маленьких незалежних функцій чи міксінів.', penaltyPct: 15 },
      { level: 2, hint: 'Object.assign(target.prototype, mixin) додає методи міксіна до класу без жорсткої ієрархії успадкування.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#composition-and-mixins',
  },
  {
    topic: 'object-composition-and-mixins',
    subConcept: 'event-emitter-implementation',
    taskType: 'CODE',
    title: 'Поглиблено: Реалізація патерну EventEmitter',
    description: 'Створіть клас `EventEmitter` із методами `on(event, listener)` (підписка) та `emit(event, ...args)` (виклик усіх підписаних функцій-слухачів з переданими аргументами).',
    difficulty: 'HARD',
    starterCode: 'class EventEmitter {\n  constructor() {\n    this.events = {};\n  }\n  on(event, listener) {\n    if (!this.events[event]) this.events[event] = [];\n    this.events[event].push(listener);\n  }\n  emit(event, ...args) {\n    if (this.events[event]) {\n      this.events[event].forEach(fn => fn(...args));\n    }\n  }\n}',
    testCases: [
      { input: '["test"]', expectedOutput: 'true', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Принцип "Композиція замість успадкування" полягає у збиранні поведінки з маленьких незалежних функцій чи міксінів.', penaltyPct: 15 },
      { level: 2, hint: 'Object.assign(target.prototype, mixin) додає методи міксіна до класу без жорсткої ієрархії успадкування.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#composition-and-mixins',
  },
  // Capstone Bug Hunt for js-oop
  {
    topic: 'classes-es6',
    subConcept: 'lost-this-in-class-method-bug',
    taskType: 'CODE',
    title: 'Bug Hunt: Втрата контексту this при передачі методу як колбеку',
    description: 'У класі `Timer` метод `start()` передає `this.tick` у `setTimeout`, що призводить до втрати `this.seconds`. Виправте метод, привʼязавши контекст за допомогою стрілочної функції `() => this.tick()`.',
    difficulty: 'MEDIUM',
    starterCode: 'class Timer {\n  constructor() {\n    this.seconds = 0;\n  }\n  tick() {\n    this.seconds++;\n  }\n  start() {\n    setTimeout(() => this.tick(), 10);\n  }\n}',
    testCases: [
      { input: '[]', expectedOutput: '1', isSecret: false },
    ],
    socraticHints: [
      { level: 1, hint: 'Класи в ES6 — це синтаксичний цукор над прототипним успадкуванням.', penaltyPct: 15 },
      { level: 2, hint: 'Методи, оголошені всередині класу, автоматично потрапляють у prototype функції-конструктора.', penaltyPct: 30 },
    ],
    studyUnitUrl: '/learn/js-dev/module-5/oop#classes-es6',
  },
];
