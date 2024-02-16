const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const express = require('express');
const { notFound, errorHandler } = require('./middlewares');
const api = require('./api');
const app = express();
const { initializeDiscordBot } = require('./api/initializeDiscordBot');
const { wakeMarvin } = require('./api/marvinBot');

// load environment variables
require('dotenv').config();

// enable if you're behind a reverse proxy (AWS ELB, Nginx)
app.set('trust proxy', 1);

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.json({
		message: '🌈👋🌎🌍🌏🍦🌈',
	});
});

app.use('/api/v1', api);

app.use(notFound);
app.use(errorHandler);

// connect to Discord API. make intents known.
const bot = initializeDiscordBot();

// connect bot to OpenAI
wakeMarvin(bot);

module.exports = app;
