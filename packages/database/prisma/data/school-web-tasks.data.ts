import { SeedTask } from './js-tasks.data';

/**
 * school-web-tasks.data.ts
 * 
 * Спеціалізований банк завдань для шкільного курсу "Вебтехнології та алгоритмізація (10–11 класи)"
 * Магістерське дослідження: "Формування алгоритмічної компетентності учнями старшої школи у процесі вивчення розділу Вебтехнології"
 * 
 * Модулі розбиті за базовими алгоритмічними структурами:
 * 1. Лінійні алгоритми та DOM-маніпуляція (web-alg-linear-dom)
 * 2. Алгоритми з розгалуженням та обробка подій (web-alg-branching-events)
 * 3. Циклічні алгоритми та ітератори списків (web-alg-loops-render)
 * 4. Алгоритми перевірки умов та валідація даних (web-alg-form-validation)
 * 5. Алгоритми пошуку, фільтрації та сортування (web-alg-filter-search)
 */

// 1. Лінійні алгоритми та DOM
export const schoolLinearDomTasks: SeedTask[] = [
  {
    topic: 'dom-traversal',
    subConcept: 'element-by-id-text',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Поняття вузла DOM та лінійний доступ',
    description: 'Яка властивість вузла DOM у браузері використовується для зчитування або заміни лише текстового вмісту без інтерпретації HTML-тегів?',
    difficulty: 'EASY',
    options: [
      { id: '1', text: 'textContent або innerText', isCorrect: true },
      { id: '2', text: 'innerHTML', isCorrect: false },
      { id: '3', text: 'value', isCorrect: false },
      { id: '4', text: 'className', isCorrect: false }
    ],
    socraticHints: [
      { level: 1, hint: 'innerHTML парсить теги, а нам потрібен чистий текст.', penaltyPct: 10 }
    ]
  },
  {
    topic: 'linear-algorithms',
    subConcept: 'linear-calc-output',
    taskType: 'CODE',
    title: 'Практика: Лінійний обчислювальний алгоритм для веб-сторінки',
    description: 'Напишіть функцію `calculateOrderTotal(price, quantity, discountPercent)`, яка обчислює фінальну вартість замовлення для інтернет-магазину. Формула: `total = price * quantity * (1 - discountPercent / 100)`. Поверніть округлене до 2 знаків число.',
    difficulty: 'EASY',
    starterCode: `function calculateOrderTotal(price, quantity, discountPercent) {
  // Ваш код тут:
}
`,
    testCases: [
      { input: JSON.stringify([100, 2, 10]), expectedOutput: '180' },
      { input: JSON.stringify([250, 4, 0]), expectedOutput: '1000' },
      { input: JSON.stringify([49.99, 3, 15]), expectedOutput: '127.47' }
    ],
    socraticHints: [
      { level: 1, hint: 'Спочатку знайдіть вартість без знижки (ціна * кількість), а потім помножте на коефіцієнт знижки.', penaltyPct: 10 },
      { level: 2, hint: 'Використовуйте Number((...).toFixed(2)) або Math.round для округлення.', penaltyPct: 20 }
    ]
  },
  {
    topic: 'linear-algorithms',
    subConcept: 'format-user-badge',
    taskType: 'CODE',
    title: 'Практика: Лінійне перетворення даних для бейджа користувача',
    description: 'Напишіть функцію `formatUserBadge(firstName, lastName, role)`, яка формує рядок для заголовка веб-сторінки у форматі: `"[ROLE] Прізвище І."`, де роль переведена у верхній регістр, а від імені береться лише перша літера з крапкою.',
    difficulty: 'MEDIUM',
    starterCode: `function formatUserBadge(firstName, lastName, role) {
  // Наприклад: formatUserBadge("Олена", "Коваль", "admin") -> "[ADMIN] Коваль О."
}
`,
    testCases: [
      { input: JSON.stringify(["Олена", "Коваль", "admin"]), expectedOutput: '"[ADMIN] Коваль О."' },
      { input: JSON.stringify(["Тарас", "Шевченко", "student"]), expectedOutput: '"[STUDENT] Шевченко Т."' },
      { input: JSON.stringify(["Іван", "Франко", "teacher"]), expectedOutput: '"[TEACHER] Франко І."' }
    ]
  }
];

// 2. Розгалужені алгоритми та події
export const schoolBranchingTasks: SeedTask[] = [
  {
    topic: 'events-branching',
    subConcept: 'ui-state-toggle',
    taskType: 'SINGLE_CHOICE',
    title: 'Теорія: Розгалуження при взаємодії з інтерфейсом',
    description: 'Яка алгоритмічна конструкція найкраще підходить для реалізації перемикача темного/світлого режиму сайту (Toggle switch)?',
    difficulty: 'EASY',
    options: [
      { id: '1', text: 'Умовне розгалуження (if / else або тернарний оператор)', isCorrect: true },
      { id: '2', text: 'Цикл з лічильником for', isCorrect: false },
      { id: '3', text: 'Асинхронний проміс Promise.race', isCorrect: false },
      { id: '4', text: 'Нескінченний цикл while(true)', isCorrect: false }
    ]
  },
  {
    topic: 'events-branching',
    subConcept: 'grade-badge-logic',
    taskType: 'CODE',
    title: 'Практика: Алгоритм визначення колірного бейджа оцінки',
    description: 'Для веб-журналу оцінок напишіть функцію `getGradeBadgeClass(score)`, яка за 100-бальною шкалою повертає CSS-клас бейджа:\n- `badge-high` якщо score >= 85\n- `badge-medium` якщо score >= 60 та < 85\n- `badge-low` якщо score >= 35 та < 60\n- `badge-danger` якщо score < 35',
    difficulty: 'EASY',
    starterCode: `function getGradeBadgeClass(score) {
  // Ваш код розгалуження тут:
}
`,
    testCases: [
      { input: JSON.stringify([95]), expectedOutput: '"badge-high"' },
      { input: JSON.stringify([75]), expectedOutput: '"badge-medium"' },
      { input: JSON.stringify([50]), expectedOutput: '"badge-low"' },
      { input: JSON.stringify([20]), expectedOutput: '"badge-danger"' }
    ]
  },
  {
    topic: 'events-branching',
    subConcept: 'delivery-cost-calculator',
    taskType: 'CODE',
    title: 'Практика: Складне розгалуження вартості доставки для веб-кошика',
    description: 'Напишіть алгоритм розрахунку вартості доставки `calculateShipping(cartTotal, isPremiumUser, distanceKm)`:\n- Якщо `isPremiumUser` є true, то при замовленні від 500 грн доставка безкоштовна (0).\n- Якщо `cartTotal` >= 1000 грн (незалежно від статусу), доставка також безкоштовна (0).\n- В інших випадках базова ставка 50 грн + 5 грн за кожен кілометр дистанції.',
    difficulty: 'MEDIUM',
    starterCode: `function calculateShipping(cartTotal, isPremiumUser, distanceKm) {
  // Обчисліть фінальну вартість доставки:
}
`,
    testCases: [
      { input: JSON.stringify([600, true, 10]), expectedOutput: '0' },
      { input: JSON.stringify([1200, false, 25]), expectedOutput: '0' },
      { input: JSON.stringify([400, true, 10]), expectedOutput: '100' },
      { input: JSON.stringify([300, false, 5]), expectedOutput: '75' }
    ]
  }
];

// 3. Циклічні алгоритми та рендеринг списків
export const schoolLoopsRenderTasks: SeedTask[] = [
  {
    topic: 'loops-and-collections',
    subConcept: 'render-html-list',
    taskType: 'CODE',
    title: 'Практика: Циклічна генерація HTML-списку з масиву',
    description: 'Створіть функцію `generateHtmlList(items)`, яка приймає масив рядків (наприклад, пунктів меню) і за допомогою циклу формує рядок розмітки: `<ul><li>Пункт 1</li><li>Пункт 2</li>...</ul>`. Якщо масив порожній, поверніть `<ul class="empty"></ul>`.',
    difficulty: 'EASY',
    starterCode: `function generateHtmlList(items) {
  // Ваша циклічна генерація:
}
`,
    testCases: [
      { input: JSON.stringify([["Головна", "Новини", "Контакти"]]), expectedOutput: '"<ul><li>Головна</li><li>Новини</li><li>Контакти</li></ul>"' },
      { input: JSON.stringify([[]]), expectedOutput: '"<ul class=\\"empty\\"></ul>"' }
    ]
  },
  {
    topic: 'loops-and-collections',
    subConcept: 'sum-cart-items',
    taskType: 'CODE',
    title: 'Практика: Циклічний алгоритм підсумовування товарів у кошику',
    description: 'Кошик інтернет-магазину представлений масивом об\'єктів `[{ title: string, price: number, qty: number }]`. Напишіть функцію `sumCart(items)`, яка в циклі обчислює повну суму всіх товарів (з урахуванням кількості `price * qty`).',
    difficulty: 'MEDIUM',
    starterCode: `function sumCart(items) {
  // Циклічне накопичення суми:
}
`,
    testCases: [
      { 
        input: JSON.stringify([[{ title: 'Зошит', price: 20, qty: 3 }, { title: 'Ручка', price: 15, qty: 2 }]]), 
        expectedOutput: '90' 
      },
      { 
        input: JSON.stringify([[]]), 
        expectedOutput: '0' 
      }
    ]
  }
];

// 4. Алгоритми перевірки та валідація форм
export const schoolValidationTasks: SeedTask[] = [
  {
    topic: 'form-validation',
    subConcept: 'password-strength',
    taskType: 'CODE',
    title: 'Практика: Алгоритм валідації надійності паролю',
    description: 'Напишіть функцію `validatePassword(password)` для форми реєстрації на шкільному сайті. Пароль вважається валідним (`true`), якщо:\n1. Довжина не менше 8 символів;\n2. Містить хоча б одну цифру (0-9);\n3. Не містить пробілів. Інакше поверніть `false`.',
    difficulty: 'MEDIUM',
    starterCode: `function validatePassword(password) {
  // Логічні перевірки для форми:
}
`,
    testCases: [
      { input: JSON.stringify(["School2026"]), expectedOutput: 'true' },
      { input: JSON.stringify(["short1"]), expectedOutput: 'false' },
      { input: JSON.stringify(["NodigitsHere"]), expectedOutput: 'false' },
      { input: JSON.stringify(["Pass with space1"]), expectedOutput: 'false' }
    ]
  },
  {
    topic: 'form-validation',
    subConcept: 'email-domain-check',
    taskType: 'CODE',
    title: 'Практика: Алгоритм перевірки шкільного поштового домену',
    description: 'Для доступу до шкільного порталу учні мають використовувати шкільну пошту. Напишіть функцію `isSchoolEmail(email, schoolDomain)`, яка повертає `true`, якщо адреса містить символ `@` та закінчується на `@${schoolDomain}`.',
    difficulty: 'EASY',
    starterCode: `function isSchoolEmail(email, schoolDomain) {
  // Перевірка формату та домену:
}
`,
    testCases: [
      { input: JSON.stringify(["ivan@school12.edu.ua", "school12.edu.ua"]), expectedOutput: 'true' },
      { input: JSON.stringify(["petro@gmail.com", "school12.edu.ua"]), expectedOutput: 'false' },
      { input: JSON.stringify(["school12.edu.ua", "school12.edu.ua"]), expectedOutput: 'false' }
    ]
  }
];

// 5. Алгоритми пошуку, фільтрації та сортування
export const schoolFilterSearchTasks: SeedTask[] = [
  {
    topic: 'search-filter-sort',
    subConcept: 'filter-products-by-category',
    taskType: 'CODE',
    title: 'Практика: Алгоритм фільтрації карток для веб-каталогу',
    description: 'Напишіть функцію `filterByCategoryAndMaxPrice(products, category, maxPrice)`, яка фільтрує масив товарів `[{ id, name, category, price }]` за обраною категорією та граничною ціною (ціна <= maxPrice).',
    difficulty: 'MEDIUM',
    starterCode: `function filterByCategoryAndMaxPrice(products, category, maxPrice) {
  // Поверніть відфільтрований масив об'єктів:
}
`,
    testCases: [
      {
        input: JSON.stringify([
          [
            { id: 1, name: 'Мишка', category: 'it', price: 450 },
            { id: 2, name: 'Клавіатура', category: 'it', price: 1200 },
            { id: 3, name: 'Блокнот', category: 'books', price: 100 }
          ],
          'it',
          500
        ]),
        expectedOutput: '[{"id":1,"name":"Мишка","category":"it","price":450}]'
      }
    ]
  },
  {
    topic: 'search-filter-sort',
    subConcept: 'sort-leaderboard',
    taskType: 'CODE',
    title: 'Практика: Алгоритм сортування турнірної таблиці учнів',
    description: 'Напишіть функцію `sortLeaderboard(students)`, яка сортує масив учнів `[{ name: string, points: number }]` за спаданням балів (`points`). Якщо бали однакові, сортувати за алфавітом імені (`name`) за зростанням.',
    difficulty: 'HARD',
    starterCode: `function sortLeaderboard(students) {
  // Алгоритм сортування масиву:
}
`,
    testCases: [
      {
        input: JSON.stringify([
          [
            { name: 'Богдан', points: 80 },
            { name: 'Анна', points: 95 },
            { name: 'Віктор', points: 80 }
          ]
        ]),
        expectedOutput: '[{"name":"Анна","points":95},{"name":"Богдан","points":80},{"name":"Віктор","points":80}]'
      }
    ]
  }
];
