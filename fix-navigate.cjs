const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const filesToFix = [
  'Listings.jsx',
  'PostProperty.jsx',
  'PropertyDetails.jsx',
  'Register.jsx'
];

for (const file of filesToFix) {
  const filePath = path.join(pagesDir, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Replace navigate('/property/${propertyId}') with navigate.push(...)
    content = content.replace(/navigate\(`\/property\/\$\{propertyId\}`\)/g, 'navigate.push(`/property/${propertyId}`)');
    
    // Replace navigate('/login', { state: { from: ... } }) with navigate.push('/login?from=...')
    // We will do a generic replacement for this pattern
    content = content.replace(/navigate\('\/login',\s*\{\s*state:\s*\{\s*from:\s*([^}]+)\s*\}\s*\}\)/g, (match, fromUrl) => {
      // fromUrl might be a string literal like "'/listings'" or template literal like "`/property/${id}`"
      return `navigate.push('/login?from=' + encodeURIComponent(${fromUrl}))`;
    });

    // PostProperty.jsx
    content = content.replace(/navigate\('\/dashboard'\)/g, "navigate.push('/dashboard')");

    // Register.jsx
    content = content.replace(/navigate\(user\.role === 'broker' \? '\/dashboard' : '\/',\s*\{[^}]*\}\);/s, "navigate.push(user.role === 'broker' ? '/dashboard?tab=subscription' : '/');");

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed', file);
  }
}
