import { DiagnosticQuestionDto } from '@sbc/types';

export const DIAGNOSTIC_PREFLIGHT_QUESTIONS: DiagnosticQuestionDto[] = [
  {
    id: 'diag-q1-vars',
    skillSlug: 'school-alg-basics',
    question: 'Що відбудеться при виконанні наступного коду в JavaScript?',
    codeSnippet: `const maxAttempts = 3;
maxAttempts = 5;
console.log(maxAttempts);`,
    options: [
      {
        id: 'opt-1-1',
        text: 'У консолі буде виведено число 5',
        isCorrect: false,
        explanation: 'Константи const захищені від повторного присвоєння оператором "=". Це викликає фатальну помилку.'
      },
      {
        id: 'opt-1-2',
        text: 'Виникне помилка TypeError: Assignment to constant variable',
        isCorrect: true,
        explanation: 'Вірно! Змінні, оголошені як const, не можна переприсвоювати після первинної ініціалізації.'
      },
      {
        id: 'opt-1-3',
        text: 'У консолі буде виведено число 3',
        isCorrect: false,
        explanation: 'Інтерпретатор не ігнорує рядок переприсвоєння, а викидає виняток TypeError.'
      },
      {
        id: 'opt-1-4',
        text: 'Буде виведено undefined',
        isCorrect: false,
        explanation: 'Значення було успішно присвоєно на першому рядку, але спроба зміни призводить до помилки.'
      }
    ],
    difficulty: 'EASY'
  },
  {
    id: 'diag-q2-branching',
    skillSlug: 'school-alg-branching',
    question: 'Який результат виведе консоль браузера?',
    codeSnippet: `let score = "10";
if (score === 10) {
  console.log("Точне співпадіння");
} else if (score == 10) {
  console.log("Нестроге співпадіння");
} else {
  console.log("Немає співпадіння");
}`,
    options: [
      {
        id: 'opt-2-1',
        text: 'Точне співпадіння',
        isCorrect: false,
        explanation: 'Оператор строгого порівняння === перевіряє типи. Рядок "10" не дорівнює числу 10.'
      },
      {
        id: 'opt-2-2',
        text: 'Нестроге співпадіння',
        isCorrect: true,
        explanation: 'Вірно! Оператор == виконує неявне приведення типів (type coercion), тому рядок "10" приводиться до числа 10.'
      },
      {
        id: 'opt-2-3',
        text: 'Немає співпадіння',
        isCorrect: false,
        explanation: 'Оператор == спрацює на гілці else if, оскільки значення співпадуть після приведення.'
      },
      {
        id: 'opt-2-4',
        text: 'Помилка виконання (SyntaxError)',
        isCorrect: false,
        explanation: 'Код синтаксично повністю коректний.'
      }
    ],
    difficulty: 'MEDIUM'
  },
  {
    id: 'diag-q3-loops',
    skillSlug: 'school-alg-loops',
    question: 'Скільки разів виконається тіло цього циклу for?',
    codeSnippet: `let count = 0;
for (let i = 0; i < 5; i++) {
  count += i;
}
console.log(count);`,
    options: [
      {
        id: 'opt-3-1',
        text: '4 рази',
        isCorrect: false,
        explanation: 'Ітерації відбудуться для значень i = 0, 1, 2, 3, 4 — тобто рівно 5 разів.'
      },
      {
        id: 'opt-3-2',
        text: '5 разів (значення count = 10)',
        isCorrect: true,
        explanation: 'Вірно! i набуває значень 0, 1, 2, 3, 4 (5 ітерацій), а сума 0+1+2+3+4 = 10.'
      },
      {
        id: 'opt-3-3',
        text: '6 разів',
        isCorrect: false,
        explanation: 'Умова i < 5 є строгою, тому при i = 5 цикл негайно завершується.'
      },
      {
        id: 'opt-3-4',
        text: 'Цикл нескінченний',
        isCorrect: false,
        explanation: 'Інкремент i++ на кожній ітерації гарантує досягнення умови завершення.'
      }
    ],
    difficulty: 'MEDIUM'
  },
  {
    id: 'diag-q4-functions',
    skillSlug: 'school-alg-functions',
    question: 'Що поверне виклик стрілочної функції calculateTotal?',
    codeSnippet: `const calculateTotal = (price, discount = 0.1) => price * (1 - discount);
console.log(calculateTotal(100));`,
    options: [
      {
        id: 'opt-4-1',
        text: '90',
        isCorrect: true,
        explanation: 'Чудово! Параметр discount має дефолтне значення 0.1, тому 100 * (1 - 0.1) = 90.'
      },
      {
        id: 'opt-4-2',
        text: 'NaN',
        isCorrect: false,
        explanation: 'Параметр discount не є undefined, оскільки спрацював дефолтний аргумент 0.1.'
      },
      {
        id: 'opt-4-3',
        text: '100',
        isCorrect: false,
        explanation: 'Знижка була застосована автоматично завдяки дефолтному аргументу.'
      },
      {
        id: 'opt-4-4',
        text: 'undefined',
        isCorrect: false,
        explanation: 'Стрілочна функція з коротким записом без фігурних дужок повертає результат виразу автоматично.'
      }
    ],
    difficulty: 'MEDIUM'
  },
  {
    id: 'diag-q5-dom',
    skillSlug: 'school-web-dom',
    question: 'Який метод слід використати для додавання реакції на клік користувача по кнопці?',
    codeSnippet: `const btn = document.querySelector("#submit-btn");
// Який рядок правильний?`,
    options: [
      {
        id: 'opt-5-1',
        text: 'btn.addEventListener("click", () => alert("Готово!"));',
        isCorrect: true,
        explanation: 'Вірно! Стандартний та безпечний метод підписки на події DOM — addEventListener.'
      },
      {
        id: 'opt-5-2',
        text: 'btn.onClickEvent("click");',
        isCorrect: false,
        explanation: 'Такого методу в стандартному DOM API не існує.'
      },
      {
        id: 'opt-5-3',
        text: 'document.listen("click", btn);',
        isCorrect: false,
        explanation: 'Метод підписки викликається безпосередньо на цільовому елементі через addEventListener.'
      },
      {
        id: 'opt-5-4',
        text: 'btn.fire("click");',
        isCorrect: false,
        explanation: 'Це викликає подію (trigger), а не підписується на неї.'
      }
    ],
    difficulty: 'EASY'
  }
];
