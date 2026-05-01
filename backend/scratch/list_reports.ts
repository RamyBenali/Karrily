import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listReports() {
    const { data, error } = await supabase
        .from("reports")
        .select(`
            *,
            reporter:profiles!reporter_id(full_name),
            item:items!reported_item_id(title)
        `);

    if (error) {
        console.error("Fetch failed:", error);
    } else {
        console.log("Reports found:", data);
    }
}

listReports();
