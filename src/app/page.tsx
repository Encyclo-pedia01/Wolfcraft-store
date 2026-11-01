export const instant = false;

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
      {/* HERO */}
      <section className="bg-[#0B1F3A] text-white">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <p className="text-[#22D3EE] text-sm uppercase tracking-widest mb-4">
            The Official Collab
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            The Academic Encyclopedia{" "}
            <span className="text-[#22D3EE]">×</span> Wolfcraft
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Premium custom T-shirts for UPSA students. Pick your design, pick
            your color — delivered to your hostel or pickup on campus.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/shop"
              className="bg-[#22D3EE] text-[#0B1F3A] font-semibold px-6 py-3 rounded-lg hover:bg-cyan-300"
            >
              Shop the Drop
            </Link>
            <Link
              href="/custom"
              className="border border-[#22D3EE] text-[#22D3EE] px-6 py-3 rounded-lg hover:bg-[#22D3EE]/10"
            >
              Request Custom Design
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED DESIGNS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-6">Featured from the Drop</h2>
        {featured.length === 0 ? (
          <p className="text-slate-500">
            No designs yet — add some in the admin panel.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((d) => (
              <Link
                key={d.id}
                href="/shop"
                className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={d.image_url}
                  alt={d.name}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-4">
                  <p className="text-xs uppercase tracking-wide text-[#0B1F3A] font-semibold">
                    {d.drop_name ?? "Wolfcraft"}
                  </p>
                  <h3 className="font-semibold mt-1">{d.name}</h3>
                  <p className="text-[#0B1F3A] font-bold mt-2">
                    + GHS {Number(d.price).toFixed(2)} design fee
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
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