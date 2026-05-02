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
    } else if (file.endsWith('.tsx')) {
      const content = fs.readFileSync(file, 'utf8');
      
      const buttonMatches = content.matchAll(/<Button([^>]*)>/gi);
      for (const match of buttonMatches) {
        const attrs = match[1];
        if (!attrs.includes('onClick') && !attrs.includes('type="submit"') && !attrs.includes("type='submit'")) {
          // If it's a child of a Link, it might be fine, but we'll flag it anyway
          results.push(`${file}: <Button${attrs}>`);
        }
      }
    }
  });
  return results;
}
const res = walk('frontend/src');
fs.writeFileSync('missing_handlers.txt', res.join('\n'));
console.log(`Found ${res.length} matches`);
