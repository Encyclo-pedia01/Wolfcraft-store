export const instant = false;

import { createClient } from "@/lib/supabase/server";
import CustomForm from "./CustomForm";

export default async function CustomPage() {
  const supabase = (await createClient()) as any;
  const { data: attire } = await supabase
    .from("attire")
    .select("id,name,base_price")
    .eq("is_active", true);

  return <CustomForm attire={attire ?? []} />;
}