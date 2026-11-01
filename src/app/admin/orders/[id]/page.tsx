export const instant = false;

import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AdminOrderActions from "./AdminOrderActions";

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = (await createClient()) as any;

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*, attire:attire(name), design:designs(name)")
    .eq("order_id", order.id);

  let customReq: any = null;
  let imageUrl: string | null = null;
  let customAttireName: string | null = null;

  if (order.order_type === "custom") {
    const { data: cr } = await supabase
      .from("custom_requests")
      .select("*")
      .eq("order_id", order.id)
      .single();
    customReq = cr;

    if (cr?.attire_id) {
      const { data: att } = await supabase
        .from("attire")
        .select("name")
        .eq("id", cr.attire_id)
        .single();
      customAttireName = att?.name ?? null;
    }

    // Generate a temporary signed URL for the uploaded image
    if (cr?.upload_url) {
      const { data: signed } = await supabase.storage
        .from("custom-uploads")
        .createSignedUrl(cr.upload_url, 60 * 60); // valid for 1 hour
      imageUrl = signed?.signedUrl ?? null;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/admin" className="text-sm text-slate-500 hover:underline">
        ← Back to orders
      </Link>

      <div className="flex items-start justify-between mt-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">{order.ref_code}</h1>
          <p className="text-slate-600">
            {order.customer_name} · {order.phone}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 capitalize">
            {order.order_type} order
          </p>
          <p className="text-sm font-medium capitalize">
            Status: {order.status.replace("_", " ")}
          </p>
        </div>
      </div>

      {/* Request details */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-3">Request Details</h2>
        {order.order_type === "custom" ? (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Attire</span>
              <span className="font-medium">{customAttireName ?? "—"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-600">Input type</span>
              <span className="font-medium capitalize">
                {customReq?.input_type ?? "—"}
              </span>
            </div>
            {customReq?.idea_text && (
              <div>
                <p className="text-slate-600 mb-1">Idea</p>
                <p className="bg-slate-50 border border-slate-200 rounded-lg p-3 whitespace-pre-wrap">
                  {customReq.idea_text}
                </p>
              </div>
            )}
            {imageUrl && (
              <div>
                <p className="text-slate-600 mb-2">Uploaded Reference</p>
                <a href={imageUrl} target="_blank" rel="noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Reference"
                    className="w-48 rounded-lg border border-slate-200 hover:opacity-80"
                  />
                </a>
                <p className="text-xs text-slate-500 mt-1">
                  Click to open full size
                </p>
              </div>
            )}
          </div>
        ) : (
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
        )}

        <div className="border-t border-slate-200 mt-4 pt-3 text-sm space-y-1">
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
              {order.payment_method === "momo" ? "MoMo" : "COD"} (
              {order.payment_status})
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <AdminOrderActions order={order} />
    </div>
  );
}