import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDir = path.join(__dirname, 'src', 'app');

function stripUseClient(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      stripUseClient(fullPath);
    } else if (file === 'page.jsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('"use client"') || content.includes("'use client'")) {
        content = content.replace(/"use client";?\s*/g, '');
        content = content.replace(/'use client';?\s*/g, '');
        fs.writeFileSync(fullPath, content);
        console.log('Stripped "use client" from ' + fullPath);
      }
    }
  }
}

stripUseClient(appDir);
