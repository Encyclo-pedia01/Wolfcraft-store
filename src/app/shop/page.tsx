export const instant = false;

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Attire = {
  id: string;
  name: string;
  type: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
};

export default async function ShopPage() {
  const supabase = (await createClient()) as any;
  const { data } = await supabase
    .from("attire")
    .select("id,name,type,description,base_price,image_url")
    .eq("is_active", true);

  const attire = (data ?? []) as Attire[];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Shop</h1>
      <p className="text-slate-600 mb-8">
        Pick an attire, then choose a Wolfcraft design.
      </p>

      {attire.length === 0 ? (
        <p className="text-slate-500">No attire available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {attire.map((a) => (
            <Link
              key={a.id}
              href={`/shop/${a.id}`}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition"
            >
              {a.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.image_url}
                  alt={a.name}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-slate-100" />
              )}
              <div className="p-4">
                <h3 className="font-semibold">{a.name}</h3>
                <p className="text-slate-600 text-sm">{a.description}</p>
                <p className="font-bold mt-2">
                  From GHS {Number(a.base_price).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}