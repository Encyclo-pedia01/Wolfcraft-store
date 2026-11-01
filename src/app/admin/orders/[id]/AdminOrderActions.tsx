"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const READY_STEPS = ["confirmed", "designing", "printing", "ready", "delivered"];
const CUSTOM_STEPS = [
  "pending_quote",
  "confirmed",
  "designing",
  "printing",
  "ready",
  "delivered",
];

export default function AdminOrderActions({ order }: { order: any }) {
  const supabase = createClient() as any;
  const router = useRouter();

  const [quote, setQuote] = useState<string>(
    Number(order.total) > 0 ? String(order.total) : ""
  );
  const [status, setStatus] = useState<string>(order.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isCustom = order.order_type === "custom";
  const steps = isCustom ? CUSTOM_STEPS : READY_STEPS;

  async function saveQuote() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const amount = Number(quote);
    if (!amount || amount <= 0) {
      setError("Enter a valid amount");
      setSaving(false);
      return;
    }

    const subtotal = amount - Number(order.delivery_fee);

    // Update order total
    const { error: orderErr } = await supabase
      .from("orders")
      .update({
        total: amount,
        subtotal,
        status: "confirmed",
      })
      .eq("id", order.id);

    if (orderErr) {
      setError(orderErr.message);
      setSaving(false);
      return;
    }

    // Update custom request
    const { error: reqErr } = await supabase
      .from("custom_requests")
      .update({
        quote_amount: amount,
        quote_status: "quoted",
        quote_sent_at: new Date().toISOString(),
      })
      .eq("order_id", order.id);

    if (reqErr) {
      setError(reqErr.message);
      setSaving(false);
      return;
    }

    setStatus("confirmed");
    setSuccess("Quote saved and order marked confirmed.");
    setSaving(false);
    router.refresh();
  }

  async function updateStatus(newStatus: string) {
    setSaving(true);
    setError(null);
    setSuccess(null);

    const updates: any = { status: newStatus };
    if (newStatus === "delivered" && order.payment_method === "cod") {
      updates.payment_status = "paid";
    }

    const { error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", order.id);

    if (error) {
      setError(error.message);
    } else {
      setStatus(newStatus);
      setSuccess(`Status changed to ${newStatus.replace("_", " ")}.`);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      {/* Quote (custom only) */}
      {isCustom && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold mb-3">Quote</h2>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">
                Total price (GHS)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                placeholder="160.00"
              />
            </div>
            <button
              onClick={saveQuote}
              disabled={saving}
              className="bg-[#0B1F3A] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#122a4a] disabled:opacity-40"
            >
              {saving ? "Saving…" : "Save Quote"}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Delivery fee already includes GHS{" "}
            {Number(order.delivery_fee).toFixed(2)}. Setting a quote marks
            status as <strong>confirmed</strong>.
          </p>
        </div>
      )}

      {/* Status */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold mb-3">Change Status</h2>
        <div className="flex flex-wrap gap-2">
          {steps.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={saving || s === status || s === "pending_quote"}
              className={`px-4 py-2 rounded-lg border text-sm capitalize ${
                s === status
                  ? "bg-[#0B1F3A] text-white border-[#0B1F3A]"
                  : "bg-white border-slate-300 hover:border-[#0B1F3A]"
              } disabled:opacity-40`}
            >
              {s === "pending_quote" ? "pending quote" : s}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-700 text-sm">{success}</p>}
    </div>
  );
}