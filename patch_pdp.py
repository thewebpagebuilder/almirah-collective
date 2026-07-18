import re
from pathlib import Path

t = Path('src/components/product/product-detail-client.tsx').read_text()

# We need to change the size selector to use stockBySize to disable out of stock sizes.
# First, update the Product type.
t = t.replace('stock: number;', 'stock: number;\n  stockBySize: Record<string, number>;')

# Update size mapping in the render block:
size_block = r'\{product\.sizes\.map\(\(s\) \=\> \(\s*<button\s*key=\{s\}\s*type="button"\s*onClick=\{\(\) => setSize\(s\)\}.*?\>.*?\{s\}\s*\<\/button\>\s*\)\)\}'

new_size_block = '''{product.sizes.map((s) => {
                const isAvailable = (product.stockBySize[s] || 0) > 0;
                return (
                <button
                  key={s}
                  type="button"
                  disabled={!isAvailable}
                  onClick={() => setSize(s)}
                  className={cn(
                    "min-w-12 border px-3 py-2.5 text-sm transition relative overflow-hidden",
                    !isAvailable && "opacity-40 cursor-not-allowed bg-transparent border-obsidian/10 text-obsidian/40",
                    isAvailable && size === s
                      ? "border-obsidian bg-obsidian text-pearl"
                      : "border-obsidian/20 hover:border-obsidian",
                  )}
                >
                  {s}
                  {!isAvailable && <span className="absolute inset-0 border-t border-obsidian/40 rotate-[20deg] scale-150 origin-center" />}
                </button>
              )})}'''

t = re.sub(size_block, new_size_block, t, flags=re.DOTALL)

Path('src/components/product/product-detail-client.tsx').write_text(t)
print("PDP patched for sizing.")
