import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  Job,
  Alert,
  JobStats,
  SearchFilters,
  ApiResponse,
  PaginatedResponse,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Job endpoints
  async getJobs(page = 1, limit = 10): Promise<PaginatedResponse<Job>> {
    const response: AxiosResponse<PaginatedResponse<Job>> = await this.api.get(
      `/jobs?page=${page}&limit=${limit}`
    );
    return response.data;
  }

  async getJobById(id: string): Promise<Job> {
    const response: AxiosResponse<ApiResponse<Job>> = await this.api.get(
      `/jobs/${id}`
    );
    return response.data.data!;
  }

  async searchJobs(
    filters: SearchFilters,
    page = 1,
    limit = 10
  ): Promise<PaginatedResponse<Job>> {
    const response: AxiosResponse<PaginatedResponse<Job>> = await this.api.post(
      `/jobs/search?page=${page}&limit=${limit}`,
      filters
    );
    return response.data;
  }

  async getJobStats(): Promise<JobStats> {
    const response: AxiosResponse<ApiResponse<JobStats>> = await this.api.get(
      "/jobs/stats"
    );
    return response.data.data!;
  }

  async getJobSuggestions(query: string): Promise<string[]> {
    const response: AxiosResponse<ApiResponse<string[]>> = await this.api.get(
      `/jobs/suggestions?q=${encodeURIComponent(query)}`
    );
    return response.data.data!;
  }

  async getJobsBySkills(skills: string): Promise<Job[]> {
    const response: AxiosResponse<ApiResponse<Job[]>> = await this.api.get(
      `/jobs/skills/${encodeURIComponent(skills)}`
    );
    return response.data.data!;
  }

  async getRemoteJobs(): Promise<Job[]> {
    const response: AxiosResponse<ApiResponse<Job[]>> = await this.api.get(
      "/jobs/remote"
    );
    return response.data.data!;
  }

  async getSimilarJobs(jobId: string): Promise<Job[]> {
    const response: AxiosResponse<ApiResponse<Job[]>> = await this.api.get(
      `/jobs/${jobId}/similar`
    );
    return response.data.data!;
  }

  // Search endpoints
  async search(
    query: string,
    filters?: SearchFilters
  ): Promise<PaginatedResponse<Job>> {
    const response: AxiosResponse<PaginatedResponse<Job>> = await this.api.post(
      "/search",
      { query, filters }
    );
    return response.data;
  }

  // Alert endpoints
  async getAlerts(): Promise<Alert[]> {
    const response: AxiosResponse<ApiResponse<Alert[]>> = await this.api.get(
      "/alerts"
    );
    return response.data.data!;
  }

  async createAlert(
    alert: Omit<Alert, "_id" | "createdAt" | "updatedAt">
  ): Promise<Alert> {
    const response: AxiosResponse<ApiResponse<Alert>> = await this.api.post(
      "/alerts",
      alert
    );
    return response.data.data!;
  }

  async updateAlert(id: string, alert: Partial<Alert>): Promise<Alert> {
    const response: AxiosResponse<ApiResponse<Alert>> = await this.api.put(
      `/alerts/${id}`,
      alert
    );
    return response.data.data!;
  }

  async deleteAlert(id: string): Promise<void> {
    await this.api.delete(`/alerts/${id}`);
  }

  // Analytics endpoints
  async getAnalytics(): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(
      "/analytics"
    );
    return response.data.data!;
  }
}

export const apiService = new ApiService();
export default apiService;
