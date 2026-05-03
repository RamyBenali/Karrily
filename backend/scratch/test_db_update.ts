import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "backend/.env") });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
    const id = "4a2b7602-f300-4663-969d-6e1ac1f2c854";
    const { data, error } = await supabase
        .from("reports")
        .update({ 
            status: "ignored",
            resolved_at: new Date().toISOString(),
            resolved_by: "b1249e02-16e7-41f9-8fcf-edca29c55667",
            admin_notes: "Validé via modération"
        })
        .eq("reported_review_id", id)
        .select();
    console.log("Error:", error);
    console.log("Data:", data);
}
check();
