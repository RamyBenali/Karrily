import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), "backend/.env") });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function check() {
    const { data } = await supabase.from('profiles').select('role').eq('id', 'b1249e02-16e7-41f9-8fcf-edca29c55667').single();
    console.log("User role:", data);
}
check();
