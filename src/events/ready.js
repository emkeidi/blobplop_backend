const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Marvin is online and ready to shine. Logged in as ${client.user.tag}`);
	},
};
