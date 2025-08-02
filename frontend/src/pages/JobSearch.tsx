import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Pagination,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import apiService from "../services/api";
import { Job, SearchFilters } from "../types";
import {
  formatDate,
  formatSalary,
  formatJobType,
  getJobTypeColor,
} from "../utils/helpers";

const JobSearch: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchJobs();
  }, [page, filters]);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.searchJobs(filters, page, 10);
      setJobs(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({
      ...filters,
      keywords: searchQuery ? [searchQuery] : undefined,
    });
    setPage(1);
  };

  const JobCard = ({ job }: { job: Job }) => (
    <Card sx={{ mb: 2, "&:hover": { boxShadow: 3 } }}>
      <CardContent>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            component="h3"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            {job.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <BusinessIcon
              sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
            />
            {job.company.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <LocationIcon
              sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}
            />
            {job.location.city}, {job.location.state}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
            <Chip
              label={formatJobType(job.jobType.type)}
              size="small"
              sx={{
                bgcolor: getJobTypeColor(job.jobType.type),
                color: "white",
              }}
            />
            {job.location.remote && (
              <Chip label="Remote" size="small" color="primary" />
            )}
            <Chip
              label={formatSalary(job.jobType.salary)}
              size="small"
              variant="outlined"
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Posted {formatDate(job.postedDate)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Job Search
      </Typography>

      {/* Search Bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              fullWidth
              placeholder="Search jobs, skills, or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ minWidth: 120 }}
            >
              Search
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Job Type</InputLabel>
              <Select
                value={filters.jobTypes || []}
                label="Job Type"
                multiple
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    jobTypes: e.target.value as string[],
                  })
                }
              >
                <MenuItem value="full-time">Full Time</MenuItem>
                <MenuItem value="part-time">Part Time</MenuItem>
                <MenuItem value="contract">Contract</MenuItem>
                <MenuItem value="internship">Internship</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Experience</InputLabel>
              <Select
                value={filters.experience || ""}
                label="Experience"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    experience: e.target.value as string,
                  })
                }
              >
                <MenuItem value="">All Levels</MenuItem>
                <MenuItem value="entry">Entry Level</MenuItem>
                <MenuItem value="mid">Mid Level</MenuItem>
                <MenuItem value="senior">Senior Level</MenuItem>
                <MenuItem value="lead">Lead Level</MenuItem>
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.remote || false}
                  onChange={(e) =>
                    setFilters({ ...filters, remote: e.target.checked })
                  }
                />
              }
              label="Remote Only"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <LinearProgress />
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>
            {jobs.length} jobs found
          </Typography>

          {jobs.length === 0 ? (
            <Alert severity="info">
              No jobs found matching your criteria. Try adjusting your search
              filters.
            </Alert>
          ) : (
            <>
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}

              {/* Pagination */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default JobSearch;
