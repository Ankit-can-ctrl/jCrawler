const redisClient = require("../config/redis");
const logger = require("../utils/logger");

class CacheService {
  // Get value from cache
  static async get(key) {
    try {
      const value = await redisClient.get(key);
      return value;
    } catch (error) {
      logger.error("Cache get error:", error);
      return null;
    }
  }

  // Set value in cache
  static async set(key, value, expireTime = 3600) {
    try {
      await redisClient.set(key, value, expireTime);
      return true;
    } catch (error) {
      logger.error("Cache set error:", error);
      return false;
    }
  }

  // Delete value from cache
  static async del(key) {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error("Cache del error:", error);
      return false;
    }
  }

  // Check if key exists
  static async exists(key) {
    try {
      return await redisClient.exists(key);
    } catch (error) {
      logger.error("Cache exists error:", error);
      return false;
    }
  }

  // Get multiple values
  static async mget(keys) {
    try {
      const values = await Promise.all(keys.map((key) => this.get(key)));
      return values;
    } catch (error) {
      logger.error("Cache mget error:", error);
      return [];
    }
  }

  // Set multiple values
  static async mset(keyValuePairs, expireTime = 3600) {
    try {
      const promises = keyValuePairs.map(([key, value]) =>
        this.set(key, value, expireTime)
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      logger.error("Cache mset error:", error);
      return false;
    }
  }

  // Increment counter
  static async incr(key, expireTime = 3600) {
    try {
      const value = await redisClient.client.incr(key);
      await redisClient.client.expire(key, expireTime);
      return value;
    } catch (error) {
      logger.error("Cache incr error:", error);
      return null;
    }
  }

  // Get cache statistics
  static async getStats() {
    try {
      const info = await redisClient.client.info();
      return info;
    } catch (error) {
      logger.error("Cache stats error:", error);
      return null;
    }
  }

  // Clear all cache
  static async clear() {
    try {
      await redisClient.client.flushdb();
      return true;
    } catch (error) {
      logger.error("Cache clear error:", error);
      return false;
    }
  }

  // Cache middleware for Express routes
  static cacheMiddleware(expireTime = 300) {
    return async (req, res, next) => {
      if (req.method !== "GET") {
        return next();
      }

      const key = `cache:${req.originalUrl}`;

      try {
        const cachedResponse = await this.get(key);

        if (cachedResponse) {
          return res.json({
            ...cachedResponse,
            fromCache: true,
          });
        }

        // Store original send method
        const originalSend = res.json;

        // Override send method to cache response
        res.json = function (data) {
          // Cache the response
          CacheService.set(key, data, expireTime);

          // Call original send method
          return originalSend.call(this, data);
        };

        next();
      } catch (error) {
        logger.error("Cache middleware error:", error);
        next();
      }
    };
  }

  // Generate cache key for jobs
  static generateJobCacheKey(filters, page, limit, sort) {
    const filterString = JSON.stringify(filters);
    const sortString = JSON.stringify(sort);
    return `jobs:${filterString}:${page}:${limit}:${sortString}`;
  }

  // Generate cache key for search
  static generateSearchCacheKey(searchQuery, options) {
    const queryString = JSON.stringify(searchQuery);
    const optionsString = JSON.stringify(options);
    return `search:${queryString}:${optionsString}`;
  }

  // Generate cache key for user data
  static generateUserCacheKey(userId, dataType) {
    return `user:${userId}:${dataType}`;
  }

  // Invalidate cache by pattern
  static async invalidatePattern(pattern) {
    try {
      const keys = await redisClient.client.keys(pattern);
      if (keys.length > 0) {
        await redisClient.client.del(keys);
      }
      return keys.length;
    } catch (error) {
      logger.error("Cache invalidate pattern error:", error);
      return 0;
    }
  }

  // Invalidate user-related cache
  static async invalidateUserCache(userId) {
    const patterns = [`user:${userId}:*`, `jobs:*`, `search:*`];

    try {
      const promises = patterns.map((pattern) =>
        this.invalidatePattern(pattern)
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      logger.error("Cache invalidate user error:", error);
      return false;
    }
  }

  // Invalidate job-related cache
  static async invalidateJobCache() {
    const patterns = ["jobs:*", "search:*", "stats:*"];

    try {
      const promises = patterns.map((pattern) =>
        this.invalidatePattern(pattern)
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      logger.error("Cache invalidate job error:", error);
      return false;
    }
  }

  // Cache with TTL (Time To Live)
  static async setWithTTL(key, value, ttl = 3600) {
    try {
      await redisClient.set(key, value, ttl);
      return true;
    } catch (error) {
      logger.error("Cache setWithTTL error:", error);
      return false;
    }
  }

  // Get TTL for a key
  static async getTTL(key) {
    try {
      return await redisClient.client.ttl(key);
    } catch (error) {
      logger.error("Cache getTTL error:", error);
      return -1;
    }
  }

  // Extend TTL for a key
  static async extendTTL(key, ttl = 3600) {
    try {
      await redisClient.client.expire(key, ttl);
      return true;
    } catch (error) {
      logger.error("Cache extendTTL error:", error);
      return false;
    }
  }
}

module.exports = CacheService;
