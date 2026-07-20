const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://zscukxpafikmszrqwodc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzY3VreHBhZmlrbXN6cnF3b2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDExODI0MSwiZXhwIjoyMDk5Njk0MjQxfQ.P7S3r-bExANegxs09D-NeXZnICntc_VaLTPGSiadWlk';
const supabase = createClient(supabaseUrl, supabaseKey);

const imagesDir = path.join(__dirname, 'public', 'images', 'products');
const catalogPath = path.join(__dirname, 'src', 'lib', 'catalog.ts');

async function uploadImages() {
  const files = fs.readdirSync(imagesDir);
  console.log(`Found ${files.length} images to upload...`);

  let successCount = 0;
  for (const file of files) {
    const filePath = path.join(imagesDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    let mimeType = 'image/png';
    if (file.endsWith('.jpg') || file.endsWith('.jpeg')) mimeType = 'image/jpeg';
    if (file.endsWith('.heic')) mimeType = 'image/heic';

    console.log(`Uploading ${file}...`);
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(file, fileBuffer, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error(`Failed to upload ${file}:`, error.message);
    } else {
      successCount++;
    }
  }
  console.log(`Successfully uploaded ${successCount}/${files.length} images.`);

  console.log('Updating catalog.ts...');
  let catalogData = fs.readFileSync(catalogPath, 'utf8');
  catalogData = catalogData.replace(/"\/images\/products\//g, `"${supabaseUrl}/storage/v1/object/public/product-images/`);
  fs.writeFileSync(catalogPath, catalogData);
  console.log('Finished updating catalog.ts!');
}

uploadImages().catch(console.error);
