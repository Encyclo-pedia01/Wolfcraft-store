import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Encyclopedia × Wolfcraft",
  description: "Premium custom T-shirts for UPSA students",
  // If you have a favicon URL from Supabase, you can paste it here:
  // icons: { icon: "YOUR_FAVICON_URL_HERE" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#051024] text-white flex flex-col min-h-screen`}>
        
        {/* HEADER */}
        <header className="bg-[#051024]/90 backdrop-blur-md sticky top-0 z-50 border-b border-white/10">
          <nav className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            
            {/* LOGO & BRAND NAME */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#00E5FF]/30 group-hover:border-[#00E5FF] transition-colors">
                {/* Make sure to replace this with your actual logo URL if you have one */}
                <Image
                  src="https://drtyrktxrzfioazkgrsj.supabase.co/storage/v1/object/public/designs/logo.png" 
                  alt="Encyclopedia x Wolfcraft Logo"
                  fill
                  className="object-cover bg-[#051024]"
                />
              </div>
              <span className="font-bold text-lg md:text-xl tracking-tight hidden sm:block">
                Encyclopedia <span className="text-[#00E5FF]">×</span> Wolfcraft
              </span>
            </Link>

            <div className="flex gap-6 text-sm font-semibold">
              <Link href="/shop" className="hover:text-[#00E5FF] transition-colors">Shop</Link>
              <Link href="/custom" className="hover:text-[#00E5FF] transition-colors">Custom</Link>
              <Link href="/track" className="hover:text-[#00E5FF] transition-colors">Track Order</Link>
            </div>
          </nav>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* FOOTER */}
        <footer className="bg-[#0B1F3A] border-t border-white/10 text-slate-400 text-sm py-12 mt-16">
          <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-between gap-6">
            
            <div className="relative w-16 h-16 opacity-50 hover:opacity-100 transition-opacity">
               <Image
                  src="https://drtyrktxrzfioazkgrsj.supabase.co/storage/v1/object/public/designs/logo.png"
                  alt="Wolfcraft Logo"
                  fill
                  className="object-contain"
                />
            </div>

            <div className="text-center">
              <p className="font-bold tracking-widest uppercase text-xs mb-2 text-slate-300">
                Powered by The Academic Encyclopedia & Wolfcraft
              </p>
              <p>© {new Date().getFullYear()} — UPSA Edition</p>
            </div>
          </div>
        </footer>

        {/* VERCEL ANALYTICS */}
        <Analytics />
        
      </body>
    </html>
  );
}