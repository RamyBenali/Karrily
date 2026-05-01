import https from "https";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getSpec() {
    const url = new URL(`${supabaseUrl}/rest/v1/?apikey=${supabaseServiceKey}`);
    https.get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk;
        });
        res.on("end", () => {
            try {
                const spec = JSON.parse(data);
                const reportsDef = spec.definitions.reports;
                console.log(JSON.stringify(reportsDef, null, 2));
            } catch (error: any) {
                console.error("Error parsing spec:", error.message);
                console.log("Data was:", data.substring(0, 500));
            }
        });
    }).on("error", (err) => {
        console.error("Error fetching spec:", err.message);
    });
}

getSpec();
