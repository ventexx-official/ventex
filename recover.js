const fs = require('fs');
const path = require('path');
const ids = ['11a31704-5dee-4ac3-8086-6ff0ae4cf105', '273043c7-21ed-4067-a46d-b20912ea0906', '9a13b940-22bc-4ad3-83b1-bdbffd7afe2b', 'ede063b9-28ff-4f95-8709-98170d2b79b9', '4cbdcf44-9dcd-4167-8472-cf1142065966'];

ids.forEach(id => {
  const logPath = `C:/Users/HP/.gemini/antigravity/brain/${id}/.system_generated/logs/transcript.jsonl`;
  if (fs.existsSync(logPath)) {
    const lines = fs.readFileSync(logPath, 'utf8').split('\n');
    lines.forEach(line => {
      if (!line.trim()) return;
      try {
        const obj = JSON.parse(line);
        if (obj.tool_calls) {
          obj.tool_calls.forEach(tc => {
            if (tc.name === 'write_to_file' || tc.name === 'default_api:write_to_file') {
              console.log('Found write_to_file in', id);
              
              let args = tc.args || tc.arguments;
              if (!args) { console.log('No args'); return; }
              if (typeof args === 'string') {
                try { args = JSON.parse(args); } catch(e) { console.log('parse fail 1'); }
              }
              
              let TargetFile = args.TargetFile;
              let CodeContent = args.CodeContent;
              
              if (typeof TargetFile === 'string' && TargetFile.startsWith('"')) {
                try { TargetFile = JSON.parse(TargetFile); } catch(e) { console.log('parse fail 2'); }
              }
              if (typeof CodeContent === 'string' && CodeContent.startsWith('"')) {
                try { CodeContent = JSON.parse(CodeContent); } catch(e) { console.log('parse fail 3'); }
              }
              
              if (TargetFile && CodeContent) {
                 fs.writeFileSync(path.resolve(TargetFile), CodeContent);
                 console.log('Recovered:', TargetFile);
              } else {
                 console.log('Missing TargetFile or CodeContent');
              }
            }
          });
        }
      } catch (e) {
      }
    });
  }
});
