const fs = require('fs');
const path = require('path');

function findInDir(dir, ext, results = []) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory() && !f.includes('node_modules') && !f.includes('.git')) {
      findInDir(full, ext, results);
    } else if (f.endsWith(ext)) {
      results.push(full);
    }
  });
  return results;
}

function flatten(obj, prefix) {
  prefix = prefix || '';
  return Object.keys(obj).reduce((acc, k) => {
    const key = prefix ? prefix + '.' + k : k;
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      Object.assign(acc, flatten(obj[k], key));
    } else {
      acc[key] = obj[k];
    }
    return acc;
  }, {});
}

const fr = JSON.parse(fs.readFileSync('frontend/src/i18n/fr.json', 'utf8'));
const frFlat = flatten(fr);

const files = findInDir('frontend/src', '.tsx');
const missingKeys = new Map();

// Only accept keys that look like actual i18n keys (contain a dot and start with a word)
const validKeyPattern = /^[a-z][a-zA-Z0-9]*\.[a-zA-Z][a-zA-Z0-9]*$/;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const regex = /t\(["']([a-zA-Z][a-zA-Z0-9]*\.[a-zA-Z][a-zA-Z0-9]*)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const key = match[1];
    if (!frFlat[key]) {
      if (!missingKeys.has(key)) {
        missingKeys.set(key, []);
      }
      const basename = path.basename(f);
      if (!missingKeys.get(key).includes(basename)) {
        missingKeys.get(key).push(basename);
      }
    }
  }
});

console.log('Missing i18n keys (' + missingKeys.size + '):');
Array.from(missingKeys.entries()).sort((a, b) => a[0].localeCompare(b[0])).forEach(([key, files]) => {
  console.log('  ' + key + '  ->  ' + files.join(', '));
});
