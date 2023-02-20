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
    
    let rawdata = await fs.readFileSync('data.json');
    let data = await JSON.parse(rawdata); 
    
    var userList = [];
        
    for (var map in data){
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
            if (i>=20){
                break;
            }
            console.log("SORTABLE: " + sortable[i].toString());
            if (!userList.includes(sortable[i][0]))
            {
                userList.push(sortable[i][0]);
            }
        }
    }
    
    tbl = "";
    for (var i=0; i<userList.length; i++){
        tbl += `<@${userList[i]}>\n`
    }
    
    if(tbl == ""){
        var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`There does not apear to be any names`);
        return await interaction.editReply({embeds: [embed]})
    }
    else {
        var embed = new Discord.MessageEmbed()
        .setTitle(`List of all players on the current leaderboards`)
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.info = {
    "name": "names",
    "description": "Lists the names of all the players currently in the top 20 lists."
};