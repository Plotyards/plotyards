const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;

  // Replace react-router-dom imports
  if (content.includes('react-router-dom')) {
    content = content.replace(/import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]react-router-dom['"];?/g, (match, imports) => {
      let newImports = [];
      let navImports = [];
      let linkImport = '';
      
      const parts = imports.split(',').map(s => s.trim());
      if (parts.includes('Link')) linkImport = `import Link from 'next/link';\n`;
      if (parts.includes('useNavigate')) navImports.push('useRouter');
      if (parts.includes('useParams')) navImports.push('useParams');
      if (parts.includes('useLocation')) navImports.push('usePathname');
      if (parts.includes('useSearchParams')) navImports.push('useSearchParams');
      
      let res = linkImport;
      if (navImports.length > 0) {
        res += `import { ${navImports.join(', ')} } from 'next/navigation';\n`;
      }
      return res;
    });
    changed = true;
  }

  // Replace hooks
  if (content.includes('useNavigate()')) {
    content = content.replace(/const\s+(\w+)\s*=\s*useNavigate\(\);/g, 'const $1 = useRouter();');
    changed = true;
  }
  
  if (content.includes('useLocation()')) {
    content = content.replace(/const\s+\{?[^}]*\}?\s*=\s*useLocation\(\);/g, 'const pathname = usePathname();');
    changed = true;
  }

  // Add "use client" if it needs hooks and doesn't have it
  const needsClient = ['useState', 'useEffect', 'useRef', 'useRouter', 'useParams', 'usePathname', 'useContext', 'createContext'].some(hook => content.includes(hook));
  if (needsClient && !content.includes('"use client"')) {
    content = `"use client";\n\n` + content;
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Processed:', filePath);
  }
}

function walkDir(dir) {
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
walkDir(path.join(__dirname, 'src', 'context'));
