import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "backend/.env") });

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkReview() {
    const id = "4a2b7602-f300-4663-969d-6e1ac1f2c854";
    const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", id)
        .single();
    
    if (error) {
        console.error("Error fetching review:", error);
    } else {
        console.log("Review data:", data);
    }

    const { data: reports, error: reportsErr } = await supabase
        .from("reports")
        .select("*")
        .eq("reported_review_id", id);
    
    console.log("Associated reports:", reports);
}

checkReview();
