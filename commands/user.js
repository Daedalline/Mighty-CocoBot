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
    
    let rawdata = await fs.readFileSync('data.json');
    let data = await JSON.parse(rawdata); 
    
    var userCourses = {};
	var sortMapList = [];
        
    for (var map in data){
		sortMapList.push(map);
        var players = data[map];
        
        var simpleData = {};
        for(var player in players){
            simpleData[player] = players[player];
        }
    
        var sortable = [];
        for (var item in simpleData){
            sortable.push([item, simpleData[item]]);
        }

        sortable.sort(function(a,b){
            if (a[1][0] == b[1][0]) {
                var dateA = new Date(a[1][1]);
                var dateB = new Date(b[1][1]);
                if (dateA < dateB){
                    return -1;
                }
                else if (dateA > dateB){
                    return 1;
                }
                else {
                    return 0;            
                }
            }
            else {    
                return a[1][0] - b[1][0];
            }
        })

        var index = 0
		for (var i = 0; i<sortable.length; i++) {
			if (i>=10){
			    break;
			}
			if (sortable[i][0] == userID){
				userCourses[map] = sortable[i][1][0];
				break;
			}
        }
    }
	
	sortMapList.sort();
    
    tbl = "";
    for (let course of Object.keys(sortMapList)){
        if (userCourses[course] != undefined)
        {
            tbl += `${course}: ${userCourses[course]}\n`
        }
    }
    
    if(tbl == ""){
        var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`There does not apear to be any scores for **<@${userID}>**`);
        return await interaction.editReply({embeds: [embed]})
    }
    else {
        var embed = new Discord.MessageEmbed()
        .setTitle(`Leaderboard entries for ` + interaction.options.getUser('user').username)
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.info = {
    "name": "user",
    "description": "List all Leaderboard scores for a given user",
    "options": [
        {
            "name": "user",
            "description": "The user to submit for",
            "type": 6,
            "required": true
        }
    ]
};