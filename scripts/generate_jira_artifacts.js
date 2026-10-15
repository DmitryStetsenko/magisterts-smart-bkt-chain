const fs = require('fs');
const path = require('path');

const issues = JSON.parse(fs.readFileSync('scripts/mapped_issues.json', 'utf-8'));

const tasksDir = path.join(__dirname, '..', 'docs', 'tasks');
if (!fs.existsSync(tasksDir)) {
  fs.mkdirSync(tasksDir, { recursive: true });
}

// 1. Generate jira_import.csv
const csvHeaders = ['Issue Key', 'Epic Link', 'Issue Type', 'Summary', 'Status', 'Date', 'Git Commit Hash'];
const csvRows = [csvHeaders.join(',')];

issues.forEach(iss => {
  const cleanSummary = `"${iss.summary.replace(/"/g, '""')}"`;
  csvRows.push([
    iss.issueKey,
    iss.epicKey,
    iss.type,
    cleanSummary,
    'Done',
    iss.date,
    iss.hash
  ].join(','));
});

fs.writeFileSync(path.join(tasksDir, 'jira_import.csv'), csvRows.join('\n'), 'utf-8');

// 2. Generate tasks registry Markdown by Epics
const epics = {
  'SBC-EP-INF': { name: 'Monorepo & CI/CD Setup', scope: 'INF', items: [] },
  'SBC-EP-SH': { name: 'Database Modeling & Shared Packages', scope: 'SH', items: [] },
  'SBC-EP-BK': { name: 'Authentication & Core API', scope: 'BK', items: [] },
  'SBC-EP-BKT': { name: 'Bayesian Knowledge Tracing & Behavioral Telemetry', scope: 'BKT', items: [] },
  'SBC-EP-LLM': { name: 'Automated Code Assessment & Open-Text Evaluation', scope: 'LLM', items: [] },
  'SBC-EP-W3': { name: 'Web3 Infrastructure & Smart Contracts', scope: 'W3', items: [] },
  'SBC-EP-ST': { name: 'Student Portal & Skill Tree Map', scope: 'ST', items: [] },
  'SBC-EP-TC': { name: 'Teacher Portal & Analytics CRM', scope: 'TC', items: [] },
  'SBC-EP-AD': { name: 'Admin Portal & Knowledge DAG Builder', scope: 'AD', items: [] },
  'SBC-EP-LD': { name: 'Landing Web Page', scope: 'LD', items: [] }
};

issues.forEach(iss => {
  if (epics[iss.epicKey]) {
    epics[iss.epicKey].items.push(iss);
  } else {
    epics['SBC-EP-INF'].items.push(iss);
  }
});

let mdRegistry = `# 📋 Реєстр Завдань та Епіків Проєкту (Tasks & Epics Registry)\n\n`;
mdRegistry += `Цей каталог містить повну структуру тасок проєкту Smart-BKT-Chain з прив'язкою до ідентифікаторів Jira (\`SBC-XXX\`), епіків та історії розробки.\n`;
mdRegistry += `Файл експорту в Jira: [\`jira_import.csv\`](file:///docs/tasks/jira_import.csv).\n\n`;

mdRegistry += `## 📊 Зведена статистика\n`;
mdRegistry += `| Епік | Назва | Кількість завдань |\n`;
mdRegistry += `| :--- | :--- | :---: |\n`;

for (const [key, data] of Object.entries(epics)) {
  mdRegistry += `| **\`${key}\`** | ${data.name} | ${data.items.length} |\n`;
}
mdRegistry += `| **ВСЬОГО** | - | **${issues.length}** |\n\n---\n\n`;

for (const [key, data] of Object.entries(epics)) {
  mdRegistry += `## 🎯 ${key}: ${data.name}\n\n`;
  mdRegistry += `| Task Key | Type | Scope | Summary | Date | Commit Hash |\n`;
  mdRegistry += `| :--- | :---: | :---: | :--- | :---: | :---: |\n`;
  data.items.forEach(iss => {
    mdRegistry += `| **${iss.issueKey}** | \`${iss.type}\` | \`${iss.scope}\` | ${iss.summary} | ${iss.date} | \`${iss.hash}\` |\n`;
  });
  mdRegistry += `\n---\n\n`;
}

fs.writeFileSync(path.join(tasksDir, 'registry.md'), mdRegistry, 'utf-8');
console.log('Successfully generated docs/tasks/registry.md and docs/tasks/jira_import.csv');
