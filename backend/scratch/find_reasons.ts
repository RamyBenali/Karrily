import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConstraint() {
    // We can't query information_schema easily via PostgREST, but we can try to find it in the OpenAPI spec if it was an Enum
    // However, a Check Constraint is different.
    
    // Let's try to query with a common reason like 'spam' or 'inappropriate'
    const testReasons = ['spam', 'fraud', 'inappropriate', 'harassment', 'other'];
    
    for (const reason of testReasons) {
        const { error } = await supabase.from("reports").insert({
            reporter_id: 'a0000000-0000-0000-0000-000000000001',
            reason: reason,
            reported_item_id: '7af349f8-c4a9-4b8d-abd2-fd33f3b37c4d',
            status: 'pending'
        });
        
        if (error) {
            console.log(`Reason '${reason}' failed: ${error.message}`);
        } else {
            console.log(`Reason '${reason}' WORKED!`);
            // Clean up
            await supabase.from("reports").delete().eq("reason", reason);
            return;
        }
    }
}

checkConstraint();
