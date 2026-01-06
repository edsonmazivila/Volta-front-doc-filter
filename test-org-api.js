// Test script to check organization payrolls API
const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

async function testOrgPayrollsAPI() {
  const url = `${API_BASE_URL}/api/reports/organization/payroll`;
  
  console.log('Testing URL:', url);
  console.log('Making request...\n');
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('\nResponse Data:');
      console.log(JSON.stringify(data, null, 2));
      console.log('\nData structure check:');
      console.log('- Has .data?', 'data' in data);
      console.log('- Has .count?', 'count' in data);
      console.log('- Has .success?', 'success' in data);
      console.log('- Is array?', Array.isArray(data));
      console.log('- Data length:', Array.isArray(data) ? data.length : (data.data ? data.data.length : 'N/A'));
    } else {
      const text = await response.text();
      console.log('\nError Response:');
      console.log(text);
    }
  } catch (error) {
    console.error('\nFetch Error:');
    console.error(error.message);
    console.error(error);
  }
}

testOrgPayrollsAPI();
