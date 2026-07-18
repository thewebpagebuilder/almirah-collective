import re
from pathlib import Path

# Replace the description rendering in product-detail-client.tsx
f = Path('src/components/product/product-detail-client.tsx')
text = f.read_text()

old_block = '''          <div className="mt-5 max-w-lg text-sm leading-relaxed text-obsidian/70 space-y-4">
            {product.description.split("\\n").filter(Boolean).map((line, i) => (
              <p key={i}>{line.trim()}</p>
            ))}
          </div>'''

new_block = '''          <div 
            className="mt-5 max-w-lg text-sm leading-relaxed text-obsidian/70 space-y-4 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />'''

if old_block in text:
    f.write_text(text.replace(old_block, new_block))
    print("description patched")
else:
    print("description not found")

