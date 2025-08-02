# Job Scraper Backend API

A comprehensive Node.js/Express backend for a global job scraping platform with advanced search, filtering, and user management features.

## 🚀 Features

- **Advanced Job Search**: Multi-criteria search with filtering by skills, location, salary, etc.
- **User Management**: Registration, authentication, and profile management
- **Job Alerts**: Customizable job alerts with email/Slack notifications
- **Caching**: Redis-based caching for improved performance
- **Real-time Analytics**: Job statistics and market insights
- **Rate Limiting**: API rate limiting for security
- **Comprehensive Logging**: Winston-based logging system
- **Data Validation**: Express-validator for request validation
- **Error Handling**: Centralized error handling middleware

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Redis (v6 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd job-scraper-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   ```

   Edit `.env` file with your configuration:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/job_scraper_db

   # Redis Configuration
   REDIS_URL=redis://localhost:6379

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📊 Database Schema

### Job Collection

```javascript
{
  _id: ObjectId,
  title: String,
  company: {
    name: String,
    industry: String,
    size: String,
    location: String,
    website: String,
    rating: Number
  },
  location: {
    city: String,
    state: String,
    country: String,
    remote: Boolean,
    timezone: String
  },
  jobType: {
    type: String, // full-time, part-time, contract, freelance, internship
    experience: String, // entry, mid, senior, lead, executive
    salary: {
      min: Number,
      max: Number,
      currency: String,
      period: String // hourly, monthly, yearly
    }
  },
  skills: [String],
  description: String,
  requirements: [String],
  benefits: [String],
  url: String,
  sourceSite: String,
  postedDate: Date,
  scrapedDate: Date,
  isActive: Boolean,
  metadata: {
    views: Number,
    applications: Number,
    savedCount: Number
  }
}
```

### User Collection

```javascript
{
  _id: ObjectId,
  email: String,
  password: String,
  profile: {
    firstName: String,
    lastName: String,
    skills: [String],
    experience: String,
    location: Object,
    remotePreference: Boolean,
    bio: String,
    avatar: String
  },
  preferences: {
    jobTypes: [String],
    locations: [Object],
    salaryRange: Object,
    skills: [String],
    remoteOnly: Boolean,
    experienceLevel: String
  },
  savedJobs: [Object],
  appliedJobs: [Object],
  alerts: [ObjectId],
  isActive: Boolean,
  isEmailVerified: Boolean
}
```

## 🔌 API Endpoints

### Jobs

#### Get All Jobs

```http
GET /api/jobs?page=1&limit=20&keywords=react&skills=javascript&location=remote&remote=true&jobType=full-time&experience=senior&salaryMin=50000&salaryMax=100000&company=Google&sourceSite=linkedin&postedAfter=2024-01-01&sortBy=postedDate&sortOrder=desc
```

#### Get Job by ID

```http
GET /api/jobs/:id
```

#### Get Similar Jobs

```http
GET /api/jobs/:id/similar?limit=5
```

#### Get Job Statistics

```http
GET /api/jobs/stats
```

#### Get Jobs by Skills

```http
GET /api/jobs/skills/javascript,react,nodejs?page=1&limit=20
```

#### Get Remote Jobs

```http
GET /api/jobs/remote?page=1&limit=20
```

#### Get Job Suggestions

```http
GET /api/jobs/suggestions?q=react
```

### Search

#### Advanced Search

```http
POST /api/search
Content-Type: application/json

{
  "keywords": ["react", "frontend"],
  "skills": ["javascript", "react", "typescript"],
  "locations": [
    {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    }
  ],
  "remote": true,
  "jobTypes": ["full-time", "contract"],
  "experience": "senior",
  "salaryRange": {
    "min": 80000,
    "max": 150000,
    "currency": "USD"
  },
  "companies": ["Google", "Facebook"],
  "excludeKeywords": ["junior", "intern"],
  "postedAfter": "2024-01-01",
  "sortBy": "postedDate",
  "sortOrder": "desc"
}
```

### Users

#### Register User

```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "skills": ["javascript", "react", "nodejs"],
    "experience": "senior",
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    },
    "remotePreference": true,
    "bio": "Full-stack developer with 5+ years of experience"
  }
}
```

#### Login User

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

#### Get User Profile

```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Update User Profile

```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": {
    "firstName": "John",
    "lastName": "Smith",
    "skills": ["javascript", "react", "nodejs", "python"],
    "experience": "senior",
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA"
    },
    "remotePreference": true,
    "bio": "Updated bio"
  }
}
```

### Job Actions (Authenticated)

#### Save Job

```http
POST /api/jobs/:id/save
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Great opportunity with good salary"
}
```

#### Apply for Job

```http
POST /api/jobs/:id/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "notes": "Applied through company website"
}
```

#### Update Application Status

```http
PUT /api/jobs/:id/application-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "interviewing",
  "notes": "First round interview scheduled"
}
```

#### Get Saved Jobs

```http
GET /api/jobs/user/saved?page=1&limit=20
Authorization: Bearer <token>
```

#### Get Applied Jobs

```http
GET /api/jobs/user/applied?page=1&limit=20&status=applied
Authorization: Bearer <token>
```

#### Check Job Status

```http
GET /api/jobs/:id/status
Authorization: Bearer <token>
```

### Alerts

#### Create Alert

```http
POST /api/alerts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "React Developer Jobs",
  "criteria": {
    "keywords": ["react", "frontend"],
    "skills": ["javascript", "react", "typescript"],
    "locations": [
      {
        "city": "San Francisco",
        "state": "CA",
        "country": "USA"
      }
    ],
    "remoteOnly": true,
    "jobTypes": ["full-time", "contract"],
    "experienceLevel": "senior",
    "salaryRange": {
      "min": 80000,
      "max": 150000,
      "currency": "USD"
    },
    "companies": ["Google", "Facebook"],
    "excludeKeywords": ["junior", "intern"]
  },
  "frequency": "daily",
  "notification": {
    "email": true,
    "push": false,
    "slack": false
  }
}
```

#### Get User Alerts

```http
GET /api/alerts
Authorization: Bearer <token>
```

#### Update Alert

```http
PUT /api/alerts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Alert Name",
  "criteria": {
    "keywords": ["react", "frontend", "typescript"]
  },
  "frequency": "weekly"
}
```

#### Delete Alert

```http
DELETE /api/alerts/:id
Authorization: Bearer <token>
```

### Analytics

#### Get Salary Trends

```http
GET /api/analytics/salary-trends?skills=javascript,react&location=San Francisco&timeframe=6months
```

#### Get Skill Demand

```http
GET /api/analytics/skill-demand?location=remote&timeframe=3months
```

#### Get Remote Work Trends

```http
GET /api/analytics/remote-trends?timeframe=1year
```

#### Get Company Insights

```http
GET /api/analytics/company-insights?company=Google&timeframe=6months
```

## 🔧 Configuration

### Environment Variables

| Variable                  | Description               | Default                                    |
| ------------------------- | ------------------------- | ------------------------------------------ |
| `NODE_ENV`                | Environment mode          | `development`                              |
| `PORT`                    | Server port               | `5000`                                     |
| `MONGODB_URI`             | MongoDB connection string | `mongodb://localhost:27017/job_scraper_db` |
| `REDIS_URL`               | Redis connection string   | `redis://localhost:6379`                   |
| `JWT_SECRET`              | JWT secret key            | Required                                   |
| `JWT_EXPIRES_IN`          | JWT expiration time       | `7d`                                       |
| `EMAIL_HOST`              | SMTP host                 | `smtp.gmail.com`                           |
| `EMAIL_PORT`              | SMTP port                 | `587`                                      |
| `EMAIL_USER`              | SMTP username             | Required                                   |
| `EMAIL_PASS`              | SMTP password             | Required                                   |
| `RATE_LIMIT_WINDOW_MS`    | Rate limit window         | `900000` (15 minutes)                      |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window   | `100`                                      |
| `CORS_ORIGIN`             | CORS origin               | `http://localhost:3000`                    |

### Database Indexes

The application automatically creates the following indexes for optimal performance:

- Text index on `title` and `description`
- Index on `company.name`
- Compound index on `location.city` and `location.country`
- Index on `location.remote`
- Index on `skills`
- Index on `sourceSite`
- Index on `postedDate` (descending)
- Index on `isActive`
- Compound index on `jobType.salary.min` and `jobType.salary.max`

## 🚀 Performance Features

### Caching

- Redis-based caching for job queries
- Cache invalidation on data updates
- Configurable cache TTL
- Cache middleware for automatic caching

### Rate Limiting

- API rate limiting per IP
- Configurable limits and windows
- Rate limit headers in responses

### Database Optimization

- Proper indexing for common queries
- Aggregation pipelines for analytics
- Connection pooling
- Query optimization

## 📝 Logging

The application uses Winston for logging with the following features:

- Structured JSON logging
- Log rotation (5MB max file size, 5 files max)
- Separate error and combined logs
- Console logging in development
- Request logging with Morgan

### Log Levels

- `error`: Application errors
- `warn`: Warning messages
- `info`: General information
- `debug`: Debug information (development only)

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention (MongoDB)
- XSS protection

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Scripts

```bash
# Development
npm run dev          # Start development server with nodemon

# Production
npm start            # Start production server
npm run build        # Build for production

# Testing
npm test             # Run tests
npm run test:watch   # Run tests in watch mode

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues

# Database
npm run db:seed      # Seed database with sample data
npm run db:reset     # Reset database
```

## 🐳 Docker

```bash
# Build Docker image
docker build -t job-scraper-backend .

# Run with Docker Compose
docker-compose up -d
```

## 📈 Monitoring

### Health Check

```http
GET /health
```

Response:

```json
{
  "success": true,
  "message": "Job Scraper API is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "development"
}
```

### Metrics

- Request count and response times
- Database connection status
- Cache hit/miss ratios
- Error rates and types
- Memory and CPU usage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the API examples

## 🔄 Updates

To update the application:

1. Pull the latest changes
2. Install new dependencies: `npm install`
3. Run database migrations if any
4. Restart the server

## 📊 API Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  },
  "message": "Optional message"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```
