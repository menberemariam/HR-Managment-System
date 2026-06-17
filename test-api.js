// test-api.js
const axios = require("axios");

async function testAPI() {
  try {
    console.log("Testing HR System API...\n");

    // 1. Test Login
    console.log("1. Testing Login...");
    const loginRes = await axios.post("http://localhost:8000/api/auth/login", {
      email: "admin@arsi.edu",
      password: "password123",
    });
    console.log("✓ Login Success:", loginRes.data.success);

    // 2. Test Get Employees (with cookie)
    console.log("\n2. Testing Get Employees...");
    const cookie = loginRes.headers["set-cookie"][0];
    const employeesRes = await axios.get(
      "http://localhost:8000/api/employees",
      {
        headers: { Cookie: cookie },
      },
    );
    console.log(`✓ Got ${employeesRes.data.length} employees`);

    console.log("\n✅ All tests passed! API is working.");
  } catch (error) {
    console.error("❌ API Test Failed:", error.message);
  }
}

testAPI();
