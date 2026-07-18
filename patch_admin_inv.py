import re
from pathlib import Path

t = Path('src/components/admin/admin-client.tsx').read_text()

# Add state for New Product Modal
if 'showNewProduct' not in t:
    t = t.replace('const [customTo, setCustomTo] = useState("");',
                  'const [customTo, setCustomTo] = useState("");\n  const [showNewProduct, setShowNewProduct] = useState(false);\n  const [newProductForm, setNewProductForm] = useState({ name: "", description: "", price: "", categorySlug: "womens-wear", image: "", stockBySize: { S: 0, L: 0, XL: 0, XXL: 0, "Free Size": 0 } });')

# Rewrite updateStock to handle stockBySize
t = re.sub(
    r'async function updateStock\(id: number, stock: number\) \{.*?router\.refresh\(\)\);\n  \}',
    '''async function updateStockBySize(id: number, currentStock: Record<string, number>, size: string, change: number) {
    setMessage("");
    const newStock = { ...currentStock, [size]: Math.max(0, (currentStock[size] || 0) + change) };
    const res = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stockBySize: newStock }),
    });
    if (!res.ok) return setMessage("Failed to update stock");
    setMessage("Inventory updated");
    startTransition(() => router.refresh());
  }
  
  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    setMessage("Creating...");
    const res = await fetch("/api/admin/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProductForm),
    });
    if (!res.ok) return setMessage("Failed to create product");
    setMessage("Product added");
    setShowNewProduct(false);
    startTransition(() => router.refresh());
  }

  async function deleteProduct(id: number) {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setMessage("Deleting...");
    const res = await fetch(`/api/admin/inventory?id=${id}`, { method: "DELETE" });
    if (!res.ok) return setMessage("Failed to delete");
    setMessage("Product deleted");
    startTransition(() => router.refresh());
  }''',
    t,
    flags=re.DOTALL
)

# Rewrite the inventory tab UI
old_inv_block = r'\{tab === "inventory" && \(.*?\<h2 className="font-serif text-3xl"\>Inventory management\<\/h2>.*?<\/tbody>\s*\<\/table>\s*\<\/div>\s*\<\/div>\s*\)\}'

new_inv_block = '''{tab === "inventory" && (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl">Inventory management</h2>
              <button onClick={() => setShowNewProduct(true)} className="bg-champagne px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-obsidian font-bold">
                + Add New Product
              </button>
            </div>
            
            {showNewProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-obsidian/80 p-4">
                <form onSubmit={createProduct} className="w-full max-w-lg bg-obsidian p-6 border border-pearl/20 overflow-y-auto max-h-[90vh]">
                  <h3 className="font-serif text-2xl mb-4 text-champagne">Add New Product</h3>
                  <div className="space-y-4 text-sm">
                    <input required placeholder="Product Name" className="w-full bg-transparent border border-pearl/20 px-3 py-2" value={newProductForm.name} onChange={e => setNewProductForm({...newProductForm, name: e.target.value})} />
                    <textarea required placeholder="Description (Supports HTML for bullet points)" rows={4} className="w-full bg-transparent border border-pearl/20 px-3 py-2" value={newProductForm.description} onChange={e => setNewProductForm({...newProductForm, description: e.target.value})} />
                    <input required type="number" placeholder="Price (INR)" className="w-full bg-transparent border border-pearl/20 px-3 py-2" value={newProductForm.price} onChange={e => setNewProductForm({...newProductForm, price: e.target.value})} />
                    <input required placeholder="Image URL (e.g. https://...)" className="w-full bg-transparent border border-pearl/20 px-3 py-2" value={newProductForm.image} onChange={e => setNewProductForm({...newProductForm, image: e.target.value})} />
                    
                    <select className="w-full bg-transparent border border-pearl/20 px-3 py-2" value={newProductForm.categorySlug} onChange={e => setNewProductForm({...newProductForm, categorySlug: e.target.value})}>
                      <option className="bg-obsidian" value="womens-wear">Women's Wear</option>
                      <option className="bg-obsidian" value="mens-wear">Men's Wear</option>
                      <option className="bg-obsidian" value="indian-casuals">Indian Casuals</option>
                      <option className="bg-obsidian" value="dresses">Dresses</option>
                      <option className="bg-obsidian" value="co-ord-sets">Co-ord Sets</option>
                      <option className="bg-obsidian" value="blouses-tops">Blouses & Tops</option>
                      <option className="bg-obsidian" value="active-wear">Active-Wear</option>
                    </select>

                    <div className="pt-2 border-t border-pearl/10">
                      <p className="text-[10px] uppercase tracking-widest text-champagne mb-2">Initial Stock</p>
                      <div className="grid grid-cols-2 gap-3">
                        {["S", "L", "XL", "XXL", "Free Size"].map(s => (
                          <label key={s} className="flex items-center justify-between border border-pearl/10 px-2 py-1">
                            <span className="text-xs">{s}</span>
                            <input type="number" min="0" className="w-16 bg-transparent text-right outline-none" value={(newProductForm.stockBySize as any)[s]} onChange={e => setNewProductForm({...newProductForm, stockBySize: {...newProductForm.stockBySize, [s]: parseInt(e.target.value) || 0}})} />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowNewProduct(false)} className="px-4 py-2 text-xs uppercase tracking-widest text-pearl/50 hover:text-pearl">Cancel</button>
                    <button type="submit" className="bg-champagne px-4 py-2 text-[11px] uppercase tracking-[0.15em] text-obsidian font-bold">Save Product</button>
                  </div>
                </form>
              </div>
            )}

            <div className="mt-6 overflow-x-auto border border-pearl/10">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-pearl/5 text-[10px] uppercase tracking-[0.15em] text-pearl/45">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category / Price</th>
                    <th className="px-4 py-3 min-w-[320px]">Stock by Size (+ / -)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-pearl/8">
                      <td className="px-4 py-3 align-top max-w-[200px]">
                        <p className="line-clamp-2">{p.name}</p>
                        <p className="text-[10px] text-champagne mt-1">Total Stock: {p.stock}</p>
                      </td>
                      <td className="px-4 py-3 align-top capitalize text-pearl/60">
                        {p.categorySlug.replace(/-/g, " ")}
                        <br/><span className="text-pearl">{formatCurrency(p.price)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {["S", "L", "XL", "XXL", "Free Size"].map(size => {
                            const val = p.stockBySize?.[size] || 0;
                            return (
                              <div key={size} className="flex items-center justify-between border border-pearl/15 p-1 bg-pearl/[0.02]">
                                <span className="text-pearl/60 w-12 truncate">{size}</span>
                                <span className={cn("font-mono w-6 text-center", val === 0 ? "text-red-400" : "text-champagne")}>{val}</span>
                                <div className="flex gap-1">
                                  <button onClick={() => updateStockBySize(p.id, p.stockBySize, size, -1)} className="px-1.5 bg-pearl/10 hover:bg-pearl/20">−</button>
                                  <button onClick={() => updateStockBySize(p.id, p.stockBySize, size, 1)} className="px-1.5 bg-pearl/10 hover:bg-pearl/20">+</button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <button onClick={() => deleteProduct(p.id)} className="text-[10px] uppercase tracking-widest text-red-400 hover:text-red-300 border border-red-900/30 px-2 py-1">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}'''

t = re.sub(old_inv_block, new_inv_block, t, flags=re.DOTALL)
Path('src/components/admin/admin-client.tsx').write_text(t)
print("Admin inventory patched.")
