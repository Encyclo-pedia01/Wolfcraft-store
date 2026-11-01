export const instant = false;

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutForm from "./CheckoutForm";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ attire?: string; variant?: string; design?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.attire || !sp.variant || !sp.design) notFound();

  const supabase = (await createClient()) as any;

  const [{ data: attire }, { data: variant }, { data: design }] =
    await Promise.all([
      supabase.from("attire").select("*").eq("id", sp.attire).single(),
      supabase.from("attire_variants").select("*").eq("id", sp.variant).single(),
      supabase.from("designs").select("*").eq("id", sp.design).single(),
    ]);

  if (!attire || !variant || !design) notFound();

  return <CheckoutForm attire={attire} variant={variant} design={design} />;
}