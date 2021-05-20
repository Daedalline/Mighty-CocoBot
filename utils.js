/*
 * ====================NOTE====================
 *    This code was created by LostAndDead,
 *   please don't claim this as your own work
 *        https://github.com/LostAndDead
 * ============================================
 */

const Discord = require("discord.js");
const fs = require("fs");
const yaml = require('js-yaml');
const { config } = require("process");

module.exports.maps = [
    {
        "name": "Tourist Trap–Easy",
        "value": "tt-e"
    },
    {
        "name": "Tourist Trap–Hard",
        "value": "tt-h"
    },
    {
        "name": "Cherry Blossom-Easy",
        "value": "cb-e"
    },
    {
        "name": "Cherry Blossom–Hard",
        "value": "cb-h"
    },
    {
        "name": "Seagull Stacks-Easy",
        "value": "ss-e"
    },
    {
        "name": "Seagull Stack–Hard",
        "value": "ss-h"
    },
    {
        "name": "Arizona Modern-Easy",
        "value": "am-e"
    },
    {
        "name": "Arizona Modern–Hard",
        "value": "am-h"
    },
    {
        "name": "Original Gothic-Easy",
        "value": "og-e"
    },
    {
        "name": "Original Gothic–Hard",
        "value": "og-h"
    },
    {
        "name": "Tethys Station-Easy",
        "value": "ts-e"
    },
    {
        "name": "Tethys Station–Hard",
        "value": "ts-h"
    },
    {
        "name": "Bogey's Bonanza",
        "value": "bb"
    }
]

module.exports.findMapname = async (short) => {
    var res = "Invalid Map ID"
    this.maps.forEach(element => {
        if(element.value == short){
            res = element.name
        }
    });
    return res
}

let Config = null;

try {
    let fileContents = fs.readFileSync('./config.yml', 'utf8');
    Config = yaml.load(fileContents);
}
catch (e) {
    console.log(e);
}

async function createAPIMessage(bot, interaction, content){
    const apiMessage = await Discord.APIMessage.create(bot.channels.resolve(interaction.channel_id), content)
        .resolveData()
        .resolveFiles();

    return {...apiMessage.data, files: apiMessage.files};
}

module.exports.loadData = async() => {
    let rawdata = fs.readFileSync('data.json');
    let data = JSON.parse(rawdata); 
    return data
}

module.exports.saveData = async(data) => {
    writedata = JSON.stringify(data, null, "\t");
    fs.writeFileSync('data.json', writedata);
}

module.exports.sendEmbed = async (bot, interaction, embed) =>{

    let apiMessage = await createAPIMessage(bot, interaction, embed)

    await bot.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: apiMessage
        }
    })
}

module.exports.sendFollowupEmbed = async (bot, interaction, embed) =>{

    await bot.api.webhooks(bot.user.id, interaction.token).post({
        data: {
            embeds : [
                embed
            ]
        }
    })
}

module.exports.send = async (bot, interaction, message) => {
    await bot.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: message
            }
        }
    })
}

module.exports.sendFollowup = async (bot, interaction, message) => {
    await bot.api.webhooks(bot.user.id, interaction.token).post({
        data: {
            content: message
        }
    })
}

module.exports.loadConfig = async() => {
    try {
        let fileContents = fs.readFileSync('./config.yml', 'utf8');
        return yaml.load(fileContents);
    }
    catch (e) {
        log.info(e);
    }
}

module.exports.error = async(bot, interaction, message) => {

    await bot.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: message,
                flags: 64
            }
        }
    })
}

module.exports.success = async(bot, interaction, message) => {
    let embed = new Discord.MessageEmbed()
        .setTitle("Success!")
        .setDescription(message)
        .setColor("0x00FF00");
    
    let apiMessage = await createAPIMessage(bot, interaction, embed)

    await bot.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: apiMessage
        }
    })
}

module.exports.setLoading = async(bot, interaction) => {
    msg = await bot.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 5,
        }
    })
}

module.exports.respondLoading = async(bot, interaction, message) => {
    await bot.api.webhooks(bot.user.id, interaction.token).messages("@original").patch({
        data: {
            type: 4,
            content: message
        }
    })
}

module.exports.respondLoadingEmbed = async(bot, interaction, embed) => {

    let embedAPI = await createAPIMessage(bot, interaction, embed)

    await bot.api.webhooks(bot.user.id, interaction.token).messages("@original").patch({
        data: {
            type: 4,
            embeds: [
                embedAPI.embed
            ]
        }
    })
}