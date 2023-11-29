const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Marvin is online, ready to shine. ${client.user.tag}`);
	},
};
