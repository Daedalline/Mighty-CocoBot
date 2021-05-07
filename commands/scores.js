/*
 * ====================NOTE====================
 *    This code was created by LostAndDead,
 *   please don't claim this as your own work
 *        https://github.com/LostAndDead
 * ============================================
 */

const Discord = require("discord.js");
const utils = require("../utils")
const fs = require("fs");
const yaml = require('js-yaml');

let Config = null;

try {
    let fileContents = fs.readFileSync('./config.yml', 'utf8');
    Config = yaml.load(fileContents);
}
catch (e) {
    console.log(e);
}

module.exports.run = async(bot, interaction, args) => {

    var guild = await bot.guilds.cache.find(guild => guild.id == interaction.guild_id)
    var member = await guild.members.cache.find(user => user.id == interaction.member.user.id)

    if(!member.hasPermission("MANAGE_MESSAGES")){
        await utils.error(bot, interaction, "You do not have permission to manage scores")
        return
    }

    var data = await utils.loadData()

    if(args[0].name == "submit"){

        var userID = args[0].options[0].value
        var ammount = args[0].options[1].value
        var map = args[0].options[2].value

        if(ammount > 999 || ammount < -999){
            await utils.error(bot, interaction, "Come on... Im not that stupid. Try a more realistic number")
            return;
        }

        await utils.setLoading(bot, interaction)

        if(!data[map]){
            data[map] = {}
        }

        data[map][userID] = ammount
        await utils.saveData(data)

        var mapName = await utils.findMapname(map)
        
        var embed = new Discord.MessageEmbed()
        .setTitle("Score Recorded")
        .setDescription(`Recorded a score of **${ammount}** for <@${userID}> on **${mapName}**`);
        return await utils.respondLoadingEmbed(bot, interaction, embed)
    }
    
    if(args[0].name == "remove"){

        var userID = args[0].options[0].value
        var map = args[0].options[1].value

        await utils.setLoading(bot, interaction)

        if(!data[map]){
            data[map] = {}
        }

        if(data[map][userID]){
            delete data[map][userID]
            await utils.saveData(data)

            var mapName = await utils.findMapname(map)
        
            var embed = new Discord.MessageEmbed()
            .setTitle("Score Removed")
            .setDescription(`Removed a score for <@${userID}> from **${mapName}**`);
            return await utils.respondLoadingEmbed(bot, interaction, embed)
        }else{
            var mapName = await utils.findMapname(map)

            var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`<@${userID}> does not apear have a score on **${mapName}**`);
            return await utils.respondLoadingEmbed(bot, interaction, embed)
        }
    }
};

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
                    "choices": utils.maps,
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
                    "choices": utils.maps,
                    "required": true
                }
            ]
        }
    ]
};
