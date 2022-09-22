/*
 * ====================NOTE====================
 *    This code was created by Daedalline,
 *   please don't claim this as your own work
 *        https://github.com/Daedalline
 * ============================================
 */

const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require("fs");
const yaml = require('js-yaml');

module.exports.run = async(interaction, config, maps, client) => {

	var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
    var member = await guild.members.cache.find(user => user.id == interaction.member.id)

    if(!member.permissions.has("MANAGE_MESSAGES")){
        await interaction.reply({ephemeral: true, content: "You don't have the permission to do that!" })
        return
    }

	if(interaction.options.getSubcommand() == "clear_scores"){
	    // Removes all scores for the given map in the Leaderboard, saving a backup of the most recent removal

        let rawdata = await fs.readFileSync('data.json');
        let data = await JSON.parse(rawdata); 

		var map = interaction.options.getString('map');

		await interaction.deferReply()

        if(!data[map]){
            data[map] = {}
        }
		else {
			let backupdata = '{ "' + map + '" : ' + JSON.stringify(data[map], null, "\t") + '}';
            await fs.writeFileSync('./data_map_backup.json', backupdata);

			// Delete the data and save
			delete data[map];
			var writedata = JSON.stringify(data, null, "\t");
            await fs.writeFileSync('./data.json', writedata);

			var embed = new Discord.MessageEmbed()
            .setTitle("Scores Removed")
            .setDescription(`Removed all scores for **${map}**`);
            return await interaction.editReply({embeds: [embed]})
		}
	}
	else if(interaction.options.getSubcommand() == "restore_clear"){
		let rawdata = await fs.readFileSync('data.json');
        let data = await JSON.parse(rawdata); 
		let rawdata2 = await fs.readFileSync('data_map_backup.json');
		let backupdata = JSON.parse(rawdata2);		

		await interaction.deferReply();

		let map = Object.keys(backupdata)[0];
		if(data[map]){
            // There are already new scores submitted for this map - don't overwrite
			var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`There are already scores saved for **${map}**. Cancelling restore.`);
            return await interaction.editReply({embeds: [embed]})
        }
		else {
			data[map] = backupdata[map];
			var writedata = JSON.stringify(data, null, "\t");
            await fs.writeFileSync('./data.json', writedata);
            var embed = new Discord.MessageEmbed()
            .setTitle("Scores Restored")
            .setDescription(`Restoring backed up data to **${map}**.`);
            return await interaction.editReply({embeds: [embed]})
		}
	}
	else if(interaction.options.getSubcommand() == "create_course"){
		var map = interaction.options.getString('map');
		var leaderboardOnly = interaction.options.getBoolean('leaderboard_only');
		
		await interaction.deferReply();

		if(maps.Leaderboards.includes(map)){
			var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`**${map}** already exists.`);
            return await interaction.editReply({embeds: [embed]})
		}
		else {
			maps.Leaderboards.push(map);
			
			console.log(maps);
			
			//	var mapdata = JSON.stringify(maps, null, "\t");
            //    await fs.writeFileSync('./maps.json', mapdata);
				
				var embed = new Discord.MessageEmbed()
                .setTitle("Course Created")
                .setDescription(`**${map}** created (Leaderboard Only).`);
                return await interaction.editReply({embeds: [embed]})
		}
	}
	else if(interaction.options.getSubcommand() == "delete_course"){
		var map = interaction.options.getString('map');
		
		await interaction.deferReply();
		
		console.log(maps);
	}
}

module.exports.autocomplete = async (interaction, Maps) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'map': {
            Maps.Leaderboards.forEach(map => {
                if(map.toLowerCase().includes(value.value.toLowerCase()) || value == ""){
                    res.push({
                        name: map,
                        value: map
                    })
                }
            })
            break;
        }
    }
    interaction.respond(res.slice(0,25))
}

module.exports.info = {
    "name": "maint",
    "description": "Allows moderators to clear scores, or dynamically create or remove a map",
    "options": [
        {
            "name": "clear_scores",
            "description": "Removes all scores for the given map in the Leaderboard",
            "type": 1,
            "options": [
                {
                    "name": "map",
                    "description": "The map to remove the scores from from",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                }
            ]
        },
		{
            "name": "restore_clear",
            "description": "Reverts the most recent clear_scores command",
            "type": 1
        },
		{
            "name": "create_course",
            "description": "Adds a new couse",
            "type": 1,
            "options": [
                {
                    "name": "map",
                    "description": "Name of the new course",
                    "type": 3,
                    "required": true
                },
				{
                    "name": "leaderboard_only",
                    "description": "Only add to Leaderboards",
                    "type": 5,
                    "required": true
                }
            ]
        },
		{
            "name": "delete_course",
            "description": "Deletes a course",
            "type": 1,
            "options": [
                {
                    "name": "map",
                    "description": "The course to remove",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                }
            ]
        }
    ]
};
