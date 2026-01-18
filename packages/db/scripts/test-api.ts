import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
const envPath = resolve(__dirname, "../../../apps/web/.env.local");
console.log(`Loading environment from: ${envPath}`);
config({ path: envPath });

const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
console.log(`API Key: ${API_KEY?.substring(0, 10)}...`);

async function testAPI() {
  // Test 1: Simple request with minimal parameters
  console.log("\n=== Test 1: Basic API call ===");
  try {
    const url1 = `https://api.data.gov/ed/collegescorecard/v1/schools?api_key=${API_KEY}&fields=id,school.name&per_page=5`;
    console.log("URL:", url1);

    const response1 = await fetch(url1);
    console.log("Status:", response1.status, response1.statusText);

    if (response1.ok) {
      const data = await response1.json();
      console.log("✅ Success! Fetched", data.results?.length, "schools");
      console.log("First school:", data.results?.[0]);
    } else {
      const error = await response1.text();
      console.log("❌ Error:", error);
    }
  } catch (error) {
    console.error("❌ Request failed:", error);
  }

  // Test 2: With filters
  console.log("\n=== Test 2: With filters ===");
  try {
    const url2 = new URL("https://api.data.gov/ed/collegescorecard/v1/schools");
    url2.searchParams.set("api_key", API_KEY!);
    url2.searchParams.set("fields", "id,school.name,school.city,school.state");
    url2.searchParams.set("school.degrees_awarded.predominant", "3");
    url2.searchParams.set("school.operating", "1");
    url2.searchParams.set("per_page", "5");

    console.log("URL:", url2.toString());

    const response2 = await fetch(url2.toString());
    console.log("Status:", response2.status, response2.statusText);

    if (response2.ok) {
      const data = await response2.json();
      console.log("✅ Success! Fetched", data.results?.length, "schools");
      data.results?.forEach((school: any, i: number) => {
        console.log(`${i + 1}. ${school["school.name"]} - ${school["school.city"]}, ${school["school.state"]}`);
      });
    } else {
      const error = await response2.text();
      console.log("❌ Error:", error);
    }
  } catch (error) {
    console.error("❌ Request failed:", error);
  }
}

testAPI();
