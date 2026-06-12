const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('app');
let modifiedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  const lines = content.split('\n');
  const newLines = lines.map(line => {
    if (line.includes('text-[var(--bg)]') && !line.includes('bg-[var(--text)]')) {
      return line.replace(/text-\[var\(--bg\)\]/g, 'text-[var(--text)]');
    }
    return line;
  });
  
  content = newLines.join('\n');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
    console.log('Fixed text colors in:', file);
  }
});

console.log('Total files modified:', modifiedFiles);
