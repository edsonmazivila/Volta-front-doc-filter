// Test to compare working vs broken endpoint
const API_URL = 'http://localhost:8081';

async function testEndpoint(path, description) {
  console.log(`\n=== Testing: ${description} ===`);
  console.log(`URL: ${API_URL}${path}`);
  
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(`Status: ${res.status} ${res.statusText}`);
    if (res.status === 401) {
      console.log('✓ Correctly requires auth (401)');
    } else if (res.status === 404) {
      console.log('✗ Endpoint not found (404) - NOT IMPLEMENTED');
    } else {
      console.log(`Response: ${res.status}`);
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function run() {
  await testEndpoint('/api/payroll/history', 'Working payroll endpoint');
  await testEndpoint('/api/reports/organization/payroll', 'NEW organization payroll endpoint');
  await testEndpoint('/api/reports/organization/timesheets', 'Organization timesheets');
}

run();
