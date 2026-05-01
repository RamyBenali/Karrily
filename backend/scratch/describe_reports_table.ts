import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function describeTable() {
    const { data, error } = await supabase.rpc("get_table_columns", { table_name: "reports" });
    if (error) {
        // If RPC doesn't exist, try a direct query to information_schema if possible
        // Actually, Supabase doesn't allow direct query to information_schema via API usually
        // Let's try to just insert a dummy row and see what happens or if it fails on missing columns
        console.error("Error or RPC does not exist:", error.message);
        
        // Alternative: Try to select all columns and see the keys of the first row (if any)
        // But the table is empty.
        
        // Let's try to insert a row with basic fields and see if it works
        const testReport = {
            reporter_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
            target_type: 'item',
            target_id: '00000000-0000-0000-0000-000000000000',
            reason: 'Test report',
            status: 'pending'
        };
        const { error: insertError } = await supabase.from("reports").insert(testReport);
        if (insertError) {
            console.error("Insert failed:", insertError.message);
        } else {
            console.log("Insert worked! Table has standard columns.");
            // Clean up
            await supabase.from("reports").delete().eq("reason", "Test report");
        }
    } else {
        console.log("Table columns:", data);
    }
}

describeTable();
