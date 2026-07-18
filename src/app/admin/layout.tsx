import type { ReactNode } from "react";

/** Admin uses its own dark chrome; hide storefront chrome spacing quirks */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="-mt-0">{children}</div>;
}
