import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  LinearProgress,
  Paper,
} from "@mui/material";
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingIcon,
  Bookmark as BookmarkIcon,
  Search as SearchIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import { Job, JobStats } from "../types";
import {
  formatDate,
  formatSalary,
  formatJobType,
  getJobTypeColor,
} from "../utils/helpers";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<JobStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, jobsData] = await Promise.all([
          apiService.getJobStats(),
          apiService.getJobs(1, 5),
        ]);
        setStats(statsData);
        setRecentJobs(jobsData.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar sx={{ bgcolor: color, mr: 2 }}>{icon}</Avatar>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: "bold" }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        Welcome to JobScraper! 👋
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 4 }}>
        <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
          <StatCard
            title="Total Jobs"
            value={stats?.totalJobs || 0}
            icon={<WorkIcon />}
            color="#4caf50"
          />
        </Box>
        <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
          <StatCard
            title="Remote Jobs"
            value={stats?.remoteJobs || 0}
            icon={<LocationIcon />}
            color="#2196f3"
          />
        </Box>
        <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
          <StatCard
            title="Avg Salary"
            value={
              stats?.averageSalary
                ? `$${Math.round(stats.averageSalary / 1000)}k`
                : "N/A"
            }
            icon={<TrendingIcon />}
            color="#ff9800"
          />
        </Box>
        <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
          <StatCard
            title="Active Alerts"
            value="0"
            icon={<BookmarkIcon />}
            color="#9c27b0"
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        {/* Recent Jobs */}
        <Box sx={{ flex: "2 1 600px", minWidth: 0 }}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" component="h2">
                  Recent Job Postings
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate("/jobs")}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentJobs.map((job) => (
                  <ListItem key={job._id} divider>
                    <ListItemAvatar>
                      <Avatar
                        sx={{ bgcolor: getJobTypeColor(job.jobType.type) }}
                      >
                        <BusinessIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold" }}
                          >
                            {job.title}
                          </Typography>
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
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {job.company.name} • {job.location.city},{" "}
                            {job.location.state}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatSalary(job.jobType.salary)} • Posted{" "}
                            {formatDate(job.postedDate)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate(`/jobs/${job._id}`)}
                    >
                      View
                    </Button>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Box>

        {/* Quick Actions & Stats */}
        <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={() => navigate("/jobs")}
                    fullWidth
                  >
                    Search Jobs
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<BookmarkIcon />}
                    onClick={() => navigate("/saved")}
                    fullWidth
                  >
                    Saved Jobs
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<WorkIcon />}
                    onClick={() => navigate("/applied")}
                    fullWidth
                  >
                    Applied Jobs
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Top Skills */}
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Top Skills in Demand
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {stats?.topSkills?.slice(0, 8).map((skill) => (
                    <Chip
                      key={skill.skill}
                      label={`${skill.skill} (${skill.count})`}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* Top Companies */}
            <Card>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  Top Companies
                </Typography>
                <List dense>
                  {stats?.topCompanies?.slice(0, 5).map((company) => (
                    <ListItem key={company.company}>
                      <ListItemText
                        primary={company.company}
                        secondary={`${company.count} jobs`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
