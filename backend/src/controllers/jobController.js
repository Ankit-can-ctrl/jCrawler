const Job = require('../models/Job');
const SearchService = require('../services/searchService');
const CacheService = require('../services/cacheService');
const logger = require('../utils/logger');

class JobController {
  // Get all jobs with pagination and filters
  async getJobs(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        keywords,
        skills,
        location,
        remote,
        jobType,
        experience,
        salaryMin,
        salaryMax,
        company,
        sourceSite,
        postedAfter,
        sortBy = 'postedDate',
        sortOrder = 'desc'
      } = req.query;

      // Build search filters
      const filters = {};
      
      if (keywords) {
        filters.$text = { $search: keywords };
      }
      
      if (skills && skills.length > 0) {
        filters.skills = { $in: Array.isArray(skills) ? skills : [skills] };
      }
      
      if (location) {
        filters.$or = [
          { 'location.city': new RegExp(location, 'i') },
          { 'location.state': new RegExp(location, 'i') },
          { 'location.country': new RegExp(location, 'i') }
        ];
      }
      
      if (remote !== undefined) {
        filters['location.remote'] = remote === 'true';
      }
      
      if (jobType) {
        filters['jobType.type'] = jobType;
      }
      
      if (experience) {
        filters['jobType.experience'] = experience;
      }
      
      if (salaryMin || salaryMax) {
        if (salaryMin && salaryMax) {
          filters['jobType.salary.min'] = { $gte: parseInt(salaryMin) };
          filters['jobType.salary.max'] = { $lte: parseInt(salaryMax) };
        } else if (salaryMin) {
          filters['jobType.salary.min'] = { $gte: parseInt(salaryMin) };
        } else if (salaryMax) {
          filters['jobType.salary.max'] = { $lte: parseInt(salaryMax) };
        }
      }
      
      if (company) {
        filters['company.name'] = new RegExp(company, 'i');
      }
      
      if (sourceSite) {
        filters.sourceSite = sourceSite.toLowerCase();
      }
      
      if (postedAfter) {
        filters.postedDate = { $gte: new Date(postedAfter) };
      }
      
      // Always filter active jobs
      filters.isActive = true;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      // Check cache first
      const cacheKey = `jobs:${JSON.stringify(filters)}:${page}:${limit}:${JSON.stringify(sort)}`;
      const cachedResult = await CacheService.get(cacheKey);
      
      if (cachedResult) {
        return res.json({
          success: true,
          data: cachedResult.jobs,
          pagination: cachedResult.pagination,
          fromCache: true
        });
      }

      // Execute query
      const [jobs, total] = await Promise.all([
        Job.find(filters)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .populate('company', 'name industry size rating'),
        Job.countDocuments(filters)
      ]);

      const result = {
        jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      };

      // Cache the result for 5 minutes
      await CacheService.set(cacheKey, result, 300);

      res.json({
        success: true,
        data: jobs,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Error fetching jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch jobs',
        message: error.message
      });
    }
  }

  // Get job by ID
  async getJobById(req, res) {
    try {
      const { id } = req.params;
      
      const job = await Job.findById(id)
        .populate('company', 'name industry size rating website');

      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // Increment view count
      await job.incrementViews();

      res.json({
        success: true,
        data: job
      });

    } catch (error) {
      logger.error('Error fetching job by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch job',
        message: error.message
      });
    }
  }

  // Get similar jobs
  async getSimilarJobs(req, res) {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;

      const job = await Job.findById(id);
      if (!job) {
        return res.status(404).json({
          success: false,
          error: 'Job not found'
        });
      }

      // Find similar jobs based on skills and company
      const similarJobs = await Job.find({
        _id: { $ne: id },
        isActive: true,
        $or: [
          { skills: { $in: job.skills } },
          { 'company.name': job.company.name }
        ]
      })
        .sort({ postedDate: -1 })
        .limit(parseInt(limit))
        .populate('company', 'name industry size rating');

      res.json({
        success: true,
        data: similarJobs
      });

    } catch (error) {
      logger.error('Error fetching similar jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch similar jobs',
        message: error.message
      });
    }
  }

  // Get job statistics
  async getJobStats(req, res) {
    try {
      const stats = await Job.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalJobs: { $sum: 1 },
            remoteJobs: {
              $sum: { $cond: ['$location.remote', 1, 0] }
            },
            avgSalary: {
              $avg: {
                $cond: [
                  { $and: ['$jobType.salary.min', '$jobType.salary.max'] },
                  { $divide: [{ $add: ['$jobType.salary.min', '$jobType.salary.max'] }, 2] },
                  null
                ]
              }
            },
            topSkills: {
              $push: '$skills'
            },
            topCompanies: {
              $push: '$company.name'
            }
          }
        }
      ]);

      // Process skills and companies
      const allSkills = stats[0]?.topSkills?.flat() || [];
      const allCompanies = stats[0]?.topCompanies || [];

      const skillCounts = allSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1;
        return acc;
      }, {});

      const companyCounts = allCompanies.reduce((acc, company) => {
        acc[company] = (acc[company] || 0) + 1;
        return acc;
      }, {});

      const topSkills = Object.entries(skillCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count }));

      const topCompanies = Object.entries(companyCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([company, count]) => ({ company, count }));

      res.json({
        success: true,
        data: {
          totalJobs: stats[0]?.totalJobs || 0,
          remoteJobs: stats[0]?.remoteJobs || 0,
          avgSalary: Math.round(stats[0]?.avgSalary || 0),
          topSkills,
          topCompanies
        }
      });

    } catch (error) {
      logger.error('Error fetching job stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch job statistics',
        message: error.message
      });
    }
  }

  // Get jobs by skills
  async getJobsBySkills(req, res) {
    try {
      const { skills } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const skillsArray = skills.split(',').map(skill => skill.trim().toLowerCase());
      
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [jobs, total] = await Promise.all([
        Job.findBySkills(skillsArray)
          .sort({ postedDate: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('company', 'name industry size rating'),
        Job.countDocuments({
          skills: { $in: skillsArray },
          isActive: true
        })
      ]);

      res.json({
        success: true,
        data: jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      logger.error('Error fetching jobs by skills:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch jobs by skills',
        message: error.message
      });
    }
  }

  // Get remote jobs
  async getRemoteJobs(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [jobs, total] = await Promise.all([
        Job.findRemoteJobs()
          .sort({ postedDate: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .populate('company', 'name industry size rating'),
        Job.countDocuments({
          'location.remote': true,
          isActive: true
        })
      ]);

      res.json({
        success: true,
        data: jobs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });

    } catch (error) {
      logger.error('Error fetching remote jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch remote jobs',
        message: error.message
      });
    }
  }

  // Search jobs with advanced filters
  async searchJobs(req, res) {
    try {
      const searchQuery = req.body;
      const { page = 1, limit = 20 } = req.query;

      const results = await SearchService.advancedSearch(searchQuery, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        ...results
      });

    } catch (error) {
      logger.error('Error searching jobs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search jobs',
        message: error.message
      });
    }
  }

  // Get job suggestions for autocomplete
  async getJobSuggestions(req, res) {
    try {
      const { q } = req.query;
      
      if (!q || q.length < 2) {
        return res.json({
          success: true,
          data: []
        });
      }

      const suggestions = await Job.aggregate([
        {
          $match: {
            isActive: true,
            $or: [
              { title: { $regex: q, $options: 'i' } },
              { 'company.name': { $regex: q, $options: 'i' } },
              { skills: { $regex: q, $options: 'i' } }
            ]
          }
        },
        {
          $group: {
            _id: '$title',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]);

      res.json({
        success: true,
        data: suggestions.map(s => s._id)
      });

    } catch (error) {
      logger.error('Error fetching job suggestions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch job suggestions',
        message: error.message
      });
    }
  }
}

module.exports = new JobController(); 