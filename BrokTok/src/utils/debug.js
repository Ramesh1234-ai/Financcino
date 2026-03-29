/**
 * Debug Utility for Expense Tracker
 * Use: window.DEBUG.checkStatus()
 */

const DEBUG = {
  // Check authentication status
  async checkAuth() {
    console.log('🔐 === AUTH DEBUG ===');
    try {
      const response = await fetch('/api/health');
      const health = await response.json();
      console.log('✅ Backend Health:', health);
    } catch (e) {
      console.log('❌ Backend unreachable:', e.message);
    }
  },

  // Check token status
  async checkToken() {
    console.log('🔑 === TOKEN DEBUG ===');
    try {
      // This requires useAuth to be imported
      console.log('ℹ️  To check token, run: const {getToken} = useAuth(); const token = await getToken(); console.log(token)');
    } catch (e) {
      console.log('Error:', e.message);
    }
  },

  // Check API connectivity
  async checkAPI() {
    console.log('🌐 === API DEBUG ===');
    const endpoints = [
      '/api/health',
      '/api/expenses',
      '/api/categories',
      '/api/receipts'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            'Authorization': 'Bearer test-token'
          }
        });
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      } catch (e) {
        console.log(`${endpoint}: ❌ ${e.message}`);
      }
    }
  },

  // Check receipt data structure
  checkReceiptData(receipt) {
    console.log('📄 === RECEIPT DATA DEBUG ===');
    console.log('Receipt ID:', receipt._id || receipt.id);
    console.log('Amount Methods:');
    console.log('  - extractedData?.amount:', receipt.extractedData?.amount);
    console.log('  - extractedData?.total:', receipt.extractedData?.total);
    console.log('Date Methods:');
    console.log('  - extractedData?.date:', receipt.extractedData?.date);
    console.log('  - extractedData?.dates[0]:', receipt.extractedData?.dates?.[0]);
    console.log('Full extractedData:', receipt.extractedData);
  },

  // Simulate upload flow
  async simulateUpload() {
    console.log('📸 === UPLOAD SIMULATION ===');
    console.log('Step 1: Get token');
    console.log('Step 2: Prepare FormData');
    console.log('Step 3: POST to /api/receipts/upload');
    console.log('Step 4: Wait 1.5s for processing');
    console.log('Step 5: GET /api/expenses to refresh');
  },

  // Simulate checkbox selection
  checkCheckboxLogic() {
    console.log('☑️ === CHECKBOX DEBUG ===');
    const testReceipts = [
      { _id: '507f1f77bcf86cd799439011', name: 'Receipt 1' },
      { _id: '507f1f77bcf86cd799439012', name: 'Receipt 2' },
      { _id: '507f1f77bcf86cd799439013', name: 'Receipt 3' }
    ];

    let selected = [];

    console.log('Initial selected:', selected);

    // Toggle first receipt
    const id = testReceipts[0]._id;
    selected = selected.includes(id) 
      ? selected.filter(x => x !== id) 
      : [...selected, id];
    console.log('After selecting Receipt 1:', selected);

    // Toggle second receipt
    const id2 = testReceipts[1]._id;
    selected = selected.includes(id2) 
      ? selected.filter(x => x !== id2) 
      : [...selected, id2];
    console.log('After selecting Receipt 2:', selected);

    // Deselect first
    const id3 = testReceipts[0]._id;
    selected = selected.includes(id3) 
      ? selected.filter(x => x !== id3) 
      : [...selected, id3];
    console.log('After deselecting Receipt 1:', selected);

    console.log('✅ Logic correct if each action changes selected array');
  },

  // Full system status
  async fullStatus() {
    console.log('\n\n');
    console.log('╔════════════════════════════════════════╗');
    console.log('║   EXPENSE TRACKER - FULL DEBUG STATUS  ║');
    console.log('╚════════════════════════════════════════╝\n');

    await this.checkAuth();
    console.log('\n');
    
    await this.checkAPI();
    console.log('\n');
    
    this.checkCheckboxLogic();
    console.log('\n');

    console.log('📋 NEXT STEPS:');
    console.log('1. Check console output above');
    console.log('2. Open Network tab and test upload');
    console.log('3. Verify endpoints respond with 200');
    console.log('4. Check that token is sent in Authorization header');
  }
};

// Make available globally
window.DEBUG = DEBUG;

console.log('✅ Debug utility loaded. Run: DEBUG.fullStatus()');
