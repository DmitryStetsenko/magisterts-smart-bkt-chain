import { SeedTask } from './js-tasks.data';

/**
 * school-web-tasks.data.ts
 * 
 * Комплексний адаптивний банк завдань для шкільного курсу:
 * «Вебтехнології та алгоритмізація (10–11 класи)» (slug: web-algorithms-school)
 * 
 * Розроблено відповідно до:
 * 1. Програми курсу інформатики МОН України для 10–11 класів (академічний та профільний рівні).
 * 2. Стандарту побудови адаптивних завдань docs/justifications/03_task_authoring_and_pedagogical_specification.md.
 * 3. Принципу дидактичної послідовності: від алгоритмічного базису до інтерактивного веб-застосунку.
 * 4. Когнітивної тріади (EASY / MEDIUM / HARD) та механізму ремедіації (Remediation / Graceful Degradation)
 *    з обов'язковими Сократівськими підказками (socraticHints) та посиланнями на конспект уроку (studyUnitUrl).
 */

// ============================================================================
// МОДУЛЬ 1: school-alg-basics (Змінні, типи даних та лінійні вирази)
// ============================================================================
export const schoolAlgBasicsTasks: SeedTask[] = [
  // --- Topic: variables-and-types ---
  {
    topic: 'variables-and-types',
    subConcept: 'let-vs-const-declaration',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Оголошення змінних let та const',
    description: 'Яке ключове слово у JavaScript слід використовувати для оголошення величини, значення якої НЕ повинно змінюватися під час роботи програми (наприклад, число Пі або базова ставка податку)?',
    difficulty: 'EASY',
    options: [
      { id: '1', text: 'const', isCorrect: true },
      { id: '2', text: 'let', isCorrect: false },
      { id: '3', text: 'var', isCorrect: false },
      { id: '4', text: 'static', isCorrect: false }
    ],
    socraticHints: [
      { level: 1, hint: 'Згадайте слово "константа" з математики. Яке ключове слово є його скороченням?', penaltyPct: 15 },
      { level: 2, hint: 'У сучасному стандарті JS для постійних значень вживають саме const.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-1/variables-and-types#let-vs-const'
  },
  {
    topic: 'variables-and-types',
    subConcept: 'data-types-identification',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Базові типи даних у шкільному курсі',
    description: 'До якого типу даних належить значення `"12"` (у лапках) на відміну від числа `12` без лапок?',
    difficulty: 'EASY',
    options: [
      { id: '1', text: 'Рядок (string)', isCorrect: true },
      { id: '2', text: 'Ціле число (number)', isCorrect: false },
      { id: '3', text: 'Логічний тип (boolean)', isCorrect: false },
      { id: '4', text: 'Невизначений тип (undefined)', isCorrect: false }
    ],
    socraticHints: [
      { level: 1, hint: 'Будь-який текст або числові символи, взяті в лапки "", є текстовим типом.', penaltyPct: 15 },
      { level: 2, hint: 'У JS лапки позначають рядковий тип даних — string.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-1/variables-and-types#primitive-types'
  },
  // --- Topic: linear-calculations ---
  {
    topic: 'linear-calculations',
    subConcept: 'currency-converter',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Лінійний конвертер гривень у долари',
    description: 'Напишіть функцію `convertToUsd(uahAmount, exchangeRate)`, яка приймає суму в гривнях `uahAmount` та поточний курс долара `exchangeRate` і повертає еквівалент у доларах США. Округліть результат до двох знаків після коми (за допомогою `Number((...).toFixed(2))` або `Math.round`).',
    difficulty: 'EASY',
    starterCode: `function convertToUsd(uahAmount, exchangeRate) {
  // Ваш лінійний розрахунок тут:
}
`,
    testCases: [
      { input: JSON.stringify([4150, 41.5]), expectedOutput: '100' },
      { input: JSON.stringify([830, 41.5]), expectedOutput: '20' },
      { input: JSON.stringify([1000, 40]), expectedOutput: '25', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Щоб перевести гривні в долари, потрібно суму в гривнях поділити на курс обміну.', penaltyPct: 15 },
      { level: 2, hint: 'Використайте: return Number((uahAmount / exchangeRate).toFixed(2));', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-1/linear-calculations#currency-calc'
  },
  {
    topic: 'linear-calculations',
    subConcept: 'currency-converter',
    taskType: 'CODE',
    title: 'Практика: Калькулятор вартості покупки товарів зі знижкою',
    description: 'Для шкільного онлайн-магазину канцтоварів напишіть функцію `calculatePurchaseTotal(itemPrice, quantity, discountPercent)`. Функція обчислює суму покупки за формулою: `ціна * кількість * (1 - знижка / 100)`. Поверніть фінальну вартість замовлення, округлену до 2 знаків після коми.',
    difficulty: 'MEDIUM',
    starterCode: `function calculatePurchaseTotal(itemPrice, quantity, discountPercent) {
  // Обчисліть фінальну вартість покупки:
}
`,
    testCases: [
      { input: JSON.stringify([100, 2, 10]), expectedOutput: '180' },
      { input: JSON.stringify([250, 4, 0]), expectedOutput: '1000' },
      { input: JSON.stringify([49.99, 3, 15]), expectedOutput: '127.47' },
      { input: JSON.stringify([15.5, 10, 20]), expectedOutput: '124', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Спочатку знайдіть повну вартість без знижки (itemPrice * quantity), потім застосуйте коефіцієнт (1 - discountPercent / 100).', penaltyPct: 15 },
      { level: 2, hint: 'Для округлення до двох знаків використайте Number(result.toFixed(2)).', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-1/linear-calculations#discount-calculator'
  },
  // --- Topic: string-templates ---
  {
    topic: 'string-templates',
    subConcept: 'format-school-badge',
    taskType: 'CODE',
    title: 'Практика: Форматування візитки учня для шкільного сайту',
    description: 'Напишіть функцію `formatStudentCard(firstName, lastName, gradeNumber, gradeLetter)`, яка повертає рядок у форматі: `"Учень: Прізвище І. (Номер-Буква клас)"`. Наприклад: `formatStudentCard("Олександр", "Петренко", 10, "А")` має повернути `"Учень: Петренко О. (10-А клас)"`.',
    difficulty: 'MEDIUM',
    starterCode: `function formatStudentCard(firstName, lastName, gradeNumber, gradeLetter) {
  // Сформуйте форматований рядок картки:
}
`,
    testCases: [
      { input: JSON.stringify(["Олександр", "Петренко", 10, "А"]), expectedOutput: '"Учень: Петренко О. (10-А клас)"' },
      { input: JSON.stringify(["Марія", "Коваль", 11, "Б"]), expectedOutput: '"Учень: Коваль М. (11-Б клас)"' },
      { input: JSON.stringify(["Іван", "Бойко", 9, "В"]), expectedOutput: '"Учень: Бойко І. (9-В клас)"', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Першу літеру імені можна отримати як firstName[0] або firstName.charAt(0).', penaltyPct: 15 },
      { level: 2, hint: 'Використовуйте шаблонний рядок зворотними лапками: `Учень: ${lastName} ${firstName[0]}. (${gradeNumber}-${gradeLetter} клас)`.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-1/string-templates#template-literals'
  },
  {
    topic: 'string-templates',
    subConcept: 'format-school-badge',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Просте з\'єднання імені та прізвища',
    description: 'Напишіть функцію `getFullName(firstName, lastName)`, яка просто з\'єднує ім\'я та прізвище через один пробіл: `"Ім\'я Прізвище"`.',
    difficulty: 'EASY',
    starterCode: `function getFullName(firstName, lastName) {
  // Поверніть рядок через пробіл:
}
`,
    testCases: [
      { input: JSON.stringify(["Тарас", "Шевченко"]), expectedOutput: '"Тарас Шевченко"' },
      { input: JSON.stringify(["Леся", "Українка"]), expectedOutput: '"Леся Українка"' },
      { input: JSON.stringify(["Іван", "Франко"]), expectedOutput: '"Іван Франко"', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Скористайтеся конкатенацією через знак + або інтерполяцією `${firstName} ${lastName}`.', penaltyPct: 15 },
      { level: 2, hint: 'return `${firstName} ${lastName}`;', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-1/string-templates#string-concat'
  }
];

// ============================================================================
// МОДУЛЬ 2: school-alg-branching (Умовні конструкції та логічні розгалуження)
// ============================================================================
export const schoolAlgBranchingTasks: SeedTask[] = [
  // --- Topic: boolean-conditions ---
  {
    topic: 'boolean-conditions',
    subConcept: 'logical-and-or',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Логічні оператори "І" та "АБО"',
    description: 'Який логічний оператор у JavaScript повертає `true` тоді і тільки тоді, коли ОБИДВІ перевірювані умови є істинними?',
    difficulty: 'EASY',
    options: [
      { id: '1', text: '&& (Логічне І)', isCorrect: true },
      { id: '2', text: '|| (Логічне АБО)', isCorrect: false },
      { id: '3', text: '! (Логічне НЕ)', isCorrect: false },
      { id: '4', text: '=== (Сувора рівність)', isCorrect: false }
    ],
    socraticHints: [
      { level: 1, hint: 'Згадайте кон\'юнкцію з курсу математики та інформатики. У JS вона записується двома амперсандами.', penaltyPct: 15 },
      { level: 2, hint: 'Оператор && вимагає одночасного виконання лівої та правої частини.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-2/boolean-conditions#logical-operators'
  },
  // --- Topic: grade-evaluation ---
  {
    topic: 'grade-evaluation',
    subConcept: 'pass-fail-check',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Перевірка залікового балу (Здав / Не здав)',
    description: 'Напишіть функцію `isExamPassed(score)`. Якщо бал учня `score` становить 4 або більше за 12-бальною шкалою, функція повертає `"Здав"`, інакше повертає `"Не здав"`.',
    difficulty: 'EASY',
    starterCode: `function isExamPassed(score) {
  // Перевірте умову score >= 4:
}
`,
    testCases: [
      { input: JSON.stringify([10]), expectedOutput: '"Здав"' },
      { input: JSON.stringify([4]), expectedOutput: '"Здав"' },
      { input: JSON.stringify([3]), expectedOutput: '"Не здав"' },
      { input: JSON.stringify([1]), expectedOutput: '"Не здав"', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Використайте просту конструкцію if (score >= 4) { return "Здав"; } else { return "Не здав"; }', penaltyPct: 15 },
      { level: 2, hint: 'Також можна використати тернарний оператор: return score >= 4 ? "Здав" : "Не здав";', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-2/grade-evaluation#simple-if-else'
  },
  {
    topic: 'grade-evaluation',
    subConcept: 'level-of-achievement',
    taskType: 'CODE',
    title: 'Практика: Визначення рівня навчальних досягнень учня за 12-бальною шкалою',
    description: 'Напишіть алгоритм `getAchievementLevel(points)`, який за українською 12-бальною шкільною системою повертає назву рівня:\n- 10–12 балів: `"Високий"`\n- 7–9 балів: `"Достатній"`\n- 4–6 балів: `"Середній"`\n- 1–3 бали: `"Початковий"`\n- Якщо бал менше 1 або більше 12, повернути `"Некоректний бал"`.',
    difficulty: 'MEDIUM',
    starterCode: `function getAchievementLevel(points) {
  // Реалізуйте ланцюжок розгалуження else if:
}
`,
    testCases: [
      { input: JSON.stringify([11]), expectedOutput: '"Високий"' },
      { input: JSON.stringify([8]), expectedOutput: '"Достатній"' },
      { input: JSON.stringify([5]), expectedOutput: '"Середній"' },
      { input: JSON.stringify([2]), expectedOutput: '"Початковий"' },
      { input: JSON.stringify([15]), expectedOutput: '"Некоректний бал"' },
      { input: JSON.stringify([0]), expectedOutput: '"Некоректний бал"', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Почніть із перевірки некоректного балу: if (points < 1 || points > 12) return "Некоректний бал";', penaltyPct: 15 },
      { level: 2, hint: 'Далі спадним ланцюжком перевіряйте: if (points >= 10) return "Високий"; else if (points >= 7) return "Достатній"; тощо.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-2/grade-evaluation#school-levels'
  },
  // --- Topic: complex-branching ---
  {
    topic: 'complex-branching',
    subConcept: 'cinema-ticket-discount',
    taskType: 'CODE',
    title: 'Практика: Розрахунок вартості квитка на шкільну екскурсію',
    description: 'Напишіть функцію `calculateExcursionTicket(basePrice, age, isStudentCard)`:\n- Дітям до 6 років квиток завжди безкоштовний (повертає `0`).\n- Якщо вік від 6 до 17 років або учень має учнівський квиток (`isStudentCard === true`), надається знижка 50% від `basePrice`.\n- Для пенсіонерів від 65 років надається знижка 30% від `basePrice`.\n- Для всіх інших діє повна ціна `basePrice`.\nПоверніть кінцеву вартість квитка (число).',
    difficulty: 'MEDIUM',
    starterCode: `function calculateExcursionTicket(basePrice, age, isStudentCard) {
  // Врахуйте всі умови надання пільг:
}
`,
    testCases: [
      { input: JSON.stringify([200, 5, false]), expectedOutput: '0' },
      { input: JSON.stringify([200, 14, false]), expectedOutput: '100' },
      { input: JSON.stringify([200, 19, true]), expectedOutput: '100' },
      { input: JSON.stringify([200, 70, false]), expectedOutput: '140' },
      { input: JSON.stringify([200, 30, false]), expectedOutput: '200' },
      { input: JSON.stringify([150, 65, false]), expectedOutput: '105', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Перевіряйте умови по порядку: спочатку вік < 6, далі (age <= 17 || isStudentCard), далі age >= 65.', penaltyPct: 15 },
      { level: 2, hint: 'Знижка 50% означає basePrice * 0.5, а знижка 30% — basePrice * 0.7.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-2/complex-branching#nested-conditions'
  },
  {
    topic: 'complex-branching',
    subConcept: 'cinema-ticket-discount',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Перевірка права на дитячий квиток',
    description: 'Напишіть функцію `isChildTicket(age)`. Якщо вік дитини менше 14 років, повернути `true`, інакше повернути `false`.',
    difficulty: 'EASY',
    starterCode: `function isChildTicket(age) {
  // Поверніть логічне значення:
}
`,
    testCases: [
      { input: JSON.stringify([10]), expectedOutput: 'true' },
      { input: JSON.stringify([14]), expectedOutput: 'false' },
      { input: JSON.stringify([16]), expectedOutput: 'false' },
      { input: JSON.stringify([7]), expectedOutput: 'true', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Умова строго менше записується знаком <.', penaltyPct: 15 },
      { level: 2, hint: 'return age < 14;', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-2/complex-branching#comparison-operators'
  }
];

// ============================================================================
// МОДУЛЬ 3: school-alg-loops (Циклічні алгоритми та ітератори)
// ============================================================================
export const schoolAlgLoopsTasks: SeedTask[] = [
  // --- Topic: loop-fundamentals ---
  {
    topic: 'loop-fundamentals',
    subConcept: 'loop-structure-theory',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Три складові класичного циклу for',
    description: 'У заголовку циклу `for (let i = 0; i < 10; i++)` третій вираз `i++` відповідає за:',
    difficulty: 'EASY',
    options: [
      { id: '1', text: 'Зміну лічильника (крок ітерації)', isCorrect: true },
      { id: '2', text: 'Початкову ініціалізацію змінної', isCorrect: false },
      { id: '3', text: 'Умову продовження виконання циклу', isCorrect: false },
      { id: '4', text: 'Достроковий вихід із програми', isCorrect: false }
    ],
    socraticHints: [
      { level: 1, hint: 'Операція i++ збільшує значення i на одиницю наприкінці кожного кроку циклу.', penaltyPct: 15 },
      { level: 2, hint: 'Це крок лічильника або модифікація змінної циклу.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-3/loop-fundamentals#for-loop-anatomy'
  },
  // --- Topic: accumulator-loops ---
  {
    topic: 'accumulator-loops',
    subConcept: 'sum-numbers-range',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Сума натуральних чисел від 1 до N',
    description: 'Напишіть функцію `sumUpTo(n)`, яка за допомогою циклу знаходить і повертає суму всіх натуральних чисел від 1 до `n` включно: `1 + 2 + 3 + ... + n`. Якщо `n <= 0`, поверніть `0`.',
    difficulty: 'EASY',
    starterCode: `function sumUpTo(n) {
  // Створіть змінну суми та організуйте цикл від 1 до n:
}
`,
    testCases: [
      { input: JSON.stringify([5]), expectedOutput: '15' },
      { input: JSON.stringify([10]), expectedOutput: '55' },
      { input: JSON.stringify([1]), expectedOutput: '1' },
      { input: JSON.stringify([0]), expectedOutput: '0', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Оголосіть змінну-акумулятор let sum = 0; перед циклом.', penaltyPct: 15 },
      { level: 2, hint: 'Запустіть цикл for (let i = 1; i <= n; i++) { sum += i; } і поверніть sum.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-3/accumulator-loops#sum-accumulator'
  },
  {
    topic: 'accumulator-loops',
    subConcept: 'sum-numbers-range',
    taskType: 'CODE',
    title: 'Практика: Підрахунок суми тільки парних чисел у діапазоні',
    description: 'Напишіть функцію `sumEvenNumbers(start, end)`, яка за допомогою циклу знаходить суму тільки парних чисел у проміжку від `start` до `end` включно. Наприклад, для діапазону від 1 до 6 парні числа: 2, 4, 6, а їхня сума: 12.',
    difficulty: 'MEDIUM',
    starterCode: `function sumEvenNumbers(start, end) {
  // Пройдіться циклом від start до end та підсумуйте лише парні числа:
}
`,
    testCases: [
      { input: JSON.stringify([1, 6]), expectedOutput: '12' },
      { input: JSON.stringify([10, 14]), expectedOutput: '36' },
      { input: JSON.stringify([3, 3]), expectedOutput: '0' },
      { input: JSON.stringify([2, 2]), expectedOutput: '2' },
      { input: JSON.stringify([5, 11]), expectedOutput: '24', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Число є парним, якщо залишок від його ділення на 2 дорівнює нулю: i % 2 === 0.', penaltyPct: 15 },
      { level: 2, hint: 'Всередині циклу for додавайте число до суми лише якщо виконується перевірка if (i % 2 === 0).', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-3/accumulator-loops#conditional-sum'
  },
  // --- Topic: counting-occurrences ---
  {
    topic: 'counting-occurrences',
    subConcept: 'count-vowels-or-chars',
    taskType: 'CODE',
    title: 'Практика: Алгоритм підрахунку символів у тексті',
    description: 'Для веб-редактора дописів напишіть функцію `countOccurrences(text, targetChar)`, яка за допомогою циклу підраховує, скільки разів символ `targetChar` зустрічається у рядку `text` (без урахування регістру). Наприклад, у слові "Інформатика" літера "і" зустрічається 2 рази.',
    difficulty: 'MEDIUM',
    starterCode: `function countOccurrences(text, targetChar) {
  // Підрахуйте кількість входжень символу:
}
`,
    testCases: [
      { input: JSON.stringify(["Інформатика", "і"]), expectedOutput: '2' },
      { input: JSON.stringify(["JavaScript", "a"]), expectedOutput: '2' },
      { input: JSON.stringify(["Школа", "о"]), expectedOutput: '1' },
      { input: JSON.stringify(["Алгоритм", "я"]), expectedOutput: '0' },
      { input: JSON.stringify(["Багато літер ааа", "А"]), expectedOutput: '4', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Щоб регістр не впливав на результат, переведіть обидва параметри в нижній регістр за допомогою .toLowerCase().', penaltyPct: 15 },
      { level: 2, hint: 'Пройдіться циклом від 0 до text.length і якщо text[i] === targetChar, збільшуйте лічильник count++.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-3/counting-occurrences#char-count'
  },
  {
    topic: 'counting-occurrences',
    subConcept: 'count-vowels-or-chars',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Перевірка наявності символу в рядку',
    description: 'Напишіть функцію `containsChar(text, char)`. Якщо рядок `text` містить символ `char`, повернути `true`, інакше повернути `false`.',
    difficulty: 'EASY',
    starterCode: `function containsChar(text, char) {
  // Поверніть true або false:
}
`,
    testCases: [
      { input: JSON.stringify(["Київ", "ї"]), expectedOutput: 'true' },
      { input: JSON.stringify(["Школа", "z"]), expectedOutput: 'false' },
      { input: JSON.stringify(["Web", "W"]), expectedOutput: 'true', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'У JS рядки мають стандартний метод .includes(char).', penaltyPct: 15 },
      { level: 2, hint: 'return text.includes(char);', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-3/counting-occurrences#string-includes'
  }
];

// ============================================================================
// МОДУЛЬ 4: school-alg-functions (Функції та модульність алгоритмів)
// ============================================================================
export const schoolAlgFunctionsTasks: SeedTask[] = [
  // --- Topic: function-declarations ---
  {
    topic: 'function-declarations',
    subConcept: 'return-statement-role',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Призначення інструкції return у функції',
    description: 'Що відбувається, коли інтерпретатор доходить до інструкції `return` всередині функції?',
    difficulty: 'EASY',
    options: [
      { id: '1', text: 'Функція повертає обчислене значення і негайно завершує свою роботу', isCorrect: true },
      { id: '2', text: 'Значення друкується на екран, а функція продовжує виконання наступних рядків', isCorrect: false },
      { id: '3', text: 'Програма перезавантажує веб-сторінку', isCorrect: false },
      { id: '4', text: 'Очищається пам\'ять браузера', isCorrect: false }
    ],
    socraticHints: [
      { level: 1, hint: 'Інструкція return слугує виходом із функції та передачею результату назад тому, хто її викликав.', penaltyPct: 15 },
      { level: 2, hint: 'Будь-який код, написаний у тілі функції нижче за return, не виконується.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-4/function-declarations#return-statement'
  },
  // --- Topic: geometry-functions ---
  {
    topic: 'geometry-functions',
    subConcept: 'rectangle-area-perimeter',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Функція обчислення периметра прямокутника',
    description: 'Напишіть функцію `calcPerimeter(width, height)`, яка обчислює та повертає периметр прямокутника за формулою: `2 * (width + height)`.',
    difficulty: 'EASY',
    starterCode: `function calcPerimeter(width, height) {
  // Поверніть периметр:
}
`,
    testCases: [
      { input: JSON.stringify([5, 10]), expectedOutput: '30' },
      { input: JSON.stringify([7, 3]), expectedOutput: '20' },
      { input: JSON.stringify([12, 8]), expectedOutput: '40', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Периметр — це сума всіх сторін прямокутника: 2 * (width + height).', penaltyPct: 15 },
      { level: 2, hint: 'return 2 * (width + height);', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-4/geometry-functions#perimeter'
  },
  {
    topic: 'geometry-functions',
    subConcept: 'rectangle-area-perimeter',
    taskType: 'CODE',
    title: 'Практика: Розрахунок витрат фарби для ремонту шкільного кабінету',
    description: 'Напишіть функцію `calculatePaintBudget(roomWidth, roomLength, wallHeight, coveragePerLiter, pricePerLiter)`. Функція обчислює площу чотирьох стін кабінету: `2 * wallHeight * (roomWidth + roomLength)`. Потім кількість літрів фарби: `площа / coveragePerLiter` (округлити вгору до цілого балончика за допомогою `Math.ceil`). Наприкінці помножити на ціну за літр `pricePerLiter`. Поверніть загальну вартість фарби (ціле число).',
    difficulty: 'MEDIUM',
    starterCode: `function calculatePaintBudget(roomWidth, roomLength, wallHeight, coveragePerLiter, pricePerLiter) {
  // Розрахуйте загальний бюджет на фарбу:
}
`,
    testCases: [
      { input: JSON.stringify([6, 8, 3, 10, 150]), expectedOutput: '1350' },
      { input: JSON.stringify([4, 5, 2.5, 9, 200]), expectedOutput: '1200' },
      { input: JSON.stringify([10, 10, 4, 12, 180]), expectedOutput: '2520', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Спочатку знайдіть площу стін: const area = 2 * wallHeight * (roomWidth + roomLength);', penaltyPct: 15 },
      { level: 2, hint: 'Кількість балонів знайдіть через Math.ceil(area / coveragePerLiter) і помножте на pricePerLiter.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-4/geometry-functions#paint-calculator'
  },
  // --- Topic: modular-algorithms ---
  {
    topic: 'modular-algorithms',
    subConcept: 'is-prime-check',
    taskType: 'CODE',
    title: 'Практика: Алгоритмічна функція перевірки простого числа',
    description: 'Напишіть допоміжну функцію `isPrime(n)`, яка повертає `true`, якщо ціле число `n > 1` є простим (ділиться без залишку лише на 1 та на себе), і `false` у протилежному випадку.',
    difficulty: 'MEDIUM',
    starterCode: `function isPrime(n) {
  // Перевірте, чи є число простим:
}
`,
    testCases: [
      { input: JSON.stringify([7]), expectedOutput: 'true' },
      { input: JSON.stringify([12]), expectedOutput: 'false' },
      { input: JSON.stringify([2]), expectedOutput: 'true' },
      { input: JSON.stringify([1]), expectedOutput: 'false' },
      { input: JSON.stringify([29]), expectedOutput: 'true', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Якщо n <= 1, воно точно не є простим (return false).', penaltyPct: 15 },
      { level: 2, hint: 'Пройдіться циклом від 2 до Math.sqrt(n). Якщо n % i === 0, то знайдено дільник (return false). Якщо цикл завершився — return true.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-4/modular-algorithms#prime-numbers'
  }
];

// ============================================================================
// МОДУЛЬ 5: school-alg-arrays (Масиви та обробка колекцій даних)
// ============================================================================
export const schoolAlgArraysTasks: SeedTask[] = [
  // --- Topic: array-basics ---
  {
    topic: 'array-basics',
    subConcept: 'array-indexing-theory',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Індексація елементів у масиві',
    description: 'Якщо масив містить 5 елементів `let arr = [10, 20, 30, 40, 50]`, який індекс має перший елемент масиву, і який індекс має останній?',
    difficulty: 'EASY',
    options: [
      { id: '1', text: 'Перший: 0, останній: 4 (arr.length - 1)', isCorrect: true },
      { id: '2', text: 'Перший: 1, останній: 5 (arr.length)', isCorrect: false },
      { id: '3', text: 'Перший: 0, останній: 5', isCorrect: false },
      { id: '4', text: 'Перший: 1, останній: 4', isCorrect: false }
    ],
    socraticHints: [
      { level: 1, hint: 'У JavaScript, як і в більшості мов програмування, індексація починається з нуля.', penaltyPct: 15 },
      { level: 2, hint: 'Останній елемент завжди має номер arr.length - 1.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-5/array-basics#indexing'
  },
  // --- Topic: array-aggregation ---
  {
    topic: 'array-aggregation',
    subConcept: 'average-grade-calc',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Отримання першого та останнього елементів масиву',
    description: 'Напишіть функцію `getFirstAndLast(arr)`, яка приймає непорожній масив чисел або рядків і повертає новий масив із двох елементів: `[перший_елемент, останній_елемент]`.',
    difficulty: 'EASY',
    starterCode: `function getFirstAndLast(arr) {
  // Поверніть масив із першого та останнього елементів:
}
`,
    testCases: [
      { input: JSON.stringify([[10, 20, 30, 40]]), expectedOutput: '[10,40]' },
      { input: JSON.stringify([["Київ", "Львів", "Одеса"]]), expectedOutput: '["Київ","Одеса"]' },
      { input: JSON.stringify([[99]]), expectedOutput: '[99,99]', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Перший елемент це arr[0], а останній — arr[arr.length - 1].', penaltyPct: 15 },
      { level: 2, hint: 'return [arr[0], arr[arr.length - 1]];', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-5/array-aggregation#first-last'
  },
  {
    topic: 'array-aggregation',
    subConcept: 'average-grade-calc',
    taskType: 'CODE',
    title: 'Практика: Розрахунок середнього бала табеля учня',
    description: 'Напишіть функцію `calculateAverageGrade(grades)`, яка приймає масив оцінок учня `grades` (наприклад, `[10, 11, 8, 9, 12]`) та обчислює середнє арифметичне. Поверніть число, округлене до 1 знака після коми. Якщо масив порожній, поверніть `0`.',
    difficulty: 'MEDIUM',
    starterCode: `function calculateAverageGrade(grades) {
  // Знайдіть суму оцінок і поділіть на їх кількість:
}
`,
    testCases: [
      { input: JSON.stringify([[10, 11, 8, 9, 12]]), expectedOutput: '10' },
      { input: JSON.stringify([[12, 11, 10]]), expectedOutput: '11' },
      { input: JSON.stringify([[7, 8, 9, 6]]), expectedOutput: '7.5' },
      { input: JSON.stringify([[]]), expectedOutput: '0' },
      { input: JSON.stringify([[4, 5, 4]]), expectedOutput: '4.3', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Якщо grades.length === 0, відразу поверніть 0.', penaltyPct: 15 },
      { level: 2, hint: 'Підсумуйте елементи в циклі for і поверніть Number((sum / grades.length).toFixed(1)).', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-5/array-aggregation#average-calc'
  },
  // --- Topic: array-search-extremum ---
  {
    topic: 'array-search-extremum',
    subConcept: 'find-max-score',
    taskType: 'CODE',
    title: 'Практика: Пошук найвищого результату олімпіади в класі',
    description: 'Напишіть функцію `findMaxScore(scores)`, яка приймає масив балів учасників олімпіади і за допомогою циклу знаходить та повертає максимальний бал. Не використовуйте `Math.max(...scores)`. Якщо масив порожній, поверніть `null`.',
    difficulty: 'MEDIUM',
    starterCode: `function findMaxScore(scores) {
  // Реалізуйте класичний алгоритм пошуку максимуму:
}
`,
    testCases: [
      { input: JSON.stringify([[78, 92, 64, 99, 85]]), expectedOutput: '99' },
      { input: JSON.stringify([[50, 40, 30]]), expectedOutput: '50' },
      { input: JSON.stringify([[]]), expectedOutput: 'null' },
      { input: JSON.stringify([[100, 100, 95]]), expectedOutput: '100', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Нехай початковий максимум дорівнює першому елементу: let max = scores[0];', penaltyPct: 15 },
      { level: 2, hint: 'Пройдіться циклом від 1 до кінця масиву: якщо scores[i] > max, то оновлюйте max = scores[i].', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-5/array-search-extremum#find-max'
  },
  {
    topic: 'array-search-extremum',
    subConcept: 'filter-positive-numbers',
    taskType: 'CODE',
    title: 'Практика: Фільтрація списку учнів з оцінками достатнього та високого рівня',
    description: 'Напишіть функцію `getPassingGrades(grades)`, яка приймає масив оцінок і повертає новий масив, який містить лише ті оцінки, що становлять 7 балів і вище (відсіюючи оцінки 1–6).',
    difficulty: 'MEDIUM',
    starterCode: `function getPassingGrades(grades) {
  // Сформуйте новий масив лише з оцінками >= 7:
}
`,
    testCases: [
      { input: JSON.stringify([[5, 8, 11, 4, 9, 10]]), expectedOutput: '[8,11,9,10]' },
      { input: JSON.stringify([[4, 5, 6]]), expectedOutput: '[]' },
      { input: JSON.stringify([[10, 11, 12]]), expectedOutput: '[10,11,12]' },
      { input: JSON.stringify([[7, 6, 7]]), expectedOutput: '[7,7]', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Ви можете використати стандартний метод масивів .filter(g => g >= 7) або створити новий масив через цикл.', penaltyPct: 15 },
      { level: 2, hint: 'return grades.filter(grade => grade >= 7);', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-5/array-search-extremum#array-filter'
  }
];

// ============================================================================
// МОДУЛЬ 6: school-web-dom-events (Вебтехнології — Інтерактивний DOM та події)
// ============================================================================
export const schoolWebDomEventsTasks: SeedTask[] = [
  // --- Topic: dom-access-theory ---
  {
    topic: 'dom-access-theory',
    subConcept: 'get-element-by-id',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Пошук елемента на сторінці за унікальним id',
    description: 'Який метод об\'єкта `document` використовується у веб-розробці для отримання доступу до HTML-елемента за його унікальним атрибутом `id`?',
    difficulty: 'EASY',
    options: [
      { id: '1', text: 'document.getElementById("my-id")', isCorrect: true },
      { id: '2', text: 'document.findElement("my-id")', isCorrect: false },
      { id: '3', text: 'document.select("#my-id")', isCorrect: false },
      { id: '4', text: 'document.queryId("my-id")', isCorrect: false }
    ],
    socraticHints: [
      { level: 1, hint: 'Зверніть увагу на точну назву методу в специфікації браузера: отримати елемент за Id.', penaltyPct: 15 },
      { level: 2, hint: 'Правильний метод: getElementById (літери Id у верхньому/нижньому регістрі).', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-6/dom-access-theory#get-element'
  },
  {
    topic: 'dom-access-theory',
    subConcept: 'text-content-vs-html',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Зміна текстового вмісту тега без ризику XSS-уразливостей',
    description: 'Яку властивість DOM-вузла слід використовувати для безпечного виведення тексту, введеного користувачем, щоб символи на зразок `<` та `>` не інтерпретувалися як HTML-теги?',
    difficulty: 'EASY',
    options: [
      { id: '1', text: 'textContent (або innerText)', isCorrect: true },
      { id: '2', text: 'innerHTML', isCorrect: false },
      { id: '3', text: 'outerHTML', isCorrect: false },
      { id: '4', text: 'className', isCorrect: false }
    ],
    socraticHints: [
      { level: 1, hint: 'innerHTML сприймає рядок як розмітку тегів, що небезпечно при неперевіреному введенні.', penaltyPct: 15 },
      { level: 2, hint: 'Для безпечного виведення чистого тексту використовують саме textContent.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-6/dom-access-theory#text-content'
  },
  // --- Topic: dom-string-generators ---
  {
    topic: 'dom-string-generators',
    subConcept: 'render-badge-element',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Генератор HTML-тега span з класом',
    description: 'Напишіть функцію `createBadgeHtml(text, statusClass)`, яка повертає рядок HTML-розмітки: `<span class="badge ${statusClass}">${text}</span>`.',
    difficulty: 'EASY',
    starterCode: `function createBadgeHtml(text, statusClass) {
  // Сформуйте рядок тега span:
}
`,
    testCases: [
      { input: JSON.stringify(["Відмінно", "badge-success"]), expectedOutput: '"<span class=\\"badge badge-success\\">Відмінно</span>"' },
      { input: JSON.stringify(["Увага", "badge-warning"]), expectedOutput: '"<span class=\\"badge badge-warning\\">Увага</span>"' },
      { input: JSON.stringify(["Нове", "badge-info"]), expectedOutput: '"<span class=\\"badge badge-info\\">Нове</span>"', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Використовуйте шаблонний рядок зворотними лапками: `<span class="badge ${statusClass}">${text}</span>`.', penaltyPct: 15 },
      { level: 2, hint: 'Переконайтеся, що навколо класу statusClass стоять подвійні лапки атрибута.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-6/dom-string-generators#create-badge'
  },
  {
    topic: 'dom-string-generators',
    subConcept: 'render-html-list',
    taskType: 'CODE',
    title: 'Практика: Динамічна генерація списку HTML `<ul><li>` із масиву даних',
    description: 'Напишіть функцію `generateHtmlList(items)`, яка приймає масив рядків (наприклад, пунктів шкільного меню або розкладу дзвінків) і формує рядок розмітки: `<ul><li>Пункт 1</li><li>Пункт 2</li>...</ul>`. Якщо масив порожній, повернути `<ul class="empty"></ul>`.',
    difficulty: 'MEDIUM',
    starterCode: `function generateHtmlList(items) {
  // Згенеруйте розмітку списку:
}
`,
    testCases: [
      { input: JSON.stringify([["Алгебра", "Геометрія", "Інформатика"]]), expectedOutput: '"<ul><li>Алгебра</li><li>Геометрія</li><li>Інформатика</li></ul>"' },
      { input: JSON.stringify([[]]), expectedOutput: '"<ul class=\\"empty\\"></ul>"' },
      { input: JSON.stringify([["Урок 1"]]), expectedOutput: '"<ul><li>Урок 1</li></ul>"', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Якщо items.length === 0, відразу поверніть \'<ul class="empty"></ul>\'.', penaltyPct: 15 },
      { level: 2, hint: 'Використайте items.map(it => `<li>${it}</li>`).join(\'\') або цикл for.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-6/dom-string-generators#generate-list'
  },
  // --- Topic: ui-state-handlers ---
  {
    topic: 'ui-state-handlers',
    subConcept: 'counter-state-logic',
    taskType: 'CODE',
    title: 'Практика: Алгоритмічний стан інтерактивного лічильника відвідувачів',
    description: 'Для інтерактивної кнопки веб-сторінки напишіть функцію `updateCounterState(currentCount, action)`:\n- Якщо `action === "increment"`, повернути `currentCount + 1`.\n- Якщо `action === "decrement"`, повернути `Math.max(0, currentCount - 1)` (лічильник не може бути менше нуля).\n- Якщо `action === "reset"`, повернути `0`.\n- В інших випадках повернути `currentCount`.',
    difficulty: 'MEDIUM',
    starterCode: `function updateCounterState(currentCount, action) {
  // Реалізуйте перемикання станів лічильника:
}
`,
    testCases: [
      { input: JSON.stringify([5, "increment"]), expectedOutput: '6' },
      { input: JSON.stringify([5, "decrement"]), expectedOutput: '4' },
      { input: JSON.stringify([0, "decrement"]), expectedOutput: '0' },
      { input: JSON.stringify([10, "reset"]), expectedOutput: '0' },
      { input: JSON.stringify([7, "unknown"]), expectedOutput: '7', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Використайте конструкцію switch(action) або ланцюжок if/else if.', penaltyPct: 15 },
      { level: 2, hint: 'Для decrement врахуйте обмеження знизу: currentCount > 0 ? currentCount - 1 : 0.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-6/ui-state-handlers#counter-state'
  }
];

// ============================================================================
// МОДУЛЬ 7: school-web-applied-projects (Прикладна веб-алгоритмізація: валідація, пошук, фільтри)
// ============================================================================
export const schoolWebAppliedProjectsTasks: SeedTask[] = [
  // --- Topic: form-validation ---
  {
    topic: 'form-validation',
    subConcept: 'password-strength',
    taskType: 'CODE',
    title: 'Практика: Алгоритм валідації надійності пароля для форми реєстрації',
    description: 'Напишіть функцію `validateSchoolPassword(password)`, яка перевіряє надійність пароля на шкільному порталі. Пароль вважається надійним (`true`), якщо одночасно виконуються три правила:\n1. Довжина не менше 8 символів;\n2. Містить хоча б одну цифру (0–9);\n3. Не містить пробілів.\nВ іншому випадку повернути `false`.',
    difficulty: 'MEDIUM',
    starterCode: `function validateSchoolPassword(password) {
  // Перевірте всі три вимоги безпеки:
}
`,
    testCases: [
      { input: JSON.stringify(["School2026"]), expectedOutput: 'true' },
      { input: JSON.stringify(["short1"]), expectedOutput: 'false' },
      { input: JSON.stringify(["NoDigitsHere"]), expectedOutput: 'false' },
      { input: JSON.stringify(["Pass with space1"]), expectedOutput: 'false' },
      { input: JSON.stringify(["CyberSafe99"]), expectedOutput: 'true', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Перевірте довжину: password.length >= 8. Перевірте пробіли: !password.includes(" ").', penaltyPct: 15 },
      { level: 2, hint: 'Наявність цифри можна перевірити через регулярний вираз /\\d/.test(password) або цикл перевірки символів.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-7/form-validation#password-security'
  },
  {
    topic: 'form-validation',
    subConcept: 'password-strength',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Перевірка мінімальної довжини поля введення',
    description: 'Напишіть функцію `checkMinLength(text, minLen)`, яка повертає `true`, якщо довжина рядка `text` більша або дорівнює `minLen`, і `false` у протилежному випадку.',
    difficulty: 'EASY',
    starterCode: `function checkMinLength(text, minLen) {
  // Перевірте мінімальну довжину:
}
`,
    testCases: [
      { input: JSON.stringify(["Олександр", 3]), expectedOutput: 'true' },
      { input: JSON.stringify(["Ол", 3]), expectedOutput: 'false' },
      { input: JSON.stringify(["", 1]), expectedOutput: 'false', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Властивість рядка .length повертає кількість символів.', penaltyPct: 15 },
      { level: 2, hint: 'return text.length >= minLen;', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-7/form-validation#min-length'
  },
  // --- Topic: catalog-search-filter ---
  {
    topic: 'catalog-search-filter',
    subConcept: 'live-search-query',
    taskType: 'CODE',
    title: 'Практика (Ремедіація): Пошук підрядка в назві без урахування регістру',
    description: 'Напишіть функцію `matchesSearch(title, query)`, яка повертає `true`, якщо рядок `title` містить підрядок `query` незалежно від великих чи малих літер.',
    difficulty: 'EASY',
    starterCode: `function matchesSearch(title, query) {
  // Перевірте входження без урахування регістру:
}
`,
    testCases: [
      { input: JSON.stringify(["Підручник з інформатики", "інформ"]), expectedOutput: 'true' },
      { input: JSON.stringify(["Геометрія 11 клас", "алгебра"]), expectedOutput: 'false' },
      { input: JSON.stringify(["JavaScript для початківців", "SCRIPT"]), expectedOutput: 'true', isSecret: true }
    ],
    socraticHints: [
      { level: 1, hint: 'Переведіть обидва рядки у нижній регістр: title.toLowerCase() та query.toLowerCase().', penaltyPct: 15 },
      { level: 2, hint: 'return title.toLowerCase().includes(query.toLowerCase());', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-7/catalog-search-filter#live-search'
  },
  {
    topic: 'catalog-search-filter',
    subConcept: 'live-search-query',
    taskType: 'CODE',
    title: 'Практика: Алгоритм живого пошуку та фільтрації книг у шкільній бібліотеці',
    description: 'Напишіть функцію `filterLibraryBooks(books, category, searchWord)`:\n- Кожна книга має вигляд: `{ id: number, title: string, category: string, year: number }`.\n- Якщо `category !== "all"`, відібрати тільки книги зазначеної категорії.\n- Якщо `searchWord` не порожній, назва книги `title` повинна містити `searchWord` (без урахування регістру).\nПоверніть відфільтрований масив об\'єктів книг.',
    difficulty: 'MEDIUM',
    starterCode: `function filterLibraryBooks(books, category, searchWord) {
  // Відфільтруйте масив книг за категорією та пошуковим словом:
}
`,
    testCases: [
      {
        input: JSON.stringify([
          [
            { id: 1, title: 'Алгоритми та структури', category: 'it', year: 2022 },
            { id: 2, title: 'Історія України', category: 'history', year: 2020 },
            { id: 3, title: 'Веб-розробка на JS', category: 'it', year: 2024 }
          ],
          'it',
          'веб'
        ]),
        expectedOutput: '[{"id":3,"title":"Веб-розробка на JS","category":"it","year":2024}]'
      },
      {
        input: JSON.stringify([
          [
            { id: 1, title: 'Кобзар', category: 'literature', year: 2018 },
            { id: 2, title: 'Енеїда', category: 'literature', year: 2019 }
          ],
          'all',
          ''
        ]),
        expectedOutput: '[{"id":1,"title":"Кобзар","category":"literature","year":2018},{"id":2,"title":"Енеїда","category":"literature","year":2019}]'
      }
    ],
    socraticHints: [
      { level: 1, hint: 'Використайте метод books.filter(b => ...). Умова категорії: category === "all" || b.category === category.', penaltyPct: 15 },
      { level: 2, hint: 'Умова пошуку: !searchWord || b.title.toLowerCase().includes(searchWord.toLowerCase()). Об\'єднайте їх через &&.', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-7/catalog-search-filter#library-filter'
  },
  // --- Topic: sorting-leaderboards ---
  {
    topic: 'sorting-leaderboards',
    subConcept: 'sort-students-leaderboard',
    taskType: 'CODE',
    title: 'Практика: Сортування турнірної таблиці шкільної олімпіади',
    description: 'Напишіть функцію `sortLeaderboard(students)`, яка сортує масив учасників `[{ name: string, score: number }]` за спаданням балів (`score`). Якщо бали однакові, сортувати за ім\'ям (`name`) в алфавітному порядку за зростанням (`localeCompare`). Поверніть відсортований масив.',
    difficulty: 'HARD',
    starterCode: `function sortLeaderboard(students) {
  // Реалізуйте комплексне сортування:
}
`,
    testCases: [
      {
        input: JSON.stringify([
          [
            { name: 'Богдан', score: 85 },
            { name: 'Анна', score: 95 },
            { name: 'Віктор', score: 85 }
          ]
        ]),
        expectedOutput: '[{"name":"Анна","score":95},{"name":"Богдан","score":85},{"name":"Віктор","score":85}]'
      },
      {
        input: JSON.stringify([
          [
            { name: 'Ярослав', score: 70 },
            { name: 'Дмитро', score: 90 }
          ]
        ]),
        expectedOutput: '[{"name":"Дмитро","score":90},{"name":"Ярослав","score":70}]',
        isSecret: true
      }
    ],
    socraticHints: [
      { level: 1, hint: 'Використайте метод .slice().sort((a, b) => ...), щоб не мутувати вихідний масив.', penaltyPct: 15 },
      { level: 2, hint: 'Якщо b.score !== a.score, повертайте b.score - a.score. Інакше повертайте a.name.localeCompare(b.name).', penaltyPct: 30 }
    ],
    studyUnitUrl: '/learn/school-web/module-7/sorting-leaderboards#leaderboard-sort'
  }
];
