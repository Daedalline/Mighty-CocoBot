/*
 * ====================NOTE====================
 *    This code was created by LostAndDead,
 *   please don't claim this as your own work
 *        https://github.com/LostAndDead
 *           Modified by Daedalline
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

    let rawdata = await fs.readFileSync('data.json');
    let data = await JSON.parse(rawdata); 

    if(interaction.options.getSubcommand() == "submit"){

        var userID = interaction.options.getUser('user').id
        var amount = interaction.options.getInteger('score')
        var map = interaction.options.getString('map')

        if(amount > 999 || amount < -999){
            await interaction.reply({ephemeral: true, content: "Come on... Im not that stupid. Try a more realistic number"})
            return;
        }

        await interaction.deferReply()
        
        if(!data[map]){
            data[map] = {}
        }
        
        if(data[map][userID] != undefined)
        {
            if(data[map][userID][0] <= amount)
            {
                await interaction.reply({ephemeral: true, content: "This score is higher than the existing score of " + data[map][userID][0]})
                return;
            }
        }

        data[map][userID] = [amount, new Date().toJSON()]
        var writedata = JSON.stringify(data, null, "\t");
        await fs.writeFileSync('./data.json', writedata);
        
        var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Recorded a score of **${amount}** for <@${userID}> on **${map}**`);
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
            await fs.writeFileSync('./data.json', writedata);
        
            var embed = new Discord.MessageEmbed()
            .setTitle("Score Removed")
            .setDescription(`Removed a score for <@${userID}> from **${map}**`);
            return await interaction.editReply({embeds: [embed]})
        }else{
            var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`<@${userID}> does not apear have a score on **${map}**`);
            return await interaction.editReply({embeds: [embed]})
        }
    }
};

module.exports.autocomplete = async (interaction, Maps) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'map': {
            Maps.Leaderboards.forEach(map => {
                if(map.toLowerCase().includes(value.value.toLowerCase()) || value == ""){
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
    "name": "scores",
    "description": "Allows moderators to manage scores on the boards",
    "options": [
        {
            "name": "submit",
            "description": "Submit a users score to a map.",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                },
                {
                    "name": "score",
                    "description": "The score they achieved",
                    "type": 4,
                    "required": true
                },
                {
                    "name": "map",
                    "description": "The map they got it on",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                }
            ]
        },
        {
            "name": "remove",
            "description": "Remove a users score from a map",
            "type": 1,
            "options": [
                {
                    "name": "user",
                    "description": "The user to submit for",
                    "type": 6,
                    "required": true
                },
                {
                    "name": "map",
                    "description": "The map to remove it from",
                    "type": 3,
                    "autocomplete": true,
                    "required": true
                }
            ]
        }
    ]
};
