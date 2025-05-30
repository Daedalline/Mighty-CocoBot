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
const paginationEmbed = require('discordjs-button-pagination')

module.exports.run = async(interaction, config, maps, client) => {
    
    var userID = interaction.options.getUser('user').id
    var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
    var member = await guild.members.cache.find(user => user.id == interaction.member.id)
        
    if(interaction.channel.id != config.CoursesLeageChannelID && !member.permissions.has("MANAGE_MESSAGES")){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();
	
    // Main Leaderboards   
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
        var rank = 0;
        var previous_score = -1000;
        for (var i = 0; i<sortable.length; i++) {
            // Calculate rank
            if (sortable[i][1][0] > previous_score)
            {
                rank++;
            }
            previous_score = sortable[i][1][0];
            if (sortable[i][0] == userID){
                userCourses[map] = [sortable[i][1][0], rank];
                break;
            }
        }
    }
    
    sortMapList.sort();
    
    tblSL = "__**Standard Leaderboards**__\n";
    var noScores = true;
    for (var i=0; i<sortMapList.length; i++){
        if (userCourses[sortMapList[i]] != undefined)
        {
            noScores = false;
            tblSL += `#${userCourses[sortMapList[i]][1
            ]}: ${sortMapList[i]} ${userCourses[sortMapList[i]][0]}\n`
        }
    }
    if (noScores) {
        tblSL += `There does not apear to be any scores for **<@${userID}>**\n`;
    }
	
    // Race Mode leaderboards
    rawdata = await fs.readFileSync('racemode_data.json');
    data = await JSON.parse(rawdata); 
    
    userCourses = {};
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
        var rank = 0;
        var previous_score = -1000;
        for (var i = 0; i<sortable.length; i++) {
            // Calculate rank
            if (sortable[i][1][0] > previous_score)
            {
                rank++;
            }
            previous_score = sortable[i][1][0];
            if (sortable[i][0] == userID){
                userCourses[map] = [sortable[i][1][0], rank];
                break;
            }
        }
    }

    sortMapList.sort();
    
    tblRM = "__**Race Mode Leaderboards**__\n";
    noScores = true;
    for (var i=0; i<sortMapList.length; i++){
        var courseName = sortMapList[i];
        if (userCourses[courseName] != undefined)
        {
            noScores = false;
            var date = new Date(null);
            date.setMilliseconds(userCourses[courseName][0]);
            var timeString = date.toISOString().slice(14, 22);
            tblRM += `#${userCourses[courseName][1]}: ${courseName} ${timeString}\n`
        }
    }
    if (noScores) {
        tblRM += `There does not apear to be any Race Mode scores for **<@${userID}>**`;
    }
    
	if (tblSL.length + tblRM.length < 4090) {
        // Print output
		var embed = new Discord.MessageEmbed()
		.setTitle(`Leaderboard entries for ` + interaction.options.getUser('user').username)
		.setDescription(tblSL + "\n" + tblRM);
		return await interaction.editReply({embeds: [embed]})
	}
	else if (tblSL.length < 4096 && tblRM.length < 4096) {
        // Print output
		var embedSL = new Discord.MessageEmbed()
		.setTitle(`Leaderboard entries for ` + interaction.options.getUser('user').username)
		.setDescription(tblSL);
		var embedRM = new Discord.MessageEmbed()
		.setTitle(`Leaderboard entries for ` + interaction.options.getUser('user').username)
		.setDescription(tblRM);
		
		// Define pagination buttons, etc. Will move this out if needed later
		const button1 = new Discord.MessageButton()
		.setCustomId("previousbtn")
		.setLabel("Previous")
		.setStyle("DANGER");
		const button2 = new Discord.MessageButton()
		.setCustomId("nextbtn")
		.setLabel("Next")
		.setStyle("SUCCESS");
		const timeout = 120000;
		const pages = [embedSL, embedRM];
		const buttonList = [button1, button2];
		
		paginationEmbed(interaction, pages, buttonList, timeout);
	}
	else {
        // Print output
		var embed = new Discord.MessageEmbed()
		.setTitle(`Leaderboard entries for ` + interaction.options.getUser('user').username)
		.setDescription(`Leaderboard entries exceed maximum message size. Please ping Dae.`);
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