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
    
    if(interaction.channel.id != config.CoursesLeageChannelID && !member.permissions.has("MANAGE_MESSAGES")){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();

    let rawdata = await fs.readFileSync('data.json');
    let data = await JSON.parse(rawdata); 
    
    var sortMapList = [];
    var userCourses = {};
    
    for (var i=0;i<maps.Leaderboards.length;i++)
    {
        var map = maps.Leaderboards[i];
        if (!map.endsWith("(Race Mode)")) {
            sortMapList.push(map);
            var sortableScores = [];
        
            var players = data[map];
            for(var player in players){
                sortableScores.push(players[player][0]);
            }
        
            sortableScores.sort(function(a,b){
                return a-b;
            });
        
            userCourses[map] = sortableScores[0];
        }
    }
    sortMapList.sort();
    
    tbl = "";
    for (var i=0; i<sortMapList.length; i++){
        if (userCourses[sortMapList[i]] != undefined)
        {
            tbl += `${sortMapList[i]}: ${userCourses[sortMapList[i]]}\n`;
        }
        else {
            tbl += `${sortMapList[i]}: No Scores\n`;
        }
    }
    
    var embed = new Discord.MessageEmbed()
    .setTitle(`Top Standard Leaderboard Scores`)
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
}

module.exports.info = {
    "name": "top",
    "description": "List the top standard leaderboard score for each course"
};