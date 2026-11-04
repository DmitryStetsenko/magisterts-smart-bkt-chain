# 🧠 Brainstorm: База Ідей та Архітектурних Дискусій (Brainstorm Knowledge Hub)

Цей каталог призначений для фіксації результатів мозкових штурмів, концептуальних гіпотез, обговорення математичних моделей BKT, гейміфікації та архітектури комплексу **Smart-BKT-Chain**.

---

## 🗂️ Зміст сесій та тематичних досліджень

1. [01. Оцінювання Засвоєння Теми за Різними Типами Завдань та Телеметрією](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/01_evaluating_mastery_across_task_types.md)
   - *Дата:* 12 жовтня 2026
   - *Ключові теми:* Динамічні $P(G)$ та $P(S)$, когнітивний спектр типів задач (Single/Multi Choice, Code VM, Essay), коефіцієнт достовірності телеметрії ($\alpha$), триангуляція оцінки теми.

2. [02. Трансформація у Повноцінну EdTech-Екосистему](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/02_edtech_ecosystem_vision.md)
   - *Дата:* 13 жовтня 2026
   - *Ключові теми:* Just-in-Time теорія та інтервенції, Socratic AI-тьютор, RPG Skill Tree гейміфікація, Teacher Co-Pilot (пульс аудиторії), Proof-of-Competence без списування.

3. [03. Суто Технічна Архітектура EdTech-Платформи](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/03_technical_edtech_platform_architecture.md)
   - *Дата:* 13 жовтня 2026
   - *Ключові теми:* Реалізація у монорепозиторії, LearningSessionEngine (FSM), InterventionRouter, SocraticScaffoldingService, TelemetryIntegrityEngine (WPM/Burstiness), Prisma схема, Split-Screen Monaco, Live Classroom WebSocket.

4. [04. Семантична Перевірка Відкритих Текстових Відповідей та BKT](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/04_open_ended_questions_semantic_eval.md)
   - *Дата:* 14 жовтня 2026
   - *Ключові теми:* Багаторівневий пайплайн (Tier 1 Heuristics → Tier 2 Embeddings → Tier 3 LLM Judge), оцінка рубрик (Rubrics), інтеграція з телеметрією друку (paste events, WPM, hesitation), Soft-BKT зважування, Human-in-the-Loop в кабінеті викладача.

5. [05. Дедуплікація, Історія Версій та Еволюція Спроб у Черзі Перевірки Викладача](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/05_review_queue_deduplication_and_history.md)
   - *Дата:* 15 жовтня 2026
   - *Ключові теми:* Дедуплікація черги викладача, авто-заміщення спроб (superseding), таймлайн та семантичний Diff версій у ReviewQueueInspector, захист від спаму повторних відправок студентом.

6. [06. Рефакторинг та Спрощення Віджета Аномалій — Єдиний Конфігурований Віджет за Категоріями для Студента та Викладача](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/06_anomaly_tree_refactoring_categories_widget.md)
   - *Дата:* 19 жовтня 2026
   - *Ключові теми:* Ліквідація зайвих 4 підвкладок (DAG, Руни), відмова від 3-рівневих акордеонів, 4 чисті смислові категорії аномалій (Буфер обміну, Спідран, Семантичний спам, Когнітивне тертя), пропси та рольова конфігурація `AnomalyCategoriesWidget` для `student` та `teacher`.

7. [07. Порушення «Адаптивного Тупика» (Breaking the Adaptive Deadlock & Remediation Scaffolding)](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/07_breaking_adaptive_deadlock_and_scaffolding.md)
   - *Дата:* 22 жовтня 2026
   - *Ключові теми:* Подолання замкненого кола деградації завдань (The Frustration Loop), Scaffolding замість екзаменатора, мікро-теорія Just-in-Time, розбір типових помилок (Distractor Feedback), Human-in-the-Loop ескалація до викладача, тактичний відступ за графом передумов (DAG Backtracking), Cognitive Cool-Down та паркування завдань.

8. [08. Від Системи Оцінювання до Системи Адаптивного Навчання (Adaptive Learning Paradigm & Cross-App Contracts)](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/08_adaptive_learning_paradigm_and_cross_app_contracts.md)
   - *Дата:* 26 жовтня 2026
   - *Ключові теми:* Подолання пастки «розумного термометра» (Computerized Adaptive Testing vs Intelligent Tutoring System), відповідність букві й духу магістерського паспорта, збереження стабільного ядра та розширення монорепозиторію, повноцінне оживлення пакета `@sbc/types` (Shared Domain Contracts), еволюція навчального шару (картки теорії, Misconception Feedback, Parsons Problems) та Web3 Proof-of-Competence.

9. [09. Концепція Повного Гайду Платформи та Каталогу Застосунків (Master Guide & Ecosystem Apps Handbook)](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/09_complete_platform_handbook_and_guide_concept.md)
   - *Дата:* 28 жовтня 2026
   - *Ключові теми:* Єдиний наскрізний посібник платформи з 7 модулів, окремий вичерпний каталог усіх 5 застосунків екосистеми (`apps/study`, `apps/student`, `apps/teacher`, `apps/admin`, `apps/api`), рольові керівництва учня/вчителя/методиста, математичний апарат BKT та нижня асимптота, смартконтракти dNFT, FSD-архітектура та стандарти розробки.

10. [10. Архітектура та Науково-Практична Проекція Монорепозиторію в Специфікацію Магістерської Дисертації (`thesis_spec.json`)](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/10_thesis_spec_scientific_architecture.md)
    - *Дата:* 29 жовтня 2026
    - *Ключові теми:* Принцип єдиного джерела істини (Single Source of Truth), класифікація аналогів за 4 класами з виявленням сліпих зон (CTT, пастка термометра, спідран, copy-paste), математичний рушій BKT з регуляторами $P(S)$ та $P(G)$, нижня асимптота знань ($P_{\min}=0.05$), інтегральний індекс $C_{\text{trust}}$ та 4 класи аномалій, подолання адаптивного тупика (DAG Backtracking + Scaffolding), рольовий розподіл 5 застосунків екосистеми, зменшення RMSE з 0.382 до 0.214 та підтвердження через Soulbound dNFT.

11. [11. Стратегія Адаптивної Траєкторії: Шлюз Компетентності та Розмежування Ролей Підручника й Тренажера](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/11_adaptive_learning_path_strategy.md)
    - *Дата:* 1 листопада 2026
    - *Ключові теми:* Розмежування зон відповідальності: `apps/study` як бездистракційний Zen Focus підручник без тривожності оцінювання, `apps/student` як повноцінне середовище калібрування BKT та телеметрії; шлюз підтвердження компетенцій (Competency Verification Gateway) з порогом $P(L_n) \ge 0.85$ для розблокування наступних розділів; беклог режиму Test-Out (`SBC-311`).

12. [12. Архітектура Семантичної Маршрутизації та SEO для Next.js App Router](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/12_seo_routing_architecture.md)
    - *Дата:* 1 листопада 2026
    - *Ключові теми:* Впровадження вкладених семантичних URL замість односторінкового `useState` (`/courses/[courseSlug]/[moduleSlug]/[unitSlug]` та `/practice/[courseSlug]/[skillSlug]`); динамічні SEO метадані `generateMetadata`, статична генерація `generateStaticParams`, Schema.org JSON-LD; протокол міжпортальних глибоких посилань (Cross-App Deep Linking Protocol) між навчальними сервісами.


13. [13. Оптимізація та Декомпозиція Хедера Платформи (Header De-cluttering & Scope Architecture)](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/13_header_decluttering_and_scope_architecture.md)
    - *Дата:* 4 листопада 2026
    - *Ключові теми:* Усунення перевантаження та змішування контекстів (Scope Bleed), ліквідація дублювання назв курсів і модулів, розведення на Top App Header, Workspace Sub-Header та Drawer, інтерактивні мікро-поповери (Pills), перенесення профілю у правий сектор.

14. [14. Відповідність Проєкту Офіційно Затвердженій Темі Магістерської Роботи та Архітектура ШІ для Персоналізації](file:///d:/PROJECTS/MAGISTERS/SMART-BKT-CHAIN/docs/brainstorm/14_thesis_topic_alignment_and_ai_architecture.md)
    - *Дата:* 4 листопада 2026
    - *Ключові теми:* Семантичний мапінг офіційно затвердженої теми наказу («Розробка навчальної онлайн-платформи з використанням штучного інтелекту для персоналізації освітніх траєкторій»); наукове обґрунтування BKT (HMM / Dynamic Bayesian Networks) та динамічного секвенування (Automated Planning) як фундаментального ШІ (Explainable AI); архітектура мок-адаптерів для генеративних LLM (Gemini API); план реструктуризації акцентів дисертації.

