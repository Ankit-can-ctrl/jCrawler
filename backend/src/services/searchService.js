const Job = require("../models/Job");
const logger = require("../utils/logger");

class SearchService {
  // Advanced search with multiple criteria
  static async advancedSearch(searchQuery, options = {}) {
    try {
      const {
        keywords,
        skills,
        locations,
        remote,
        jobTypes,
        experience,
        salaryRange,
        companies,
        excludeKeywords,
        postedAfter,
        sortBy = "postedDate",
        sortOrder = "desc",
      } = searchQuery;

      const { page = 1, limit = 20 } = options;

      // Build search query
      const query = { isActive: true };

      // Keywords search
      if (keywords && keywords.length > 0) {
        const keywordArray = Array.isArray(keywords) ? keywords : [keywords];
        query.$text = { $search: keywordArray.join(" ") };
      }

      // Skills filter
      if (skills && skills.length > 0) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        query.skills = { $in: skillsArray.map((skill) => skill.toLowerCase()) };
      }

      // Location filter
      if (locations && locations.length > 0) {
        const locationQueries = locations.map((location) => {
          const locQuery = {};
          if (location.city)
            locQuery["location.city"] = new RegExp(location.city, "i");
          if (location.state)
            locQuery["location.state"] = new RegExp(location.state, "i");
          if (location.country)
            locQuery["location.country"] = new RegExp(location.country, "i");
          return locQuery;
        });
        query.$or = locationQueries;
      }

      // Remote filter
      if (remote !== undefined) {
        query["location.remote"] = remote;
      }

      // Job type filter
      if (jobTypes && jobTypes.length > 0) {
        query["jobType.type"] = { $in: jobTypes };
      }

      // Experience level filter
      if (experience) {
        query["jobType.experience"] = experience;
      }

      // Salary range filter
      if (salaryRange) {
        if (salaryRange.min && salaryRange.max) {
          query["jobType.salary.min"] = { $gte: salaryRange.min };
          query["jobType.salary.max"] = { $lte: salaryRange.max };
        } else if (salaryRange.min) {
          query["jobType.salary.min"] = { $gte: salaryRange.min };
        } else if (salaryRange.max) {
          query["jobType.salary.max"] = { $lte: salaryRange.max };
        }
      }

      // Company filter
      if (companies && companies.length > 0) {
        query["company.name"] = { $in: companies };
      }

      // Exclude keywords
      if (excludeKeywords && excludeKeywords.length > 0) {
        const excludeQueries = excludeKeywords.map((keyword) => ({
          $or: [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
          ],
        }));
        query.$and = excludeQueries.map((q) => ({ $not: q }));
      }

      // Posted after filter
      if (postedAfter) {
        query.postedDate = { $gte: new Date(postedAfter) };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute search
      const [jobs, total] = await Promise.all([
        Job.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate("company", "name industry size rating"),
        Job.countDocuments(query),
      ]);

      return {
        data: jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
        searchQuery: query,
      };
    } catch (error) {
      logger.error("Error in advanced search:", error);
      throw error;
    }
  }

  // Search with relevance scoring
  static async relevanceSearch(searchQuery, options = {}) {
    try {
      const { keywords, skills, location } = searchQuery;
      const { page = 1, limit = 20 } = options;

      // Build base query
      const query = { isActive: true };
      const shouldClauses = [];

      // Keywords relevance
      if (keywords) {
        query.$text = { $search: keywords };
        shouldClauses.push({ $text: { $search: keywords } });
      }

      // Skills relevance
      if (skills && skills.length > 0) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        query.skills = { $in: skillsArray };
        shouldClauses.push({ skills: { $in: skillsArray } });
      }

      // Location relevance
      if (location) {
        query.$or = [
          { "location.city": new RegExp(location, "i") },
          { "location.state": new RegExp(location, "i") },
          { "location.country": new RegExp(location, "i") },
        ];
        shouldClauses.push(query.$or);
      }

      const skip = (page - 1) * limit;

      // Use aggregation for relevance scoring
      const pipeline = [
        { $match: query },
        {
          $addFields: {
            relevanceScore: {
              $sum: [
                // Text score if available
                { $ifNull: [{ $meta: "textScore" }, 0] },
                // Skills match bonus
                {
                  $multiply: [
                    { $size: { $setIntersection: ["$skills", skills || []] } },
                    10,
                  ],
                },
                // Recent job bonus
                {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: [new Date(), "$postedDate"] },
                        1000 * 60 * 60 * 24, // days
                      ],
                    },
                    -1,
                  ],
                },
              ],
            },
          },
        },
        { $sort: { relevanceScore: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "companies",
            localField: "company",
            foreignField: "_id",
            as: "company",
          },
        },
        { $unwind: "$company" },
      ];

      const [jobs, total] = await Promise.all([
        Job.aggregate(pipeline),
        Job.countDocuments(query),
      ]);

      return {
        data: jobs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error("Error in relevance search:", error);
      throw error;
    }
  }

  // Get search suggestions
  static async getSearchSuggestions(query) {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      const suggestions = await Job.aggregate([
        {
          $match: {
            isActive: true,
            $or: [
              { title: { $regex: query, $options: "i" } },
              { "company.name": { $regex: query, $options: "i" } },
              { skills: { $regex: query, $options: "i" } },
            ],
          },
        },
        {
          $group: {
            _id: "$title",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      return suggestions.map((s) => s._id);
    } catch (error) {
      logger.error("Error getting search suggestions:", error);
      return [];
    }
  }

  // Get trending searches
  static async getTrendingSearches() {
    try {
      const trending = await Job.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: "$skills",
            count: { $sum: 1 },
          },
        },
        {
          $unwind: "$_id",
        },
        {
          $group: {
            _id: "$_id",
            count: { $sum: "$count" },
          },
        },
        {
          $sort: { count: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      return trending.map((t) => ({
        skill: t._id,
        count: t.count,
      }));
    } catch (error) {
      logger.error("Error getting trending searches:", error);
      return [];
    }
  }

  // Build filters for frontend
  static async getAvailableFilters() {
    try {
      const filters = await Job.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            jobTypes: { $addToSet: "$jobType.type" },
            experienceLevels: { $addToSet: "$jobType.experience" },
            skills: { $addToSet: "$skills" },
            companies: { $addToSet: "$company.name" },
            locations: {
              $addToSet: {
                city: "$location.city",
                state: "$location.state",
                country: "$location.country",
              },
            },
          },
        },
      ]);

      if (filters.length === 0) {
        return {
          jobTypes: [],
          experienceLevels: [],
          skills: [],
          companies: [],
          locations: [],
        };
      }

      const result = filters[0];

      // Flatten skills array
      result.skills = [...new Set(result.skills.flat())];

      // Filter out null/undefined values
      result.companies = result.companies.filter((c) => c);
      result.locations = result.locations.filter(
        (l) => l.city || l.state || l.country
      );

      return result;
    } catch (error) {
      logger.error("Error getting available filters:", error);
      return {
        jobTypes: [],
        experienceLevels: [],
        skills: [],
        companies: [],
        locations: [],
      };
    }
  }
}

module.exports = SearchService;
