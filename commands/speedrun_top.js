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

    let rawdata = await fs.readFileSync('speedrun_data.json');
    let data = await JSON.parse(rawdata); 
    
    var sortMapList = [];
    var userCourses = {};
    
    for (var i=0;i<maps.Maps.length;i++)
    {
        var map = maps.Maps[i];
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
    sortMapList.sort();
    
    console.log(JSON.stringify(userCourses));
    
    tbl = "";
    for (var i=0; i<sortMapList.length; i++){
        var courseName = sortMapList[i];
        if (userCourses[courseName] != undefined)
        {
            var date = new Date(null);
            date.setSeconds(userCourses[courseName][1]);
            var timeString = date.toISOString().slice(11, 19);

            tbl += `${courseName}: ${userCourses[courseName][0]}, ${timeString}\n`;
        }
        else {
            tbl += `${courseName}: No Scores\n`;
        }
    }
    
    var embed = new Discord.MessageEmbed()
    .setTitle(`Top Speedrun Leaderboard Scores`)
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
}

module.exports.info = {
    "name": "speedrun_top",
    "description": "List the top speedrun leaderboard score for each course"
};