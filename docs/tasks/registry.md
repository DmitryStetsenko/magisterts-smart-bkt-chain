# 📋 Реєстр Завдань та Епіків Проєкту (Tasks & Epics Registry)

Цей каталог містить повну структуру тасок проєкту Smart-BKT-Chain з прив'язкою до ідентифікаторів Jira (`SBC-XXX`), епіків та історії розробки.
Файл експорту в Jira: [`jira_import.csv`](file:///docs/tasks/jira_import.csv).

## 📊 Зведена статистика
| Епік | Назва | Кількість завдань |
| :--- | :--- | :---: |
| **`SBC-EP-INF`** | Monorepo & CI/CD Setup | 88 |
| **`SBC-EP-SH`** | Database Modeling & Shared Packages | 21 |
| **`SBC-EP-BK`** | Authentication & Core API | 14 |
| **`SBC-EP-BKT`** | Bayesian Knowledge Tracing & Behavioral Telemetry | 29 |
| **`SBC-EP-LLM`** | Automated Code Assessment & Open-Text Evaluation | 10 |
| **`SBC-EP-W3`** | Web3 Infrastructure & Smart Contracts | 0 |
| **`SBC-EP-ST`** | Student Portal & Skill Tree Map | 29 |
| **`SBC-EP-TC`** | Teacher Portal & Analytics CRM | 22 |
| **`SBC-EP-AD`** | Admin Portal & Knowledge DAG Builder | 8 |
| **`SBC-EP-LD`** | Landing Web Page | 9 |
| **ВСЬОГО** | - | **237** |

---

## 🎯 SBC-EP-INF: Monorepo & CI/CD Setup

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-1** | `Story` | `INF` | setup monorepo shell, compile script, next.js documentation site, and github actions pipeline | 2026-06-16 | `3794a89` |
| **SBC-2** | `Story` | `INF` | scaffold monorepo directories and package configurations for apps and packages | 2026-06-16 | `d3302b2` |
| **SBC-3** | `Story` | `INF` | split evolutionary roadmap into separate block and set as default active tab | 2026-06-16 | `361332e` |
| **SBC-4** | `Task` | `INF` | replace emojis with premium SVG icons in doc portal | 2026-06-16 | `92d4db2` |
| **SBC-5** | `Task` | `INF` | restore text labels for rationale subitems in doc portal | 2026-06-16 | `ff00a48` |
| **SBC-6** | `Bug` | `INF` | synchronize active phase states and fix light mode visibility in roadmap | 2026-06-17 | `170ae7c` |
| **SBC-7** | `Bug` | `INF` | make roadmap phase cards clickable to activate states | 2026-06-17 | `89b0944` |
| **SBC-8** | `Story` | `INF` | stretch content to full width and enhance roadmap steps with descriptions and active phase scrolling | 2026-06-17 | `30f79f4` |
| **SBC-9** | `Task` | `INF` | make sidebar wider with w-96 for better readability | 2026-06-17 | `6eee994` |
| **SBC-10** | `Task` | `INF` | remove left indent pl-12 from card contents for cleaner alignment | 2026-06-17 | `3b4e0eb` |
| **SBC-11** | `Story` | `INF` | improve markdown renderer to support tables, code blocks, italics and custom shorthand labels | 2026-06-17 | `3b66487` |
| **SBC-12** | `Story` | `INF` | fix light theme styling bugs and improve nested bold markdown rendering | 2026-06-17 | `aa73790` |
| **SBC-13** | `Story` | `INF` | resolve light/dark text contrast via React-controlled theme variables | 2026-06-17 | `c731bc9` |
| **SBC-14** | `Task` | `INF` | Update Next.js base path repository name to magisterts-smart-bkt-chain | 2026-06-17 | `d532133` |
| **SBC-15** | `Task` | `INF` | Fix ESLint hoisting error and remove unused parameter | 2026-06-17 | `a577777` |
| **SBC-16** | `Task` | `INF` | Consolidate to a single root lockfile, removing nested lockfile in apps/docs | 2026-06-17 | `aa70f8d` |
| **SBC-17** | `Bug` | `INF` | add cross-platform SWC binary optional dependencies for GH Pages build | 2026-06-17 | `748d03e` |
| **SBC-18** | `Bug` | `INF` | force webpack for next build on GH Pages | 2026-06-17 | `ea4b1dc` |
| **SBC-19** | `Bug` | `INF` | add lightningcss optional dependencies for cross-platform builds | 2026-06-17 | `4d746c4` |
| **SBC-20** | `Bug` | `INF` | add tailwind oxide optional dependencies for cross-platform builds | 2026-06-17 | `498b963` |
| **SBC-22** | `Task` | `INF` | update package-lock.json after workspace dependency installation | 2026-06-17 | `95c69c1` |
| **SBC-23** | `Story` | `INF` | make docs site sidebar responsive on mobile with a toggle button and backdrop | 2026-06-17 | `134c388` |
| **SBC-24** | `Bug` | `INF` | fix mobile layout header issues, update GitHub link, and add root README | 2026-06-17 | `248d91d` |
| **SBC-25** | `Task` | `INF` | perfectly center mobile vertical timeline line and markers | 2026-06-17 | `5af8458` |
| **SBC-26** | `Story` | `INF` | integrate react-markdown and fix compile_docs.py bold list stripping | 2026-06-17 | `16136a6` |
| **SBC-27** | `Bug` | `INF` | resolve markdown table rendering issues and timeline key-value double asterisk bugs | 2026-06-17 | `8509584` |
| **SBC-28** | `Task` | `INF` | make sidebar sticky on desktop layout | 2026-06-17 | `01142c0` |
| **SBC-29** | `Bug` | `INF` | filter out markdown divider items from rendering as empty cards | 2026-06-17 | `c183e1b` |
| **SBC-30** | `Story` | `INF` | migrate tab navigation to native Next.js App Router routes with trailing slash | 2026-06-17 | `b5bb05c` |
| **SBC-31** | `Story` | `INF` | create minimalist landing page for root route | 2026-06-17 | `e8bf7db` |
| **SBC-32** | `Bug` | `INF` | add home link to header logos | 2026-06-17 | `e25710c` |
| **SBC-33** | `Task` | `INF` | make navigation buttons uniform and add detailed concept section on landing page | 2026-06-17 | `484b991` |
| **SBC-34** | `Task` | `INF` | revert card headings 1 & 2 to original and rename heading 3 to 'Захищені Цифрові Сертифікати' | 2026-06-17 | `380e3d7` |
| **SBC-35** | `Task` | `INF` | remove domain names badge from landing page hero | 2026-06-17 | `a7c3ac4` |
| **SBC-36** | `Task` | `INF` | restructure docs app to FSD using views layer to avoid Next.js routing conflict | 2026-06-17 | `ac5b898` |
| **SBC-37** | `Task` | `INF` | integrate adaptive BKT and behavioral telemetry to roadmap and architecture | 2026-06-17 | `a7967f2` |
| **SBC-38** | `Task` | `INF` | update README with detailed capabilities | 2026-06-17 | `a3003e5` |
| **SBC-39** | `Task` | `INF` | remove domain name references from headers and descriptions | 2026-06-17 | `33c3b16` |
| **SBC-41** | `Task` | `INF` | highlight adaptive task sequencing feature in readme | 2026-06-17 | `623dc09` |
| **SBC-42** | `Task` | `INF` | swap features grid and detailed concept sections, update BKT feature to include sequencing | 2026-06-17 | `a859576` |
| **SBC-43** | `Task` | `INF` | swap card typography sizes between concept and core features sections | 2026-06-17 | `e13e021` |
| **SBC-47** | `Task` | `INF` | elevate concepts block language to academic/scientific level | 2026-06-17 | `78fc9af` |
| **SBC-48** | `Task` | `INF` | revert section title and description to original wording | 2026-06-17 | `4fe4242` |
| **SBC-50** | `Task` | `INF` | create daily progress log and record June 17 entry | 2026-06-17 | `18bfb4c` |
| **SBC-51** | `Task` | `INF` | save detailed 5-step master plan of action to daily progress log | 2026-06-17 | `6e22466` |
| **SBC-60** | `Task` | `INF` | sync all documentation source files and compiled JSON data for apps/docs site | 2026-10-02 | `5a93894` |
| **SBC-61** | `Bug` | `INF` | disable Next.js devIndicators rendering overlay badge in development mode | 2026-10-02 | `dd15a18` |
| **SBC-63** | `Task` | `INF` | update daily progress and detailed technical log for Micro-Step 5.1 completion | 2026-10-03 | `12646a3` |
| **SBC-64** | `Task` | `INF` | create workspace agent rules in .agents/AGENTS.md for mandatory progress logging and micro-steps | 2026-10-03 | `b854893` |
| **SBC-65** | `Task` | `INF` | document workspace agent rules location and mandatory progress logging procedures | 2026-10-03 | `001c132` |
| **SBC-72** | `Task` | `INF` | postpone Step 7 Web3 and prioritize system audit and testing | 2026-10-04 | `61d8162` |
| **SBC-79** | `Story` | `INF` | handle unstarted BKT state reset and document progress | 2026-10-04 | `be515b2` |
| **SBC-81** | `Bug` | `INF` | support exact array parameter display in test cases | 2026-10-04 | `381ce2e` |
| **SBC-90** | `Task` | `INF` | add mandatory E2E testing rule and document Playwright architecture strategy | 2026-10-04 | `360b0e9` |
| **SBC-97** | `Story` | `INF` | configure Playwright and implement end-to-end integration test flow | 2026-10-05 | `9eb455b` |
| **SBC-98** | `Bug` | `INF` | update test locators for admin port and modal confirm button | 2026-10-05 | `34d08dc` |
| **SBC-99** | `Task` | `INF` | update daily progress log and compile docs JSON for successful E2E execution | 2026-10-05 | `86a1bb3` |
| **SBC-101** | `Story` | `INF` | expand JavaScript course to 5 modules with 14 practical tasks and DAG dependencies | 2026-10-05 | `fd47c07` |
| **SBC-103** | `Task` | `INF` | update roadmap and project management architecture for multi-app role separation (step 1) | 2026-10-05 | `6eae314` |
| **SBC-107** | `Story` | `INF` | create public landing page app apps/landing on port 3001 (step 5) | 2026-10-05 | `d824fa6` |
| **SBC-108** | `Task` | `INF` | compile JSON documentation after multi-app portal separation | 2026-10-05 | `bf97780` |
| **SBC-109** | `Task` | `INF` | rename apps/landing to apps/web and update root package scripts and docs | 2026-10-05 | `e4626f1` |
| **SBC-110** | `Bug` | `INF` | disable experimental reactCompiler and fix dev script port to 3005 | 2026-10-05 | `a88658b` |
| **SBC-119** | `Bug` | `INF` | add page navigation fallback wait for dev server compilation | 2026-10-06 | `e0ef183` |
| **SBC-120** | `Task` | `INF` | verify multi-discipline UI flow in student and teacher portals with Playwright | 2026-10-06 | `a085ee4` |
| **SBC-121** | `Task` | `INF` | update daily progress log with E2E test verification success | 2026-10-06 | `4543c8a` |
| **SBC-124** | `Story` | `INF` | populate heterogeneous mixed task types (quizzes, essays, code) inside single course | 2026-10-06 | `8c471ab` |
| **SBC-127** | `Bug` | `INF` | prevent duplicate task recommendation and avoid BKT mastery inflation on repeat submissions | 2026-10-06 | `75a4068` |
| **SBC-128** | `Story` | `INF` | fix DAG sequencing locks, next task UX & add module task exhaustion reset modal | 2026-10-08 | `506c0c7` |
| **SBC-140** | `Task` | `INF` | update daily_progress log and recompile JSON artifacts | 2026-10-09 | `29154fa` |
| **SBC-142** | `Task` | `INF` | sync daily progress log for clean SkillDagMap header | 2026-10-09 | `5e68b8d` |
| **SBC-145** | `Task` | `INF` | update detailed technical implementation log and recompile JSON | 2026-10-09 | `0d0da55` |
| **SBC-147** | `Task` | `INF` | compile docs JSON for metrics icons and explanation modal | 2026-10-09 | `d7c54fe` |
| **SBC-149** | `Task` | `INF` | sync daily progress and compile docs JSON for compact metrics UI | 2026-10-09 | `42cd901` |
| **SBC-162** | `Task` | `INF` | document sidebar toggle-to-collapse standard | 2026-10-12 | `b0644f3` |
| **SBC-165** | `Task` | `INF` | document 3-state navigation model in daily progress | 2026-10-12 | `638ab84` |
| **SBC-169** | `Task` | `INF` | capture EdTech ecosystem vision and add ideation fidelity rule | 2026-10-13 | `2bb0bb8` |
| **SBC-170** | `Task` | `INF` | add technical platform architecture for EdTech ecosystem | 2026-10-13 | `a0eae07` |
| **SBC-186** | `Task` | `INF` | sync daily progress and implementation logs for UI unification and styling fixes | 2026-10-13 | `03e56e3` |
| **SBC-201** | `Task` | `INF` | verify review queue navigation in teacher portal | 2026-10-14 | `af7c405` |
| **SBC-203** | `Story` | `INF` | establish task registry, jira import csv and enforce jira conventional commits format | 2026-10-15 | `7821dce` |
| **SBC-204** | `Story` | `INF` | install git commit-msg hook and document commit workflow in project management docs | 2026-10-15 | `a6b8cb6` |
| **SBC-205** | `Task` | `INF` | make jira artifacts generator read dynamically from git log | 2026-10-15 | `529820b` |
| **SBC-206** | `Task` | `INF` | synchronize architecture docs, 10 epics specification, tech stack apps and roadmap phase statuses | 2026-10-15 | `34a4104` |
| **SBC-207** | `Task` | `INF` | sync tasks registry and jira import csv with sbc-206 | 2026-10-15 | `baab886` |
| **SBC-208** | `Bug` | `INF` | update package-lock and enhance github pages workflow for resilient ci | 2026-10-15 | `b11f87b` |
| **SBC-210** | `Task` | `INF` | sync task registry and jira import csv for sbc-209 | 2026-10-15 | `4994498` |
| **SBC-224** | `Task` | `INF` | log emoji removal and sync task registry and daily progress | 2026-10-19 | `52d9d9b` |

---

## 🎯 SBC-EP-SH: Database Modeling & Shared Packages

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-21** | `Story` | `SH` | add shared UI package with Storybook integration and update tech stack docs | 2026-06-17 | `ac208b6` |
| **SBC-52** | `Story` | `SH` | setup PostgreSQL Docker environment, Prisma schema and initial seed script | 2026-10-01 | `876cab2` |
| **SBC-53** | `Task` | `SH` | update daily progress log and root package.json for step 1 database completion | 2026-10-01 | `5a31655` |
| **SBC-54** | `Story` | `SH` | add db:seed root script and auto-load dotenv in database seed script | 2026-10-02 | `5d25414` |
| **SBC-57** | `Bug` | `SH` | fix TypeScript rootDir output and globalThis type assertion for CJS/NestJS import compatibility | 2026-10-02 | `0fd4cb8` |
| **SBC-123** | `Task` | `SH` | convert course selection tabs to scalable dropdown selectors in student and teacher portals | 2026-10-06 | `b5263ab` |
| **SBC-137** | `Story` | `SH` | unify teacher & admin apps into modular Opera-style Shell layout | 2026-10-09 | `0098983` |
| **SBC-139** | `Task` | `SH` | compact SkillDagMap nodes with overlapping connectors and fix non-scrolling drawer headers | 2026-10-09 | `f91a723` |
| **SBC-141** | `Bug` | `SH` | remove duplicated header title inside SkillDagMap component | 2026-10-09 | `e8fb3a5` |
| **SBC-146** | `Story` | `SH` | add icons and formula modal explanations to student metrics grid | 2026-10-09 | `b42d192` |
| **SBC-148** | `Task` | `SH` | compact Student Metrics Grid and BKT Heatmap cards | 2026-10-09 | `470a372` |
| **SBC-167** | `Story` | `SH` | unify navigation rail and sidebar state across student, teacher, and admin portals | 2026-10-12 | `b57bd6e` |
| **SBC-181** | `Bug` | `SH` | restrict bouncing icon animation to active or selected node only | 2026-10-13 | `a6f962c` |
| **SBC-183** | `Task` | `SH` | unify GameSkillTreeWidget and AnomalyTreeWidget in @sbc/ui package | 2026-10-13 | `5957a5a` |
| **SBC-184** | `Bug` | `SH` | restore original crystal node styles and add tailwind source path for shared ui | 2026-10-13 | `7e6b58b` |
| **SBC-185** | `Bug` | `SH` | remove excessive blurred selection halo from skill tree nodes | 2026-10-13 | `3b21c34` |
| **SBC-189** | `Story` | `SH` | extend Prisma schema with OPEN_TEXT, TeacherReviewStatus and semantic evaluation fields | 2026-10-14 | `2d0efad` |
| **SBC-232** | `Story` | `SH` | document authoring and pedagogical specification for multi-tier adaptive task bank | 2026-10-20 | `f4af440` |
| **SBC-233** | `Story` | `SH` | generate comprehensive 107-task adaptive bank across 5 JS modules adhering to authoring specification | 2026-10-20 | `f4af440` |
| **SBC-250** | `Story` | `SH` | integrate authoring Socratic hints and study unit deep linking into Task schema, seed data, and student UI | 2026-10-22 | `8185996` |
| **SBC-253** | `Story` | `SH` | expand multi-tier task bank with isomorphic blitzes, metaphors, Socratic hints and study deep-links | 2026-10-22 | `44d68a9` |
| **SBC-270** | `Story` | `SH` | seed school web algorithms course and task bank for informatics master research | 2026-10-24 | pending |

---

## 🎯 SBC-EP-BK: Authentication & Core API

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-55** | `Story` | `BK` | setup NestJS application frame with hexagonal architecture and Prisma ORM integration | 2026-10-02 | `dd0ddb5` |
| **SBC-56** | `Story` | `BK` | configure Swagger OpenAPI documentation UI at /api/v1/docs | 2026-10-02 | `2547878` |
| **SBC-58** | `Story` | `BK` | implement BKT Core Engine, TaskSequencer domain logic and Mini-Course seed with 100% unit test coverage | 2026-10-02 | `16fc9b3` |
| **SBC-59** | `Story` | `BK` | implement REST API, WebSockets Telemetry Gateway and create detailed technical implementation log | 2026-10-02 | `3f25fbc` |
| **SBC-73** | `Bug` | `BK` | fix VM test runner argument handling and seed test cases input format | 2026-10-04 | `231914c` |
| **SBC-74** | `Story` | `BK` | add real Promise/await resolution support to NestJS VM test runner | 2026-10-04 | `1bd05f3` |
| **SBC-75** | `Bug` | `BK` | fallback demo-student userId to active student BKT state in getStudentState | 2026-10-04 | `3b3a36c` |
| **SBC-78** | `Bug` | `BK` | fix TelemetrySession relation in resetStudentState Prisma query | 2026-10-04 | `06b29b4` |
| **SBC-89** | `Task` | `BK` | add unit tests for student analytics and telemetry reset state | 2026-10-04 | `f843665` |
| **SBC-112** | `Story` | `BK` | integrate BullMQ and Redis evaluation queue with EvaluationProcessor worker | 2026-10-05 | `34482e8` |
| **SBC-114** | `Story` | `BK` | add idempotency check to prevent duplicate BKT calculations for identical task code | 2026-10-05 | `410d37a` |
| **SBC-115** | `Bug` | `BK` | fallback to global tasks in TaskSequencer when all active skill tasks are completed | 2026-10-05 | `5c969e0` |
| **SBC-125** | `Bug` | `BK` | support const and let function declarations in VM runner | 2026-10-06 | `d5ac059` |
| **SBC-171** | `Story` | `BK` | add BehavioralAdjuster for dynamic Slip/Guess (Phase 2 step 1) | 2026-10-13 | `bd7526c` |

---

## 🎯 SBC-EP-BKT: Bayesian Knowledge Tracing & Behavioral Telemetry

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-40** | `Task` | `BKT` | document adaptive learning track and task sequencing | 2026-06-17 | `e7d9c8d` |
| **SBC-44** | `Task` | `BKT` | rewrite first concept card to highlight multi-factor adaptive learning (BKT + telemetry + assessments) | 2026-06-17 | `c6ce3de` |
| **SBC-85** | `Bug` | `BKT` | emit instant websocket telemetry on paste to calculate 100 percent copy paste ratio | 2026-10-04 | `4f723a6` |
| **SBC-91** | `Bug` | `BKT` | add multi-level paste event detection and WebSocket room fallback | 2026-10-04 | `aef06a8` |
| **SBC-93** | `Bug` | `BKT` | correct WPM calculation on paste and zero out typing speed for 100% copy-paste ratio | 2026-10-04 | `9555e49` |
| **SBC-94** | `Bug` | `BKT` | add 300ms deduplication threshold to handlePaste to ensure exact single paste count | 2026-10-04 | `e7d9887` |
| **SBC-95** | `Bug` | `BKT` | filter modifier keys and Ctrl/Cmd/Alt shortcuts from WPM keystroke counter | 2026-10-04 | `1a551e4` |
| **SBC-96** | `Task` | `BKT` | sync detailed implementation log with latest telemetry deduplication and WPM fixes | 2026-10-04 | `582d875` |
| **SBC-100** | `Task` | `BKT` | add specification for telemetry and analytical metrics | 2026-10-05 | `a56fd2d` |
| **SBC-102** | `Bug` | `BKT` | optimize socket.io transport to pure websocket to fix devtools console warning | 2026-10-05 | `3b5b260` |
| **SBC-116** | `Task` | `BKT` | add multi-modal neural telemetry AI concepts and telemetry fix | 2026-10-05 | `a36ba7c` |
| **SBC-129** | `Story` | `BKT` | add real-time WebSocket BKT reset synchronization for active student sessions | 2026-10-09 | `19869d6` |
| **SBC-150** | `Task` | `BKT` | document per-module telemetry concept and update roadmap & implementation log | 2026-10-09 | `29f7df1` |
| **SBC-151** | `Story` | `BKT` | implement per-module telemetry aggregation, course median calculation, and real-time behavioral profile upserts | 2026-10-10 | `d9f51eb` |
| **SBC-159** | `Task` | `BKT` | update daily progress and documentation data with inspector module telemetry | 2026-10-12 | `87dcc0f` |
| **SBC-172** | `Story` | `BKT` | integrate BehavioralAdjuster into evaluate endpoint and persist used parameters | 2026-10-13 | `a2d175e` |
| **SBC-173** | `Story` | `BKT` | separate telemetry display between student (silent) and teacher (detailed log) | 2026-10-13 | `0a16ca1` |
| **SBC-176** | `Story` | `BKT` | introduce standalone AnomalyRadarWidget with deep dive question audit and task navigation | 2026-10-13 | `c94fa52` |
| **SBC-177** | `Story` | `BKT` | implement hierarchical interactive AnomalyTreeWidget grouped by anomaly type and skill | 2026-10-13 | `46a3ac2` |
| **SBC-178** | `Story` | `BKT` | introduce multi-mode AnomalyTreeWidget with tree, graph and rpg views | 2026-10-13 | `dc79a64` |
| **SBC-179** | `Story` | `BKT` | add DAG module-based anomaly tree mode with hierarchical sibling branches | 2026-10-13 | `3d6223e` |
| **SBC-180** | `Story` | `BKT` | render full task titles, descriptions, and telemetry previews in anomaly trees and modal | 2026-10-13 | `84be699` |
| **SBC-198** | `Task` | `BKT` | log micro-step 7 keyword stuffing protection and telemetry integration | 2026-10-14 | `64a2e7f` |
| **SBC-202** | `Task` | `BKT` | add full open-text assessment pipeline and anomaly specification to telemetry_analytics.md | 2026-10-14 | `d8b755d` |
| **SBC-225** | `Task` | `BKT` | document scientific justification for cognitive latency threshold and rapid guessing in BKT | 2026-10-19 | `2f718c8` |
| **SBC-226** | `Task` | `BKT` | document scientific justification for multi-level mastery, adaptive difficulty scaling and cognitive cool-down | 2026-10-20 | `0f06a78` |
| **SBC-227** | `Story` | `BKT` | implement multi-tier JS task bank with topic/subConcept metadata, Bloom 0.75 threshold and adaptive TaskSequencer | 2026-10-20 | `0f06a78` |
| **SBC-241** | `Story` | `BKT` | restructure JS curriculum progression, topic-first sequencing order and universal VM script evaluation | 2026-10-21 | `54e0935` |
| **SBC-243** | `Story` | `BKT` | eliminate function wrappers from Module 1 tasks, introduce direct variable and expression exercises | 2026-10-21 | `pending` |
| **SBC-247** | `Bug` | `BKT` | prevent re-offering identical failed task on graceful degradation and supply auxiliary remediation task | 2026-10-22 | `9529263` |
| **SBC-249** | `Task` | `BKT` | document brainstorm session 07 on breaking adaptive deadlock, remediation looping and scaffolding | 2026-10-22 | `pending` |

---

## 🎯 SBC-EP-LLM: Automated Code Assessment & Open-Text Evaluation

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-111** | `Task` | `LLM` | detail Phase 3 AI evaluation & async queue architecture with Mermaid sequence diagram | 2026-10-05 | `902249f` |
| **SBC-118** | `Story` | `LLM` | implement universal polyglot BKT evaluation engine and multi-course UI | 2026-10-06 | `37964d6` |
| **SBC-168** | `Task` | `LLM` | initialize brainstorm hub and document session 01 on multi-task mastery evaluation and telemetry | 2026-10-12 | `20d13cf` |
| **SBC-187** | `Task` | `LLM` | specify multi-tier semantic evaluation pipeline for open-ended questions | 2026-10-14 | `8c0bdc9` |
| **SBC-188** | `Story` | `LLM` | add OpenTextHeuristicEvaluator and integrate open-text telemetry into BehavioralAdjuster | 2026-10-14 | `300b428` |
| **SBC-190** | `Story` | `LLM` | implement OpenAnswerEvaluatorService orchestrator and integrate with BktController | 2026-10-14 | `7c52224` |
| **SBC-191** | `Bug` | `LLM` | reject gibberish input and seed Event Loop rubric | 2026-10-14 | `8f87102` |
| **SBC-192** | `Task` | `LLM` | update daily progress and detailed log for gibberish filter fix | 2026-10-14 | `7268459` |
| **SBC-197** | `Bug` | `LLM` | prevent keyword stuffing and connect essay telemetry to BKT adjuster | 2026-10-14 | `3f9d9f6` |
| **SBC-199** | `Bug` | `LLM` | block looping phrase spam and route high-paste submissions to teacher review queue | 2026-10-14 | `ed21a27` |

---

## 🎯 SBC-EP-W3: Web3 Infrastructure & Smart Contracts

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |

---

## 🎯 SBC-EP-ST: Student Portal & Skill Tree Map

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-83** | `Story` | `ST` | connect live student analytics endpoint and telemetry calculation | 2026-10-04 | `46c074a` |
| **SBC-84** | `Bug` | `ST` | sync student profile name and eliminate initial mock data flash | 2026-10-04 | `fcee9d4` |
| **SBC-86** | `Bug` | `ST` | ensure exact zero values in analytics for reset student state | 2026-10-04 | `a8b0947` |
| **SBC-104** | `Story` | `ST` | rename apps/web to apps/student and update workspace scripts (step 2) | 2026-10-05 | `03209db` |
| **SBC-113** | `Bug` | `ST` | enhance Deletes telemetry detection for Backspace, Delete keys and selection range removals | 2026-10-05 | `150c144` |
| **SBC-126** | `Bug` | `ST` | sync active module highlighting and fallback student resolution for BKT state | 2026-10-06 | `fcffc10` |
| **SBC-131** | `Task` | `ST` | redesign layout into sticky top nav with collapsible task sidebar and skill graph | 2026-10-09 | `2118d7e` |
| **SBC-132** | `Story` | `ST` | implement unified Opera-style vertical icon rail and expandable drawers shell | 2026-10-09 | `1a5f03a` |
| **SBC-133** | `Task` | `ST` | replace text close button with minimalist X icon in side drawer header | 2026-10-09 | `bdc575a` |
| **SBC-134** | `Task` | `ST` | replace settings icon with gear and move external apps block to bottom of icon rail | 2026-10-09 | `a489708` |
| **SBC-135** | `Task` | `ST` | add horizontal separator after settings block in vertical icon rail | 2026-10-09 | `3988d27` |
| **SBC-136** | `Task` | `ST` | position settings block at very bottom of vertical icon rail with preceding separator | 2026-10-09 | `f903170` |
| **SBC-138** | `Task` | `ST` | reorient SkillDagMap into clean vertical flow with down arrows inside side drawer | 2026-10-09 | `e3b6580` |
| **SBC-152** | `Story` | `ST` | implement RPG-style GameSkillTreeWidget with interactive power rays, player levels, and quest cards | 2026-10-11 | `00ca1d6` |
| **SBC-153** | `Bug` | `ST` | improve RPG Level badge layout and text alignment | 2026-10-11 | `80c1a43` |
| **SBC-154** | `Story` | `ST` | display GameSkillTree on main canvas with node details in side drawer including locked status inspection | 2026-10-11 | `9c87f2e` |
| **SBC-155** | `Bug` | `ST` | make rail navigation tabs mutually exclusive to prevent dual active highlight | 2026-10-11 | `3d1bdfc` |
| **SBC-161** | `Story` | `ST` | allow clicking active task icon to toggle close sidebar drawer and stretch main canvas | 2026-10-12 | `72c82f6` |
| **SBC-163** | `Bug` | `ST` | keep main view when toggling sidebar drawer on and off | 2026-10-12 | `4a283d0` |
| **SBC-164** | `Story` | `ST` | implement full 3-state navigation model (open, collapsed full-width canvas, tab switch) | 2026-10-12 | `b6192c0` |
| **SBC-166** | `Bug` | `ST` | unify activeTab and isDrawerOpen navigation state to preserve selected tab highlight on sidebar collapse | 2026-10-12 | `f6168cc` |
| **SBC-174** | `Story` | `ST` | display telemetry anomalies and adjustment history in student RPG tree inspector | 2026-10-13 | `636edfb` |
| **SBC-175** | `Task` | `ST` | document telemetry anomalies, latency thresholds, and skill tree indicators | 2026-10-13 | `0019273` |
| **SBC-182** | `Story` | `ST` | add anomaly tree view toggle to student skill tree widget | 2026-10-13 | `dfde3e5` |
| **SBC-193** | `Story` | `ST` | display semantic rubric breakdown and teacher review status | 2026-10-14 | `9ac1768` |
| **SBC-194** | `Task` | `ST` | log micro-step 5 student semantic rubric UI | 2026-10-14 | `8c19e4a` |
| **SBC-216** | `Story` | `ST` | implement attempt history tab in student task drawer with teacher feedback and live review decision synchronization | 2026-10-19 | `1e201d7` |
| **SBC-230** | `Story` | `ST` | implement top adaptive degradation notice banner with score cap and remove confusing per-task difficulty badges | 2026-10-20 | `e612f0a` |
| **SBC-244** | `Story` | `ST` | add deterministic options shuffling with letter markers in QuizTaskEditor | 2026-10-21 | `35ad827` |
| **SBC-245** | `Story` | `ST` | add adaptive difficulty degradation prompt button to evaluation toast | 2026-10-21 | `22479aa` |
| **SBC-246** | `Story` | `ST` | add prominent course and module progress indicators to student header and workspace HUD | 2026-10-22 | `9fab206` |
| **SBC-248** | `Style` | `ST` | replace bulky degradation text badge with compact message icon and interactive explanation tooltip | 2026-10-22 | `560e622` |
| **SBC-252** | `Story` | `ST` | hide Socratic hints and study unit deep-link on clean initial attempts and show conditionally upon struggle | 2026-10-22 | `81c4829` |
| **SBC-269** | `Fix` | `ST` | persistently display and highlight selected quiz answer upon submission | 2026-10-23 | `27eb4ae` |

---

## 🎯 SBC-EP-TC: Teacher Portal & Analytics CRM

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-45** | `Task` | `TC` | soften language in hybrid assessment card to emphasize workload reduction for teachers | 2026-06-17 | `a1d9f4f` |
| **SBC-46** | `Task` | `TC` | update hybrid assessment card to include latest LLM models and teacher review for controversial cases | 2026-06-17 | `02628d6` |
| **SBC-49** | `Task` | `TC` | revert card 3 to original, update card 2 description to emphasize teacher is only involved when strictly necessary | 2026-06-17 | `ba343d6` |
| **SBC-105** | `Story` | `TC` | extract teacher portal to apps/teacher with port 3003 (step 3) | 2026-10-05 | `484a771` |
| **SBC-130** | `Story` | `TC` | add reusable CourseOverviewWidget for course hierarchy & question inspection | 2026-10-09 | `2211100` |
| **SBC-143** | `Story` | `TC` | implement list in drawer and detail on main screen pattern for students and course map | 2026-10-09 | `16101d9` |
| **SBC-144** | `Task` | `TC` | compile docs JSON for teacher portal list-detail refactor | 2026-10-09 | `d868466` |
| **SBC-156** | `Story` | `TC` | integrate student game skill tree view in teacher portal | 2026-10-11 | `ffc617b` |
| **SBC-157** | `Task` | `TC` | update daily progress and compiled docs json with teacher skill tree | 2026-10-11 | `90f00d7` |
| **SBC-158** | `Story` | `TC` | display per-module telemetry stats and navigation button in skill tree inspector panel | 2026-10-12 | `2c32b52` |
| **SBC-160** | `Bug` | `TC` | keep skill tree view active on node click and inspect module stats in right sidebar | 2026-10-12 | `82739da` |
| **SBC-195** | `Story` | `TC` | human-in-the-loop review queue for open text answers | 2026-10-14 | `9e43565` |
| **SBC-196** | `Task` | `TC` | log micro-step 6 teacher review queue and recompile docs portal | 2026-10-14 | `a581cbe` |
| **SBC-200** | `Task` | `TC` | log micro-step 8 phrase looping spam protection and teacher review routing | 2026-10-14 | `36d68b2` |
| **SBC-209** | `Bug` | `TC` | filter teacher review queue submissions by course slug relation | 2026-10-15 | `52a8355` |
| **SBC-211** | `Task` | `TC` | document brainstorm session 05 on review queue deduplication and history | 2026-10-15 | `edcab54` |
| **SBC-212** | `Story` | `TC` | implement teacher review queue deduplication with submission versioning and attempts history | 2026-10-16 | `8e73ef1` |
| **SBC-213** | `Bug` | `TC` | auto-refresh teacher review queue on student state reset via WebSocket and handler | 2026-10-16 | `b78f44a` |
| **SBC-214** | `Story` | `TC` | real-time bidirectional WebSocket synchronization of student submissions and teacher review decisions | 2026-10-17 | `2ed2cea` |
| **SBC-215** | `Task` | `INF` | update daily progress, detailed technical log and compile docs json for real-time sync | 2026-10-17 | `3b34dad` |
| **SBC-218** | `Story` | `TC` | implement teacher reviewed submissions archive filter in review queue with decision history inspection | 2026-10-19 | `f3073b0` |
| **SBC-219** | `Task` | `INF` | update daily progress, detailed technical log, scope baseline and compile docs json for teacher review archive | 2026-10-19 | `a1d2109` |
| **SBC-220** | Task | TC | document brainstorm session 06 on anomaly tree refactoring into role-configurable category widget | 2026-10-19 | 82694f |
| **SBC-221** | Story | TC | refactor anomaly tree into clean role-configurable categories accordion and remove redundant sub-tabs | 2026-10-19 | 5267cb4 |
| **SBC-223** | `Style` | `TC` | remove duplicate emojis and enforce clean SVG icons in skill and anomaly tree navigation | 2026-10-19 | `05de2b7` |
| **SBC-228** | `Story` | `TC` | move student selector to searchable top-bar dropdown in teacher portal and collapse redundant side drawer | 2026-10-20 | `39bbe31` |
| **SBC-229** | `Story` | `TC` | implement cohort mastery distribution and live risk feed widgets in teacher analytics side drawer | 2026-10-20 | `e612f0a` |
| **SBC-234** | `Story` | `TC` | implement interactive CourseGraphViewer with topic hierarchy, subconcepts, and cognitive triad matrix in teacher portal | 2026-10-20 | `b607a94` |
| **SBC-235** | `Story` | `TC` | redesign CourseGraphViewer into visual branching skill tree with SVG curves, topic triads, and RPG aesthetic | 2026-10-20 | `7101f6c` |
| **SBC-236** | `Bug` | `TC` | fix difficulty selection filter and search reactivity in CourseGraphViewer tree and matrix views | 2026-10-20 | `0bdb30b` |
| **SBC-237** | `Story` | `TC` | transform redundant coursemap side drawer into Pedagogical Audit, Triad Balance, and Task Inspector panel | 2026-10-20 | `6079470` |
| **SBC-238** | `Story` | `TC` | convert task inspector into sliding right-hand drawer to keep skill tree canvas unobstructed | 2026-10-20 | `5d3469c` |
| **SBC-239** | `Style` | `TC` | remove screen blur, place sliding drawer below top header with smooth slideInRight animation | 2026-10-20 | `7437a3b` |
| **SBC-240** | `Refactor` | `TC` | eliminate duplicate task inspector from left sidebar, keep dedicated right drawer for inspection | 2026-10-20 | `c67f550` |
| **SBC-254** | `Story` | `TC` | implement BKT metric verification and calculation audit sandbox in teacher portal | 2026-10-22 | `90da67f` |
| **SBC-255** | `Story` | `TC` | implement interactive click-to-explain deep dive inspection modals for BKT math components in teacher portal | 2026-10-23 | `78d3b7f` |
| **SBC-256** | `Story` | `TC` | implement comprehensive adaptive mechanisms registry in teacher portal audit module | 2026-10-23 | `80bc521` |
| **SBC-257** | `Story` | `TC` | separate student-specific and global system audit tabs and side drawer sections | 2026-10-23 | `c05e25f` |
| **SBC-258** | `Style` | `TC` | position general tools section first in teacher metrics audit side drawer | 2026-10-23 | `3d65b18` |
| **SBC-259** | `Story` | `TC` | implement collapsible accordions for general tools and student list in metrics audit drawer | 2026-10-23 | `0e4c47f` |
| **SBC-260** | `Style` | `TC` | remove outer section borders and use minimalist plus-minus collapse toggles in audit drawer | 2026-10-23 | `6434d90` |
| **SBC-261** | `Style` | `TC` | replace text toggles with enlarged Lucide Plus and Minus icons in drawer sections | 2026-10-23 | `64f80b2` |
| **SBC-262** | `Task` | `INF` | establish Rule 7 for Side Drawer Sections Standard in workspace rules and docs | 2026-10-23 | `5e24e23` |
| **SBC-263** | `Style` | `TC` | unify Analytics and CourseMap drawer sections to Rule 7 borderless accordion standard | 2026-10-23 | `afad77f` |
| **SBC-264** | `Style` | `TC` | create reusable DrawerSection in @sbc/ui and refactor Reviews and Settings drawers to Rule 7 | 2026-10-23 | `8abc0fc` |
| **SBC-265** | `Chore` | `INF` | formalize Drawer Container and Mandatory DrawerSection Architecture in Rule 7 | 2026-10-23 | `a3077db` |
| **SBC-266** | `Style` | `ST` | refactor Student Portal drawer to Rule 7 DrawerSection architecture | 2026-10-23 | `2166713` |
| **SBC-267** | `Docs` | `BKT` | document BKT error decay dynamics and Lower Bound Asymptote across docs and teacher inspector | 2026-10-23 | `168be44` |
| **SBC-268** | `Fix` | `BKT` | prevent repeated submission spamming and duplicate BKT score inflation | 2026-10-23 | `738bad0` |

---

## 🎯 SBC-EP-AD: Admin Portal & Knowledge DAG Builder

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-69** | `Story` | `AD` | init Next.js 16 admin app and update progress logs | 2026-10-03 | `d7c3062` |
| **SBC-70** | `Story` | `AD` | build interactive Skill DAG editor and BKT parameters tuning form | 2026-10-03 | `8c7fb8f` |
| **SBC-71** | `Story` | `AD` | build student analytics table and BKT heatmap | 2026-10-03 | `9fae1d0` |
| **SBC-77** | `Story` | `AD` | add experimental BKT state & submission history reset feature | 2026-10-04 | `b90ff78` |
| **SBC-92** | `Bug` | `AD` | replace window.confirm with custom React modal for reset action | 2026-10-04 | `ef01cae` |
| **SBC-106** | `Story` | `AD` | transform apps/admin into System CMS dashboard on port 3004 (step 4) | 2026-10-05 | `b2f6e4d` |
| **SBC-117** | `Story` | `AD` | move Skill DAG Editor to apps/admin and decouple teacher portal analytics | 2026-10-06 | `f867055` |
| **SBC-122** | `Story` | `AD` | implement dynamic course manager CMS and API creation endpoint | 2026-10-06 | `bf10d19` |

---

## 🎯 SBC-EP-LD: Landing Web Page

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-62** | `Story` | `LD` | initialize Next.js 16 student client frame with TailwindCSS v4 in apps/web (Micro-Step 5.1) | 2026-10-03 | `7da7ee2` |
| **SBC-66** | `Story` | `LD` | implement Monaco Code Editor with behavioral telemetry hook and REST evaluation integration (Micro-Step 5.2) | 2026-10-03 | `db51cda` |
| **SBC-67** | `Story` | `LD` | implement interactive Skill DAG Graph visualization component (Micro-Step 5.3) | 2026-10-03 | `d39f1c4` |
| **SBC-68** | `Story` | `LD` | verify live BKT evaluation and update progress logs | 2026-10-03 | `9b6c661` |
| **SBC-76** | `Story` | `LD` | add active student profile badge in Student Portal header | 2026-10-04 | `99644c6` |
| **SBC-80** | `Bug` | `LD` | improve test case arguments display formatting and log changes | 2026-10-04 | `66b738c` |
| **SBC-82** | `Bug` | `LD` | auto refresh recommended task on ACCEPTED submission status | 2026-10-04 | `104da6d` |
| **SBC-87** | `Bug` | `LD` | disable automatic task transition on ACCEPTED submission status | 2026-10-04 | `abf03e3` |
| **SBC-88** | `Bug` | `LD` | add content change fallback for robust monaco paste detection | 2026-10-04 | `7ff7dbd` |

---

