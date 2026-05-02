const fs = require('fs');
const path = require('path');
const regex = /bientôt disponible|coming soon|toast\(|TODO|href="#"|onClick=\{\(\) => \{\}\}/i;

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
        if (regex.test(line)) {
          results.push(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }
  });
  return results;
}

const res = walk('frontend/src');
fs.writeFileSync('search_results.txt', res.join('\n'));
console.log(`Found ${res.length} matches`);
