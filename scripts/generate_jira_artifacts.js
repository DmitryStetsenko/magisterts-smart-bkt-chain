const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const tasksDir = path.join(__dirname, '..', 'docs', 'tasks');
if (!fs.existsSync(tasksDir)) {
  fs.mkdirSync(tasksDir, { recursive: true });
}

// 1. Read git log dynamically
const rawLog = cp.execSync('git log --reverse --format="%h|||%ad|||%s" --date=short', { encoding: 'utf-8' }).trim();
const lines = rawLog.split('\n');

const issues = [];
const regex = /^\[(SBC-\d+)\]\[(EP-[A-Z0-9]+)\]\s+([a-z]+):\s+(.+)$/i;

lines.forEach((line, idx) => {
  const [hash, date, subject] = line.split('|||');
  const match = subject.match(regex);
  if (match) {
    const issueKey = match[1];
    const epicShort = match[2];
    const epicKey = `SBC-${epicShort}`;
    const commitType = match[3].toLowerCase();
    const summary = match[4].trim();

    let issueType = 'Task';
    if (commitType === 'feat') issueType = 'Story';
    else if (commitType === 'fix') issueType = 'Bug';
    else if (commitType === 'docs') issueType = 'Task';
    else if (commitType === 'test') issueType = 'Task';

    const scope = epicShort.replace('EP-', '');

    issues.push({
      issueKey,
      epicKey,
      epicShort,
      scope,
      type: issueType,
      summary,
      commitType,
      date,
      hash,
      subject
    });
  }
});

// 2. Generate jira_import.csv
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

// 3. Generate registry.md
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
console.log(`Successfully synced ${issues.length} tasks from Git log to docs/tasks/registry.md and docs/tasks/jira_import.csv`);
