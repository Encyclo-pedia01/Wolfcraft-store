export const instant = false;

import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Design = {
  id: string;
  name: string;
  image_url: string;
  price: number;
  drop_name: string | null;
};

export default async function Home() {
  const supabase = (await createClient()) as any;
  const { data: designs } = await supabase
    .from("designs")
    .select("id,name,image_url,price,drop_name")
    .eq("is_active", true)
    .eq("is_wolfcraft_exclusive", true)
    .limit(3);

  const featured = (designs ?? []) as Design[];

  return (
    <div>
                  {/* HERO SECTION - Full Banner */}
      <section className="relative w-full max-w-7xl mx-auto px-4 pt-8 pb-12">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#00E5FF]/20 border border-[#00E5FF]/30">
          <Image
            src="https://drtyrktxrzfioazkgrsj.supabase.co/storage/v1/object/public/designs/Futuristic%20Wolfcraft%20Academic%20Collaboration.png"
            alt="Encyclopedia x Wolfcraft Collaboration"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
        
        {/* Buttons under the banner */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <Link
            href="/shop"
            className="bg-[#00E5FF] text-[#051024] font-bold px-10 py-4 rounded-md hover:bg-cyan-300 transition-colors text-lg text-center"
          >
            Shop the Drop
          </Link>
          <Link
            href="/custom"
            className="border-2 border-[#00E5FF] text-[#00E5FF] font-bold px-10 py-4 rounded-md hover:bg-[#00E5FF]/10 transition-colors text-lg text-center"
          >
            Request Custom Design
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
          {[
            { n: "1", t: "Pick your attire", d: "Choose a T-shirt in your size and color." },
            { n: "2", t: "Pick your design", d: "Browse exclusive Wolfcraft designs." },
            { n: "3", t: "Checkout & track", d: "Pay via MoMo or cash on delivery. Track any time." },
          ].map((s) => (
            <div key={s.n}>
              <div className="w-10 h-10 rounded-full bg-[#0B1F3A] text-[#22D3EE] flex items-center justify-center font-bold mb-3">
                {s.n}
              </div>
              <h3 className="font-semibold mb-1">{s.t}</h3>
              <p className="text-slate-600 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
