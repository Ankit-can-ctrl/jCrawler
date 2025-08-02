const { spawn } = require('child_process');
const { seedDatabase } = require('../src/scripts/seedData');
const { testAPI } = require('../src/scripts/testApi');
const connectDB = require('../src/config/database');

async function startAndTest() {
  console.log('🚀 Starting backend with dummy data...\n');

  try {
    // Connect to database
    console.log('📡 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected\n');

    // Seed the database
    console.log('🌱 Seeding database with dummy data...');
    await seedDatabase();
    console.log('✅ Database seeded successfully\n');

    // Start the server
    console.log('🖥️  Starting server...');
    const server = spawn('node', ['server.js'], {
      stdio: 'pipe',
      cwd: process.cwd()
    });

    // Wait for server to start
    await new Promise((resolve) => {
      server.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(output);
        if (output.includes('Server running on port')) {
          setTimeout(resolve, 2000); // Give server time to fully start
        }
      });
    });

    console.log('✅ Server started successfully\n');

    // Test the API
    console.log('🧪 Testing API endpoints...');
    await testAPI();

    console.log('\n🎉 Backend is ready!');
    console.log('📊 Summary:');
    console.log('   - Database seeded with 100 jobs, 10 users, and alerts');
    console.log('   - Server running on http://localhost:5000');
    console.log('   - API endpoints tested and working');
    console.log('   - Frontend can now fetch data from the backend');
    console.log('\n🔗 API Endpoints:');
    console.log('   - GET /api/jobs - Get all jobs');
    console.log('   - GET /api/jobs/stats - Get job statistics');
    console.log('   - GET /api/jobs/remote - Get remote jobs');
    console.log('   - POST /api/jobs/search - Search jobs');
    console.log('   - GET /api/jobs/user/saved - Get saved jobs');
    console.log('   - GET /api/jobs/user/applied - Get applied jobs');
    console.log('\n💡 Next steps:');
    console.log('   1. Start the frontend (cd ../frontend && npm start)');
    console.log('   2. The frontend will automatically connect to the backend');
    console.log('   3. You can now browse jobs, search, and test all features');

    // Keep the server running
    server.on('close', (code) => {
      console.log(`\n🛑 Server stopped with code ${code}`);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down...');
      server.kill('SIGINT');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  startAndTest();
}

module.exports = { startAndTest }; 