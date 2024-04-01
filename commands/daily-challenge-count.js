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
    await interaction.deferReply();
    
    let rawdata = await fs.readFileSync('daily_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    var finalStandings = {
        "Current Season": {}
    };
    
    var sortable = [];
    for (var player in challenge_data) {
        var totalScore = challenge_data[player]["Current Season"]["Coolest Shot From the Tee"] + challenge_data[player]["Current Season"]["Coolest Shot From Another Tee"] + challenge_data[player]["Current Season"]["Completion Awards"] + challenge_data[player]["Current Season"]["Participation Awards"] + challenge_data[player]["Current Season 9-Hole"]["Target Score Achieved"] + challenge_data[player]["Current Season 9-Hole"]["Target Score and Time Achieved"] + challenge_data[player]["Current Season 9-Hole"]["Top Score"];
        if (totalScore > 0) {
            sortable.push([player, totalScore]);
        }
    }
    
    sortable.sort(function(a,b){
        return b[1] - a[1];
    });
    
    var tbl = "__Current Season Medals:__\n"; 
    var totalMedals = 0;
    var rank = 0;
    var previous_score = 1000;
    for (var i=0;i<sortable.length;i++) {
        if (sortable[i][1] < previous_score)
        {
            rank++;
        }
        previous_score = sortable[i][1];
        tbl += `#${rank}: <@${sortable[i][0]}>   ${sortable[i][1]}\n`;
        totalMedals += sortable[i][1];
    }
    
    tbl += `\n**Total:** ${totalMedals}`;
   
    var embed = new Discord.MessageEmbed()
    .setTitle("Daily Challenge Season Standings")
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
}
    
module.exports.info = {
    "name": "daily-challenge-count",
    "description": "List the Seasonal Daily Challenge standings (including count)"
};
    