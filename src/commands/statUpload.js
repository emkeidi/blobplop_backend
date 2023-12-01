const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');
const fetch = require('node-fetch');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('upmcstat')
		.setDescription('Upload a player JSON file.')
		.addAttachmentOption((option) =>
			option.setName('jsonfile').setDescription('Upload a JSON file').setRequired(true),
		),
	async execute(interaction) {
		try {
			const attachment = interaction.options.getAttachment('jsonfile');

			if (!attachment.name || !attachment.name.endsWith('.json')) {
				return interaction.reply('Please upload a valid JSON file.');
			}

			const fileName = attachment.name;
			console.log('Incoming file: ' + fileName);

			// checking for UUID format to match the file name
			// this is how we will retrieve the stats later
			// also how we can get the player's avatar and username with https://playerdb.co/
			const match = fileName.match(
				/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
			);
			const playerUUID = match ? match[1] : null;

			if (!playerUUID) {
				return interaction.reply('Player UUID not found in the filename.');
			}

			const newData = await fetch(attachment.url);
			const newDataJson = await newData.json();
			console.log('new data json has been obtained.');
			const createdStat = await db.addStatsFromFile(newDataJson, playerUUID);
			console.log(`fresh player obj for ID: ${createdStat.user_id}`);

			// TODO make reply into a nice embed including the player's avatar and username
			interaction.reply(`Stats added for user with ID ${playerUUID}`);
		} catch (error) {
			console.error('Error processing file:', error);
			interaction.reply('Error processing the file. Please try again.');
		}
	},
};
