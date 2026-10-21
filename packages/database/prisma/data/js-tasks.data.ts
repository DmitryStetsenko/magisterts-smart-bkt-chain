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
}

// ============================================================================
// MODULE 1: js-basics (Основи JS: Змінні, Типи, Оператори та Розгалуження)
// 7 Topics x 3 Tiers = 21 Tasks + 1 Capstone Challenge = 22 Tasks
// ============================================================================
export const jsBasicsTasks: SeedTask[] = [
  // --- Topic 1: variables-declaration ---
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
  },

  // --- Topic 2: primitive-types ---
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
  },

  // --- Topic 3: type-coercion ---
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
  },

  // --- Topic 4: operators-and-logic ---
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
  },

  // --- Topic 5: arithmetic-functions ---
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
  },

  // --- Topic 6: branching-and-loops ---
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
  },

  // --- Topic 7: string-manipulation ---
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
  },
];
