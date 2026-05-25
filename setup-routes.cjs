const fs = require('fs');
const path = require('path');

const routes = {
  '': 'Home',
  'listings': 'Listings',
  'property/[id]': 'PropertyDetails',
  'dashboard': 'Dashboard',
  'plotadmin': 'AdminLogin',
  'admin': 'AdminPanel',
  'post-property': 'PostProperty',
  'favourites': 'Favourites',
  'history': 'History',
  'login': 'Login',
  'register': 'Register',
  'blogs': 'Blogs',
  'blogs/[slug]': 'BlogDetails',
  'about': 'StaticPage',
  'contact': 'StaticPage',
  'privacy': 'StaticPage',
  'terms': 'StaticPage',
  'refund-policy': 'StaticPage',
  'faq': 'HelpCenter',
  'help-center': 'HelpCenter',
  'app-coming-soon': 'AppComingSoon',
};

const appDir = path.join(__dirname, 'src', 'app');

for (const [routePath, componentName] of Object.entries(routes)) {
  const dirPath = path.join(appDir, routePath);
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  
  const pagePath = path.join(dirPath, 'page.jsx');
  
  const depth = routePath === '' ? 0 : routePath.split('/').length;
  let relativePath = '../'; // from app to src
  for(let i=0; i<depth; i++) relativePath += '../';
  
  let extraProps = '';
  if (componentName === 'StaticPage') {
    let typeMap = {
      'about': 'about', 'contact': 'contact', 'privacy': 'privacy', 'terms': 'terms', 'refund-policy': 'refund'
    };
    extraProps = ` type="${typeMap[routePath] || routePath}"`;
  }

  const content = `"use client";\nimport PageComponent from '${relativePath}pages/${componentName}';\n\nexport default function Page(props) { return <PageComponent {...props}${extraProps} />; }\n`;
  
  fs.writeFileSync(pagePath, content, 'utf-8');
}

console.log('Routes generated successfully');
