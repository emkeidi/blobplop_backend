const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
	data: new SlashCommandBuilder().setName('ron').setDescription('Ron Swanson weighs in.'),
	async execute(interaction) {
		const ronResponse = await axios.get('https://ron-swanson-quotes.herokuapp.com/v2/quotes');
		const ronResponseJson = JSON.stringify(ronResponse.data[0]);
		interaction.reply(`${ronResponseJson} - Ron`);
	},
};
