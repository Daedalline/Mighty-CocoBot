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
    if(interaction.channel.id != config.CoursesLeageChannelID){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();
    
    let rawdata = await fs.readFileSync('weekly_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    var finalStandings = {
        "Current Season": {}
    };
    
    var sortable = [];
    for (var player in challenge_data) {
        var totalScore = challenge_data[player]["Current Season"]["Points"];
        if (totalScore > 0) {
            sortable.push([player, totalScore]);
        }
    }
    
    sortable.sort(function(a,b){
        return b[1] - a[1];
    });
    
    var tbl = "__Current Season Points:__\n"; 
    for (var i=0;i<sortable.length;i++) {
        tbl += `<@${sortable[i][0]}>: ${sortable[i][1]}\n`;
    }
   
    var embed = new Discord.MessageEmbed()
    .setTitle("Weekly Challenge Season Standings")
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
}
    
module.exports.info = {
    "name": "weekly-challenge-standings",
    "description": "List the Seasonal Weekly Challenge standings"
};
    