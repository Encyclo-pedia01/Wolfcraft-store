"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Attire = { id: string; name: string; base_price: number };

export default function CustomForm({ attire }: { attire: Attire[] }) {
  const supabase = createClient() as any;
  const router = useRouter();

  const [attireId, setAttireId] = useState(attire[0]?.id ?? "");
  const [inputType, setInputType] = useState<"upload" | "idea" | "both">("idea");
  const [file, setFile] = useState<File | null>(null);
  const [idea, setIdea] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "hostel">("pickup");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "cod">("momo");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedAttire = attire.find((a) => a.id === attireId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Upload file if provided
      let uploadUrl: string | null = null;
      if ((inputType === "upload" || inputType === "both") && file) {
        const ext = file.name.split(".").pop() || "png";
        const path = `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("custom-uploads")
          .upload(path, file);
        if (upErr) throw upErr;
        uploadUrl = path;
      }

      // 2. Create order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_name: name,
          phone,
          order_type: "custom",
          status: "pending_quote",
          subtotal: 0,
          delivery_fee: deliveryType === "hostel" ? 10 : 0,
          total: 0,
          payment_method: paymentMethod,
          delivery_type: deliveryType,
          delivery_address: deliveryType === "hostel" ? address : null,
        })
        .select("id,ref_code")
        .single();

      if (orderErr || !order) throw orderErr ?? new Error("Order failed");

      // 3. Create the custom request
      const { error: reqErr } = await supabase.from("custom_requests").insert({
        order_id: order.id,
        attire_id: attireId,
        input_type: inputType,
        upload_url: uploadUrl,
        idea_text: idea || null,
      });

      if (reqErr) throw reqErr;

      router.push(
        `/order/${order.ref_code}?phone=${encodeURIComponent(phone)}`
      );
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Custom Design Request</h1>
      <p className="text-slate-600 mb-8">
        Tell us your idea or send a reference — we'll design it and send you a
        quote.
      </p>

      <form
        onSubmit={submit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-5"
      >
        {/* Attire */}
        <div>
          <label className="block text-sm font-semibold mb-1">Attire</label>
          <select
            value={attireId}
            onChange={(e) => setAttireId(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
          >
            {attire.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {selectedAttire && (
            <p className="text-xs text-slate-500 mt-1">
              Base: GHS {Number(selectedAttire.base_price).toFixed(2)} (design
              fee quoted separately)
            </p>
          )}
        </div>

        {/* Input type */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            How do you want to describe your design?
          </label>
          <div className="flex gap-3">
            {(["upload", "idea", "both"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setInputType(t)}
                className={`flex-1 py-2 rounded-lg border text-sm capitalize ${
                  inputType === t
                    ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                    : "bg-white border-slate-300"
                }`}
              >
                {t === "upload" ? "Upload" : t === "idea" ? "Idea" : "Both"}
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        {(inputType === "upload" || inputType === "both") && (
          <div>
            <label className="block text-sm font-semibold mb-1">
              Reference image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm"
            />
          </div>
        )}

        {/* Idea */}
        {(inputType === "idea" || inputType === "both") && (
          <div>
            <label className="block text-sm font-semibold mb-1">
              Describe your idea
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={4}
              placeholder="e.g. A navy tee with 'Class of 2026' in bold cyan across the chest, small wolf emblem on the sleeve"
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>
        )}

        {/* Contact */}
        <div className="border-t border-slate-200 pt-4 space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Full name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="Ama Mensah"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Phone (MoMo number)
            </label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="024 000 0000"
            />
          </div>
        </div>

        {/* Delivery */}
        <div>
          <label className="block text-sm font-semibold mb-1">Delivery</label>
          <div className="flex gap-3">
            {(["pickup", "hostel"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDeliveryType(d)}
                className={`flex-1 py-2 rounded-lg border text-sm ${
                  deliveryType === d
                    ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                    : "bg-white border-slate-300"
                }`}
              >
                {d === "pickup"
                  ? "Campus pickup (free)"
                  : "Hostel delivery (+GHS 10)"}
              </button>
            ))}
          </div>
        </div>

        {deliveryType === "hostel" && (
          <div>
            <label className="block text-sm font-semibold mb-1">
              Hostel & room
            </label>
            <input
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="Block A, Room 204"
            />
          </div>
        )}

        {/* Payment preference */}
        <div>
          <label className="block text-sm font-semibold mb-1">
            Payment preference (you'll pay after we send the quote)
          </label>
          <div className="flex gap-3">
            {(["momo", "cod"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPaymentMethod(p)}
                className={`flex-1 py-2 rounded-lg border text-sm ${
                  paymentMethod === p
                    ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                    : "bg-white border-slate-300"
                }`}
              >
                {p === "momo" ? "Mobile Money" : "Cash on Delivery"}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0B1F3A] text-white py-3 rounded-lg font-semibold hover:bg-[#122a4a] disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit Custom Request"}
        </button>
      </form>
    </div>
  );
}