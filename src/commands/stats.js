const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mcstats')
		.setDescription('Enter player name to see their Minecraft stats.')
		.addStringOption((option) =>
			option
				.setName('player')
				.setDescription('Player to look up')
				.setAutocomplete(true)
				.setRequired(true),
		),
	async execute(interaction) {
		// retrieve player based on user input
		const player = interaction.options.getString('player');
		const playerResponse = await fetch(`https://playerdb.co/api/player/minecraft/${player}`, {
			method: 'GET',
			headers: {
				'user-agent': `discordBot by ${process.env.USER_AGENT}`,
			},
		});
		const playerResponseJson = await playerResponse.json();
		console.log(playerResponseJson.data.player.id);
		console.log(playerResponseJson.data.player.username);

		const playerStatFiles = fs
			.readdirSync(path.join(__dirname, './playerStats'))
			.filter((file) => file.endsWith('.json'));

		let playerStatFileName = '';
		for (const ps of playerStatFiles) {
			const splitFileName = ps.split('.');
			const psUUID = splitFileName[0];
			if (playerResponseJson.data.player.id == psUUID) {
				playerStatFileName = ps;
			}
		}

		// initialize sorted stat arrays
		const minedSorted = [];
		const pickedUpSorted = [];
		const droppedSorted = [];
		const usedSorted = [];
		const craftedSorted = [];
		const brokenSorted = [];
		const killedSorted = [];
		const killedBySorted = [];

		// parse that file, letting Discord handle errors for now...
		const playerFile = JSON.parse(
			fs.readFileSync(path.join(__dirname, `./playerStats/${playerStatFileName}`)),
		);

		for (const key in playerFile.stats['minecraft:killed_by']) {
			killedBySorted.push({ key: key, total: playerFile.stats['minecraft:killed_by'][key] });
		}
		killedBySorted.sort((a, b) => b.total - a.total);
		console.log('Killed By:');
		console.log(killedBySorted.slice(0, 3));

		for (const key in playerFile.stats['minecraft:mined']) {
			minedSorted.push({ key: key, total: playerFile.stats['minecraft:mined'][key] });
		}
		minedSorted.sort((a, b) => b.total - a.total);
		console.log('Mined:');
		console.log(minedSorted.slice(0, 3));

		for (const key in playerFile.stats['minecraft:used']) {
			usedSorted.push({ key: key, total: playerFile.stats['minecraft:used'][key] });
		}
		usedSorted.sort((a, b) => b.total - a.total);
		console.log('Used:');
		console.log(usedSorted.slice(0, 3));

		for (const key in playerFile.stats['minecraft:killed']) {
			killedSorted.push({ key: key, total: playerFile.stats['minecraft:killed'][key] });
		}
		killedSorted.sort((a, b) => b.total - a.total);
		console.log('Killed:');
		console.log(killedSorted.slice(0, 3));

		for (const key in playerFile.stats['minecraft:dropped']) {
			droppedSorted.push({ key: key, total: playerFile.stats['minecraft:dropped'][key] });
		}
		droppedSorted.sort((a, b) => b.total - a.total);
		console.log('Dropped:');
		console.log(droppedSorted.slice(0, 3));

		for (const key in playerFile.stats['minecraft:crafted']) {
			craftedSorted.push({ key: key, total: playerFile.stats['minecraft:crafted'][key] });
		}
		craftedSorted.sort((a, b) => b.total - a.total);
		console.log('Crafted:');
		console.log(craftedSorted.slice(0, 3));

		for (const key in playerFile.stats['minecraft:picked_up']) {
			pickedUpSorted.push({ key: key, total: playerFile.stats['minecraft:picked_up'][key] });
		}
		pickedUpSorted.sort((a, b) => b.total - a.total);
		console.log('Picked Up:');
		console.log(pickedUpSorted.slice(0, 3));

		for (const key in playerFile.stats['minecraft:broken']) {
			brokenSorted.push({ key: key, total: playerFile.stats['minecraft:broken'][key] });
		}
		brokenSorted.sort((a, b) => b.total - a.total);
		console.log('Broken:');
		console.log(brokenSorted.slice(0, 3));

		// capture all of custom stats
		const custom = [];
		for (const key in playerFile.stats['minecraft:custom']) {
			custom.push({ key: key, total: playerFile.stats['minecraft:custom'][key] });
		}
		console.log('Custom:');
		console.log(custom.slice(0, 10));

		// helper function to find
		const findByKey = (key, arr) => arr.find((e) => e.key === key);

		function cleanKey(keyName) {
			const splitKeyName = keyName.split(':');
			const cleanedKey = splitKeyName[1];
			return String(cleanedKey).replace(/_/g, ' ');
		}

		function formatTotal(total) {
			return parseInt(total).toLocaleString('en-US');
		}

		const animalsBred = findByKey('minecraft:animals_bred', custom);
		const fish = findByKey('minecraft:fish_caught', custom);
		const bell = findByKey('minecraft:bell_ring', custom);
		const walk = findByKey('minecraft:walk_one_cm', custom);
		const sprint = findByKey('minecraft:sprint_one_cm', custom);
		const boat = findByKey('minecraft:boat_one_cm', custom);
		const deaths = findByKey('minecraft:deaths', custom);
		const enchant = findByKey('minecraft:enchant_item', custom);
		const mobKills = findByKey('minecraft:mob_kills', custom);
		const damageBlocked = findByKey('minecraft:damage_blocked_by_shield', custom);
		const damageDealt = findByKey('minecraft:damage_dealt', custom);
		const villagerTrades = findByKey('minecraft:traded_with_villager', custom);
		const timeSinceRest = findByKey('minecraft:time_since_rest', custom);
		const timeSinceDeath = findByKey('minecraft:time_since_death', custom);

		// Build embedded reply
		const exampleEmbed = new EmbedBuilder()
			.setColor('DarkGold')
			.setTitle(`${playerResponseJson.data.player.username}'s stats`)
			.setAuthor({
				name: 'MCStatChecker',
				iconURL:
					'https://static.wikia.nocookie.net/minecraft_gamepedia/images/a/ab/Diamond_JE3_BE3.png/revision/latest?cb=20200325185152',
			})
			.setDescription("How's my mining?")
			.setThumbnail(await playerResponseJson.data.player.avatar)
			.addFields(
				{
					name: ':pick: Most Mined',
					value: `${cleanKey(minedSorted[0].key)}: ${formatTotal(minedSorted[0].total)}`,
					inline: true,
				},
				{
					name: ':palm_down_hand: Most Picked Up',
					value: `${cleanKey(pickedUpSorted[0].key)}: ${formatTotal(pickedUpSorted[0].total)}`,
					inline: true,
				},
				{
					name: ':wastebasket: Most Dropped',
					value: `${cleanKey(droppedSorted[0].key)}: ${formatTotal(droppedSorted[0].total)}`,
					inline: true,
				},
				{
					name: ':school_satchel: Most Used',
					value: `${cleanKey(usedSorted[0].key)}: ${formatTotal(usedSorted[0].total)}`,
					inline: true,
				},
				{
					name: ':tools: Most Crafted',
					value: `${cleanKey(craftedSorted[0].key)}: ${formatTotal(craftedSorted[0].total)}`,
					inline: true,
				},
				{
					name: ':broken_heart: Most Broken',
					value: `${cleanKey(brokenSorted[0].key)}: ${formatTotal(brokenSorted[0].total)}`,
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },

				{
					name: ':skull: Most Killed By',
					value: `${cleanKey(killedBySorted[0].key)}: ${formatTotal(killedBySorted[0].total)}`,
					inline: true,
				},
				{
					name: ':crossed_swords: Most Killed',
					value: `${cleanKey(killedSorted[0].key)}: ${formatTotal(killedSorted[0].total)}`,
					inline: true,
				},

				{ name: '\u200B', value: '\u200B' },
				{
					name: ':shield: Damage Blocked',
					value: formatTotal(damageBlocked != undefined ? damageBlocked.total : 0),
					inline: true,
				},
				{
					name: ':boxing_glove: Damage Dealt',
					value: formatTotal(damageDealt != undefined ? damageDealt.total : 0),
					inline: true,
				},
				{
					name: ':handshake: Villager Trades',
					value: formatTotal(villagerTrades != undefined ? villagerTrades.total : 0),
					inline: true,
				},
				{
					name: ':fishing_pole_and_fish: Fish Caught',
					value: formatTotal(fish != undefined ? fish.total : 0),
					inline: true,
				},
				{
					name: ':cow: Animals Bred',
					value: formatTotal(animalsBred != undefined ? animalsBred.total : 0),
					inline: true,
				},
				{
					name: ':bell: Bell Rung',
					value: formatTotal(bell != undefined ? bell.total : 0),
					inline: true,
				},
				{
					name: ':woman_walking: Walk Distance',
					value: formatTotal(walk != undefined ? walk.total / 100 : 0) + ' m',
					inline: true,
				},
				{
					name: ':dash: Sprint Distance',
					value: formatTotal(sprint != undefined ? sprint.total / 100 : 0) + ' m',
					inline: true,
				},
				{
					name: ':person_rowing_boat: Boat Distance',
					value: formatTotal(boat != undefined ? boat.total / 100 : 0) + ' m',
					inline: true,
				},
				{
					name: ':dizzy_face: Deaths',
					value: formatTotal(deaths != undefined ? deaths.total : 0),
					inline: true,
				},
				{
					name: ':coffin: Mob Kills',
					value: formatTotal(mobKills != undefined ? mobKills.total : 0),
					inline: true,
				},
				{
					name: ':gem: Items Enchanted',
					value: formatTotal(enchant != undefined ? enchant.total : 0),
					inline: true,
				},
				{ name: '\u200B', value: '\u200B' },
				{
					name: ':bed: Time Since Sleep',
					value:
						formatTotal(timeSinceRest != undefined ? timeSinceRest.total / 1200 : 0) + ' minutes',
					inline: true,
				},
				{
					name: ':hourglass: Time Since Death',
					value:
						formatTotal(timeSinceDeath != undefined ? timeSinceDeath.total / 1200 : 0) + ' minutes',
					inline: true,
				},
			)
			.setImage(`https://crafthead.net/armor/body/${playerResponseJson.data.player.id}`)
			.setTimestamp()
			.setFooter({
				text: 'helping you die less & mine more',
				iconURL:
					'https://static.wikia.nocookie.net/minecraft_gamepedia/images/a/ab/Diamond_JE3_BE3.png/revision/latest?cb=20200325185152',
			});

		await interaction.reply({ embeds: [exampleEmbed] });
	},
};
