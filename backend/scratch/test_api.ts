import axios from "axios";

const API_URL = "http://localhost:3005/api";
const REVIEW_ID = "00000000-0000-0000-0000-000000000000"; // Placeholder

async function testDismiss() {
    try {
        console.log("Testing dismiss report for review...");
        // I don't have a token here, but I can check if the route exists
        const res = await axios.patch(`${API_URL}/reviews/${REVIEW_ID}/dismiss-report`);
        console.log("Response:", res.data);
    } catch (err: any) {
        console.log("Error status:", err.response?.status);
        console.log("Error data:", err.response?.data);
    }
}

testDismiss();
