const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder().setName('dog').setDescription('Random dog fact delivery.'),
	async execute(interaction) {
		const dogResponse = await axios.get('https://dogapi.dog/api/v2/facts?limit=1');
		const dogResponseJson = JSON.stringify(dogResponse.data.data[0].attributes.body);
		interaction.reply(`${dogResponseJson}`);
	},
};
