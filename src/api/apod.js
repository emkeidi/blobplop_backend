const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  // 1. make the request to nasa api
  // 2. respond to this request with data from nasa api

  res.json({
    message: 'here are some pics of space!'
  });
});

module.exports = router;
