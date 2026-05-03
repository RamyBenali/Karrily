import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "backend/.env") });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function resetReview() {
    const id = "4a2b7602-f300-4663-969d-6e1ac1f2c854";
    
    // Set review to reported
    await supabase.from("reviews").update({ is_reported: true }).eq("id", id);
    
    // Reset report to pending
    await supabase.from("reports").update({ 
        status: "pending",
        resolved_at: null,
        resolved_by: null,
        admin_notes: null
    }).eq("reported_review_id", id);

    console.log("Review and its reports have been reset to 'reported/pending' state.");
}

resetReview();
