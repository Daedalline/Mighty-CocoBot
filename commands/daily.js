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
    
    var userID = interaction.options.getUser('user').id
	var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
	var member = await guild.members.cache.find(user => user.id == interaction.member.id)
	
    if(!member.permissions.has("MANAGE_MESSAGES")){
        await interaction.reply({ephemeral: true, content: "You don't have the permission to do that!" })
        return
    }
	
   
    let rawdata = await fs.readFileSync('challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
	
	if(interaction.options.getSubcommand() == "add"){
		var userID = interaction.options.getUser('user').id
        var stat = interaction.options.getString('stat')
		
		await interaction.deferReply();
		
		if(!challenge_data[user]){
            challenge_data[user] = {}
        }
		
		var writedata = JSON.stringify(challenge_data, null, "\t");
        await fs.writeFileSync('./challenge_data.json', writedata);
			
		var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Incremented **${stat}** for <@${userID}>`);
        return await interaction.editReply({embeds: [embed]})
	}
}

module.exports.info = {
    "name": "daily",
    "description": "Allows moderators to manage daily challenge stats on the boards",
    "options": [
        {
            "name": "add",
            "description": "Increments a user's daily challenge stats by one.",
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
						}
					]
                }
            ]
        },
		{
            "name": "clear_monthly",
            "description": "Removes all 'monthly' statistics for every user",
            "type": 1
		}
    ]
};