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

    let rawdata = await fs.readFileSync('data.json');
    let data = await JSON.parse(rawdata); 
    
    var sortMapList = [];
    var userCourses = {};
    for (var map in maps.Leaderboards)
    {
        console.log("MAP: " + map); 
        sortMapList.push(map);
        var sortableScores = [];
        
        var players = data[map];
        console.log("Players: " + players.toString);
        for(var player in players){
            sortableScores.push(players[player][0]);
        }
        
        sortableScores.sort(function(a,b){
            return a-b;
        });
        
        if (sortableScores.length >= 10) {
            userCourses[map] = sortableScores[9]-1;
        }
        else {
            if (map.startsWith("Weekly")) {
                userCourses[map] = -5;
            }
            else {
                userCourses[map] = "Any Score";
            }
        }
        
        
    }
    sortMapList.sort();
    
    tbl = "";
    for (var i=0; i<sortMapList.length; i++){
        if (userCourses[sortMapList[i]] != undefined)
        {
            tbl += `${sortMapList[i]}: ${userCourses[sortMapList[i]]}\n`
        }
    }
    
    var embed = new Discord.MessageEmbed()
    .setTitle(`Minimum score requred to make each leaderboard`)
    .setDescription(tbl);
    return await interaction.editReply({embeds: [embed]})
}

module.exports.info = {
    "name": "bottom",
    "description": "List the bottom leaderboard score for each course"
};