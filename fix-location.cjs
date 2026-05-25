const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  for (const [search, replace] of replacements) {
    if ((search instanceof RegExp && search.test(content)) || (typeof search === 'string' && content.includes(search))) {
      content = content.replace(search, replace);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${filePath}`);
  }
}

// 1. AdminLogin.jsx
replaceInFile(path.join(__dirname, 'src/pages/AdminLogin.jsx'), [
  [/import \{ usePathname \} from 'next\/navigation';/g, "import { usePathname, useSearchParams } from 'next/navigation';"],
  ["const pathname = usePathname();", "const pathname = usePathname();\n  const searchParams = useSearchParams();"],
  ["location.state?.plotadmin === true", "(typeof window !== 'undefined' && window.history.state?.plotadmin === true)"],
  ["new URLSearchParams(location.search).get('entry')", "searchParams.get('entry')"],
  ["if (location.search)", "if (searchParams.toString())"],
  ["location.search", "searchParams"],
  ["location.state?.from", "(typeof window !== 'undefined' ? window.history.state?.from : null)"]
]);

// 2. Login.jsx
replaceInFile(path.join(__dirname, 'src/pages/Login.jsx'), [
  ["location.state?.from", "(typeof window !== 'undefined' ? window.history.state?.from : null)"]
]);

// 3. Dashboard.jsx
replaceInFile(path.join(__dirname, 'src/pages/Dashboard.jsx'), [
  ["location.state?.tab", "(typeof window !== 'undefined' ? window.history.state?.tab : null)"]
]);

// 4. PropertyDetails.jsx
replaceInFile(path.join(__dirname, 'src/pages/PropertyDetails.jsx'), [
  ["window.location.href", "(typeof window !== 'undefined' ? window.location.href : '')"]
]);

// 5. Blogs.jsx
replaceInFile(path.join(__dirname, 'src/pages/Blogs.jsx'), [
  ["window.location.href", "(typeof window !== 'undefined' ? window.location.href : '')"]
]);

console.log('Fixes applied');
