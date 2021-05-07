/*
 * ====================NOTE====================
 *    This code was created by LostAndDead,
 *   please don't claim this as your own work
 *        https://github.com/LostAndDead
 * ============================================
 */

const Discord = require("discord.js");
const utils = require("../utils")

module.exports.run = async(bot, interaction, args) => {
    var embed = new Discord.MessageEmbed()
    .setDescription("Yes I am indeed alive!\n\nI might as well sneak some credit in here")
    .setFooter('Made by LostAndDead#0001', 'https://cdn.discordapp.com/avatars/329353232570908682/a_dd8b8ac06a7732882f328dfa931a0a62.gif?size=256');
    await utils.sendEmbed(bot, interaction, embed)
};

module.exports.info = {
    "name": "ping",
    "description": "Check if I am alive!"
};
