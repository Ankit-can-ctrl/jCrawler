const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Import models
const Job = require("../models/Job");
const User = require("../models/User");
const Alert = require("../models/Alert");

// Connect to database
const connectDB = require("../config/database");

// Sample data
const companies = [
  {
    name: "TechCorp Solutions",
    industry: "Software Development",
    size: "large",
    location: "San Francisco, CA",
    website: "https://techcorp.com",
    rating: 4.2,
  },
  {
    name: "InnovateLabs",
    industry: "Artificial Intelligence",
    size: "startup",
    location: "Austin, TX",
    website: "https://innovatelabs.ai",
    rating: 4.5,
  },
  {
    name: "Global Systems Inc",
    industry: "Enterprise Software",
    size: "enterprise",
    location: "New York, NY",
    website: "https://globalsystems.com",
    rating: 4.0,
  },
  {
    name: "CloudWorks",
    industry: "Cloud Computing",
    size: "medium",
    location: "Seattle, WA",
    website: "https://cloudworks.com",
    rating: 4.3,
  },
  {
    name: "DataFlow Analytics",
    industry: "Data Science",
    size: "small",
    location: "Boston, MA",
    website: "https://dataflow.com",
    rating: 4.1,
  },
  {
    name: "MobileFirst",
    industry: "Mobile Development",
    size: "startup",
    location: "Los Angeles, CA",
    website: "https://mobilefirst.com",
    rating: 4.4,
  },
  {
    name: "SecureNet",
    industry: "Cybersecurity",
    size: "medium",
    location: "Washington, DC",
    website: "https://securenet.com",
    rating: 4.6,
  },
  {
    name: "GreenTech",
    industry: "Clean Technology",
    size: "startup",
    location: "Portland, OR",
    website: "https://greentech.com",
    rating: 4.0,
  },
];

const jobTitles = [
  "Senior Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Product Manager",
  "UX/UI Designer",
  "QA Engineer",
  "System Administrator",
  "Cloud Architect",
  "Mobile App Developer",
  "Security Engineer",
  "Data Engineer",
  "React Developer",
  "Python Developer",
  "Java Developer",
  "Node.js Developer",
  "iOS Developer",
  "Android Developer",
  "Blockchain Developer",
  "AI Research Engineer",
  "Technical Lead",
  "Software Architect",
];

const skills = [
  "javascript",
  "python",
  "java",
  "react",
  "node.js",
  "mongodb",
  "postgresql",
  "aws",
  "docker",
  "kubernetes",
  "git",
  "typescript",
  "angular",
  "vue.js",
  "machine learning",
  "data science",
  "sql",
  "nosql",
  "redis",
  "elasticsearch",
  "microservices",
  "rest api",
  "graphql",
  "html",
  "css",
  "sass",
  "less",
  "webpack",
  "babel",
  "jest",
  "cypress",
  "selenium",
  "agile",
  "scrum",
  "ci/cd",
  "jenkins",
  "github actions",
  "terraform",
  "ansible",
  "linux",
  "nginx",
  "apache",
  "express.js",
  "django",
  "flask",
  "spring boot",
  "hibernate",
  "junit",
  "pytest",
  "mocha",
  "chai",
  "eslint",
  "prettier",
  "figma",
  "sketch",
  "adobe xd",
  "invision",
  "zeplin",
  "swift",
  "kotlin",
  "flutter",
  "react native",
  "xamarin",
  "unity",
  "unreal engine",
  "blender",
  "tensorflow",
  "pytorch",
  "scikit-learn",
  "pandas",
  "numpy",
  "matplotlib",
  "seaborn",
  "plotly",
  "tableau",
  "power bi",
  "apache spark",
  "hadoop",
  "kafka",
  "rabbitmq",
  "apache airflow",
  "dbt",
  "snowflake",
  "databricks",
];

const locations = [
  { city: "San Francisco", state: "CA", country: "USA", remote: false },
  { city: "New York", state: "NY", country: "USA", remote: false },
  { city: "Austin", state: "TX", country: "USA", remote: false },
  { city: "Seattle", state: "WA", country: "USA", remote: false },
  { city: "Boston", state: "MA", country: "USA", remote: false },
  { city: "Los Angeles", state: "CA", country: "USA", remote: false },
  { city: "Chicago", state: "IL", country: "USA", remote: false },
  { city: "Denver", state: "CO", country: "USA", remote: false },
  { city: "Portland", state: "OR", country: "USA", remote: false },
  { city: "Remote", state: "", country: "USA", remote: true },
  { city: "Toronto", state: "ON", country: "Canada", remote: false },
  { city: "Vancouver", state: "BC", country: "Canada", remote: false },
  { city: "London", state: "", country: "UK", remote: false },
  { city: "Berlin", state: "", country: "Germany", remote: false },
  { city: "Amsterdam", state: "", country: "Netherlands", remote: false },
];

const jobTypes = [
  {
    type: "full-time",
    experience: "senior",
    salary: { min: 80000, max: 150000, currency: "USD", period: "yearly" },
  },
  {
    type: "full-time",
    experience: "mid",
    salary: { min: 60000, max: 100000, currency: "USD", period: "yearly" },
  },
  {
    type: "full-time",
    experience: "entry",
    salary: { min: 45000, max: 75000, currency: "USD", period: "yearly" },
  },
  {
    type: "contract",
    experience: "senior",
    salary: { min: 80, max: 120, currency: "USD", period: "hourly" },
  },
  {
    type: "contract",
    experience: "mid",
    salary: { min: 60, max: 90, currency: "USD", period: "hourly" },
  },
  {
    type: "part-time",
    experience: "mid",
    salary: { min: 30, max: 50, currency: "USD", period: "hourly" },
  },
  {
    type: "freelance",
    experience: "senior",
    salary: { min: 100, max: 150, currency: "USD", period: "hourly" },
  },
  {
    type: "internship",
    experience: "entry",
    salary: { min: 20, max: 35, currency: "USD", period: "hourly" },
  },
];

const benefits = [
  "Health insurance",
  "Dental insurance",
  "Vision insurance",
  "401(k) matching",
  "Flexible work hours",
  "Remote work options",
  "Professional development",
  "Conference attendance",
  "Home office stipend",
  "Gym membership",
  "Free lunch",
  "Stock options",
  "Unlimited PTO",
  "Parental leave",
  "Mental health support",
  "Learning budget",
  "Equipment provided",
  "Team building events",
];

const requirements = [
  "Bachelor's degree in Computer Science or related field",
  "3+ years of experience in software development",
  "Strong problem-solving skills",
  "Excellent communication skills",
  "Experience with modern web technologies",
  "Knowledge of software development best practices",
  "Ability to work in a team environment",
  "Experience with version control systems",
  "Understanding of agile methodologies",
  "Strong analytical skills",
  "Experience with cloud platforms",
  "Knowledge of database design",
  "Experience with testing frameworks",
  "Understanding of security best practices",
  "Experience with CI/CD pipelines",
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function getRandomSalary() {
  const jobType = getRandomElement(jobTypes);
  return jobType.salary;
}

function generateJob() {
  const company = getRandomElement(companies);
  const title = getRandomElement(jobTitles);
  const location = getRandomElement(locations);
  const jobType = getRandomElement(jobTypes);
  const jobSkills = getRandomElements(
    skills,
    Math.floor(Math.random() * 8) + 3
  );
  const jobBenefits = getRandomElements(
    benefits,
    Math.floor(Math.random() * 6) + 2
  );
  const jobRequirements = getRandomElements(
    requirements,
    Math.floor(Math.random() * 8) + 3
  );

  const postedDate = new Date();
  postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 30));

  return {
    title,
    company: {
      name: company.name,
      industry: company.industry,
      size: company.size,
      location: company.location,
      website: company.website,
      rating: company.rating,
    },
    location: {
      city: location.city,
      state: location.state,
      country: location.country,
      remote: location.remote,
      timezone: location.remote ? "UTC" : "America/New_York",
    },
    jobType: {
      type: jobType.type,
      experience: jobType.experience,
      salary: jobType.salary,
    },
    skills: jobSkills,
    description: `We are looking for a talented ${title} to join our team at ${company.name}. This is an exciting opportunity to work on cutting-edge projects and grow your career in a dynamic environment.

Key Responsibilities:
• Develop and maintain high-quality software applications
• Collaborate with cross-functional teams to deliver innovative solutions
• Participate in code reviews and technical discussions
• Contribute to the continuous improvement of our development processes
• Stay up-to-date with industry trends and best practices

Our company offers a collaborative work environment, competitive compensation, and excellent growth opportunities. We value creativity, innovation, and a passion for technology.`,
    requirements: jobRequirements,
    benefits: jobBenefits,
    url: `https://${company.website.replace("https://", "")}/careers/${title
      .toLowerCase()
      .replace(/\s+/g, "-")}`,
    sourceSite: "company-website",
    postedDate,
    scrapedDate: new Date(),
    isActive: true,
    metadata: {
      views: Math.floor(Math.random() * 1000),
      applications: Math.floor(Math.random() * 50),
      savedCount: Math.floor(Math.random() * 20),
    },
  };
}

function generateUser() {
  const firstNames = [
    "John",
    "Jane",
    "Michael",
    "Sarah",
    "David",
    "Emily",
    "Robert",
    "Lisa",
    "James",
    "Maria",
    "Alex",
    "Sam",
    "Chris",
    "Taylor",
    "Jordan",
    "Casey",
    "Morgan",
    "Riley",
    "Quinn",
    "Avery",
  ];
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Anderson",
    "Taylor",
    "Thomas",
    "Hernandez",
    "Moore",
    "Martin",
    "Jackson",
    "Thompson",
    "White",
    "Lopez",
  ];

  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

  const userSkills = getRandomElements(
    skills,
    Math.floor(Math.random() * 10) + 5
  );
  const experience = getRandomElement(["entry", "mid", "senior", "lead"]);
  const location = getRandomElement(locations);

  return {
    email,
    password: "password123",
    profile: {
      firstName,
      lastName,
      skills: userSkills,
      experience,
      location: {
        city: location.city,
        state: location.state,
        country: location.country,
        timezone: location.remote ? "UTC" : "America/New_York",
      },
      remotePreference: Math.random() > 0.5,
      bio: `Experienced ${experience} level developer with expertise in ${userSkills
        .slice(0, 3)
        .join(
          ", "
        )}. Passionate about creating innovative solutions and continuous learning.`,
      avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
    },
    preferences: {
      jobTypes: getRandomElements(
        ["full-time", "part-time", "contract", "freelance", "internship"],
        Math.floor(Math.random() * 3) + 1
      ),
      locations: [location],
      salaryRange: {
        min: Math.floor(Math.random() * 50000) + 30000,
        max: Math.floor(Math.random() * 100000) + 80000,
        currency: "USD",
      },
      skills: userSkills.slice(0, 5),
      remoteOnly: location.remote,
      experienceLevel: experience,
    },
    isActive: true,
    isEmailVerified: true,
  };
}

function generateAlert(userId) {
  const alertNames = [
    "Remote JavaScript Jobs",
    "Senior Python Positions",
    "Data Science Opportunities",
    "Frontend Developer Roles",
    "Full Stack Positions",
    "Machine Learning Jobs",
    "React Developer Opportunities",
    "DevOps Engineer Roles",
    "Mobile App Development",
    "Cloud Computing Jobs",
  ];

  const alertName = getRandomElement(alertNames);
  const alertSkills = getRandomElements(
    skills,
    Math.floor(Math.random() * 5) + 2
  );
  const alertKeywords = getRandomElements(
    ["remote", "senior", "full-time", "startup", "ai", "ml", "cloud"],
    Math.floor(Math.random() * 3) + 1
  );

  return {
    userId,
    name: alertName,
    criteria: {
      keywords: alertKeywords,
      skills: alertSkills,
      locations: [getRandomElement(locations)],
      remoteOnly: Math.random() > 0.7,
      jobTypes: getRandomElements(
        ["full-time", "part-time", "contract", "freelance"],
        Math.floor(Math.random() * 2) + 1
      ),
      experienceLevel: getRandomElement(["entry", "mid", "senior", "lead"]),
      salaryRange: {
        min: Math.floor(Math.random() * 50000) + 30000,
        max: Math.floor(Math.random() * 100000) + 80000,
        currency: "USD",
      },
      companies: getRandomElements(
        companies.map((c) => c.name),
        Math.floor(Math.random() * 3) + 1
      ),
      excludeKeywords: ["internship", "junior"],
    },
    frequency: getRandomElement(["daily", "weekly"]),
    notification: {
      email: true,
      push: Math.random() > 0.5,
      slack: false,
    },
    isActive: true,
    lastTriggered: new Date(
      Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000
    ),
    stats: {
      totalMatches: Math.floor(Math.random() * 50),
      lastMatchCount: Math.floor(Math.random() * 10),
    },
  };
}

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await Job.deleteMany({});
    await User.deleteMany({});
    await Alert.deleteMany({});

    // Track used emails to avoid duplicates
    const usedEmails = new Set();

    // Generate and insert jobs
    console.log("📝 Generating jobs...");
    const jobs = [];
    for (let i = 0; i < 100; i++) {
      jobs.push(generateJob());
    }
    const createdJobs = await Job.insertMany(jobs);
    console.log(`✅ Created ${createdJobs.length} jobs`);

    // Generate and insert users
    console.log("👥 Generating users...");
    const users = [];
    for (let i = 0; i < 10; i++) {
      let user;
      let attempts = 0;
      do {
        user = generateUser();
        attempts++;
        if (attempts > 50) {
          // If we can't generate a unique email after 50 attempts, add a number
          const baseEmail = user.email;
          const [name, domain] = baseEmail.split("@");
          user.email = `${name}${i + 1}@${domain}`;
          break;
        }
      } while (usedEmails.has(user.email));

      usedEmails.add(user.email);
      users.push(user);
    }
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Generate and insert alerts
    console.log("🔔 Generating alerts...");
    const alerts = [];
    for (const user of createdUsers) {
      const userAlerts = [];
      for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) {
        userAlerts.push(generateAlert(user._id));
      }
      alerts.push(...userAlerts);
    }
    await Alert.insertMany(alerts);
    console.log(`✅ Created ${alerts.length} alerts`);

    // Add some saved and applied jobs for users
    console.log("💾 Adding saved and applied jobs...");
    for (const user of createdUsers) {
      const randomJobs = getRandomElements(
        createdJobs,
        Math.floor(Math.random() * 5) + 2
      );

      for (const job of randomJobs) {
        if (Math.random() > 0.5) {
          await user.saveJob(job._id, "Interesting opportunity!");
        }
        if (Math.random() > 0.7) {
          await user.applyForJob(job._id, "Applied via company website");
        }
      }
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Jobs: ${jobs.length}`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Alerts: ${alerts.length}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  connectDB()
    .then(() => {
      console.log("📡 Connected to database");
      return seedDatabase();
    })
    .then(() => {
      console.log("✅ Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
