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

    let rawdata = await fs.readFileSync('speedrun_data.json');
    let data = await JSON.parse(rawdata); 
    
    var sortMapList = [];
    var userCourses = {};
    for (var i=0;i<maps.Leaderboards.length;i++)
    {
        var map = maps.Leaderboards[i];
        if (!map.startsWith("Weekly")) {
            sortMapList.push(map);
            var sortableScores = [];
        
            var players = data[map];
            for(var player in players){
                sortableScores.push([players[player][0], players[player][1]]);
            }
        
            sortableScores.sort(function(a,b){
                if (a[0] == b[0]) {
                    return a[1]-b[1];
                }
                else {
                    return a[0]-b[0];
                }
            });
        
            if (sortableScores.length >= 20) {
                var date = new Date(null);
                date.setSeconds(sortableScores[19][0] - 1);
                var timeString = date.toISOString().slice(11, 19);
                userCourses[map] = timeString;
            }
            else {
                userCourses[map] = "Any Time";
            }
        }
    }
    sortMapList.sort();
    
    tbl = "";
    for (var i=0; i<sortMapList.length; i++){
        var courseName = sortMapList[i];
        if (userCourses[courseName] != undefined)
        {
            tbl += `${courseName}: ${userCourses[courseName]}\n`
        }
    }
    
    var embed = new Discord.MessageEmbed()
    .setTitle(`Time to beat to make each speedrun leaderboard`)
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
}

module.exports.info = {
    "name": "speedrun_bottom",
    "description": "List the bottom speedrun leaderboard score for each course"
};