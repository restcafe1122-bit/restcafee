const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('=== Testing Cafe Restaurant API ===\n');

  try {
    // Test 1: Login
    console.log('1. Testing login...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Set up headers for authenticated requests
    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Test 2: Verify token
    console.log('\n2. Testing token verification...');
    await axios.get(`${BASE_URL}/api/auth/verify`, { headers: authHeaders });
    console.log('✅ Token verification successful');

    // Test 3: Get menu items
    console.log('\n3. Testing menu items retrieval...');
    const menuResponse = await axios.get(`${BASE_URL}/api/menu`, { headers: authHeaders });
    console.log(`✅ Menu items retrieved: ${menuResponse.data.length} items`);

    // Test 4: Get cafe settings
    console.log('\n4. Testing cafe settings retrieval...');
    const settingsResponse = await axios.get(`${BASE_URL}/api/settings`, { headers: authHeaders });
    console.log(`✅ Cafe settings retrieved: ${settingsResponse.data.length} settings`);

    // Test 5: Create a test menu item
    console.log('\n5. Testing menu item creation...');
    const newItem = {
      name: 'Test Coffee',
      category: 'coffee',
      price: 25000,
      has_dual_pricing: false,
      image_url: '',
      order_index: 999,
      is_available: true
    };
    
    const createResponse = await axios.post(`${BASE_URL}/api/menu`, newItem, { headers: authHeaders });
    console.log(`✅ Menu item created with ID: ${createResponse.data.id}`);

    // Test 6: Update the test item
    console.log('\n6. Testing menu item update...');
    const updatedItem = {
      ...newItem,
      name: 'Updated Test Coffee',
      price: 30000
    };
    
    await axios.put(`${BASE_URL}/api/menu/${createResponse.data.id}`, updatedItem, { headers: authHeaders });
    console.log('✅ Menu item updated successfully');

    // Test 7: Delete the test item
    console.log('\n7. Testing menu item deletion...');
    await axios.delete(`${BASE_URL}/api/menu/${createResponse.data.id}`, { headers: authHeaders });
    console.log('✅ Menu item deleted successfully');

    console.log('\n🎉 All API tests passed successfully!');
    console.log('\n=== API Test Summary ===');
    console.log('✅ Authentication working');
    console.log('✅ Menu CRUD operations working');
    console.log('✅ Settings retrieval working');
    console.log('✅ JWT token validation working');

  } catch (error) {
    console.error('\n❌ API Test failed:');
    console.error('Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure the server is running: node server.js');
    }
  }
}

// Run the test
testAPI();
