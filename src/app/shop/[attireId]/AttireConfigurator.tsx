"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Attire = {
  id: string;
  name: string;
  description: string | null;
  base_price: number;
  image_url: string | null;
};

type Variant = {
  id: string;
  attire_id: string;
  size: string;
  color: string;
  stock: number;
};

type Design = {
  id: string;
  name: string;
  image_url: string;
  price: number;
};

export default function AttireConfigurator({
  attire,
  variants,
  designs,
}: {
  attire: Attire;
  variants: Variant[];
  designs: Design[];
}) {
  const router = useRouter();
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [designId, setDesignId] = useState<string>("");

  const sizes = useMemo(
    () => Array.from(new Set(variants.map((v) => v.size))),
    [variants]
  );

  const availableColors = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .filter((v) => !size || v.size === size)
            .map((v) => v.color)
        )
      ),
    [variants, size]
  );

  const selectedVariant = variants.find(
    (v) => v.size === size && v.color === color
  );
  const selectedDesign = designs.find((d) => d.id === designId);

  const total =
    Number(attire.base_price) +
    (selectedDesign ? Number(selectedDesign.price) : 0);

  function continueToCheckout() {
    if (!selectedVariant || !selectedDesign) return;
    const params = new URLSearchParams({
      attire: attire.id,
      variant: selectedVariant.id,
      design: selectedDesign.id,
    });
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
      {/* Image */}
      <div>
        {attire.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={attire.image_url}
            alt={attire.name}
            className="w-full rounded-xl border border-slate-200"
          />
        ) : (
          <div className="w-full aspect-square bg-slate-100 rounded-xl" />
        )}
      </div>

      {/* Config */}
      <div>
        <h1 className="text-3xl font-bold">{attire.name}</h1>
        <p className="text-slate-600 mt-1">{attire.description}</p>

        <div className="mt-8 space-y-6">
          {/* Size */}
          <div>
            <label className="block text-sm font-semibold mb-2">Size</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSize(s);
                    setColor("");
                  }}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    size === s
                      ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                      : "bg-white border-slate-300 hover:border-[#0B1F3A]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          {size && (
            <div>
              <label className="block text-sm font-semibold mb-2">Color</label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((c) => {
                  const v = variants.find(
                    (x) => x.size === size && x.color === c
                  );
                  const inStock = v && v.stock > 0;
                  return (
                    <button
                      key={c}
                      disabled={!inStock}
                      onClick={() => setColor(c)}
                      className={`px-4 py-2 rounded-lg border text-sm ${
                        color === c
                          ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                          : "bg-white border-slate-300 hover:border-[#0B1F3A]"
                      } ${!inStock ? "opacity-40 cursor-not-allowed" : ""}`}
                    >
                      {c}
                      {!inStock && " (out)"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Design */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Choose your Wolfcraft design
            </label>
            <div className="grid grid-cols-3 gap-3">
              {designs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDesignId(d.id)}
                  className={`border rounded-lg overflow-hidden text-left ${
                    designId === d.id
                      ? "ring-2 ring-[#22D3EE] border-[#22D3EE]"
                      : "border-slate-300 hover:border-[#0B1F3A]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.image_url}
                    alt={d.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">{d.name}</p>
                    <p className="text-xs text-slate-500">
                      + GHS {Number(d.price).toFixed(2)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Total + CTA */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Total</span>
              <span>GHS {total.toFixed(2)}</span>
            </div>
            <button
              onClick={continueToCheckout}
              disabled={!selectedVariant || !selectedDesign}
              className="w-full bg-[#0B1F3A] text-white py-3 rounded-lg font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#122a4a]"
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}