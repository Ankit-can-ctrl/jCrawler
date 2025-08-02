# Job Scraper Backend

A comprehensive backend API for a global job scraping platform with advanced search, user management, and job alerting capabilities.

## Features

- **Job Management**: CRUD operations for job listings with advanced filtering
- **User Management**: User registration, authentication, and profile management
- **Job Alerts**: Configurable job alerts with email notifications
- **Advanced Search**: Full-text search with filters for skills, location, salary, etc.
- **Analytics**: Job statistics and user activity tracking
- **Caching**: Redis-based caching for improved performance
- **Security**: JWT authentication, rate limiting, and input validation

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Authentication**: JWT with bcrypt
- **Validation**: express-validator
- **Logging**: Winston
- **Testing**: Jest

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis (optional, for caching)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `env.example`:
   ```bash
   cp env.example .env
   ```

4. Configure your environment variables in `.env`

## Database Setup

### Seeding with Dummy Data

To populate the database with realistic dummy data for testing and development:

```bash
# Seed the database with dummy data
npm run seed

# Or for development environment
npm run seed:dev
```

This will create:
- **100 job listings** with realistic data including:
  - Various job titles (Software Engineer, Data Scientist, etc.)
  - Different companies and industries
  - Multiple locations (including remote positions)
  - Salary ranges and benefits
  - Required skills and experience levels

- **10 sample users** with:
  - Complete profiles with skills and preferences
  - Saved jobs and job applications
  - Job alerts configured

- **Job alerts** for each user with different criteria

### Sample Data Includes

**Jobs:**
- 25 different job titles (Senior Software Engineer, Data Scientist, etc.)
- 8 different companies across various industries
- Multiple locations including remote positions
- Realistic salary ranges ($45k - $150k)
- 60+ different skills (JavaScript, Python, React, AWS, etc.)
- Various job types (full-time, contract, freelance, etc.)

**Users:**
- Complete user profiles with skills and experience
- Job preferences and salary expectations
- Saved jobs and application history
- Email-verified accounts ready for testing

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using Docker
```bash
# Start with Redis
npm run docker:redis

# Development with hot reload
npm run docker:dev

# Stop containers
npm run docker:stop
```

## API Endpoints

### Jobs
- `GET /api/jobs` - Get all jobs with pagination and filters
- `GET /api/jobs/:id` - Get job by ID
- `GET /api/jobs/stats` - Get job statistics
- `GET /api/jobs/remote` - Get remote jobs only
- `GET /api/jobs/skills/:skills` - Get jobs by skills
- `POST /api/jobs/search` - Advanced job search
- `GET /api/jobs/:id/similar` - Get similar jobs

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Job Actions (Demo Mode)
- `POST /api/jobs/:id/save` - Save a job
- `DELETE /api/jobs/:id/save` - Remove saved job
- `POST /api/jobs/:id/apply` - Apply for a job
- `GET /api/jobs/user/saved` - Get user's saved jobs
- `GET /api/jobs/user/applied` - Get user's applied jobs

### Alerts
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

### Search
- `POST /api/search/jobs` - Advanced job search
- `GET /api/search/suggestions` - Get search suggestions

### Analytics
- `GET /api/analytics/jobs` - Job analytics
- `GET /api/analytics/users` - User analytics

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/job-scraper

# Redis (optional)
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## API Documentation

### Job Object Structure
```json
{
  "_id": "job_id",
  "title": "Senior Software Engineer",
  "company": {
    "name": "TechCorp Solutions",
    "industry": "Software Development",
    "size": "large",
    "location": "San Francisco, CA",
    "website": "https://techcorp.com",
    "rating": 4.2
  },
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA",
    "remote": false,
    "timezone": "America/Los_Angeles"
  },
  "jobType": {
    "type": "full-time",
    "experience": "senior",
    "salary": {
      "min": 80000,
      "max": 150000,
      "currency": "USD",
      "period": "yearly"
    }
  },
  "skills": ["javascript", "react", "node.js"],
  "description": "Job description...",
  "requirements": ["Bachelor's degree...", "3+ years experience..."],
  "benefits": ["Health insurance", "401(k) matching"],
  "url": "https://company.com/careers/job",
  "sourceSite": "company-website",
  "postedDate": "2024-01-15T00:00:00.000Z",
  "isActive": true,
  "metadata": {
    "views": 150,
    "applications": 12,
    "savedCount": 5
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
