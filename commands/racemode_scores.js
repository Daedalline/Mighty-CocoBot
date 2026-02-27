/*
 * ====================NOTE====================
 *    This code was created by Daedalline,
 *   please don't claim this as your own work
 *        https://github.com
 * ============================================
 */

const Discord = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require("fs");
const yaml = require('js-yaml');

module.exports.run = async(interaction, config, maps, client) => {

    var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
    var member = await guild.members.cache.find(user => user.id == interaction.member.id)

    if(!member.permissions.has("MANAGE_MESSAGES")){
        await interaction.reply({ephemeral: true, content: "You don't have the permission to do that!" })
        return
    }

    let rawdata = await fs.readFileSync('racemode_data.json');
    let data = await JSON.parse(rawdata); 

    // Read the maps.json to get the current Leaderboards list
    let mapsFileRaw = await fs.readFileSync('maps.json');
    let mapsFileData = await JSON.parse(mapsFileRaw);
    let leaderboardList = mapsFileData.Leaderboards || [];

    if(interaction.options.getSubcommand() == "submit_time"){

        var userID = interaction.options.getUser('user').id;
        var map = interaction.options.getString('map');
        var time = interaction.options.getString('total_time');
    
        const isAlreadyWeekly = map.startsWith("Weekly: ") && map.endsWith(" (Race Mode)");
        const weeklyMapName = isAlreadyWeekly ? null : `Weekly: ${map} (Race Mode)`;
    
        let timePattern = /\d{2}:\d{2}\.\d{2}/;
        if (!timePattern.test(time)){
            await interaction.reply({ephemeral: true, content: "Invalid time format. Time must be input as mm:ss.SS."})
            return;
        }

        var totalTime = interaction.options.getString('total_time').split(/:|\./);
        await interaction.deferReply()
    
        var totalMilliseconds = (Number(totalTime[0]) * 60000) + (Number(totalTime[1]) * 1000) + (Number(totalTime[2]) * 10);

        const updateMapData = (mapName) => {
            if(!data[mapName]) data[mapName] = {};
        
            if(data[mapName][userID] == undefined || totalMilliseconds < data[mapName][userID][0]) {
                data[mapName][userID] = [totalMilliseconds, new Date().toJSON()]
                return true; 
            }
            return false;
        }

        let updatedBoards = [];

        // 1. Update the base map selected in the command
        if (updateMapData(map)) {
            updatedBoards.push(`• ${map}`);
        }
    
        // 2. Only update the Weekly board if the formatted name exists in the Leaderboards array
        if (weeklyMapName !== null && leaderboardList.includes(weeklyMapName)) {
            if (updateMapData(weeklyMapName)) {
                updatedBoards.push(`• ${weeklyMapName}`);
            }
        }

        if(updatedBoards.length === 0) {
            var embed = new Discord.MessageEmbed()
                .setTitle("No Time Recorded")
                .setDescription(`The submitted time is greater than the existing time that this user is already on the Leaderboard with.`);
            return await interaction.editReply({embeds: [embed]})
        }
        
        var writedata = JSON.stringify(data, null, "\t");
        await fs.writeFileSync('./racemode_data.json', writedata);
    
        var date = new Date(null);
        date.setMilliseconds(totalMilliseconds);
        var timeString = date.toISOString().slice(14, 22);
    
        var embed = new Discord.MessageEmbed()
            .setTitle("Time Recorded")
            .setDescription(`Recorded **${timeString}** for <@${userID}>!\n\n**Boards Updated:**\n${updatedBoards.join("\n")}`);
        
        return await interaction.editReply({embeds: [embed]})
    }

    if(interaction.options.getSubcommand() == "remove"){
        var userID = interaction.options.getUser('user').id
        var map = interaction.options.getString('map')

        await interaction.deferReply()

        if(!data[map]){
            data[map] = {}
        }

        if(data[map][userID]){
            delete data[map][userID]
            var writedata = JSON.stringify(data, null, "\t");
            await fs.writeFileSync('./racemode_data.json', writedata);
        
            var embed = new Discord.MessageEmbed()
            .setTitle("Score Removed")
            .setDescription(`Removed a score for <@${userID}> from **${map}**`);
            return await interaction.editReply({embeds: [embed]})
        }else{
            var embed = new Discord.MessageEmbed()
            .setTitle("Data Not Found")
            .setDescription(`<@${userID}> does not apear have a score on **${map}**`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
};
