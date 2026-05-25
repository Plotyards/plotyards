const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const pagesDir = path.join(srcDir, 'pages');
const viewsDir = path.join(srcDir, 'views');

if (fs.existsSync(pagesDir)) {
  fs.renameSync(pagesDir, viewsDir);
  console.log('Renamed src/pages to src/views');
}

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('/pages/')) {
        content = content.replace(/\/pages\//g, '/views/');
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`Updated imports in ${fullPath}`);
      }
    }
  }
}

processDir(srcDir);
console.log('Done');
