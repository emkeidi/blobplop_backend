const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 10,
});

const speedLimiter = slowDown({
  windowMs: 30 * 1000,
  delayAfter: 1,
  delayMs: 500,
});

const router = express.Router();

const BASE_URL = 'https://api.nasa.gov/planetary/apod?';

let cacheTime;
let cachedData;

router.get('/', limiter, speedLimiter, async (req, res, next) => {
  // in memory cache
  if (cacheTime && cacheTime > Date.now() - 30000) {
    return res.json(cachedData);
  }
  try {
    const params = new URLSearchParams({
      api_key: process.env.NASA_API_KEY,
      count: '10',
    });
    // 1. make the request to nasa api
    const { data } = await axios.get(`${BASE_URL}${params}`);
    // 2. respond to this request with data from nasa api
    cachedData = data;
    cacheTime = Date.now();
    data.cacheTime = cacheTime;
    return res.json(data);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
