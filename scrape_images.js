const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const catalogPath = path.join(__dirname, 'src/lib/catalog.ts');
let catalogText = fs.readFileSync(catalogPath, 'utf-8');

async function downloadImage(url, dest, retries=3) {
  for (let i=0; i<retries; i++) {
    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
      });
      if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`);
      const stream = fs.createWriteStream(dest);
      await finished(Readable.fromWeb(resp.body).pipe(stream));
      return;
    } catch (e) {
      if (i === retries - 1) throw e;
      console.log(`Retrying download for ${url}...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
}

async function main() {
  let imageCounter = 1;
  const outDir = path.join(__dirname, 'public/images/products');
  let page = 1;
  let allProducts = [];

  while (true) {
    console.log(`Fetching products.json page ${page}...`);
    const resp = await fetch(`https://almirahcollective.com/products.json?page=${page}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
    });
    if (!resp.ok) break;
    const data = await resp.json();
    if (!data.products || data.products.length === 0) break;
    allProducts = allProducts.concat(data.products);
    page++;
  }
  
  console.log(`Total products fetched: ${allProducts.length}`);

  for (const product of allProducts) {
    const slug = product.handle;
    
    // Check if slug exists in catalog.ts
    const slugRegex = new RegExp(`slug:\\s*["']${slug}["']`);
    if (slugRegex.test(catalogText)) {
      console.log(`Found product: ${slug}`);
      const newImagePaths = [];
      
      for (let i = 0; i < product.images.length; i++) {
        const img = product.images[i];
        let url = img.src;
        url = url.split('?')[0]; // Strip query params
        const ext = path.extname(url) || '.jpg';
        const fileName = `product_${imageCounter}_${i}${ext}`;
        const destPath = path.join(outDir, fileName);
        
        console.log(`Downloading ${url} -> ${fileName}`);
        try {
          await downloadImage(url, destPath);
          newImagePaths.push(`/images/products/${fileName}`);
        } catch(e) {
          console.error(e);
        }
      }
      
      const productBlockRegex = new RegExp(`(slug:\\s*["']${slug}["'].*?images:\\s*\\[)(.*?)(\\])`, 's');
      catalogText = catalogText.replace(productBlockRegex, (match, p1, p2, p3) => {
        return p1 + newImagePaths.map(p => `"${p}"`).join(', ') + p3;
      });
      
      imageCounter++;
    }
  }

  fs.writeFileSync(catalogPath, catalogText, 'utf-8');
  console.log("Updated catalog.ts with new image paths.");
}

main().catch(console.error);
