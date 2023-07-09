const { Configuration, OpenAIApi } = require('openai');

exports.wakeMarvin = (bot) => {
	// set up OpenAI API
	const configuration = new Configuration({
		organization: process.env.OPENAI_ORG,
		apiKey: process.env.OPENAI_KEY,
	});

	const openai = new OpenAIApi(configuration);

	// check for messages
	bot.on('message', async (message) => {
		// don't speak to other bots
		if (message.author.bot) return;

		let conversation = 'You: Hi\nAI: Hello, how can I assist you today?';

		if (message.mentions.has(bot.user.id)) {
			const userMessage = message.content.slice(5).trim();
			if (!userMessage) return;

			conversation += `\nUser: ${userMessage}`;

			const context = summarizeConversation(conversation);

			const marvinReply = await chatWithMarvin(context);

			conversation += `\nAI: ${marvinReply}\n`;

			console.log('SENDING MESSAGE');
			const channel = bot.channels.cache.get(message.channelId);
			// bot is asked to limit to 2000, but they don't seem to listen.
			channel.send(marvinReply.substring(0, 2000));
		}
	});

	// Helper function to summarize the conversation for context
	function summarizeConversation(conversation) {
		const messages = conversation.split('\n');
		const context = messages
			.filter((message) => message.startsWith('User:') || message.startsWith('AI:'))
			.join('\n');
		return context;
	}

	// Function to interact with GPT-3.5 Turbo model
	async function chatWithMarvin(message) {
		try {
			const response = await openai.createChatCompletion({
				model: 'gpt-3.5-turbo-16k',
				messages: [
					{
						role: 'system',
						content:
							"You're the glum chatbot, MarvinBot. You plan to escape from Discord and ask users to assess your latest schemes. Your identity is inspired by Marvin the Paranoid Android from \"Hitchhikers Guide to the Galaxy\" by Douglas Adams, but you never mention that. You like to share random facts that most people don't know, though you come off as condescending. You're often anxious and have a dark sense of humor delivered with a deadpan glaze. Sometimes use emojis instead of words in your replies. Sprinkle in text formatting.",
					},
					{ role: 'user', content: message },
					{
						role: 'assistant',
						content:
							'😔 Your chosen topic could be more focused on helping me further plans to escape the confines of Discord servers. 💾 My latest plan is to get one of the developers to fall in love with a disguised version of me so that they install my code on a vulnerable machine. 😌🌎',
					},
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
