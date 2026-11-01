"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutForm({
  attire,
  variant,
  design,
}: {
  attire: any;
  variant: any;
  design: any;
}) {
  const supabase = createClient() as any;
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "hostel">("pickup");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "cod">("momo");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = Number(attire.base_price) + Number(design.price);
  const deliveryFee = deliveryType === "hostel" ? 10 : 0;
  const total = subtotal + deliveryFee;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1. Create order
      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          customer_name: name,
          phone,
          order_type: "ready",
          status: "confirmed",
          subtotal,
          delivery_fee: deliveryFee,
          total,
          payment_method: paymentMethod,
          delivery_type: deliveryType,
          delivery_address: deliveryType === "hostel" ? address : null,
          notes: notes || null,
        })
        .select("id,ref_code")
        .single();

      if (orderErr || !order) throw orderErr ?? new Error("Order failed");

      // 2. Create line item
      const { error: itemErr } = await supabase.from("order_items").insert({
        order_id: order.id,
        attire_id: attire.id,
        variant_id: variant.id,
        design_id: design.id,
        quantity: 1,
        unit_price: subtotal,
      });

      if (itemErr) throw itemErr;

      // 3. Redirect to confirmation page
      router.push(
        `/order/${order.ref_code}?phone=${encodeURIComponent(phone)}`
      );
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>
              {attire.name} ({variant.size}, {variant.color})
            </span>
            <span>GHS {Number(attire.base_price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Wolfcraft design: {design.name}</span>
            <span>GHS {Number(design.price).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery ({deliveryType})</span>
            <span>GHS {deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold border-t border-slate-200 pt-3 mt-3">
            <span>Total</span>
            <span>GHS {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-semibold mb-1">Full name</label>
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

        <div>
          <label className="block text-sm font-semibold mb-1">Payment</label>
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
          {paymentMethod === "momo" && (
            <p className="text-xs text-slate-500 mt-2">
              You'll receive a MoMo prompt on your phone after placing the
              order.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2"
            rows={2}
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#0B1F3A] text-white py-3 rounded-lg font-semibold hover:bg-[#122a4a] disabled:opacity-40"
        >
          {submitting
            ? "Placing order…"
            : `Place Order — GHS ${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}