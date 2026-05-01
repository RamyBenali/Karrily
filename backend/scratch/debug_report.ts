import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debug() {
    const { data: users } = await supabase.from("profiles").select("id").limit(1);
    const { data: items } = await supabase.from("items").select("id").limit(1);
    
    if (!users || !items) {
        console.error("No users or items found to test with");
        return;
    }

    const reporter_id = users[0].id;
    const item_id = items[0].id;

    console.log(`Testing with reporter_id: ${reporter_id}, item_id: ${item_id}`);

    const { data, error } = await supabase
        .from("reports")
        .insert({
            reporter_id,
            reason: 'Test from script',
            reported_item_id: item_id,
            status: 'pending'
        })
        .select();

    if (error) {
        console.error("Insert failed:", error);
    } else {
        console.log("Insert worked!", data);
    }
}

debug();
