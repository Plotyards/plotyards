import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appDir = path.join(__dirname, 'src', 'app');

const pagesToTitleMap = {
  'admin': 'Admin Dashboard',
  'app-coming-soon': 'App Coming Soon',
  'blogs': 'Real Estate Investment Blogs',
  'contact': 'Contact Us',
  'dashboard': 'My Dashboard',
  'faq': 'Frequently Asked Questions',
  'favourites': 'My Saved Properties',
  'help-center': 'Help Center',
  'history': 'Recently Viewed Properties',
  'login': 'Login to Your Account',
  'plotadmin': 'Platform Admin',
  'post-property': 'List Your Property',
  'privacy': 'Privacy Policy',
  'refund-policy': 'Refund Policy',
  'register': 'Create an Account',
  'terms': 'Terms & Conditions'
};

for (const [dir, title] of Object.entries(pagesToTitleMap)) {
  const pagePath = path.join(appDir, dir, 'page.jsx');
  if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    if (!content.includes('export const metadata')) {
      const importMatches = content.match(/import.*?['"];?\n+/g);
      let insertionPoint = 0;
      if (importMatches) {
        insertionPoint = content.lastIndexOf(importMatches[importMatches.length - 1]) + importMatches[importMatches.length - 1].length;
      }
      
      const newContent = content.slice(0, insertionPoint) + 
                         `\nexport const metadata = {\n  title: '${title}',\n};\n\n` + 
                         content.slice(insertionPoint);
      fs.writeFileSync(pagePath, newContent);
      console.log('Added metadata to ' + dir);
    } else {
      console.log('Metadata already exists in ' + dir);
    }
  }
}
