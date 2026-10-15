# 📋 Реєстр Завдань та Епіків Проєкту (Tasks & Epics Registry)

Цей каталог містить повну структуру тасок проєкту Smart-BKT-Chain з прив'язкою до ідентифікаторів Jira (`SBC-XXX`), епіків та історії розробки.
Файл експорту в Jira: [`jira_import.csv`](file:///docs/tasks/jira_import.csv).

## 📊 Зведена статистика
| Епік | Назва | Кількість завдань |
| :--- | :--- | :---: |
| **`SBC-EP-INF`** | Monorepo & CI/CD Setup | 80 |
| **`SBC-EP-SH`** | Database Modeling & Shared Packages | 17 |
| **`SBC-EP-BK`** | Authentication & Core API | 14 |
| **`SBC-EP-BKT`** | Bayesian Knowledge Tracing & Behavioral Telemetry | 24 |
| **`SBC-EP-LLM`** | Automated Code Assessment & Open-Text Evaluation | 10 |
| **`SBC-EP-W3`** | Web3 Infrastructure & Smart Contracts | 0 |
| **`SBC-EP-ST`** | Student Portal & Skill Tree Map | 26 |
| **`SBC-EP-TC`** | Teacher Portal & Analytics CRM | 14 |
| **`SBC-EP-AD`** | Admin Portal & Knowledge DAG Builder | 8 |
| **`SBC-EP-LD`** | Landing Web Page | 9 |
| **ВСЬОГО** | - | **202** |

---

## 🎯 SBC-EP-INF: Monorepo & CI/CD Setup

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-1** | `Story` | `INF` | setup monorepo shell, compile script, next.js documentation site, and github actions pipeline | 2026-06-16 | `0d0e791` |
| **SBC-2** | `Story` | `INF` | scaffold monorepo directories and package configurations for apps and packages | 2026-06-16 | `186c739` |
| **SBC-3** | `Story` | `INF` | split evolutionary roadmap into separate block and set as default active tab | 2026-06-16 | `c970901` |
| **SBC-4** | `Task` | `INF` | replace emojis with premium SVG icons in doc portal | 2026-06-16 | `d1f900b` |
| **SBC-5** | `Task` | `INF` | restore text labels for rationale subitems in doc portal | 2026-06-16 | `07a0265` |
| **SBC-6** | `Bug` | `INF` | synchronize active phase states and fix light mode visibility in roadmap | 2026-06-17 | `56329f4` |
| **SBC-7** | `Bug` | `INF` | make roadmap phase cards clickable to activate states | 2026-06-17 | `62b9b86` |
| **SBC-8** | `Story` | `INF` | stretch content to full width and enhance roadmap steps with descriptions and active phase scrolling | 2026-06-17 | `78c7c07` |
| **SBC-9** | `Task` | `INF` | make sidebar wider with w-96 for better readability | 2026-06-17 | `7e4f2cf` |
| **SBC-10** | `Task` | `INF` | remove left indent pl-12 from card contents for cleaner alignment | 2026-06-17 | `d71b1db` |
| **SBC-11** | `Story` | `INF` | improve markdown renderer to support tables, code blocks, italics and custom shorthand labels | 2026-06-17 | `faab2c9` |
| **SBC-12** | `Story` | `INF` | fix light theme styling bugs and improve nested bold markdown rendering | 2026-06-17 | `6b134a7` |
| **SBC-13** | `Story` | `INF` | resolve light/dark text contrast via React-controlled theme variables | 2026-06-17 | `f95d909` |
| **SBC-14** | `Task` | `INF` | Update Next.js base path repository name to magisterts-smart-bkt-chain | 2026-06-17 | `636c48d` |
| **SBC-15** | `Task` | `INF` | Fix ESLint hoisting error and remove unused parameter | 2026-06-17 | `ed6b751` |
| **SBC-16** | `Task` | `INF` | Consolidate to a single root lockfile, removing nested lockfile in apps/docs | 2026-06-17 | `a2cb3a7` |
| **SBC-17** | `Bug` | `INF` | add cross-platform SWC binary optional dependencies for GH Pages build | 2026-06-17 | `7dc2b68` |
| **SBC-18** | `Bug` | `INF` | force webpack for next build on GH Pages | 2026-06-17 | `dfe3a22` |
| **SBC-19** | `Bug` | `INF` | add lightningcss optional dependencies for cross-platform builds | 2026-06-17 | `4963036` |
| **SBC-20** | `Bug` | `INF` | add tailwind oxide optional dependencies for cross-platform builds | 2026-06-17 | `7f90679` |
| **SBC-22** | `Task` | `INF` | update package-lock.json after workspace dependency installation | 2026-06-17 | `70a2b7f` |
| **SBC-23** | `Story` | `INF` | make docs site sidebar responsive on mobile with a toggle button and backdrop | 2026-06-17 | `7e0baaa` |
| **SBC-24** | `Bug` | `INF` | fix mobile layout header issues, update GitHub link, and add root README | 2026-06-17 | `242e50f` |
| **SBC-25** | `Task` | `INF` | perfectly center mobile vertical timeline line and markers | 2026-06-17 | `d68a93b` |
| **SBC-26** | `Story` | `INF` | integrate react-markdown and fix compile_docs.py bold list stripping | 2026-06-17 | `b740533` |
| **SBC-27** | `Bug` | `INF` | resolve markdown table rendering issues and timeline key-value double asterisk bugs | 2026-06-17 | `bffb64b` |
| **SBC-28** | `Task` | `INF` | make sidebar sticky on desktop layout | 2026-06-17 | `e6f1988` |
| **SBC-29** | `Bug` | `INF` | filter out markdown divider items from rendering as empty cards | 2026-06-17 | `d6252eb` |
| **SBC-30** | `Story` | `INF` | migrate tab navigation to native Next.js App Router routes with trailing slash | 2026-06-17 | `93e7340` |
| **SBC-31** | `Story` | `INF` | create minimalist landing page for root route | 2026-06-17 | `bf434a6` |
| **SBC-32** | `Bug` | `INF` | add home link to header logos | 2026-06-17 | `0dd0d79` |
| **SBC-33** | `Task` | `INF` | make navigation buttons uniform and add detailed concept section on landing page | 2026-06-17 | `36ee340` |
| **SBC-34** | `Task` | `INF` | revert card headings 1 & 2 to original and rename heading 3 to 'Захищені Цифрові Сертифікати' | 2026-06-17 | `4472d9c` |
| **SBC-35** | `Task` | `INF` | remove domain names badge from landing page hero | 2026-06-17 | `7d43b8e` |
| **SBC-36** | `Task` | `INF` | restructure docs app to FSD using views layer to avoid Next.js routing conflict | 2026-06-17 | `bf27b76` |
| **SBC-37** | `Task` | `INF` | integrate adaptive BKT and behavioral telemetry to roadmap and architecture | 2026-06-17 | `a63d7e5` |
| **SBC-38** | `Task` | `INF` | update README with detailed capabilities | 2026-06-17 | `a377d96` |
| **SBC-39** | `Task` | `INF` | remove domain name references from headers and descriptions | 2026-06-17 | `279ff47` |
| **SBC-41** | `Task` | `INF` | highlight adaptive task sequencing feature in readme | 2026-06-17 | `2aacbb2` |
| **SBC-42** | `Task` | `INF` | swap features grid and detailed concept sections, update BKT feature to include sequencing | 2026-06-17 | `21e65b7` |
| **SBC-43** | `Task` | `INF` | swap card typography sizes between concept and core features sections | 2026-06-17 | `a32f403` |
| **SBC-47** | `Task` | `INF` | elevate concepts block language to academic/scientific level | 2026-06-17 | `3e82ab8` |
| **SBC-48** | `Task` | `INF` | revert section title and description to original wording | 2026-06-17 | `7f8e1b1` |
| **SBC-50** | `Task` | `INF` | create daily progress log and record June 17 entry | 2026-06-17 | `c85bf3f` |
| **SBC-51** | `Task` | `INF` | save detailed 5-step master plan of action to daily progress log | 2026-06-17 | `691fe84` |
| **SBC-60** | `Task` | `INF` | sync all documentation source files and compiled JSON data for apps/docs site | 2026-10-02 | `5fd9877` |
| **SBC-61** | `Bug` | `INF` | disable Next.js devIndicators rendering overlay badge in development mode | 2026-10-02 | `cc8b715` |
| **SBC-63** | `Task` | `INF` | update daily progress and detailed technical log for Micro-Step 5.1 completion | 2026-10-03 | `c46a20e` |
| **SBC-64** | `Task` | `INF` | create workspace agent rules in .agents/AGENTS.md for mandatory progress logging and micro-steps | 2026-10-03 | `09492bc` |
| **SBC-65** | `Task` | `INF` | document workspace agent rules location and mandatory progress logging procedures | 2026-10-03 | `2e3a3f0` |
| **SBC-72** | `Task` | `INF` | postpone Step 7 Web3 and prioritize system audit and testing | 2026-10-04 | `9baf1de` |
| **SBC-79** | `Story` | `INF` | handle unstarted BKT state reset and document progress | 2026-10-04 | `0f6552a` |
| **SBC-81** | `Bug` | `INF` | support exact array parameter display in test cases | 2026-10-04 | `2d9014d` |
| **SBC-90** | `Task` | `INF` | add mandatory E2E testing rule and document Playwright architecture strategy | 2026-10-04 | `d3cd4f2` |
| **SBC-97** | `Story` | `INF` | configure Playwright and implement end-to-end integration test flow | 2026-10-05 | `3379334` |
| **SBC-98** | `Bug` | `INF` | update test locators for admin port and modal confirm button | 2026-10-05 | `397cb63` |
| **SBC-99** | `Task` | `INF` | update daily progress log and compile docs JSON for successful E2E execution | 2026-10-05 | `dfb164d` |
| **SBC-101** | `Story` | `INF` | expand JavaScript course to 5 modules with 14 practical tasks and DAG dependencies | 2026-10-05 | `f1202d9` |
| **SBC-103** | `Task` | `INF` | update roadmap and project management architecture for multi-app role separation (step 1) | 2026-10-05 | `dfe94be` |
| **SBC-107** | `Story` | `INF` | create public landing page app apps/landing on port 3001 (step 5) | 2026-10-05 | `ad78d09` |
| **SBC-108** | `Task` | `INF` | compile JSON documentation after multi-app portal separation | 2026-10-05 | `b69f542` |
| **SBC-109** | `Task` | `INF` | rename apps/landing to apps/web and update root package scripts and docs | 2026-10-05 | `a20f939` |
| **SBC-110** | `Bug` | `INF` | disable experimental reactCompiler and fix dev script port to 3005 | 2026-10-05 | `06bf692` |
| **SBC-119** | `Bug` | `INF` | add page navigation fallback wait for dev server compilation | 2026-10-06 | `feb048f` |
| **SBC-120** | `Task` | `INF` | verify multi-discipline UI flow in student and teacher portals with Playwright | 2026-10-06 | `c7270d9` |
| **SBC-121** | `Task` | `INF` | update daily progress log with E2E test verification success | 2026-10-06 | `e9e62bb` |
| **SBC-124** | `Story` | `INF` | populate heterogeneous mixed task types (quizzes, essays, code) inside single course | 2026-10-06 | `2ec88d2` |
| **SBC-127** | `Bug` | `INF` | prevent duplicate task recommendation and avoid BKT mastery inflation on repeat submissions | 2026-10-06 | `d08cca1` |
| **SBC-128** | `Story` | `INF` | fix DAG sequencing locks, next task UX & add module task exhaustion reset modal | 2026-10-08 | `2bd0657` |
| **SBC-140** | `Task` | `INF` | update daily_progress log and recompile JSON artifacts | 2026-10-09 | `90da3ee` |
| **SBC-142** | `Task` | `INF` | sync daily progress log for clean SkillDagMap header | 2026-10-09 | `399395c` |
| **SBC-145** | `Task` | `INF` | update detailed technical implementation log and recompile JSON | 2026-10-09 | `0c11767` |
| **SBC-147** | `Task` | `INF` | compile docs JSON for metrics icons and explanation modal | 2026-10-09 | `944c634` |
| **SBC-149** | `Task` | `INF` | sync daily progress and compile docs JSON for compact metrics UI | 2026-10-09 | `9316c05` |
| **SBC-162** | `Task` | `INF` | document sidebar toggle-to-collapse standard | 2026-10-12 | `f10ffcd` |
| **SBC-165** | `Task` | `INF` | document 3-state navigation model in daily progress | 2026-10-12 | `87cc943` |
| **SBC-169** | `Task` | `INF` | capture EdTech ecosystem vision and add ideation fidelity rule | 2026-10-13 | `58568fa` |
| **SBC-170** | `Task` | `INF` | add technical platform architecture for EdTech ecosystem | 2026-10-13 | `466021b` |
| **SBC-186** | `Task` | `INF` | sync daily progress and implementation logs for UI unification and styling fixes | 2026-10-13 | `3acccd0` |
| **SBC-201** | `Task` | `INF` | verify review queue navigation in teacher portal | 2026-10-14 | `84d8afa` |

---

## 🎯 SBC-EP-SH: Database Modeling & Shared Packages

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-21** | `Story` | `SH` | add shared UI package with Storybook integration and update tech stack docs | 2026-06-17 | `2b86f4f` |
| **SBC-52** | `Story` | `SH` | setup PostgreSQL Docker environment, Prisma schema and initial seed script | 2026-10-01 | `12310f8` |
| **SBC-53** | `Task` | `SH` | update daily progress log and root package.json for step 1 database completion | 2026-10-01 | `38cd853` |
| **SBC-54** | `Story` | `SH` | add db:seed root script and auto-load dotenv in database seed script | 2026-10-02 | `06147ee` |
| **SBC-57** | `Bug` | `SH` | fix TypeScript rootDir output and globalThis type assertion for CJS/NestJS import compatibility | 2026-10-02 | `009117d` |
| **SBC-123** | `Task` | `SH` | convert course selection tabs to scalable dropdown selectors in student and teacher portals | 2026-10-06 | `e389796` |
| **SBC-137** | `Story` | `SH` | unify teacher & admin apps into modular Opera-style Shell layout | 2026-10-09 | `57ff761` |
| **SBC-139** | `Task` | `SH` | compact SkillDagMap nodes with overlapping connectors and fix non-scrolling drawer headers | 2026-10-09 | `afbda34` |
| **SBC-141** | `Bug` | `SH` | remove duplicated header title inside SkillDagMap component | 2026-10-09 | `60b17ff` |
| **SBC-146** | `Story` | `SH` | add icons and formula modal explanations to student metrics grid | 2026-10-09 | `06ebcde` |
| **SBC-148** | `Task` | `SH` | compact Student Metrics Grid and BKT Heatmap cards | 2026-10-09 | `9a9bb1f` |
| **SBC-167** | `Story` | `SH` | unify navigation rail and sidebar state across student, teacher, and admin portals | 2026-10-12 | `05311da` |
| **SBC-181** | `Bug` | `SH` | restrict bouncing icon animation to active or selected node only | 2026-10-13 | `8df9aec` |
| **SBC-183** | `Task` | `SH` | unify GameSkillTreeWidget and AnomalyTreeWidget in @sbc/ui package | 2026-10-13 | `0eb812f` |
| **SBC-184** | `Bug` | `SH` | restore original crystal node styles and add tailwind source path for shared ui | 2026-10-13 | `dbf3c67` |
| **SBC-185** | `Bug` | `SH` | remove excessive blurred selection halo from skill tree nodes | 2026-10-13 | `99dd052` |
| **SBC-189** | `Story` | `SH` | extend Prisma schema with OPEN_TEXT, TeacherReviewStatus and semantic evaluation fields | 2026-10-14 | `3e37b5b` |

---

## 🎯 SBC-EP-BK: Authentication & Core API

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-55** | `Story` | `BK` | setup NestJS application frame with hexagonal architecture and Prisma ORM integration | 2026-10-02 | `118186c` |
| **SBC-56** | `Story` | `BK` | configure Swagger OpenAPI documentation UI at /api/v1/docs | 2026-10-02 | `81612e2` |
| **SBC-58** | `Story` | `BK` | implement BKT Core Engine, TaskSequencer domain logic and Mini-Course seed with 100% unit test coverage | 2026-10-02 | `2441c1a` |
| **SBC-59** | `Story` | `BK` | implement REST API, WebSockets Telemetry Gateway and create detailed technical implementation log | 2026-10-02 | `b0735da` |
| **SBC-73** | `Bug` | `BK` | fix VM test runner argument handling and seed test cases input format | 2026-10-04 | `562e9de` |
| **SBC-74** | `Story` | `BK` | add real Promise/await resolution support to NestJS VM test runner | 2026-10-04 | `d8f64f0` |
| **SBC-75** | `Bug` | `BK` | fallback demo-student userId to active student BKT state in getStudentState | 2026-10-04 | `e288d4f` |
| **SBC-78** | `Bug` | `BK` | fix TelemetrySession relation in resetStudentState Prisma query | 2026-10-04 | `72806a4` |
| **SBC-89** | `Task` | `BK` | add unit tests for student analytics and telemetry reset state | 2026-10-04 | `bf16ae8` |
| **SBC-112** | `Story` | `BK` | integrate BullMQ and Redis evaluation queue with EvaluationProcessor worker | 2026-10-05 | `2b70b0c` |
| **SBC-114** | `Story` | `BK` | add idempotency check to prevent duplicate BKT calculations for identical task code | 2026-10-05 | `e87615c` |
| **SBC-115** | `Bug` | `BK` | fallback to global tasks in TaskSequencer when all active skill tasks are completed | 2026-10-05 | `68ff7ff` |
| **SBC-125** | `Bug` | `BK` | support const and let function declarations in VM runner | 2026-10-06 | `cea2c4c` |
| **SBC-171** | `Story` | `BK` | add BehavioralAdjuster for dynamic Slip/Guess (Phase 2 step 1) | 2026-10-13 | `b4680de` |

---

## 🎯 SBC-EP-BKT: Bayesian Knowledge Tracing & Behavioral Telemetry

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-40** | `Task` | `BKT` | document adaptive learning track and task sequencing | 2026-06-17 | `6c9cd68` |
| **SBC-44** | `Task` | `BKT` | rewrite first concept card to highlight multi-factor adaptive learning (BKT + telemetry + assessments) | 2026-06-17 | `e96fbcb` |
| **SBC-85** | `Bug` | `BKT` | emit instant websocket telemetry on paste to calculate 100 percent copy paste ratio | 2026-10-04 | `14bf3a6` |
| **SBC-91** | `Bug` | `BKT` | add multi-level paste event detection and WebSocket room fallback | 2026-10-04 | `b80637e` |
| **SBC-93** | `Bug` | `BKT` | correct WPM calculation on paste and zero out typing speed for 100% copy-paste ratio | 2026-10-04 | `d7bb852` |
| **SBC-94** | `Bug` | `BKT` | add 300ms deduplication threshold to handlePaste to ensure exact single paste count | 2026-10-04 | `3600bcd` |
| **SBC-95** | `Bug` | `BKT` | filter modifier keys and Ctrl/Cmd/Alt shortcuts from WPM keystroke counter | 2026-10-04 | `7e10ceb` |
| **SBC-96** | `Task` | `BKT` | sync detailed implementation log with latest telemetry deduplication and WPM fixes | 2026-10-04 | `0bc5a06` |
| **SBC-100** | `Task` | `BKT` | add specification for telemetry and analytical metrics | 2026-10-05 | `853b64f` |
| **SBC-102** | `Bug` | `BKT` | optimize socket.io transport to pure websocket to fix devtools console warning | 2026-10-05 | `2d169cc` |
| **SBC-116** | `Task` | `BKT` | add multi-modal neural telemetry AI concepts and telemetry fix | 2026-10-05 | `20d1689` |
| **SBC-129** | `Story` | `BKT` | add real-time WebSocket BKT reset synchronization for active student sessions | 2026-10-09 | `8bc54db` |
| **SBC-150** | `Task` | `BKT` | document per-module telemetry concept and update roadmap & implementation log | 2026-10-09 | `e335a87` |
| **SBC-151** | `Story` | `BKT` | implement per-module telemetry aggregation, course median calculation, and real-time behavioral profile upserts | 2026-10-10 | `0e45837` |
| **SBC-159** | `Task` | `BKT` | update daily progress and documentation data with inspector module telemetry | 2026-10-12 | `a07b6c5` |
| **SBC-172** | `Story` | `BKT` | integrate BehavioralAdjuster into evaluate endpoint and persist used parameters | 2026-10-13 | `9f743ec` |
| **SBC-173** | `Story` | `BKT` | separate telemetry display between student (silent) and teacher (detailed log) | 2026-10-13 | `524a928` |
| **SBC-176** | `Story` | `BKT` | introduce standalone AnomalyRadarWidget with deep dive question audit and task navigation | 2026-10-13 | `1308840` |
| **SBC-177** | `Story` | `BKT` | implement hierarchical interactive AnomalyTreeWidget grouped by anomaly type and skill | 2026-10-13 | `db2e942` |
| **SBC-178** | `Story` | `BKT` | introduce multi-mode AnomalyTreeWidget with tree, graph and rpg views | 2026-10-13 | `0dc8f61` |
| **SBC-179** | `Story` | `BKT` | add DAG module-based anomaly tree mode with hierarchical sibling branches | 2026-10-13 | `1b85386` |
| **SBC-180** | `Story` | `BKT` | render full task titles, descriptions, and telemetry previews in anomaly trees and modal | 2026-10-13 | `91f1b7e` |
| **SBC-198** | `Task` | `BKT` | log micro-step 7 keyword stuffing protection and telemetry integration | 2026-10-14 | `ddb56f0` |
| **SBC-202** | `Task` | `BKT` | add full open-text assessment pipeline and anomaly specification to telemetry_analytics.md | 2026-10-14 | `be545a8` |

---

## 🎯 SBC-EP-LLM: Automated Code Assessment & Open-Text Evaluation

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-111** | `Task` | `LLM` | detail Phase 3 AI evaluation & async queue architecture with Mermaid sequence diagram | 2026-10-05 | `5dccd36` |
| **SBC-118** | `Story` | `LLM` | implement universal polyglot BKT evaluation engine and multi-course UI | 2026-10-06 | `c624d2e` |
| **SBC-168** | `Task` | `LLM` | initialize brainstorm hub and document session 01 on multi-task mastery evaluation and telemetry | 2026-10-12 | `03a0f62` |
| **SBC-187** | `Task` | `LLM` | specify multi-tier semantic evaluation pipeline for open-ended questions | 2026-10-14 | `b09695e` |
| **SBC-188** | `Story` | `LLM` | add OpenTextHeuristicEvaluator and integrate open-text telemetry into BehavioralAdjuster | 2026-10-14 | `c792ceb` |
| **SBC-190** | `Story` | `LLM` | implement OpenAnswerEvaluatorService orchestrator and integrate with BktController | 2026-10-14 | `cb383c3` |
| **SBC-191** | `Bug` | `LLM` | reject gibberish input and seed Event Loop rubric | 2026-10-14 | `529db7d` |
| **SBC-192** | `Task` | `LLM` | update daily progress and detailed log for gibberish filter fix | 2026-10-14 | `91833dd` |
| **SBC-197** | `Bug` | `LLM` | prevent keyword stuffing and connect essay telemetry to BKT adjuster | 2026-10-14 | `378a297` |
| **SBC-199** | `Bug` | `LLM` | block looping phrase spam and route high-paste submissions to teacher review queue | 2026-10-14 | `a64b65f` |

---

## 🎯 SBC-EP-W3: Web3 Infrastructure & Smart Contracts

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |

---

## 🎯 SBC-EP-ST: Student Portal & Skill Tree Map

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-83** | `Story` | `ST` | connect live student analytics endpoint and telemetry calculation | 2026-10-04 | `20e3157` |
| **SBC-84** | `Bug` | `ST` | sync student profile name and eliminate initial mock data flash | 2026-10-04 | `9fb68ab` |
| **SBC-86** | `Bug` | `ST` | ensure exact zero values in analytics for reset student state | 2026-10-04 | `2d59d95` |
| **SBC-104** | `Story` | `ST` | rename apps/web to apps/student and update workspace scripts (step 2) | 2026-10-05 | `cea1c88` |
| **SBC-113** | `Bug` | `ST` | enhance Deletes telemetry detection for Backspace, Delete keys and selection range removals | 2026-10-05 | `42982a3` |
| **SBC-126** | `Bug` | `ST` | sync active module highlighting and fallback student resolution for BKT state | 2026-10-06 | `f21e6bb` |
| **SBC-131** | `Task` | `ST` | redesign layout into sticky top nav with collapsible task sidebar and skill graph | 2026-10-09 | `3e6f0eb` |
| **SBC-132** | `Story` | `ST` | implement unified Opera-style vertical icon rail and expandable drawers shell | 2026-10-09 | `ea04cec` |
| **SBC-133** | `Task` | `ST` | replace text close button with minimalist X icon in side drawer header | 2026-10-09 | `c971a9c` |
| **SBC-134** | `Task` | `ST` | replace settings icon with gear and move external apps block to bottom of icon rail | 2026-10-09 | `fecbfba` |
| **SBC-135** | `Task` | `ST` | add horizontal separator after settings block in vertical icon rail | 2026-10-09 | `5848ee7` |
| **SBC-136** | `Task` | `ST` | position settings block at very bottom of vertical icon rail with preceding separator | 2026-10-09 | `4d5d9b6` |
| **SBC-138** | `Task` | `ST` | reorient SkillDagMap into clean vertical flow with down arrows inside side drawer | 2026-10-09 | `7316de4` |
| **SBC-152** | `Story` | `ST` | implement RPG-style GameSkillTreeWidget with interactive power rays, player levels, and quest cards | 2026-10-11 | `e8eec6e` |
| **SBC-153** | `Bug` | `ST` | improve RPG Level badge layout and text alignment | 2026-10-11 | `e411d25` |
| **SBC-154** | `Story` | `ST` | display GameSkillTree on main canvas with node details in side drawer including locked status inspection | 2026-10-11 | `d578564` |
| **SBC-155** | `Bug` | `ST` | make rail navigation tabs mutually exclusive to prevent dual active highlight | 2026-10-11 | `630f964` |
| **SBC-161** | `Story` | `ST` | allow clicking active task icon to toggle close sidebar drawer and stretch main canvas | 2026-10-12 | `3cf08d6` |
| **SBC-163** | `Bug` | `ST` | keep main view when toggling sidebar drawer on and off | 2026-10-12 | `33655d3` |
| **SBC-164** | `Story` | `ST` | implement full 3-state navigation model (open, collapsed full-width canvas, tab switch) | 2026-10-12 | `67c0b42` |
| **SBC-166** | `Bug` | `ST` | unify activeTab and isDrawerOpen navigation state to preserve selected tab highlight on sidebar collapse | 2026-10-12 | `60fc2f5` |
| **SBC-174** | `Story` | `ST` | display telemetry anomalies and adjustment history in student RPG tree inspector | 2026-10-13 | `7b4eded` |
| **SBC-175** | `Task` | `ST` | document telemetry anomalies, latency thresholds, and skill tree indicators | 2026-10-13 | `ce180a0` |
| **SBC-182** | `Story` | `ST` | add anomaly tree view toggle to student skill tree widget | 2026-10-13 | `0b9ced9` |
| **SBC-193** | `Story` | `ST` | display semantic rubric breakdown and teacher review status | 2026-10-14 | `14ceb67` |
| **SBC-194** | `Task` | `ST` | log micro-step 5 student semantic rubric UI | 2026-10-14 | `a4b16a8` |

---

## 🎯 SBC-EP-TC: Teacher Portal & Analytics CRM

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-45** | `Task` | `TC` | soften language in hybrid assessment card to emphasize workload reduction for teachers | 2026-06-17 | `e8a1487` |
| **SBC-46** | `Task` | `TC` | update hybrid assessment card to include latest LLM models and teacher review for controversial cases | 2026-06-17 | `26bc311` |
| **SBC-49** | `Task` | `TC` | revert card 3 to original, update card 2 description to emphasize teacher is only involved when strictly necessary | 2026-06-17 | `a7f850b` |
| **SBC-105** | `Story` | `TC` | extract teacher portal to apps/teacher with port 3003 (step 3) | 2026-10-05 | `12088ba` |
| **SBC-130** | `Story` | `TC` | add reusable CourseOverviewWidget for course hierarchy & question inspection | 2026-10-09 | `adf67a3` |
| **SBC-143** | `Story` | `TC` | implement list in drawer and detail on main screen pattern for students and course map | 2026-10-09 | `29d7a88` |
| **SBC-144** | `Task` | `TC` | compile docs JSON for teacher portal list-detail refactor | 2026-10-09 | `1be151b` |
| **SBC-156** | `Story` | `TC` | integrate student game skill tree view in teacher portal | 2026-10-11 | `afa7c67` |
| **SBC-157** | `Task` | `TC` | update daily progress and compiled docs json with teacher skill tree | 2026-10-11 | `717cf35` |
| **SBC-158** | `Story` | `TC` | display per-module telemetry stats and navigation button in skill tree inspector panel | 2026-10-12 | `cebcf73` |
| **SBC-160** | `Bug` | `TC` | keep skill tree view active on node click and inspect module stats in right sidebar | 2026-10-12 | `442aad9` |
| **SBC-195** | `Story` | `TC` | human-in-the-loop review queue for open text answers | 2026-10-14 | `0b70f62` |
| **SBC-196** | `Task` | `TC` | log micro-step 6 teacher review queue and recompile docs portal | 2026-10-14 | `b9420e6` |
| **SBC-200** | `Task` | `TC` | log micro-step 8 phrase looping spam protection and teacher review routing | 2026-10-14 | `0fd802f` |

---

## 🎯 SBC-EP-AD: Admin Portal & Knowledge DAG Builder

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-69** | `Story` | `AD` | init Next.js 16 admin app and update progress logs | 2026-10-03 | `5cd2a27` |
| **SBC-70** | `Story` | `AD` | build interactive Skill DAG editor and BKT parameters tuning form | 2026-10-03 | `71b32d7` |
| **SBC-71** | `Story` | `AD` | build student analytics table and BKT heatmap | 2026-10-03 | `967772d` |
| **SBC-77** | `Story` | `AD` | add experimental BKT state & submission history reset feature | 2026-10-04 | `53e0b3e` |
| **SBC-92** | `Bug` | `AD` | replace window.confirm with custom React modal for reset action | 2026-10-04 | `5bfb829` |
| **SBC-106** | `Story` | `AD` | transform apps/admin into System CMS dashboard on port 3004 (step 4) | 2026-10-05 | `e3c2a02` |
| **SBC-117** | `Story` | `AD` | move Skill DAG Editor to apps/admin and decouple teacher portal analytics | 2026-10-06 | `19f0f4a` |
| **SBC-122** | `Story` | `AD` | implement dynamic course manager CMS and API creation endpoint | 2026-10-06 | `d37c6ef` |

---

## 🎯 SBC-EP-LD: Landing Web Page

| Task Key | Type | Scope | Summary | Date | Commit Hash |
| :--- | :---: | :---: | :--- | :---: | :---: |
| **SBC-62** | `Story` | `LD` | initialize Next.js 16 student client frame with TailwindCSS v4 in apps/web (Micro-Step 5.1) | 2026-10-03 | `577a46f` |
| **SBC-66** | `Story` | `LD` | implement Monaco Code Editor with behavioral telemetry hook and REST evaluation integration (Micro-Step 5.2) | 2026-10-03 | `90ccf51` |
| **SBC-67** | `Story` | `LD` | implement interactive Skill DAG Graph visualization component (Micro-Step 5.3) | 2026-10-03 | `cebffa0` |
| **SBC-68** | `Story` | `LD` | verify live BKT evaluation and update progress logs | 2026-10-03 | `6e8b2d8` |
| **SBC-76** | `Story` | `LD` | add active student profile badge in Student Portal header | 2026-10-04 | `ff14967` |
| **SBC-80** | `Bug` | `LD` | improve test case arguments display formatting and log changes | 2026-10-04 | `3b1e231` |
| **SBC-82** | `Bug` | `LD` | auto refresh recommended task on ACCEPTED submission status | 2026-10-04 | `0d5fbe7` |
| **SBC-87** | `Bug` | `LD` | disable automatic task transition on ACCEPTED submission status | 2026-10-04 | `de69587` |
| **SBC-88** | `Bug` | `LD` | add content change fallback for robust monaco paste detection | 2026-10-04 | `e14e1d8` |

---

