const fs = require('fs');
const path = require('path');

const replacements = {
  'Ã¢â€\u00A0â€™': '→',
  'Ã¢â€ â€™': '→',
  'Ã‚Â·': '·',
  'Ã¢â‚¬â€œ': '–',
  'Ã¢â€ â‚¬': '─',
  'Ã°Å¸Å¡â‚¬': '🚀',
  'Ã°Å¸â€™Â¬': '💬',
  'Ã°Å¸Â¤Â ': '🤝',
  'Ã¢Å“â€¦': '✅',
  'Ã°Å¸Å½â€°': '🎉',
  'Ã¢â‚¬â€ ': '—',
  'Ã°Å¸â€œÂ¦': '📦',
  'Ã°Å¸Â¤â€“': '🤖',
  'Ã¢Â Å’': '❌',
  'Ã¢â€šÂ¹': '₹',
  'Ã¢Å¡Â\u00A0Ã¯Â¸Â\u00A0': '⚠️',
  'Ã¢Â\u00A0Â³': '⏳',
  'Ã°Å¸Å’Â\u00A0': '🌐',
  'Ã¢Å“â€œ': '✓',
  'Ã°Å¸Å’Å¸': '🌟',
  'Ã¢â€\u00A0Â\u00A0': '←',
  'Ã¢â€¢Â\u00A0': '═',
  'Ã¢Å¡Â Ã¯Â¸Â ': '⚠️',
  'Ã¢Â Â³': '⏳',
  'Ã°Å¸Å’Â ': '🌐',
  'Ã¢Å“â€œ': '✓',
  'Ã°Å¸Å’Å¸': '🌟',
  'Ã¢â€ Â ': '←',
  'Ã¢â€¢Â ': '═',
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walkDir(file));
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walkDir('.');
let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  for (const [bad, good] of Object.entries(replacements)) {
    content = content.split(bad).join(good);
  }
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', file);
    fixedCount++;
  }
});

console.log('Total fixed:', fixedCount);
