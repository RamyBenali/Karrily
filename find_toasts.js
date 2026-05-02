const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        results = results.concat(walk(file));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes('toast(') || line.includes('toast.error(') || line.includes('toast.success(') || line.includes('toast.loading(') || line.includes('console.log(')) {
          results.push(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  });
  return results;
}
const res = walk('frontend/src');
fs.writeFileSync('toast_logs.txt', res.join('\n'));
