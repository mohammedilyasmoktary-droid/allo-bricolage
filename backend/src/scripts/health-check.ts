import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

async function healthCheck() {
  console.log('🔍 Running comprehensive health check...\n');

  const checks = [
    {
      name: 'Health Endpoint',
      test: async () => {
        const res = await axios.get('http://localhost:5001/health');
        return res.data.status === 'ok';
      },
    },
    {
      name: 'Categories API',
      test: async () => {
        const res = await axios.get(`${API_BASE_URL}/categories`);
        return Array.isArray(res.data) && res.data.length > 0;
      },
    },
    {
      name: 'Reviews API',
      test: async () => {
        const res = await axios.get(`${API_BASE_URL}/reviews`);
        return Array.isArray(res.data);
      },
    },
    {
      name: 'Technicians API (Public)',
      test: async () => {
        const res = await axios.get(`${API_BASE_URL}/technicians/available?city=Casablanca`);
        return Array.isArray(res.data);
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    try {
      const result = await check.test();
      if (result) {
        console.log(`✅ ${check.name}: PASSED`);
        passed++;
      } else {
        console.log(`❌ ${check.name}: FAILED`);
        failed++;
      }
    } catch (error: any) {
      console.log(`❌ ${check.name}: ERROR - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Summary: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All checks passed! Website is functional.');
  } else {
    console.log('⚠️  Some checks failed. Please review the errors above.');
  }
}

healthCheck().catch(console.error);

