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
	
	console.log(player_data);
	
    if(typeof player_data == 'undefined') {
        var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`There does not apear to be any challenge statistics for **<@${userID}>**`);
        return await interaction.editReply({embeds: [embed]})
    }
    else {
		tbl = "";  
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