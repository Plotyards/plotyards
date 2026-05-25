const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Replace `to=` with `href=` in Link components
  const newContent = content
    .replace(/<Link([^>]+?)to={([^>]+?)}/g, '<Link$1href={$2}')
    .replace(/<Link([^>]+?)to="([^"]+?)"/g, '<Link$1href="$2"');
  
  if (newContent !== content) {
    content = newContent;
    changed = true;
  }

  // Remove SEO imports and usages
  const seoImportRegex = /import\s+SEO\s+from\s+['"][^'"]+['"];?/g;
  if (seoImportRegex.test(content)) {
    content = content.replace(seoImportRegex, '');
    changed = true;
  }

  const seoTagRegex = /<SEO[\s\S]*?\/>/g;
  if (seoTagRegex.test(content)) {
    content = content.replace(seoTagRegex, '');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Processed:', filePath);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src', 'components'));
walkDir(path.join(__dirname, 'src', 'pages'));
walkDir(path.join(__dirname, 'src', 'app'));

// Finally delete SEO.jsx if it exists
const seoComponentPath = path.join(__dirname, 'src', 'components', 'SEO.jsx');
if (fs.existsSync(seoComponentPath)) {
  fs.unlinkSync(seoComponentPath);
  console.log('Deleted SEO.jsx');
}
