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
const yaml = require('js-yaml');

module.exports.run = async(interaction, config, maps, client) => {

    var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
    var member = await guild.members.cache.find(user => user.id == interaction.member.id)

    if(!member.permissions.has("MANAGE_MESSAGES")){
        await interaction.reply({ephemeral: true, content: "You don't have the permission to do that!" })
        return
    }

    if(interaction.options.getSubcommand() == "clear_scores"){
        // Removes all scores for the given map in the Standard Leaderboard, saving a backup of the most recent removal
        
        let rawdata = await fs.readFileSync('data.json');
        let data = await JSON.parse(rawdata); 

        var map = interaction.options.getString('map');

        await interaction.deferReply()

        if(data[map] == undefined){
            // No scores exist for this course
            data[map] = {}
            
            var embed = new Discord.MessageEmbed()
            .setTitle("Data Not Found")
            .setDescription(`No scores for **${map}**.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            // Save a backup
            let backupdata = '{ "' + map + '" : ' + JSON.stringify(data[map], null, "\t") + '}';
            await fs.writeFileSync('./data_map_backup.json', backupdata);

            // Delete the data and save
            delete data[map];
            var writedata = JSON.stringify(data, null, "\t");
            await fs.writeFileSync('./data.json', writedata);

            var embed = new Discord.MessageEmbed()
            .setTitle("Scores Removed")
            .setDescription(`Removed all scores for **${map}**.`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
    else if(interaction.options.getSubcommand() == "clear_racemode_scores"){
        // Removes all scores for the given map in the Race Mode Leaderboard, saving a backup of the most recent removal
        
        let rawdata = await fs.readFileSync('racemode_data.json');
        let data = await JSON.parse(rawdata); 

        var map = interaction.options.getString('rm_map');

        await interaction.deferReply()

        if(data[map] == undefined){
            // No scores exist for this course
            data[map] = {}
            
            var embed = new Discord.MessageEmbed()
            .setTitle("Data Not Found")
            .setDescription(`No scores for **${map}**.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            // Save a backup
            let backupdata = '{ "' + map + '" : ' + JSON.stringify(data[map], null, "\t") + '}';
            await fs.writeFileSync('./racemode_data_map_backup.json', backupdata);

            // Delete the data and save
            delete data[map];
            var writedata = JSON.stringify(data, null, "\t");
            await fs.writeFileSync('./racemode_data.json', writedata);

            var embed = new Discord.MessageEmbed()
            .setTitle("Scores Removed")
            .setDescription(`Removed all scores for **${map}**.`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
    else if(interaction.options.getSubcommand() == "restore_clear"){
        // Restores the scores for the last clear_scores command
        let rawdata = await fs.readFileSync('data.json');
        let data = await JSON.parse(rawdata); 
        let rawdata2 = await fs.readFileSync('data_map_backup.json');
        let backupdata = JSON.parse(rawdata2);        

        await interaction.deferReply();

        let map = Object.keys(backupdata)[0];
        if(data[map]){
            // There are already new scores submitted for this map - don't overwrite
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`There are already scores saved for **${map}**. Cancelling restore.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            // Write the backup back to the scores, save, and output message
            data[map] = backupdata[map];
            var writedata = JSON.stringify(data, null, "\t");
            await fs.writeFileSync('./data.json', writedata);
            var embed = new Discord.MessageEmbed()
            .setTitle("Scores Restored")
            .setDescription(`Restoring backed up data to **${map}**.`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
    else if(interaction.options.getSubcommand() == "restore_racemode_clear"){
        // Restores the scores for the last clear_scores command
        let rawdata = await fs.readFileSync('racemode_data.json');
        let data = await JSON.parse(rawdata); 
        let rawdata2 = await fs.readFileSync('racemode_data_map_backup.json');
        let backupdata = JSON.parse(rawdata2);        

        await interaction.deferReply();

        let map = Object.keys(backupdata)[0];
        if(data[map]){
            // There are already new scores submitted for this map - don't overwrite
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`There are already scores saved for **${map}**. Cancelling restore.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            // Write the backup back to the scores, save, and output message
            data[map] = backupdata[map];
            var writedata = JSON.stringify(data, null, "\t");
            await fs.writeFileSync('./racemode_data.json', writedata);
            var embed = new Discord.MessageEmbed()
            .setTitle("Scores Restored")
            .setDescription(`Restoring backed up data to **${map}**.`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
    else if(interaction.options.getSubcommand() == "create_course"){
        // Create a new course, for both leaderboard and find-a-game, or just for the leaderboard only
        var map = interaction.options.getString('map');
        var leaderboardOnly = interaction.options.getBoolean('leaderboard_only');
        
        await interaction.deferReply();

        if(maps.Leaderboards.includes(map)){
            // Map already exists. Putput error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Invalid Command")
            .setDescription(`**${map}** already exists.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            // Add to the leaderboard
            maps.Leaderboards.push(map);
            
            if (leaderboardOnly){
                // Save the data and output message
                var newmapdata = JSON.stringify(maps, null, "\t");
                await fs.writeFileSync('./maps.json', newmapdata);

                var embed = new Discord.MessageEmbed()
                .setTitle("Course Created")
                .setDescription(`**${map}** created (Leaderboard Only).`);
                return await interaction.editReply({embeds: [embed]})
            }
            else {
                // Add to the course list for find-a-game
                maps.Maps.push(map);
                
                // Save teh data and output message
                var newmapdata = JSON.stringify(maps, null, "\t");
                await fs.writeFileSync('./maps.json', newmapdata);

                var embed = new Discord.MessageEmbed()
                .setTitle("Course Created")
                .setDescription(`**${map}** created.`);
                return await interaction.editReply({embeds: [embed]})
            }
        }
    }
    else if(interaction.options.getSubcommand() == "delete_course"){
        var map = interaction.options.getString('all_map');
        
        await interaction.deferReply();
        
        // Delete the data and save
        if (maps.Maps.includes(map)) {
            maps.Maps.splice(maps.Maps.indexOf(map), 1);
        }
        if (maps.Leaderboards.includes(map)) {
            maps.Leaderboards.splice(maps.Leaderboards.indexOf(map), 1);
        }
        
        var writedata = JSON.stringify(maps, null, "\t");
        await fs.writeFileSync('./maps.json', writedata);

        var embed = new Discord.MessageEmbed()
        .setTitle("Course Removed")
        .setDescription(`Removed **${map}**.`);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "add_feature"){
        // Adds a new featured couse
        var map = interaction.options.getString('map');
        await interaction.deferReply();
        
        maps.FeatureMap = map;
        var writedata = JSON.stringify(maps, null, "\t");
        await fs.writeFileSync('./maps.json', writedata);

        var embed = new Discord.MessageEmbed()
        .setTitle("Feature Added")
        .setDescription(`Added featured map **${map}**.`);
        return await interaction.editReply({embeds: [embed]})
    }
    else if(interaction.options.getSubcommand() == "remove_feature"){
        // Removes the feature course
        await interaction.deferReply();
        
        maps.FeatureMap = "";
        var writedata = JSON.stringify(maps, null, "\t");
        await fs.writeFileSync('./maps.json', writedata);

        var embed = new Discord.MessageEmbed()
        .setTitle("Feature Removed")
        .setDescription(`Removed featured map.`);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.autocomplete = async (interaction, Maps) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'map': {
            Maps.Leaderboards.forEach(map => {
                if((map.toLowerCase().includes(value.value.toLowerCase()) || value == "") && !map.endsWith("(Race Mode)")){
                    res.push({
                        name: map,
                        value: map
                    })
                }
            })
            break;
        }
        case 'rm_map': {
            Maps.Leaderboards.forEach(map => {
                if((map.toLowerCase().includes(value.value.toLowerCase()) || value == "") && !(map.startsWith("Weekly") && !map.endsWith("(Race Mode)"))){
                    res.push({
                        name: map,
                        value: map
                    })
                }
            })
            break;
        }
        case 'all_map': {
            Maps.Leaderboards.forEach(map => {
                if((map.toLowerCase().includes(value.value.toLowerCase()) || value == "")){
                    res.push({
                        name: map,
                        value: map
                    })
                }
            })
            break;
        }
    }
    interaction.respond(res.slice(0,25))
}

module.exports.info = {
    "name": "maint",
    "description": "Allows moderators to clear scores, or dynamically create or remove a map",
    "options": [
        {
            "name": "clear_scores",
            "description": "Removes all scores for the given map in the Standard Leaderboard",
            "type": 1,
            "options": [
                {
                    "name": "map",
                    "description": "The map to remove the scores from from",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                }
            ]
        },
        {
            "name": "clear_racemode_scores",
            "description": "Removes all scores for the given map in the Race Mode Leaderboard",
            "type": 1,
            "options": [
                {
                    "name": "rm_map",
                    "description": "The map to remove the scores from from",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                }
            ]
        },
        {
            "name": "restore_clear",
            "description": "Reverts the most recent clear_scores command",
            "type": 1
        },
        {
            "name": "restore_racemode_clear",
            "description": "Reverts the most recent clear_racemode_scores command",
            "type": 1
        },
        {
            "name": "create_course",
            "description": "Adds a new couse",
            "type": 1,
            "options": [
                {
                    "name": "map",
                    "description": "Name of the new course",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "leaderboard_only",
                    "description": "Only add to Leaderboards",
                    "type": 5,
                    "required": true
                }
            ]
        },
        {
            "name": "delete_course",
            "description": "Deletes a course",
            "type": 1,
            "options": [
                {
                    "name": "all_map",
                    "description": "The course to remove",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                }
            ]
        },
        {
            "name": "add_feature",
            "description": "Adds a new featured couse",
            "type": 1,
            "options": [
                {
                    "name": "map",
                    "description": "Name of the new course (do not include easy/hard in the course name)",
                    "type": 3,
                    "required": true
                }
            ]
        },
        {
            "name": "remove_feature",
            "description": "Removes the feature course",
            "type": 1,
            "options": []
        }
    ]
};
