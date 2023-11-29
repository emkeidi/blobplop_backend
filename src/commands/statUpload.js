const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
	data: new SlashCommandBuilder().setName('upmcstat').setDescription('Upload a player JSON file.'),
	async execute(interaction) {
		try {
			// Check if the interaction has an attachment
			if (interaction.options.data.length === 0) {
				return interaction.reply('Please attach a JSON file.');
			}

			const attachment = interaction.options.data[0];

			// Download the attachment
			const file = await attachment.value();

			// Parse the JSON data
			const newData = JSON.parse(file);

			// Store the JSON data in the database
			const createdStat = await db.addStatsFromFile(newData);

			interaction.reply(`Stats added for user with ID ${createdStat.user_id}`);
		} catch (error) {
			console.error('Error processing file:', error);
			interaction.reply('Error processing the file. Please try again.');
		}
	},
};
