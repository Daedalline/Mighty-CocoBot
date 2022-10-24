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
    
    if(interaction.channel.id != config.CourseDailyChannelID){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();
    
    let rawdata = await fs.readFileSync('daily_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    var player_data = challenge_data[userID];
    
    if(typeof player_data == 'undefined') {
        var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`There does not apear to be any challenge statistics for **<@${userID}>**`);
        return await interaction.editReply({embeds: [embed]})
    }
    else {
        tbl = "__Current Season Medals:__\n";  
        tbl += "Best Shot From the Tee :medal: - " + player_data["Current Season"]["Best Shot From the Tee"] + " Medals\n";
        tbl += "Best Shot From Another Tee :military_medal: - " + player_data["Current Season"]["Best Shot From Another Tee"] + " Medals\n";
        tbl += "Completion Awards :second_place: - " + player_data["Current Season"]["Completion Awards"] + " Medals\n";
        tbl += "\n"
        tbl += "__Lifetime Medals:__\n"
        tbl += "Best Shot From the Tee :medal: - " + player_data["Lifetime"]["Best Shot From the Tee"] + " Medals\n";
        tbl += "Best Shot From Another Tee :military_medal: - " + player_data["Lifetime"]["Best Shot From Another Tee"] + " Medals\n";
        tbl += "Completion Awards :second_place: - " + player_data["Lifetime"]["Completion Awards"] + " Medals\n";
        tbl += "\n"
        tbl += "__Total Season Wins:__\n";
        tbl += "First Place Finishes :first_place: - " + player_data["Total Season Wins"]["First Place Finishes"] + " Wins\n";
        tbl += "Second Place Finishes :second_place: - " + player_data["Total Season Wins"]["Second Place Finishes"] + " Wins\n";
        tbl += "Third Place Finishes :third_place: - " + player_data["Total Season Wins"]["Third Place Finishes"] + " Wins\n";
        
        var embed = new Discord.MessageEmbed()
        .setTitle(`Daily Challenge statistics for ` + interaction.options.getUser('user').username)
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.info = {
    "name": "daily-challenge",
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