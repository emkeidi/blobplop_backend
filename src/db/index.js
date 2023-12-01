const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ######### STAT CRUD ############
// create, read, update, and delete your stats here

async function addStatsFromFile(file, playerUUID) {
	// Parse the JSON data
	// const newData = JSON.parse(file);

	// Store the JSON data in the database along with the player's UUID
	// using 'upsert' to update if the playerUUID already exists, and create if not
	const createdStat = await prisma.mc_stat.upsert({
		where: { user_id: playerUUID },
		update: {
			stats: file,
		},
		create: {
			user_id: playerUUID,
			stats: file,
		},
	});

	await prisma.$disconnect();
	return createdStat;
}

async function getAllStats() {
	const allStats = await prisma.mc_stat.findMany();
	await prisma.$disconnect();
	return allStats;
}

async function getOneStat(userId) {
	const oneStat = await prisma.mc_stat.findUnique({
		where: {
			user_id: userId,
		},
	});
	await prisma.$disconnect();
	return oneStat;
}

async function createStat(newStat) {
	const createdStat = await prisma.mc_stat.create({
		data: newStat,
	});
	await prisma.$disconnect();
	return createdStat;
}

async function updateStat(userId, updatedStat) {
	const updatedUserStat = await prisma.mc_stat.update({
		where: {
			user_id: userId,
		},
		data: updatedStat,
	});
	await prisma.$disconnect();
	return updatedUserStat;
}

async function deleteStat(userId) {
	const deletedStat = await prisma.mc_stat.delete({
		where: {
			user_id: userId,
		},
	});
	await prisma.$disconnect();
	return deletedStat;
}

module.exports = {
	addStatsFromFile,
	getAllStats,
	getOneStat,
	createStat,
	updateStat,
	deleteStat,
};
