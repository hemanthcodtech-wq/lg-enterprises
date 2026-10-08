const fs = require('fs');
const path = require('path');
const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
}
const files = walkSync('./src').filter(f => f.endsWith('.js') || f.endsWith('.jsx'));
let count = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/\`\`\$\{import\.meta\.env\.VITE_API_URL\}/g, '\`\${import.meta.env.VITE_API_URL}');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed double backticks in:', file);
    count++;
  }
});
console.log('Total files updated:', count);
