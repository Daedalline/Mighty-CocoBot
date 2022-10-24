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

module.exports.run = async(interaction, config, maps, client) => {
    
	var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
	var member = await guild.members.cache.find(user => user.id == interaction.member.id)
	
    if(!member.permissions.has("MANAGE_MESSAGES")){
        await interaction.reply({ephemeral: true, content: "You don't have the permission to do that!" })
        return
    }
   
    let rawdata = await fs.readFileSync('daily_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
	
	if(interaction.options.getSubcommand() == "add"){
		var userID = interaction.options.getUser('user').id
        var stat = interaction.options.getString('stat')
		
		await interaction.deferReply();
		
		if(!challenge_data[userID]){
            challenge_data[userID] = { 
			"Current Season": {
				"Best Shot From the Tee": 0,
				"Best Shot From Another Tee": 0,
				"Completion Awards": 0
			},
			"Lifetime": {
				"Best Shot From the Tee": 0,
				"Best Shot From Another Tee": 0,
				"Completion Awards": 0
			},
			"Total Season Wins": {
				"First Place Finishes": 0,
				"Second Place Finishes": 0,
				"Third Place Finishes": 0
			}
			}
        }
		
		switch(stat){
			case("Best Shot From the Tee"):
			case("Best Shot From Another Tee"):
			case("Completion Awards"):
				challenge_data[userID]["Current Season"][stat]++;
				challenge_data[userID]["Lifetime"][stat]++;
				break;
			case("First Place Finishes"):
			case("Second Place Finishes"):
			case("Third Place Finishes"):
			    challenge_data[userID]["Total Season Wins"][stat]++;
				break;
			default:
				console.log("Error in stat switch " + stat + ". This should never happen");
		}
		
		var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('./daily_challenge_data.json', writedata);
			
		var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Incremented **${stat}** for <@${userID}>`);
        return await interaction.editReply({embeds: [embed]})
	}
	else if(interaction.options.getSubcommand() == "remove"){
		var userID = interaction.options.getUser('user').id
        var stat = interaction.options.getString('stat')
		
		await interaction.deferReply();
		
		if(!challenge_data[userID]){
			var embed = new Discord.MessageEmbed()
			.setTitle("Database Error")
			.setDescription(`<@${userID}> does not apear have a score for **${stat}**`);
			return await interaction.editReply({embeds: [embed]})
        }
		
		switch(stat){
			case("Best Shot From the Tee"):
			case("Best Shot From Another Tee"):
			case("Completion Awards"):
				if (challenge_data[userID]["Current Season"][stat] == 0 || challenge_data[userID]["Lifetime"][stat] == 0){ 
					var embed = new Discord.MessageEmbed()
					.setTitle("Database Error")
					.setDescription(`<@${userID}> has a score of zero for **${stat}**. Cannot reduce further.`);
					return await interaction.editReply({embeds: [embed]})
				}
				else {
					challenge_data[userID]["Current Season"][stat]--;
					challenge_data[userID]["Lifetime"][stat]--;
				}
				break;
			case("First Place Finishes"):
			case("Second Place Finishes"):
			case("Third Place Finishes"):
				if (challenge_data[userID]["Total Season Wins"][stat] == 0) {
					var embed = new Discord.MessageEmbed()
					.setTitle("Database Error")
					.setDescription(`<@${userID}> has a score of zero for **${stat}**. Cannot reduce further.`);
					return await interaction.editReply({embeds: [embed]})
				}
				else {
					challenge_data[userID]["Total Season Wins"][stat]--;
				}
				break;
			default:
				console.log("Error in stat switch " + stat + ". This should never happen");
		}
		
		var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('./daily_challenge_data.json', writedata);
			
		var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Decremented **${stat}** for <@${userID}>`);
        return await interaction.editReply({embeds: [embed]})
	}
	else if (interaction.options.getSubcommand() == "clear_seasonal") {
		await interaction.deferReply();
		
		for (var userID in challenge_data) {
			challenge_data[userID]["Current Season"]["Best Shot From the Tee"] = 0;
			challenge_data[userID]["Current Season"]["Best Shot From Another Tee"] = 0;
			challenge_data[userID]["Current Season"]["Completion Awards"] = 0;
		}
		
		var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('./daily_challenge_data.json', writedata);
			
		var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Cleared all seasonal daily challenge stats`);
        return await interaction.editReply({embeds: [embed]})
	}
}

module.exports.info = {
    "name": "daily",
    "description": "Allows moderators to manage daily challenge stats on the boards",
    "options": [
        {
            "name": "add",
            "description": "Increments a user's daily challenge stats by one (both seasonal and lifetime).",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                },
                {
                    "name": "stat",
                    "description": "Which statistic to increment",
                    "type": 3,
                    "required": true,
					"choices": [
						{
							"name": "Best Shot From the Tee",
							"value": "Best Shot From the Tee"
						},
						{
							"name": "Best Shot From Another Tee",
							"value": "Best Shot From Another Tee"
						},
						{
							"name": "Completion Awards",
							"value": "Completion Awards"
						},
						{
							"name": "First Place Finishes",
							"value": "First Place Finishes"
						},
						{
							"name": "Second Place Finishes",
							"value": "Second Place Finishes"
						},
						{
							"name": "Third Place Finishes",
							"value": "Third Place Finishes"
						}
					]
                }
            ]
        },
		{
            "name": "remove",
            "description": "Decrements a user's daily challenge stats by one (both seasonal and lifetime).",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                },
                {
                    "name": "stat",
                    "description": "Which statistic to increment",
                    "type": 3,
                    "required": true,
					"choices": [
						{
							"name": "Best Shot From the Tee",
							"value": "Best Shot From the Tee"
						},
						{
							"name": "Best Shot From Another Tee",
							"value": "Best Shot From Another Tee"
						},
						{
							"name": "Completion Awards",
							"value": "Completion Awards"
						},
						{
							"name": "First Place Finishes",
							"value": "First Place Finishes"
						},
						{
							"name": "Second Place Finishes",
							"value": "Second Place Finishes"
						},
						{
							"name": "Third Place Finishes",
							"value": "Third Place Finishes"
						}
					]
                }
            ]
        },
		{
            "name": "clear_seasonal",
            "description": "Removes all seasonal daily challenge statistics for every user",
            "type": 1
		}
    ]
};