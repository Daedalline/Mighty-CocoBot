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
    var guild = await client.guilds.cache.find(guild => guild.id == interaction.guild.id)
    var member = await guild.members.cache.find(user => user.id == interaction.member.id)
    
    if(!(interaction.channel.id == config.CourseDailyChannelID || interaction.channel.id == config.CourseCommunityChannelID) && !member.permissions.has("MANAGE_MESSAGES")){
        interaction.reply({ephemeral: true, content: "You are not allowed to do that in this channel"})
        return
    }
    await interaction.deferReply();
    
    let rawdata = await fs.readFileSync('daily_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    // Add community challenge icond
    let rawdata2 = await fs.readFileSync('community_challenge_data.json');
    let community_challenge_data = await JSON.parse(rawdata2);
    var community_challenge_icons = "";
    for (var challenge in community_challenge_data) {
        var challenge_info = community_challenge_data[challenge];
        if (challenge_info["state"] == "Complete" || challenge_info["state"] == "Not Completed")
        {
            var player_participated = false;
            for (var subchallenge in challenge_info["challenges"])
            {
                var subchallenge_info = challenge_info["challenges"][subchallenge];
                if (subchallenge_info["state"] == "Complete" && subchallenge_info["participants"].includes(userID))
                {
                    player_participated = true;
                    break;
                }
            }
            
            if (player_participated)
            {
                community_challenge_icons += `${community_challenge_data[challenge]["emoji"]}`;
            }
            else
            {
                community_challenge_icons += `${config.ChallengeIncompleteEmoji}`;
            }
        }
    }
    
    var player_data = challenge_data[userID];
    
    if(typeof player_data == 'undefined') {
        if (community_challenge_icons == "") {
            var embed = new Discord.MessageEmbed()
                .setTitle("Data Not Found")
                .setDescription(`There does not apear to be any challenge statistics for **<@${userID}>**`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            var tbl = "### Community Challenge Badges\n"
            tbl += community_challenge_icons + "\n\n";
            tbl += "### Daily Challenge Medals\n"
            tbl += "__Current Season Medals (Trickshot):__\n";  
            tbl += "Completion Awards :second_place: - 0 Medals\n";
            tbl += "Coolest Shot From the Tee :medal: - 0 Medals\n";
            tbl += "Coolest Shot From Another Hole/Tee :military_medal: - 0 Medals\n";
            tbl += "\n"
            tbl += "__Current Season Medals (9-Hole):__\n";  
            tbl += "Target Score Achieved :second_place: - 0 Medals\n";        
            tbl += "Target Score and Time Achieved :medal: - 0 Medals\n";
            tbl += "Top Score :military_medal: - 0 Medals\n";
            tbl += "\n"
            tbl += "__Total Season Wins:__\n";
            tbl += "First Place Finishes :first_place: - 0 Wins\n";
            tbl += "Second Place Finishes :second_place: - 0 Wins\n";
            tbl += "Third Place Finishes :third_place: - 0 Wins\n";
            tbl += "\n"
            tbl += "__Lifetime Medals (Trickshot):__\n"
            tbl += "Completion Awards :second_place: - 0 Medals\n";
            tbl += "Coolest Shot From the Tee :medal: - 0 Medals\n";
            tbl += "Coolest Shot From Another Hole/Tee :military_medal: - 0 Medals\n";
            tbl += "\n"
            tbl += "__Lifetime Medals (9-Hole):__\n"
            tbl += "Target Score Achieved :second_place: - 0 Medals\n";        
            tbl += "Target Score and Time Achieved :medal: - 0 Medals\n";
            tbl += "Top Score :military_medal: - 0 Medals\n";
            tbl += "\n"
            tbl += "__Total Lifetime Medals: 0__\n";
            var embed = new Discord.MessageEmbed()
                .setTitle(`Daily Challenge statistics for ` + interaction.options.getUser('user').username)
                .setDescription(tbl);
            return await interaction.editReply({embeds: [embed]})
        }
    }
    else {
        var totalLifetimeMedals = player_data["Lifetime"]["Participation Awards"] + player_data["Lifetime"]["Completion Awards"] + player_data["Lifetime"]["Coolest Shot From the Tee"] + player_data["Lifetime"]["Coolest Shot From Another Tee"] + player_data["Lifetime 9-Hole"]["Target Score Achieved"] + player_data["Lifetime 9-Hole"]["Target Score and Time Achieved"] + player_data["Lifetime 9-Hole"]["Top Score"];
        var tbl = "### Community Challenge Badges\n"
        tbl += community_challenge_icons + "\n\n";
        tbl += "### Daily Challenge Medals\n"
        tbl += "__Current Season Medals (Trickshot):__\n";  
        tbl += "Participation Awards :third_place: - " + player_data["Current Season"]["Participation Awards"] + " Medals\n";
        tbl += "Completion Awards :second_place: - " + player_data["Current Season"]["Completion Awards"] + " Medals\n";
        tbl += "Coolest Shot From the Tee :medal: - " + player_data["Current Season"]["Coolest Shot From the Tee"] + " Medals\n";
        tbl += "Coolest Shot From Another Hole/Tee :military_medal: - " + player_data["Current Season"]["Coolest Shot From Another Tee"] + " Medals\n";
        tbl += "\n"
        tbl += "__Current Season Medals (9-Hole):__\n";  
        tbl += "Target Score Achieved :second_place: - " + player_data["Current Season 9-Hole"]["Target Score Achieved"] + " Medals\n";        
        tbl += "Target Score and Time Achieved :medal: - " + player_data["Current Season 9-Hole"]["Target Score and Time Achieved"] + " Medals\n";
        tbl += "Top Score :military_medal: - " + player_data["Current Season 9-Hole"]["Top Score"] + " Medals\n";
        tbl += "\n"
        tbl += "__Total Season Wins:__\n";
        tbl += "First Place Finishes :first_place: - " + player_data["Total Season Wins"]["First Place Finishes"] + " Wins\n";
        tbl += "Second Place Finishes :second_place: - " + player_data["Total Season Wins"]["Second Place Finishes"] + " Wins\n";
        tbl += "Third Place Finishes :third_place: - " + player_data["Total Season Wins"]["Third Place Finishes"] + " Wins\n";
        tbl += "\n"
        tbl += "__Lifetime Medals (Trickshot):__\n"
        tbl += "Participation Awards :third_place: - " + player_data["Lifetime"]["Participation Awards"] + " Medals\n";
        tbl += "Completion Awards :second_place: - " + player_data["Lifetime"]["Completion Awards"] + " Medals\n";
        tbl += "Coolest Shot From the Tee :medal: - " + player_data["Lifetime"]["Coolest Shot From the Tee"] + " Medals\n";
        tbl += "Coolest Shot From Another Hole/Tee :military_medal: - " + player_data["Lifetime"]["Coolest Shot From Another Tee"] + " Medals\n";
        tbl += "\n"
        tbl += "__Lifetime Medals (9-Hole):__\n"
        tbl += "Target Score Achieved :second_place: - " + player_data["Lifetime 9-Hole"]["Target Score Achieved"] + " Medals\n";        
        tbl += "Target Score and Time Achieved :medal: - " + player_data["Lifetime 9-Hole"]["Target Score and Time Achieved"] + " Medals\n";
        tbl += "Top Score :military_medal: - " + player_data["Lifetime 9-Hole"]["Top Score"] + " Medals\n";
        tbl += "\n"
        tbl += "__Total Lifetime Medals: " + totalLifetimeMedals + "__\n";
        var embed = new Discord.MessageEmbed()
        .setTitle(`Challenge statistics for ` + interaction.options.getUser('user').username)
        .setDescription(tbl);
        return await interaction.editReply({embeds: [embed]})
    }
}

module.exports.info = {
    "name": "challenge-stats",
    "description": "List all Daily and Community Challenge stats for a given user",
    "options": [
        {
            "name": "user",
            "description": "The user to submit for",
            "type": 6,
            "required": true
        }
    ]
};