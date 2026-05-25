const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      if (!content.includes('"use client"') && !content.includes("'use client'")) {
        // If it uses any hooks or client features, add use client
        if (
          content.includes('useAuth') ||
          content.includes('useCompare') ||
          content.includes('useState') ||
          content.includes('useEffect') ||
          content.includes('useRef') ||
          content.includes('useContext') ||
          content.includes('onClick') ||
          content.includes('onChange') ||
          content.includes('framer-motion') ||
          content.includes('usePathname') ||
          content.includes('useRouter') ||
          content.includes('lucide-react')
        ) {
          content = '"use client";\n' + content;
          fs.writeFileSync(fullPath, content, 'utf-8');
          console.log(`Added "use client" to ${fullPath}`);
        }
      }
    }
  }
}

processDir(path.join(__dirname, 'src', 'components'));
console.log('Done processing components');
