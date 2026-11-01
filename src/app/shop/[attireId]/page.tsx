export const instant = false;

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AttireConfigurator from "./AttireConfigurator";

export default async function AttirePage({
  params,
}: {
  params: Promise<{ attireId: string }>;
}) {
  const { attireId } = await params;
  const supabase = (await createClient()) as any;

  const { data: attire } = await supabase
    .from("attire")
    .select("id,name,type,description,base_price,image_url")
    .eq("id", attireId)
    .eq("is_active", true)
    .single();

  if (!attire) notFound();

  const { data: variants } = await supabase
    .from("attire_variants")
    .select("id,attire_id,size,color,stock")
    .eq("attire_id", attireId);

  const { data: linked } = await supabase
    .from("design_attire")
    .select("design:designs(id,name,image_url,price,is_wolfcraft_exclusive,drop_name)")
    .eq("attire_id", attireId);

  const designs = (linked ?? [])
    .map((row: any) => row.design)
    .filter(Boolean);

  return (
    <AttireConfigurator
      attire={attire}
      variants={variants ?? []}
      designs={designs}
    />
  );
}