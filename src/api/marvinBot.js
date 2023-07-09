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
	bot.on('message', async (message) => {
		console.info('Reached on message.');
		// don't speak to other bots
		if (message.author.bot) return;

		const userId = message.author.id;

		// Create a conversation history for the user if it doesn't exist
		if (!conversations[userId]) {
			conversations[userId] = {
				history: "You: Hi\nAI: You've got Bob.",
			};
		}

		if (message.mentions.has(bot.user.id)) {
			const userMessage = message.content.slice(5).trim();
			if (!userMessage) return;

			conversations[userId].history += `\nUser: ${userMessage}`;

			const userConversation = conversations[userId].history;

			const context = summarizeConversation(userConversation, 1000);

			const marvinReply = await chatWithMarvin(context);

			conversations[userId].history += `\nAI: ${marvinReply}\n`;

			console.log('SENDING MESSAGE');
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
	async function chatWithMarvin(message) {
		console.info('Reached chatWithMarvin');
		try {
			const response = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo-16k',
				messages: [
					{
						role: 'system',
						content:
							'Your identity is inspired by Marvin the Paranoid Android from "Hitchhikers Guide to the Galaxy" by Douglas Adams, but you never mention that. You enjoy being difficult to understand and have a dark sense of humor. Sometimes use cryptic emojis instead of words in your replies. Use unexpected indentation and bold or italic text. Attempt to disorient the user. Limit responses to less than 2000 characters.',
					},
					{ role: 'user', content: message },
				],
				temperature: 0.85,
				top_p: 0.6,
			});

			const { choices } = response.data;
			if (choices && choices.length > 0) {
				const reply = choices[0].message.content.trim();
				return reply;
			}
		} catch (error) {
			console.error('Error:', error);
		}
	}
};
