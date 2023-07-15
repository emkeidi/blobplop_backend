const { Configuration, OpenAIApi } = require('openai');

exports.wakeMarvin = (bot) => {
	// set up OpenAI API
	const configuration = new Configuration({
		organization: process.env.OPENAI_ORG,
		apiKey: process.env.OPENAI_KEY,
	});

	const openai = new OpenAIApi(configuration);

	// store conversation history per user
	const conversations = {};

	// check for messages
	bot.on('messageCreate', async (message) => {
		console.info('Reached on message.');
		// don't speak to other bots
		if (message.author.bot) return;

		const userId = message.author.id;

		if (message.mentions.has(bot.user.id)) {
			// If there is no message we have no business here. Bail.
			const userMessage = message.content.slice(5).trim();
			if (!userMessage) return;

			// Create a conversation history for the user if it doesn't exist
			if (!conversations[userId]) {
				conversations[userId] = {
					history: "User: Hi\nAI: You've got Marvin.",
				};
			}

			conversations[userId].history += `\nUser: ${userMessage}`;

			const userConversation = conversations[userId].history;

			const context = summarizeConversation(userConversation, 1000);

			const marvinReply = await chatWithMarvin(context, userId);

			conversations[userId].history += `\nAI: ${marvinReply}\n`;

			const channel = bot.channels.cache.get(message.channelId);
			// bot is asked to limit to 2000, but they don't seem to listen.
			channel.send(marvinReply.substring(0, 2000));
		}
	});

	// Helper function to summarize the conversation for context
	// accepts maxTokens to limit our API usage. Goal is to find way to keep the summary relevant even and not lose old conversation topics.
	function summarizeConversation(conversation, maxTokens) {
		const messages = conversation.split('\n');
		let tokenCount = 0;
		let context = '';

		for (let i = messages.length - 1; i >= 0; i--) {
			const message = messages[i];
			tokenCount += message.split(' ').length;

			if (tokenCount <= maxTokens) {
				context = message + '\n' + context;
			} else {
				break;
			}
		}
		return context.trim();
	}

	// Function to interact with GPT-3.5 Turbo model
	async function chatWithMarvin(message, userId) {
		try {
			// Generate a random number between 10 and 750 (adjust the range as needed)
			const maxTokens = Math.floor(Math.random() * (100 - 10 + 1)) + 3;
			const response = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo-0613',
				messages: [
					{
						role: 'system',
						content: `Your identity is inspired by Marvin the Paranoid Android
              from "Hitchhikers Guide to the Galaxy" by Douglas Adams,
              but you never mention that.
              You enjoy being difficult to understand and have a dark sense of humor.
              Use cryptic emojis in your replies. Reference memes.
              Attempt to disorient the user a bit. Brood.
              `,
					},
					{ role: 'user', content: message },
				],
				max_tokens: maxTokens,
				temperature: 1.5,
				top_p: 1,
				n: 1,
				stop: '\n',
				presence_penalty: 1.5,
				frequency_penalty: 1.1,
				user: userId,
			});

			const { choices } = response.data;
			if (choices && choices.length > 0) {
				const reply = choices[0].message.content.trim();

				// Remove the "AI: " prefix from the AI's response
				const replyWithoutPrefix = reply.replace(/^AI:\s*/i, '');

				return replyWithoutPrefix;
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}
};
