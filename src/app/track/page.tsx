"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TrackPage() {
  const supabase = createClient() as any;
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("orders")
      .select("ref_code")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      setError("No order found for that phone number.");
      setLoading(false);
      return;
    }
    router.push(`/order/${data.ref_code}?phone=${encodeURIComponent(phone)}`);
  }

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2 text-center">Track Your Order</h1>
      <p className="text-slate-600 text-center mb-8">
        Enter the phone number you used at checkout.
      </p>
      <form onSubmit={lookup} className="space-y-4">
        <input
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="024 000 0000"
          className="w-full border border-slate-300 rounded-lg px-3 py-3"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-[#0B1F3A] text-white py-3 rounded-lg font-semibold hover:bg-[#122a4a] disabled:opacity-40"
        >
          {loading ? "Looking up…" : "Find my order"}
        </button>
      </form>
    </div>
  );
}