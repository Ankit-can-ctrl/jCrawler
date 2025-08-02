# Job Scraper Frontend

A React TypeScript frontend for the job scraping platform with modern UI and advanced search capabilities.

## Features

- **Job Browsing**: Browse and filter job listings
- **Advanced Search**: Search jobs by skills, location, salary, etc.
- **Job Details**: View detailed job information
- **User Actions**: Save jobs, apply for jobs, track applications
- **Job Alerts**: Create and manage job alerts
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean and intuitive user interface

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: CSS3 with modern design patterns
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Build Tool**: Create React App

## Prerequisites

- Node.js (v16 or higher)
- Backend server running (see backend README)

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The app will open at [http://localhost:3000](http://localhost:3000).

## Backend Integration

### Setting up the Backend

Before using the frontend, you need to start the backend with dummy data:

1. Navigate to the backend directory:
   ```bash
   cd ../backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Start the backend with dummy data:
   ```bash
   # Option 1: Start with full setup (recommended)
   npm run start:full
   
   # Option 2: Manual setup
   npm run seed    # Seed the database
   npm run dev     # Start the server
   ```

### Available Dummy Data

The backend provides realistic dummy data including:

**Jobs (100 total):**
- 25 different job titles (Software Engineer, Data Scientist, etc.)
- 8 different companies across various industries
- Multiple locations including remote positions
- Realistic salary ranges ($45k - $150k)
- 60+ different skills (JavaScript, Python, React, AWS, etc.)
- Various job types (full-time, contract, freelance, etc.)

**Users (10 total):**
- Complete user profiles with skills and experience
- Job preferences and salary expectations
- Saved jobs and application history
- Email-verified accounts ready for testing

**Job Alerts:**
- Pre-configured alerts for each user
- Different search criteria and frequencies

## API Integration

The frontend automatically connects to the backend API at `http://localhost:5000/api`. The following endpoints are available:

### Job Endpoints
- `GET /api/jobs` - Get all jobs with pagination
- `GET /api/jobs/:id` - Get job by ID
- `GET /api/jobs/stats` - Get job statistics
- `GET /api/jobs/remote` - Get remote jobs only
- `GET /api/jobs/skills/:skills` - Get jobs by skills
- `POST /api/jobs/search` - Advanced job search
- `GET /api/jobs/:id/similar` - Get similar jobs

### User Actions (Demo Mode)
- `POST /api/jobs/:id/save` - Save a job
- `DELETE /api/jobs/:id/save` - Remove saved job
- `POST /api/jobs/:id/apply` - Apply for a job
- `GET /api/jobs/user/saved` - Get user's saved jobs
- `GET /api/jobs/user/applied` - Get user's applied jobs

### Alert Endpoints
- `GET /api/alerts` - Get user's alerts
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert

## Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App
npm run eject
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Testing the Application

1. **Start the backend** (see Backend Integration section)
2. **Start the frontend**:
   ```bash
   npm start
   ```
3. **Browse jobs**: Visit the homepage to see all available jobs
4. **Search jobs**: Use the search functionality to filter jobs
5. **View job details**: Click on any job to see detailed information
6. **Save jobs**: Use the save functionality (works with demo user)
7. **Apply for jobs**: Test the apply functionality
8. **Check saved/applied jobs**: View your saved and applied jobs

## Data Structure

### Job Object
```typescript
interface Job {
  _id: string;
  title: string;
  company: {
    name: string;
    industry: string;
    size: string;
    location: string;
    website: string;
    rating: number;
  };
  location: {
    city: string;
    state: string;
    country: string;
    remote: boolean;
    timezone: string;
  };
  jobType: {
    type: "full-time" | "part-time" | "contract" | "freelance" | "internship";
    experience: "entry" | "mid" | "senior" | "lead" | "executive";
    salary: {
      min: number;
      max: number;
      currency: string;
      period: string;
    };
  };
  skills: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  url: string;
  sourceSite: string;
  postedDate: string;
  isActive: boolean;
  metadata: {
    views: number;
    applications: number;
    savedCount: number;
  };
}
```

## Troubleshooting

### Common Issues

1. **Backend not running**: Make sure the backend server is running on port 5000
2. **No data showing**: Ensure the database is seeded with dummy data
3. **CORS errors**: Check that the backend CORS configuration includes `http://localhost:3000`
4. **API connection failed**: Verify the API URL in the environment variables

### Testing API Connection

You can test if the backend is working by visiting:
- `http://localhost:5000/health` - Health check
- `http://localhost:5000/api/jobs` - Get all jobs
- `http://localhost:5000/api/jobs/stats` - Get job statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
