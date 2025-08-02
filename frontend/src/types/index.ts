export interface Job {
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
  scrapedDate: string;
  isActive: boolean;
  metadata: {
    views: number;
    applications: number;
    savedCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  _id: string;
  userId: string;
  name: string;
  criteria: {
    keywords: string[];
    skills: string[];
    locations: Array<{
      city: string;
      state: string;
      country: string;
    }>;
    remoteOnly: boolean;
    jobTypes: string[];
    experienceLevel: string;
    salaryRange: {
      min: number;
      max: number;
      currency: string;
    };
    companies: string[];
    excludeKeywords: string[];
  };
  frequency: "instant" | "daily" | "weekly";
  notification: {
    email: boolean;
    push: boolean;
    slack: boolean;
    slackWebhook?: string;
  };
  isActive: boolean;
  lastTriggered?: string;
  nextTrigger?: string;
  stats: {
    totalMatches: number;
    lastMatchCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface JobStats {
  totalJobs: number;
  remoteJobs: number;
  averageSalary: number;
  topSkills: Array<{ skill: string; count: number }>;
  topCompanies: Array<{ company: string; count: number }>;
  jobsByType: Array<{ type: string; count: number }>;
  jobsByExperience: Array<{ experience: string; count: number }>;
}

export interface SearchFilters {
  keywords?: string[];
  skills?: string[];
  locations?: Array<{
    city: string;
    state: string;
    country: string;
  }>;
  remote?: boolean;
  jobTypes?: string[];
  experience?: string;
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  companies?: string[];
  excludeKeywords?: string[];
  postedAfter?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
