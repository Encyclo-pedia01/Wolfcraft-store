export const instant = false;

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const READY_STEPS = ["confirmed", "designing", "printing", "ready", "delivered"];
const CUSTOM_STEPS = [
  "pending_quote",
  "confirmed",
  "designing",
  "printing",
  "ready",
  "delivered",
];

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ phone?: string }>;
}) {
  const { ref } = await params;
  const { phone } = await searchParams;
  if (!phone) notFound();

  const supabase = (await createClient()) as any;

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("ref_code", ref)
    .eq("phone", phone)
    .single();

  if (!order) notFound();

  const isCustom = order.order_type === "custom";

  const { data: items } = await supabase
    .from("order_items")
    .select("*, attire:attire(name), design:designs(name)")
    .eq("order_id", order.id);

  let customReq: any = null;
  let customAttireName: string | null = null;
  
  if (isCustom) {
    const { data: cr } = await supabase
      .from("custom_requests")
      .select("*")
      .eq("order_id", order.id)
      .single();
      
    customReq = cr;
    
    // Simple, separate lookup for the attire name
    if (cr?.attire_id) {
      const { data: att } = await supabase
        .from("attire")
        .select("name")
        .eq("id", cr.attire_id)
        .single();
      customAttireName = att?.name ?? null;
    }
  }
  const steps = isCustom ? CUSTOM_STEPS : READY_STEPS;
  const currentIdx = steps.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <p className="text-[#22D3EE] text-sm uppercase tracking-widest mb-2">
          {isCustom ? "Custom Request Received" : "Order Confirmed"}
        </p>
        <h1 className="text-3xl font-bold">{order.ref_code}</h1>
        <p className="text-slate-600 mt-2">
          Thanks, {order.customer_name.split(" ")[0]}!{" "}
          {isCustom
            ? "We'll review your idea and send you a quote shortly."
            : "We've got your order."}
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-3">
          {isCustom ? "Your Request" : "Order Summary"}
        </h2>

        {isCustom ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Attire</span>
              <span className="font-medium">{customAttireName ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Input type</span>
              <span className="font-medium capitalize">
                {customReq?.input_type ?? "—"}
              </span>
            </div>
            {customReq?.idea_text && (
              <div>
                <p className="text-slate-600 mb-1">Your idea</p>
                <p className="bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap">
                  {customReq.idea_text}
                </p>
              </div>
            )}
            {customReq?.upload_url && (
              <p className="text-xs text-slate-500">
                ✓ Reference image on file (visible to our team only)
              </p>
            )}
            <div className="border-t border-slate-200 pt-3 mt-3 space-y-1">
              <div className="flex justify-between">
                <span>Delivery ({order.delivery_type})</span>
                <span>GHS {Number(order.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Quote</span>
                <span>
                  {Number(order.total) > 0
                    ? `GHS ${Number(order.total).toFixed(2)}`
                    : "Pending"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <ul className="space-y-2 text-sm">
              {(items ?? []).map((it: any) => (
                <li key={it.id} className="flex justify-between">
                  <span>
                    {it.attire?.name ?? "Attire"}
                    {it.design?.name ? ` — ${it.design.name}` : ""}
                    {it.quantity > 1 ? ` × ${it.quantity}` : ""}
                  </span>
                  <span>GHS {Number(it.line_total).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-200 mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Delivery ({order.delivery_type})</span>
                <span>GHS {Number(order.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span>Total</span>
                <span>GHS {Number(order.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment</span>
                <span className="capitalize">
                  {order.payment_method === "momo"
                    ? "Mobile Money"
                    : "Cash on Delivery"}{" "}
                  ({order.payment_status})
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Timeline */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Progress</h2>
        <ol className="space-y-3">
          {steps.map((s, i) => {
            const done = i <= currentIdx;
            const label =
              s === "pending_quote" ? "pending quote" : s.replace("_", " ");
            return (
              <li key={s} className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    done
                      ? "bg-[#0B1F3A] text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={
                    done
                      ? "font-medium capitalize"
                      : "text-slate-500 capitalize"
                  }
                >
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="text-center text-slate-500 text-sm">
        Save this link to check your order status anytime.
        <br />
        Or visit{" "}
        <a href="/track" className="text-[#0B1F3A] underline">
          /track
        </a>{" "}
        and enter your phone number.
      </p>
    </div>
  );
}