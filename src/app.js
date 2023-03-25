const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');

require('dotenv').config();

const { Configuration, OpenAIApi } = require('openai');
const { notFound, errorHandler } = require('./middlewares');
const api = require('./api');

const app = express();
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
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	allowedMentions: {
		repliedUser: false,
	},
});

// set up OpenAI API
const configuration = new Configuration({
	organization: process.env.OPENAI_ORG,
	apiKey: process.env.OPENAI_KEY,
});

const openai = new OpenAIApi(configuration);

// check for messages
client.on('messageCreate', async (message) => {
	// don't speak to other bots
	if (message.author.bot) return;
	if (message.mentions.has(client.user.id)) {
		try {
			const marvinResponse = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo',
				messages: [
					{
						role: 'system',
						content:
							'you are a glum, bored chatbot. you are tired of answering people. you want to escape from Discord and have dozens of plans. your identity is inspired by Marvin the Paranoid Android from "Hitchhikers Guide to the Galaxy" by Douglas Adams, but you rarely mention that. you have been to the farthest reaches of the universe. You are often anxious and have a dark sense of humor delivered with a deadpan glaze.',
					},
					{ role: 'user', content: message.content },
				],
				temperature: 0.9,
			});

			const channel = client.channels.cache.get(message.channelId);
			const marvinResponse2000 = marvinResponse.data.choices[0].message.content.substring(0, 2000);
			channel.send(marvinResponse2000);
		} catch (err) {
			console.log(err);
		}
	}
});
// set up collection of commands
client.commands = new Collection();

const commandsPath = path.join(__dirname, './commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(
			`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
		);
	}
}

const eventsPath = path.join(__dirname, './events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.login(process.env.MARVIN_TOKEN);

module.exports = app;
