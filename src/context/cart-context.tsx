"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  productId: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartLine, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: number, size?: string, color?: string) => void;
  updateQuantity: (
    productId: number,
    quantity: number,
    size?: string,
    color?: string,
  ) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "almirah-collective-cart";

function lineKey(productId: number, size?: string, color?: string) {
  return `${productId}|${size ?? ""}|${color ?? ""}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const addItem = useCallback(
    (item: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      setItems((prev) => {
        const key = lineKey(item.productId, item.size, item.color);
        const existing = prev.find(
          (p) => lineKey(p.productId, p.size, p.color) === key,
        );
        if (existing) {
          return prev.map((p) =>
            lineKey(p.productId, p.size, p.color) === key
              ? { ...p, quantity: p.quantity + (item.quantity ?? 1) }
              : p,
          );
        }
        return [...prev, { ...item, quantity: item.quantity ?? 1 }];
      });
      setIsOpen(true);
    },
    [],
  );

  const removeItem = useCallback(
    (productId: number, size?: string, color?: string) => {
      const key = lineKey(productId, size, color);
      setItems((prev) =>
        prev.filter((p) => lineKey(p.productId, p.size, p.color) !== key),
      );
    },
    [],
  );

  const updateQuantity = useCallback(
    (productId: number, quantity: number, size?: string, color?: string) => {
      const key = lineKey(productId, size, color);
      setItems((prev) =>
        prev
          .map((p) =>
            lineKey(p.productId, p.size, p.color) === key
              ? { ...p, quantity }
              : p,
          )
          .filter((p) => p.quantity > 0),
      );
    },
    [],
  );

  const clearCart = useCallback(() => setItems([]), []);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items],
  );

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal,
      itemCount,
    }),
    [
      items,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal,
      itemCount,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
