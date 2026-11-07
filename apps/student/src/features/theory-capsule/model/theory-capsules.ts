import type { TaskDto, TheoryCapsuleDto } from '@sbc/types';

const THEORY_CAPSULES: TheoryCapsuleDto[] = [
  {
    id: 'capsule-variables-and-types',
    topicSlug: 'variables-declaration',
    title: 'Оголошення величин: const проти let та примітивні типи',
    summary:
      'Константа const жорстко фіксує прив’язку ідентифікатора після ініціалізації, а let використовується лише там, де значення змінюватиметься під час виконання алгоритму.',
    markdownContent:
      'У сучасному JavaScript кожна величина оголошується з блочною областю видимості.\n\n• Ключове слово const вимагає негайного початкового значення і забороняє повторне присвоєння через знак = (інакше виникає виняток TypeError: Assignment to constant variable).\n• Ключове слово let застосовується для лічильників, акумуляторів та змінних стану.\n• Будь-які символи всередині лапок ("12") належать до рядкового типу string: оператор + виконує конкатенацію рядків, а не математичне додавання.',
    codeExamples: [
      {
        title: 'Безпечне оголошення та перетворення типів',
        language: 'javascript',
        code: `const TAX_RATE = 0.2;     // незмінна константа
let totalScore = 10;      // змінна величина
totalScore += 5;          // 15

const rawInput = "42";
const numericValue = Number(rawInput) + 8; // 50 (замість "428")`,
      },
    ],
    keyTakeaways: [
      'Завжди оголошуйте величину як const, якщо її не потрібно перезаписувати.',
      'Спроба змінити const або оголосити її без початкового значення негайно зупиняє код.',
      'Звернення до let/const до рядка оголошення спричиняє ReferenceError (Temporal Dead Zone).',
      'Для арифметики над текстовими числами застосовуйте Number(value).',
    ],
    estimatedReadMinutes: 2,
  },
  {
    id: 'capsule-linear-calculations',
    topicSlug: 'linear-calculations',
    title: 'Лінійні алгоритми, формули та шаблонні рядки',
    summary:
      'Лінійний алгоритм виконує обчислення послідовно зверху вниз за правилами математичного пріоритету операцій та повертає результат потрібного типу.',
    markdownContent:
      'Під час побудови конвертерів величин та фінансових формул важливо контролювати порядок дій за допомогою круглих дужок () та перевіряти тип поверненого значення.\n\nЗверніть увагу: метод .toFixed(2) форматує число до двох знаків після коми, але повертає РЯДОК (string). Щоб функція повернула число (number), обгорніть результат у Number(...).',
    codeExamples: [
      {
        title: 'Округлення результату та інтерполяція рядків',
        language: 'javascript',
        code: `function calcDiscounted(price, qty, discountPct) {
  const rawTotal = price * qty * (1 - discountPct / 100);
  return Number(rawTotal.toFixed(2));
}

const badge = \`Сума до сплати: \${calcDiscounted(100, 2, 15)} грн\`;`,
      },
    ],
    keyTakeaways: [
      'Дужки () задають найвищий пріоритет у формулах знижок та пропорцій.',
      'Number(val.toFixed(2)) гарантує числовий результат замість рядка.',
      'Шаблонні рядки у зворотних лапках `... ${expr} ...` безпечно підставляють значення у текст.',
    ],
    estimatedReadMinutes: 2,
  },
  {
    id: 'capsule-conditional-logic',
    topicSlug: 'boolean-conditions',
    title: 'Умовні розгалуження if / else та логічні оператори',
    summary:
      'Строге порівняння === перевіряє і значення, і тип даних без прихованого зведення, а логічні зв’язки && та || комбінують складені умови.',
    markdownContent:
      'В умовах розгалуження завжди використовуйте оператор строгої рівності === (або !==) замість одинарного = (який є присвоєнням) чи нестрогого ==.\n\n• Логічне «І» (&&) повертає true лише тоді, коли істинні обидві умови.\n• Логічне «АБО» (||) повертає true, якщо виконується хоча б одна з умов.\n• У ланцюжках if / else if перевіряйте межі діапазонів послідовно — від найвужчої або найвищої умови до загальної.',
    codeExamples: [
      {
        title: 'Перевірка діапазонів балів',
        language: 'javascript',
        code: `function evaluateScore(points) {
  if (points < 1 || points > 12) return "Некоректний бал";
  if (points >= 10 && points <= 12) return "Високий";
  if (points >= 7) return "Достатній";
  return points >= 4 ? "Середній" : "Початковий";
}`,
      },
    ],
    keyTakeaways: [
      'Ніколи не пишіть if (x = 5) — для перевірки рівності використовуйте ===.',
      'Оператор && вимагає одночасної істинності всіх частин умови.',
      'Спочатку відсікайте некоректні граничні значення, а потім будуйте else if.',
    ],
    estimatedReadMinutes: 2,
  },
  {
    id: 'capsule-loops-functions-arrays',
    topicSlug: 'loops-and-arrays',
    title: 'Цикли, функції та опрацювання масивів даних',
    summary:
      'Змінні-акумулятори оголошуються ДО входу в цикл, а кожна чиста функція має завершуватися інструкцією return.',
    markdownContent:
      'Під час підрахунку суми, пошуку максимуму або фільтрації елементів масиву оголошуйте накопичувач (наприклад, let sum = 0;) перед циклом for.\n\nІндексація масивів у JavaScript починається з 0, а останній елемент має індекс array.length - 1.',
    codeExamples: [
      {
        title: 'Акумуляція суми елементів масиву',
        language: 'javascript',
        code: `function sumPositive(items) {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    if (items[i] > 0) sum += items[i];
  }
  return sum;
}`,
      },
    ],
    keyTakeaways: [
      'Не оголошуйте let sum = 0 всередині тіла циклу — інакше сума обнулятиметься на кожному кроці.',
      'Перевіряйте межу i < arr.length (строго менше), щоб не вийти за межі масиву.',
      'Переконайтеся, що функція явно повертає обчислене значення через return.',
    ],
    estimatedReadMinutes: 3,
  },
  {
    id: 'capsule-dom-and-validation',
    topicSlug: 'dom-and-projects',
    title: 'Інтерактивний DOM, події та клієнтська валідація',
    summary:
      'Для безпечного виведення даних у DOM використовуйте властивість textContent замість innerHTML, а введення користувача очищуйте через .trim().',
    markdownContent:
      'Браузер подає HTML-документ у вигляді дерева об’єктів DOM.\n\n• Пошук елемента: document.getElementById("id") або document.querySelector("#id").\n• Безпечне оновлення тексту: element.textContent = value (захищає від XSS-ін’єкцій).\n• Перед перевіркою паролів і полів форм завжди відсікайте пробіли методом .trim() та перевіряйте довжину рядка.',
    codeExamples: [
      {
        title: 'Безпечна перевірка поля введення',
        language: 'javascript',
        code: `function isValidPassword(raw) {
  const clean = String(raw).trim();
  return clean.length >= 8 && (clean.includes("@") || clean.includes("#"));
}`,
      },
    ],
    keyTakeaways: [
      'Віддавайте перевагу textContent замість innerHTML при роботі з текстом користувача.',
      'Метод .trim() запобігає проходженню порожніх рядків із пробілів.',
      'Обробники addEventListener реагують на події без перезавантаження сторінки.',
    ],
    estimatedReadMinutes: 2,
  },
  {
    id: 'capsule-english-b2',
    topicSlug: 'english-b2',
    title: 'B2 Grammar & Tech Communication Essentials',
    summary:
      'Узгодження часів у минулому (Past Perfect для передуючої дії), умовні речення 3-го типу та діловий регістр ІТ-комунікації.',
    markdownContent:
      '• Past Perfect (had + V3 / had been + V3) вживається для дії, яка повністю завершилася ДО іншого моменту в минулому (маркери: "By the time + Past Simple", "before", "already").\n• Third Conditional описує нереальну умову в минулому: If + Past Perfect, ... would have + V3.\n• В інженерному листуванні дотримуйтесь структури: чітка тема запиту -> контекст середовища (Staging/Production) -> очікувана дія.',
    codeExamples: [
      {
        title: 'Ключові граматичні моделі B2',
        language: 'text',
        code: `1. Prior Past Action:
   "By the time the server crashed, the DB had been backed up."
2. Third Conditional:
   "If we had refactored earlier, the deployment would have been smoother."`,
      },
    ],
    keyTakeaways: [
      'Past Simple фіксує подію в минулому, а Past Perfect — те, що сталося ще раніше.',
      'Не вживайте would у підрядній частині з if (правильно: If we had...).',
      'У CI/CD термінології розрізняйте ітеративні практики Agile та каскадний Waterfall.',
    ],
    estimatedReadMinutes: 2,
  },
  {
    id: 'capsule-ukraine-law',
    topicSlug: 'ukraine-law',
    title: 'Ієрархія нормативно-правових актів та гарантії трудового права',
    summary:
      'Конституція України має найвищу юридичну силу (ст. 8 КУ), а норми спеціального законодавства (зокрема КЗпП) не можуть порушувати конституційні гарантії.',
    markdownContent:
      '• Верховенство Конституції (ст. 8 КУ): Конституція України має найвищу юридичну силу. Закони та підзаконні акти (Укази Президента, Постанови КМУ) приймаються на її основі.\n• Конституційні права vs обов’язки (ст. 65–68 КУ): захист Вітчизни, шанування державних символів і сплата податків є обов’язками, тоді як участь у партіях чи об’єднаннях (ст. 36 КУ) — це добровільне право.\n• Гарантії ст. 40 КЗпП України: звільнення працівника з ініціативи роботодавця в період його тимчасової непрацездатності (лікарняного) або відпустки прямо заборонене законом.',
    keyTakeaways: [
      'Ієрархія актів: Конституція України -> Закони України -> Підзаконні нормативно-правові акти.',
      'Чітко відмежовуйте конституційні обов’язки (ст. 65–68 КУ) від політичних прав громадян.',
      'Звільнення за ініціативою роботодавця під час лікарняного є незаконним і тягне поновлення на роботі.',
    ],
    estimatedReadMinutes: 2,
  },
];

/**
 * Підбирає релевантну теоретичну капсулу (`TheoryCapsuleDto`) для поточного завдання
 * без необхідності перемикання вкладки браузера.
 */
export function resolveTheoryCapsule(
  task: TaskDto | null,
  activeCourseSlug?: string,
): TheoryCapsuleDto | null {
  if (!task) return null;

  const haystack = [
    task.topic || '',
    task.subConcept || '',
    task.studyUnitUrl || '',
    task.skill?.slug || '',
    activeCourseSlug || '',
  ]
    .join(' ')
    .toLowerCase();

  if (haystack.includes('ukraine-law') || haystack.includes('law-')) {
    return THEORY_CAPSULES.find((c) => c.id === 'capsule-ukraine-law') || null;
  }

  if (haystack.includes('english-b2') || haystack.includes('eng-')) {
    return THEORY_CAPSULES.find((c) => c.id === 'capsule-english-b2') || null;
  }

  if (
    haystack.includes('variables') ||
    haystack.includes('primitive-types') ||
    haystack.includes('type-coercion') ||
    haystack.includes('const') ||
    haystack.includes('school-alg-basics')
  ) {
    if (haystack.includes('linear-calculations') || haystack.includes('string-templates')) {
      return THEORY_CAPSULES.find((c) => c.id === 'capsule-linear-calculations') || null;
    }
    return THEORY_CAPSULES.find((c) => c.id === 'capsule-variables-and-types') || null;
  }

  if (
    haystack.includes('boolean') ||
    haystack.includes('branching') ||
    haystack.includes('grade-evaluation') ||
    haystack.includes('conditional')
  ) {
    return THEORY_CAPSULES.find((c) => c.id === 'capsule-conditional-logic') || null;
  }

  if (
    haystack.includes('dom') ||
    haystack.includes('event') ||
    haystack.includes('project') ||
    haystack.includes('validation')
  ) {
    return THEORY_CAPSULES.find((c) => c.id === 'capsule-dom-and-validation') || null;
  }

  if (
    haystack.includes('loop') ||
    haystack.includes('array') ||
    haystack.includes('function') ||
    haystack.includes('collection') ||
    haystack.includes('async') ||
    haystack.includes('oop')
  ) {
    return THEORY_CAPSULES.find((c) => c.id === 'capsule-loops-functions-arrays') || null;
  }

  return {
    id: `capsule-dynamic-${task.id}`,
    topicSlug: task.topic || task.skill?.slug || 'general',
    title: task.skill?.title || task.title,
    summary: `Ключові орієнтири для виконання завдання «${task.title}».`,
    markdownContent: task.description,
    keyTakeaways:
      task.socraticHints && task.socraticHints.length > 0
        ? task.socraticHints.map((h) => h.hint)
        : [
            'Уважно перевірте вхідні умови та очікуваний формат результату.',
            'Звірте крайні випадки (граничні значення, типи даних, порожні рядки).',
          ],
    estimatedReadMinutes: 2,
  };
}
