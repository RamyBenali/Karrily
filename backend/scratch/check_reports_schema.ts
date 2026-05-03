import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "backend/.env") });

const supabaseUrl = process.env.SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkColumns() {
    // Get one row to see columns
    const { data, error } = await supabase
        .from("reports")
        .select("*")
        .limit(1);

    if (error) {
        console.error("Error fetching reports:", error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Columns in 'reports' table:", Object.keys(data[0]));
    } else {
        console.log("No data in 'reports' table, trying to get table info...");
        // Try to insert a dummy row or check metadata if possible
        // Actually, let's just try to select some specific columns
        const testColumns = ['id', 'reporter_id', 'reported_item_id', 'reported_user_id', 'reported_review_id', 'reason', 'status'];
        for (const col of testColumns) {
            const { error } = await supabase.from("reports").select(col).limit(1);
            console.log(`Column '${col}': ${error ? 'MISSING (' + error.message + ')' : 'EXISTS'}`);
        }
    }
}

checkColumns();
