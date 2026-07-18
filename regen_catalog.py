import json, re, textwrap

def ts_str(s):
    return json.dumps(s, ensure_ascii=False)

def material_from(desc, tags):
    d = desc.lower()
    if 'linen' in d: return 'Linen blend. Soft, breathable finish.'
    if 'mul cotton' in d or 'mulmul' in d: return 'Mul cotton. Lightweight and airy.'
    if '240 gsm' in d: return '240 GSM cotton blend. Soft, breathable, durable.'
    if 'cotton blend' in d: return 'Premium cotton blend. Soft hand-feel for everyday wear.'
    if 'pure cotton' in d or 'cotton' in d: return 'Pure cotton. Breathable and easy-care.'
    if 'satin' in d: return 'Satin finish fabric with fluid drape.'
    if 'drycell' in d or 'puma' in d: return 'Performance DryCELL fabric. Moisture-wicking.'
    return 'Curated branded fabric selected for comfort and longevity.'

def care_from(desc):
    d = desc.lower()
    if 'dry clean' in d: return 'Dry clean recommended. Steam to refresh.'
    if 'machine wash' in d: return 'Machine wash cold gentle. Line dry. Warm iron if needed.'
    return 'Gentle machine wash cold or hand wash. Do not bleach. Line dry. Warm iron on reverse.'

with open('/tmp/products.json') as f:
    products = json.load(f).get('products', [])

# Parse existing catalog items so we can just update the `description` and `material`
# It's easier to just read the existing catalog and regex replace descriptions 
# based on handles/slugs.

current_catalog = open('src/lib/catalog.ts').read()

for p in products:
    slug = p['handle']
    # body_html can be empty
    body_html = p.get('body_html') or p['title']
    
    # We want to replace the existing description in catalog.ts
    # The existing description looks like: description: "...",
    # Let's find the block for this slug.
    # regex to find the object with this slug
    pattern = r'(slug:\s*"' + re.escape(slug) + r'".*?description:\s*)"(?:[^"\\]|\\.)*"'
    
    # Replacement string with the new HTML body
    replacement = r'\1' + json.dumps(body_html).replace('\\', '\\\\')
    
    current_catalog = re.sub(pattern, replacement, current_catalog, flags=re.DOTALL)

open('src/lib/catalog.ts', 'w').write(current_catalog)
print("Catalog updated with HTML descriptions.")
