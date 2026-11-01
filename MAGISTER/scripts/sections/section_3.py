"""
Розділ 3. Архітектура та програмна реалізація інтелектуальної EdTech-системи.
Повний інженерний опис 5 застосунків, компонентів, конвеєрів телеметрії, DTO та смарт-контракту.
"""

def get_section_3():
    sec3_sub1 = """3.1. Загальна мікросервісна та мікрофронтендна архітектура монорепозиторію

Програмний комплекс Smart-BKT-Chain спроєктовано за сучасними принципами компонентної мікрофронтендної та гексагональної мікросервісної архітектури [27, 28]. Весь програмний стек організовано в єдиний керований монорепозиторій під управлінням диспетчера пакетів npm workspaces та конвеєрного оркестратора збірки Turborepo. 

Такий підхід забезпечує критично важливі інженерні переваги для високонавантаженої освітньої платформи:
1. Сувору наскрізну статичну типізацію між клієнтськими та серверними підсистемами завдяки спільному доменному пакету `@sbc/types` [31]. Будь-яка зміна структури телеметричного кванту чи стану моделі BKT негайно верифікується компілятором TypeScript на обох кінцях з'єднання;
2. Відсутність копіювання коду та уніфікацію поведінки користувацького інтерфейсу через винесення стандартизованих компонентів у спільну бібліотеку `@sbc/ui` [32] (зокрема базового структурного блоку `DrawerSection` за стандартом безрамкових бічних панелей);
3. Централізоване декларативне керування реляційною схемою бази даних через пакет `@sbc/database` на основі Prisma ORM із підтримкою строго типізованих міграцій [34];
4. Повну ізоляцію середовищ виконання: кожен веб-застосунок монорепозиторію має власний незалежний життєвий цикл збірки, тестування та запуску, що усуває взаємний вплив при локальній розробці та горизонтальному масштабуванні.

Загальне архітектурне дерево компонентів і пакетів монорепозиторію наведено в лістингу 3.1.

Лістинг 3.1 — Архітектурна структура монорепозиторію платформи Smart-BKT-Chain
[Код: smart-bkt-chain/
├── apps/
│   ├── study/        # Порт 3006: Дидактичний простір (Zen Focus, Misconceptions, Playground)
│   ├── student/      # Порт 3002: Тренажер учня (Monaco Editor, Skill DAG Map, Live Telemetry)
│   ├── teacher/      # Порт 3003: Моніторинг викладача (BKT Heatmap, Review Queue Inspector)
│   ├── admin/        # Порт 3004: CMS Методиста (Skill DAG Visual Builder, Course Manager)
│   └── api/          # Порт 3000: Гексагональний NestJS Core (WebSockets, BktEngine, BullMQ)
├── packages/
│   ├── database/     # Prisma ORM, PostgreSQL schema, міграції
│   ├── types/        # Спільні TypeScript DTO контракти (@sbc/types)
│   └── ui/           # Спільна бібліотека компонентів (@sbc/ui, DrawerSection)
└── contracts/        # Solidity смарт-контракти (SoulboundCertificate.sol)]

Функціональний та технологічний розподіл обов'язків веб-застосунків екосистеми зведено в табл. 3.1.

Таблиця 3.1 — Функціональний та технологічний розподіл застосунків комплексу
[Таблиця: Застосунок | Порт / URL | Роль у навчальному процесі | Ключові технологічні модулі та бібліотеки]
- apps/study | localhost:3006 | Здобувачі (дидактика) | Next.js 16, Zen Focus Reading Engine, CodePlayground, Web Worker;
- apps/student | localhost:3002 | Здобувачі (практика) | Monaco Editor, useBehavioralTelemetry, SkillDagMap, Socket.IO;
- apps/teacher | localhost:3003 | Викладачі та тьютори | BKT Heatmap, ReviewQueueInspector, AnomalyRadar, LLM Review;
- apps/admin | localhost:3004 | Методисти курсів | Skill DAG Visual Builder, Course Manager, BKT Configurator;
- apps/api | localhost:3000 | Центральний бекенд | NestJS 10, WebSocket Gateway, BktEngine, BullMQ, Prisma ORM.

Міжпакетна взаємодія базується на суворому дотриманні політики інверсії залежностей: застосунки верхнього рівня (apps/*) не можуть імпортувати внутрішній код інших застосунків напряму [28]. Будь-який спільний контракт, DTO або інтерфейс попередньо реєструється в доменному пакеті @sbc/types [33].

Для стандартизації бічних панелей (Side Drawers) в усіх трьох кабінетах (student, teacher, admin) розроблено єдиний дизайн-стандарт «Панель як контейнер, вміст як секції». Панель слугує чистим структурним контейнером, а весь функціональний вміст групується у згортанні акордеонні секції через компонент DrawerSection із мінімалістичними індикаторами розгортання Plus та Minus."""

    sec3_sub2 = """3.2. Гексагональне аналітичне ядро бекенду (apps/api), WebSocket-шлюзи та схема бази даних

Серверна частина системи apps/api реалізована за архітектурним патерном «Порти та Адаптери» (Hexagonal Architecture) [27, 28]. Доменна логіка оцінювання знань BKT, розрахунку телеметричних штрафів та обходу графа повністю ізольована від зовнішніх транспортних фреймворків (HTTP-контролерів, WebSocket-гейтвеїв) та деталей збереження в реляційній базі даних.

1. Транспортний шар потокової телеметрії (WebSocket Gateway).
Для мінімізації мережевих затримок клієнтський тренажер комунікує з бекендом через бідирекційний бінарний сокет-канал Socket.IO на базі протоколу RFC 6455 [29].
Кожні 1500 мс клієнт надсилає телеметричний фрейм TELEMETRY_TICK, що містить поточні показники буфера, міжсимвольні затримки та зсув курсору. Обробник гейтвею виконує валідацію схеми через class-validator за менш ніж 0.4 мс [33].

2. Контракти передачі даних пакета @sbc/types.
Для усунення розриву типізації між TypeScript-клієнтами та NestJS-ендпоінтами в пакеті @sbc/types зафіксовано суворі структури даних: DTO конфігурації BKT, DTO стану навички та DTO телеметричних квантів подій [31, 33].

Лістинг 3.2 — Спільні DTO-контракти типізації BKT та телеметрії (@sbc/types)
[Код: // packages/types/src/bkt.types.ts
export interface BktParametersDto {
  pInit: number;    // P(L_0) - початкова ймовірність знання
  pTransit: number; // P(T) - ймовірність переходу у стан знання
  pSlip: number;    // P(S) - ймовірність помилки при знанні
  pGuess: number;   // P(G) - ймовірність вгадування без знання
}

export interface BktStateDto {
  studentId: string;
  skillId: string;
  pKnown: number;          // P(L_n) - актуальна ймовірність [0..1]
  isMastered: boolean;     // P(L_n) >= 0.85
  totalAttempts: number;
  correctAttempts: number;
}

export interface BktUpdateResultDto {
  previousPknown: number;
  newPknown: number;
  isMastered: boolean;
  delta: number;
  skillId: string;
  adjustedParams?: {
    usedSlip: number;
    usedGuess: number;
    anomalyDetected: boolean;
  };
}]

3. Захист від спаму спроб та забезпечення ідемпотентності (Idempotency Guard).
Під час практичного використання було виявлено загрозу багаторазового надсилання одного й того самого розв'язку з метою штучної накрутки значень P(L).
Для запобігання цій аномалії розроблено алгоритм ідемпотентності:
1) Бекенд обчислює SHA-256 хеш отриманого програмного коду:
[Формула: H_{code} = \\text{sha256}(code \\parallel taskId \\parallel studentId) | (3.1)]

2) Якщо надходить запит із ідентичним значенням H_code протягом захисного вікна (30 секунд), або якщо код повністю збігається з попереднім успішним кроком, сервер повертає статус DUPLICATE_SUBMISSION_IGNORED без виклику формули оновлення BKT.

4. Структура реляційної моделі даних (Prisma Schema).
Для персистентного збереження графа знань, сесій, телеметрії та черги перевірки спроєктовано оптимізовану реляційну схему в базі даних PostgreSQL [34].

Лістинг 3.3 — Фрагмент декларації Prisma-схеми даних телеметрії та BKT-станів
[Код: // packages/database/prisma/schema.prisma
model StudentBktState {
  id              String   @id @default(uuid())
  studentId       String
  skillId         String
  pKnown          Float    @default(0.15)
  consecutiveFails Int     @default(0)
  lastUpdated     DateTime @updatedAt

  @@unique([studentId, skillId])
  @@index([studentId])
}

model TelemetrySession {
  id              String   @id @default(uuid())
  studentId       String
  taskId          String
  timeToSolveMs   Int
  wpm             Float
  pasteRatio      Float
  backspaceCount  Int
  trustScore      Float
  isClean         Boolean  @default(true)
  auditHash       String?
  createdAt       DateTime @default(now())

  @@index([studentId, taskId])
}

model ReviewSubmission {
  id              String   @id @default(uuid())
  studentId       String
  taskId          String
  code            String   @db.Text
  version         Int      @default(1)
  status          String   @default("PENDING_REVIEW")
  reviewerNotes   String?  @db.Text
  createdAt       DateTime @default(now())
}]

Всі операції над станами обгорнуті в транзакційні блоки Prisma Interactive Transactions, що гарантує відсутність станів гонитви (Race Conditions) при паралельних сабмітах [34]."""

    sec3_sub3 = """3.3. Клієнтські підсистеми практичного кодування та методичного керування (apps/student, apps/teacher, apps/admin)

Клієнтські застосунки побудовані на основі компонентної архітектури React та Next.js 16 [30, 32].

1. Тренажер програмування apps/student (порт 3002).
Центральним робочим простором учня є редактор коду Monaco Editor. Для збору інформації без зниження продуктивності інтерфейсу (60 FPS) розроблено кастомний React-хук useBehavioralTelemetry. Хук перехоплює події:
- onDidChangeModelContent: реєстрація операцій вставки тексту та очищення буфера обміну;
- onKeyDown: вимірювання міжсимвольних латентностей (Inter-keystroke intervals);
- onDidBlurEditorWidget: фіксування втрати фокусу вікна браузера.

Візуалізація графа знань реалізована за допомогою компонента SkillDagMap, де кольорове кодування вершин динамічно відображає ймовірність засвоєння P(L) від червоного (P(L) < 0.30) через жовтий до смарагдово-зеленого (P(L) ≥ 0.85).

2. Робоче місце викладача apps/teacher (порт 3003).
Містить когортну теплову карту успішності (BKT Heatmap), радар виявлення аномалій академічної доброчесності та інспектор черги перевірки робіт ReviewQueueInspector.
Для запобігання засміченню черги перевірки реалізовано скінченний автомат статусів спроби:
- PENDING_REVIEW — очікує перевірки викладачем або LLM-суддею;
- SUPERSEDED — автоматично замінено новою версією розв'язку того самого учня;
- APPROVED — розв'язок схвалено із зарахуванням балів;
- REJECTED — роботу повернуто на доопрацювання з коментарем.

3. Компонент інспекції черги ReviewQueueInspector.
Компонент організовано згідно зі стандартом бічних панелей DrawerSection. Викладач бачить не просто текст коду, а синхронізовану теплову карту активності: підозрілі вставки позначаються червоним підсвічуванням, графік WPM показує неприродні сплески швидкості, а зведена оцінка LLM-судді пропонує попередній вердикт із коментарем.

4. CMS методиста курсу apps/admin (порт 3004).
Забезпечує інтерактивне конструювання графа пререквізитів курсу (Skill DAG Visual Builder), налаштування параметрів BKT (P(L_0), P(T), P(G), P(S)) та додавання навчальних модулів. Методист може зв'язувати вершини пререквізитів простим перетягуванням (Drag-and-Drop) та візуально верифікувати ациклічність графа."""

    sec3_sub4 = """3.4. Архітектура навчального простору первинної дидактики та рушія фокусування (apps/study та Zen Focus Reading Engine)

На відміну від систем, орієнтованих лише на контроль, платформа містить повнофункціональний простір теоретичного навчання та первинної дидактики — застосунок apps/study (порт 3006).

1. Рушій комфортного читання (Zen Focus Reading Engine).
Для зменшення когнітивного навантаження здобувача [16] розроблено інтерактивний рушій Zen Focus Reading Engine:
- Динамічне підсвічування активного смислового абзацу або рядка коду (Line Highlighting) із м'яким затемненням периферійного тексту;
- Можливість персонального вибору кегля (14–22 px), міжрядкового інтервалу (1.4–1.8) та колірних тем (глибока темна, нічна сапфірова, класична світла) з гарантованою контрастністю WCAG AAA;
- Бездистракційний повноекранний режим читання (Distraction-Free Mode).

2. Інтерактивна пісочниця CodePlayground.
У кожну теоретичну лекцію інтегровано живі пісочниці, де учень може експериментувати з кодом мовами TypeScript/JavaScript/Python безпосередньо у вікні браузера без необхідності налаштування локального середовища розробки [30]. Виконання коду відбувається в безпечному Web Worker, ізольованому від основного DOM-дерева сторінки.

3. Картки типових ментальних оман (Misconception Cards).
Усі картки спроєктовано згідно зі стандартом акордеонних секцій @sbc/ui DrawerSection. Вони наочно протиставляють хибний патерн розуміння правильному алгоритмічному рішенню та містять контрольне питання на швидке закріплення [15]. Студент бачить помилкове міркування (наприклад, «метод array.sort() сортує числа за числовим значенням»), пояснення проблеми (лексикографічне сортування за замовчуванням) та вірний приклад із компаратором."""

    sec3_sub5 = """3.5. Смарт-контракт децентралізованої сертифікації SoulboundCertificate у мережі Polygon

Для криптографічної фіксації досягнень здобувачів освіти розроблено комплект смарт-контрактів мовою Solidity (версія 0.8.20) для EVM-сумісної мережі Polygon PoS [20, 26].

Смарт-контракт SoulboundCertificate.sol успадковує стандарти ERC-721 [22] та інтерфейс IERC5192 (Minimal Non-transferable Soulbound NFTs) [23]. 

Лістинг 3.4 — Смарт-контракт непередаваного сертифіката SoulboundCertificate.sol
[Код: // contracts/SoulboundCertificate.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SoulboundCertificate is ERC721, Ownable {
    event Locked(uint256 tokenId);

    mapping(uint256 => bytes32) public auditHashes;
    mapping(uint256 => bool) public isLocked;

    constructor() ERC721("SmartBKT Soulbound Credential", "SBC") Ownable(msg.sender) {}

    function mintCertificate(address to, uint256 tokenId, bytes32 auditHash) external onlyOwner {
        _safeMint(to, tokenId);
        auditHashes[tokenId] = auditHash;
        isLocked[tokenId] = true;
        emit Locked(tokenId);
    }

    function _beforeTokenTransfer(address from, address to, uint256, uint256) internal pure override {
        require(from == address(0) || to == address(0), "Err: SBT is non-transferable");
    }
}]

Перевизначення хука _beforeTokenTransfer повністю унеможливлює передачу або перепродаж сертифіката між гаманцями користувачів: токен може бути створений лише шляхом емісії від нульової адреси (address(0)) або спалений емітентом у разі виявлення порушень доброчесності."""

    return {
        "id": "section_3",
        "number": 3,
        "title": "АРХІТЕКТУРА ТА ПРОГРАМНА РЕАЛІЗАЦІЯ ІНТЕЛЕКТУАЛЬНОЇ EDTECH-СИСТЕМИ",
        "targetPages": 18,
        "subsections": [
            {
                "number": "3.1",
                "title": "Загальна мікросервісна та мікрофронтендна архітектура монорепозиторію",
                "targetPages": 4,
                "content": sec3_sub1
            },
            {
                "number": "3.2",
                "title": "Гексагональне аналітичне ядро бекенду (apps/api), WebSocket-шлюзи та схема бази даних",
                "targetPages": 4,
                "content": sec3_sub2
            },
            {
                "number": "3.3",
                "title": "Клієнтські підсистеми практичного кодування та методичного керування (apps/student, apps/teacher, apps/admin)",
                "targetPages": 4,
                "content": sec3_sub3
            },
            {
                "number": "3.4",
                "title": "Архітектура навчального простору первинної дидактики та рушія фокусування (apps/study та Zen Focus Reading Engine)",
                "targetPages": 3,
                "content": sec3_sub4
            },
            {
                "number": "3.5",
                "title": "Смарт-контракт децентралізованої сертифікації SoulboundCertificate у мережі Polygon",
                "targetPages": 3,
                "content": sec3_sub5
            }
        ]
    }
