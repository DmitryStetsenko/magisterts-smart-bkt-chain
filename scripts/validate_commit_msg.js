const fs = require('fs');

const input = process.argv[2];
if (!input) {
  process.exit(0);
}

// Git passes the path to the temporary commit message file (e.g. .git/COMMIT_EDITMSG)
// For manual testing, support both file paths and direct raw string input
let rawMsg = '';
if (fs.existsSync(input)) {
  rawMsg = fs.readFileSync(input, 'utf-8').trim();
} else {
  rawMsg = input.trim();
}

// Ignore merge commits, squash or fixup
if (rawMsg.startsWith('Merge ') || rawMsg.startsWith('Revert ')) {
  process.exit(0);
}

// Regex format: [SBC-XXX][EP-YYY] <type>: <description>
const regex = /^\[SBC-\d+\]\[EP-(INF|SH|BK|BKT|LLM|W3|ST|TC|AD|LD)\] (feat|fix|docs|style|refactor|test|chore): .+/;

if (!regex.test(rawMsg)) {
  console.error('\n\x1b[31m%s\x1b[0m', '═══════════════════════════════════════════════════════════════════════');
  console.error('\x1b[31m%s\x1b[0m', '❌ ПОМИЛКА: Невалідний формат повідомлення комміту (Commit-Msg Hook)!');
  console.error('\x1b[31m%s\x1b[0m', '═══════════════════════════════════════════════════════════════════════');
  console.error('\x1b[33m%s\x1b[0m', 'Отримано: ' + rawMsg);
  console.error('\n\x1b[32m%s\x1b[0m', 'Очікуваний формат стандарту Jira Conventional Commits:');
  console.error('\x1b[36m%s\x1b[0m', '  [SBC-XXX][EP-YYY] <type>: <description>');
  console.error('\nДозволені коди епіків [EP-YYY]:');
  console.error('  [EP-INF], [EP-SH], [EP-BK], [EP-BKT], [EP-LLM], [EP-W3], [EP-ST], [EP-TC], [EP-AD], [EP-LD]');
  console.error('\nДозволені типи <type>:');
  console.error('  feat, fix, docs, style, refactor, test, chore');
  console.error('\nПриклади:');
  console.error('  [SBC-204][EP-TC] feat: add sorting to review queue');
  console.error('  [SBC-205][EP-BKT] fix: resolve threshold calculation precision');
  console.error('\x1b[31m%s\x1b[0m', '═══════════════════════════════════════════════════════════════════════\n');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✅ Повідомлення комміту відповідає стандарту Jira Conventional Commits.');
process.exit(0);
