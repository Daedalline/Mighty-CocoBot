/*
 * ====================NOTE====================
 *    This code was created by LostAndDead,
 *   please don't claim this as your own work
 *        https://github.com/LostAndDead
 * ============================================
 */

const Discord = require("discord.js");

module.exports.run = async(interaction, config, maps, client) => {
    var embed = new Discord.MessageEmbed()
    .setTitle("Yes, I am alive!")
    .setDescription("I might as well sneak some credit in here")
    .setFooter({text: 'Made by LostAndDead#0001', iconURL: 'https://cdn.discordapp.com/avatars/329353232570908682/9d0500a6d30c44f0c7509787db7fe80f.webp?size=256'});
    await interaction.reply({embeds: [embed]})
};

module.exports.info = {
    "name": "ping",
    "description": "Check if I am alive!"
};
