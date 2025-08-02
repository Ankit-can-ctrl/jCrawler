const redis = require('redis');
const logger = require('../utils/logger');

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        url: process.env.REDIS_URL,
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            logger.error('Redis server refused connection');
            return new Error('Redis server refused connection');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            logger.error('Redis retry time exhausted');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            logger.error('Redis max attempts reached');
            return undefined;
          }
          return Math.min(options.attempt * 100, 3000);
        }
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('error', (err) => {
        logger.error('Redis client error:', err);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.warn('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      return this.client;

    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  async get(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Redis get error:', error);
      return null;
    }
  }

  async set(key, value, expireTime = 3600) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      await this.client.setEx(key, expireTime, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Redis set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Redis del error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      if (!this.isConnected) {
        throw new Error('Redis not connected');
      }
      return await this.client.exists(key);
    } catch (error) {
      logger.error('Redis exists error:', error);
      return false;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

const redisClient = new RedisClient();

module.exports = redisClient; 