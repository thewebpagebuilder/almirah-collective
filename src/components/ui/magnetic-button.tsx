"use client";

import Link from "next/link";
import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "gold";
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick">;

const variants = {
  primary:
    "bg-obsidian text-pearl hover:bg-obsidian/90 border border-obsidian",
  secondary:
    "bg-transparent text-obsidian border border-obsidian/30 hover:border-obsidian",
  ghost: "bg-transparent text-obsidian hover:text-champagne-dark",
  gold: "bg-champagne text-obsidian hover:bg-champagne-dark border border-champagne",
};

export function MagneticButton({
  href,
  children,
  variant = "primary",
  className,
  onClick,
  ...props
}: Props) {
  const ref = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    el.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "translate(0, 0)";
  };

  const classes = cn(
    "inline-flex items-center justify-center gap-2 px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] font-medium transition-all duration-300 ease-out will-change-transform",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        ref={ref as React.RefObject<HTMLAnchorElement>}
        className={classes}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      className={classes}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      {...props}
    >
      {children}
    </button>
  );
}
