const fs = require('fs');
const catalogText = fs.readFileSync('src/lib/catalog.ts', 'utf8');
const matches = catalogText.match(/\/images\/[^\"\',\s\]]+/g) || [];
const uniquePaths = [...new Set(matches)];
const missing = uniquePaths.filter(p => {
  const fullPath = 'public' + p;
  return !fs.existsSync(fullPath);
});
console.log('Total images referenced in catalog:', uniquePaths.length);
console.log('Missing images count:', missing.length);
if (missing.length > 0) {
  console.log('First 20 missing:', missing.slice(0, 20));
}
