import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testInsert() {
    // Try to insert a dummy report for an item
    const { data, error } = await supabase
        .from("reports")
        .insert({
            reporter_id: '8697669d-21b9-4458-97f2-c313a52c1e48', // Assuming an admin or existing user ID
            reason: 'Test from script',
            reported_item_id: '855490ea-563b-48ae-94b6-dfec5b8c3866', // Assuming an existing item ID
            status: 'pending'
        })
        .select();

    if (error) {
        console.error("Insert failed:", error);
    } else {
        console.log("Insert worked!", data);
    }
}

testInsert();
