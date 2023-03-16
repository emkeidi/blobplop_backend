const express = require('express');

const emojis = require('./emojis');
const apod = require('./apod');

const router = express.Router();

router.get('/', (req, res) => {
	res.json({
		message: 'API - 👋🌎🌍🌏',
	});
});

router.use('/emojis', emojis);
router.use('/apod', apod);

module.exports = router;
