const fs = require('fs');
const path = require('path');

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

  // The corruption happened because UTF-8 bytes were interpreted as Windows-1252 
  // and then saved back as UTF-8. 
  // We can try to reverse this by getting the 'latin1' byte values of the string 
  // (which maps 1:1 to the first 256 Unicode points) and then decoding that buffer as utf8.
  
  // BUT we only want to do this for the specific corrupted sequences, because 
  // the entire file isn't corrupted, just the special characters!
  // Wait, if PowerShell did WriteAllText, it corrupted ALL special characters.
  
  // Let's manually replace the known corrupted strings with their correct emoji/char counterparts.
  const map = {
    "Ã¢â€\u00A0â€™": "→",
    "Ã‚Â·": "·",
    "Ã¢â‚¬â€œ": "–",
    "Ã¢â€\u00A0â‚¬": "─",
    "Ã°Å¸Å¡â‚¬": "🚀",
    "Ã°Å¸â€™Â¬": "💬",
    "Ã°Å¸Â¤Â\u00A0": "🤝",
    "Ã¢Å“â€¦": "✅",
    "Ã°Å¸Å½â€°": "🎉",
    "Ã¢â‚¬â€\u00A0": "—",
    "Ã°Å¸â€œÂ¦": "📦",
    "Ã°Å¸Â¤â€“": "🤖",
    "Ã¢Â\u00A0Å’": "❌",
    "Ã¢â€šÂ¹": "₹",
    "Ã¢Å¡Â\u00A0Ã¯Â¸Â\u00A0": "⚠️",
    "Ã¢Â\u00A0Â³": "⏳",
    "Ã°Å¸Å’Â\u00A0": "🌐",
    "Ã¢Å“â€œ": "✓",
    "Ã°Å¸Å’Å¸": "🌟",
    "Ã¢â€\u00A0Â\u00A0": "←",
    "Ã¢â€¢Â\u00A0": "═",
    "Ã¢â€\u00A0â‚¬": "─",
    // We will read the file as utf8, then replace these substrings.
  };

  for (const [bad, good] of Object.entries(map)) {
    content = content.split(bad).join(good);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed (exact map):', file);
    fixedCount++;
  }
});

console.log('Total fixed via exact map:', fixedCount);
