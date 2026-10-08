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
  content = content.split("'http://localhost:5000/api").join("`${import.meta.env.VITE_API_URL}");
  content = content.split("`http://localhost:5000/api").join("`${import.meta.env.VITE_API_URL}");
  // Fix the single quotes that were left behind! Because we replaced 'http with `${url}
  // The end of the string still has a single quote '. It should be a backtick `
  // We can do this with a simple regex for the specific replaced pattern:
  content = content.replace(/\$\{import\.meta\.env\.VITE_API_URL\}([^']*?)'/g, "${import.meta.env.VITE_API_URL}$1`");

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed API url in:', file);
    count++;
  }
});
console.log('Total files updated:', count);
