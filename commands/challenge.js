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
	
    if(interaction.channel.id != config.CoursesLeageChannelID){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();
    
    let rawdata = await fs.readFileSync('challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
	
	var player_data = challenge_data[userID];
	
    if(typeof player_data == 'undefined') {
        var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`There does not apear to be any challenge statistics for **<@${userID}>**`);
        return await interaction.editReply({embeds: [embed]})
    }
    else {
		tbl = "__Current Season Medals:__";  
		tbl =+ "Best Shot From the Tee :medal: - " + player_data["Current Season"]["Best Shot From the Tee"] + " Medals";
//		Best Shot From Another Tess (🎖️) - 8 Medals
//		Completion Awards (🥈) - 15 Medals

//		Lifetime Medals:
//		Best Shot From the Tee (🏅) - 12 Medals
//		Best Shot From Another Tess (🎖️) - 22 Medals
//		Completion Awards (🥈) - 45 Medals

//		Total Season Wins:
//		First Place Finishes (🥇) - 20 Wins
//		Second Place Finishes (🥈) - 18 Wins
//		Third Place Finishes (🥉) - 12 Wins
		
        var embed = new Discord.MessageEmbed()
        .setTitle(`Challenge statistics for ` + interaction.options.getUser('user').username)
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.info = {
    "name": "challenge",
    "description": "List all Daily Challenge stats for a given user",
    "options": [
        {
            "name": "user",
            "description": "The user to submit for",
            "type": 6,
            "required": true
        }
    ]
};