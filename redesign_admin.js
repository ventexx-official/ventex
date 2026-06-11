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
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('app/admin');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');

  // Background replacements
  content = content.replace(/bg-\[\#0F0F13\]/g, 'bg-[var(--card-bg)]');
  content = content.replace(/bg-\[\#13131A\]/g, 'bg-[var(--bg)]');
  content = content.replace(/bg-neutral-900\/20/g, 'hover:bg-[var(--bg2)]');
  content = content.replace(/bg-neutral-900\/50/g, 'bg-[var(--bg2)]');
  content = content.replace(/bg-neutral-900/g, 'bg-[var(--bg2)]');
  content = content.replace(/bg-neutral-950\/20/g, 'bg-[var(--bg2)]');
  content = content.replace(/bg-neutral-950/g, 'bg-[var(--bg)]');
  
  // Border replacements
  content = content.replace(/border-neutral-900/g, 'border-[0.5px] border-[#e5e5e5] dark:border-[#333333]');
  content = content.replace(/border-neutral-800/g, 'border-[0.5px] border-[#e5e5e5] dark:border-[#333333]');
  content = content.replace(/divide-neutral-900/g, 'divide-y divide-[#e5e5e5] dark:divide-[#333333]');

  // Text color replacements
  content = content.replace(/text-neutral-400/g, 'text-[var(--text2)]');
  content = content.replace(/text-neutral-500/g, 'text-[var(--text3)]');
  content = content.replace(/text-neutral-600/g, 'text-[var(--text3)]');
  content = content.replace(/text-neutral-300/g, 'text-[var(--text2)]');
  content = content.replace(/text-neutral-200/g, 'text-[var(--text)]');
  content = content.replace(/text-white/g, 'text-[var(--text)]');
  
  // Rounded corners
  content = content.replace(/rounded-xl/g, 'rounded-2xl');
  content = content.replace(/rounded-2xl/g, 'rounded-[24px]');
  
  // Extra replacements for admin specific things
  content = content.replace(/text-xs font-semibold text-white/g, 'text-xs font-bold text-[var(--text)]');
  content = content.replace(/placeholder-neutral-500/g, 'placeholder-[#888888]');
  
  fs.writeFileSync(file, content, 'utf8');
}

console.log("Admin redesign replacements completed on " + files.length + " files.");
