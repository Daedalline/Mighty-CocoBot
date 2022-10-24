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
    if(interaction.channel.id != config.CourseDailyChannelID){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();
    
    let rawdata = await fs.readFileSync('daily_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    var finalStandings = {
        "Current Season": { 
            "Best Shot From the Tee": {},
            "Best Shot From Another Tee": {},
            "Completion Awards": {}
        }
    };
    
    var embed = new Discord.MessageEmbed()
    .setTitle("Daily Challenge Standings")
    .setDescription("Testing in progress");
    return await interaction.editReply({embeds: [embed]})
}
    
module.exports.info = {
    "name": "daily-challenge-standings",
    "description": "List the top ten Daily Challenge standings"
};
    