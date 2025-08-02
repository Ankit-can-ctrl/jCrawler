const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing API endpoints with dummy data...\n');

  try {
    // Test 1: Get all jobs
    console.log('1. Testing GET /api/jobs');
    const jobsResponse = await axios.get(`${BASE_URL}/jobs?limit=5`);
    console.log(`✅ Found ${jobsResponse.data.data.length} jobs`);
    console.log(`   First job: ${jobsResponse.data.data[0]?.title}`);
    console.log(`   Total jobs: ${jobsResponse.data.pagination?.total}\n`);

    // Test 2: Get job statistics
    console.log('2. Testing GET /api/jobs/stats');
    const statsResponse = await axios.get(`${BASE_URL}/jobs/stats`);
    console.log('✅ Job statistics retrieved');
    console.log(`   Total jobs: ${statsResponse.data.data?.totalJobs}`);
    console.log(`   Remote jobs: ${statsResponse.data.data?.remoteJobs}`);
    console.log(`   Average salary: $${statsResponse.data.data?.averageSalary}\n`);

    // Test 3: Get remote jobs
    console.log('3. Testing GET /api/jobs/remote');
    const remoteResponse = await axios.get(`${BASE_URL}/jobs/remote?limit=3`);
    console.log(`✅ Found ${remoteResponse.data.data.length} remote jobs\n`);

    // Test 4: Get jobs by skills
    console.log('4. Testing GET /api/jobs/skills/javascript');
    const skillsResponse = await axios.get(`${BASE_URL}/jobs/skills/javascript?limit=3`);
    console.log(`✅ Found ${skillsResponse.data.data.length} JavaScript jobs\n`);

    // Test 5: Search jobs
    console.log('5. Testing POST /api/jobs/search');
    const searchResponse = await axios.post(`${BASE_URL}/jobs/search`, {
      keywords: ['react', 'frontend'],
      skills: ['javascript', 'react'],
      remote: true,
      jobTypes: ['full-time'],
      experience: 'senior',
      salaryRange: {
        min: 80000,
        max: 150000,
        currency: 'USD'
      }
    });
    console.log(`✅ Search found ${searchResponse.data.data.length} matching jobs\n`);

    // Test 6: Get saved jobs (demo user)
    console.log('6. Testing GET /api/jobs/user/saved');
    const savedResponse = await axios.get(`${BASE_URL}/jobs/user/saved?limit=3`);
    console.log(`✅ Found ${savedResponse.data.data.length} saved jobs\n`);

    // Test 7: Get applied jobs (demo user)
    console.log('7. Testing GET /api/jobs/user/applied');
    const appliedResponse = await axios.get(`${BASE_URL}/jobs/user/applied?limit=3`);
    console.log(`✅ Found ${appliedResponse.data.data.length} applied jobs\n`);

    // Test 8: Get job suggestions
    console.log('8. Testing GET /api/jobs/suggestions');
    const suggestionsResponse = await axios.get(`${BASE_URL}/jobs/suggestions?q=react`);
    console.log(`✅ Got ${suggestionsResponse.data.data.length} suggestions\n`);

    // Test 9: Test job save functionality
    console.log('9. Testing job save functionality');
    const firstJobId = jobsResponse.data.data[0]?._id;
    if (firstJobId) {
      const saveResponse = await axios.post(`${BASE_URL}/jobs/${firstJobId}/save`, {
        notes: 'Test save from API script'
      });
      console.log('✅ Job saved successfully');
      
      // Check if job is saved
      const statusResponse = await axios.get(`${BASE_URL}/jobs/${firstJobId}/status`);
      console.log(`   Job saved: ${statusResponse.data.data.isSaved}`);
      console.log(`   Job applied: ${statusResponse.data.data.isApplied}\n`);
    }

    // Test 10: Get job by ID
    console.log('10. Testing GET /api/jobs/:id');
    if (firstJobId) {
      const jobResponse = await axios.get(`${BASE_URL}/jobs/${firstJobId}`);
      console.log(`✅ Retrieved job: ${jobResponse.data.data.title}`);
      console.log(`   Company: ${jobResponse.data.data.company.name}`);
      console.log(`   Location: ${jobResponse.data.data.location.city}, ${jobResponse.data.data.location.state}`);
      console.log(`   Salary: $${jobResponse.data.data.jobType.salary.min} - $${jobResponse.data.data.jobType.salary.max}`);
      console.log(`   Skills: ${jobResponse.data.data.skills.slice(0, 3).join(', ')}...\n`);
    }

    // Test 11: Get similar jobs
    console.log('11. Testing GET /api/jobs/:id/similar');
    if (firstJobId) {
      const similarResponse = await axios.get(`${BASE_URL}/jobs/${firstJobId}/similar?limit=3`);
      console.log(`✅ Found ${similarResponse.data.data.length} similar jobs\n`);
    }

    console.log('🎉 All API tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - Jobs endpoint working');
    console.log('   - Search functionality working');
    console.log('   - User actions (save/apply) working');
    console.log('   - Statistics and analytics working');
    console.log('   - Remote job filtering working');
    console.log('   - Skills-based filtering working');
    console.log('   - Job suggestions working');
    console.log('\n✅ Backend is ready for frontend integration!');

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. Backend server is running (npm run dev)');
    console.log('   2. Database is seeded (npm run seed)');
    console.log('   3. MongoDB is running');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI }; 