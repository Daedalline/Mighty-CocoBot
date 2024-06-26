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

    let rawdata = await fs.readFileSync('racemode_data.json');
    let data = await JSON.parse(rawdata); 
    
    var sortMapList = [];
    var userCourses = {};
    
    for (var i=0;i<maps.Leaderboards.length;i++)
    {
        var map = maps.Leaderboards[i];
        if (!(map.startsWith("Weekly") && !map.endsWith("(Race Mode)"))) {
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
        
            userCourses[map] = sortableScores[0];
        }
    }
    sortMapList.sort();
    
    tbl = "";
    for (var i=0; i<sortMapList.length; i++){
        var courseName = sortMapList[i];
        if (userCourses[courseName] != undefined)
        {
            var date = new Date(null);
            date.setMilliseconds(userCourses[courseName][0]);
            var timeString = date.toISOString().slice(14, 22);

            tbl += `${courseName}: ${timeString}\n`;
        }
        else {
            tbl += `${courseName}: No Times\n`;
        }
    }
    
    var embed = new Discord.MessageEmbed()
    .setTitle(`Top Race Mode Leaderboard Times`)
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
}

module.exports.info = {
    "name": "racemode_top",
    "description": "List the top Race Mode leaderboard score for each course"
};