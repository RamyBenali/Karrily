// This script merges duplicate JSON keys in the i18n files
const fs = require('fs');

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      // Only set if not already in target (keep first occurrence as primary)
      if (target[key] === undefined) {
        target[key] = source[key];
      }
    }
  }
  return target;
}

// Parse JSON manually to handle duplicate keys
function parseWithDuplicates(text) {
  // Use a custom reviver that merges duplicates
  const result = {};
  
  // Parse as regular JSON first to get structure
  // Then manually extract all blocks
  
  // Strategy: Use regex to find all top-level key blocks
  const lines = text.split('\n');
  let currentKey = null;
  let depth = 0;
  let blockContent = '';
  const blocks = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const topKeyMatch = line.match(/^\s*"([^"]+)"\s*:\s*\{/);
    
    if (topKeyMatch && depth === 1) {
      // Save previous block
      if (currentKey && blockContent) {
        if (!blocks[currentKey]) blocks[currentKey] = [];
        blocks[currentKey].push(blockContent);
      }
      currentKey = topKeyMatch[1];
      blockContent = '{\n';
      depth = 2;
      continue;
    }
    
    if (depth >= 2) {
      // Count braces
      for (const ch of line) {
        if (ch === '{') depth++;
        if (ch === '}') depth--;
      }
      if (depth >= 2) {
        blockContent += line + '\n';
      } else {
        // Close of block
        blockContent += '}';
        if (!blocks[currentKey]) blocks[currentKey] = [];
        blocks[currentKey].push(blockContent);
        currentKey = null;
        blockContent = '';
        depth = 1;
      }
      continue;
    }
    
    if (line.trim() === '{') {
      depth = 1;
    }
  }
  
  // Merge blocks
  for (const key in blocks) {
    if (blocks[key].length > 1) {
      console.log('  Found duplicate key: "' + key + '" with ' + blocks[key].length + ' blocks');
      // Merge all blocks
      let merged = {};
      blocks[key].forEach(b => {
        try {
          const parsed = JSON.parse(b);
          deepMerge(merged, parsed);
        } catch (e) {
          // Try to clean trailing commas
          const cleaned = b.replace(/,(\s*[}\]])/g, '$1');
          try {
            const parsed = JSON.parse(cleaned);
            deepMerge(merged, parsed);
          } catch (e2) {
            console.log('    ERROR parsing block for "' + key + '":', e2.message);
          }
        }
      });
      result[key] = merged;
    } else {
      try {
        result[key] = JSON.parse(blocks[key][0]);
      } catch (e) {
        const cleaned = blocks[key][0].replace(/,(\s*[}\]])/g, '$1');
        try {
          result[key] = JSON.parse(cleaned);
        } catch (e2) {
          console.log('    ERROR parsing "' + key + '":', e2.message);
        }
      }
    }
  }
  
  return result;
}

['fr', 'en', 'ar'].forEach(lang => {
  const filePath = 'frontend/src/i18n/' + lang + '.json';
  console.log('Processing ' + filePath + '...');
  const text = fs.readFileSync(filePath, 'utf8');
  const merged = parseWithDuplicates(text);
  
  // Count keys
  function countKeys(obj) {
    let count = 0;
    for (const k in obj) {
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        count += countKeys(obj[k]);
      } else {
        count++;
      }
    }
    return count;
  }
  
  console.log('  Total keys after merge: ' + countKeys(merged));
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
  console.log('  Written to ' + filePath);
});
