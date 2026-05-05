"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBasket, LayoutDashboard, Upload, BarChart3, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/compare", label: "Compare", icon: BarChart3 },
  { href: "/nearby", label: "Nearby", icon: MapPin },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-black/[0.06]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-ink-900">
          <span className="grid place-items-center w-8 h-8 rounded-xl bg-brand-600 text-white">
            <ShoppingBasket size={18} />
          </span>
          AussieBasket
        </Link>
        <nav className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href || path.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5",
                  active ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-gray-100"
                )}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
