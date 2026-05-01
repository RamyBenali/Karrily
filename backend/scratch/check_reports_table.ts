import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
    const { data, error } = await supabase.from("reports").select("*").limit(1);
    if (error) {
        console.error("Error or table does not exist:", error.message);
    } else {
        console.log("Table 'reports' exists. Sample data:", data);
    }
}

checkTable();
