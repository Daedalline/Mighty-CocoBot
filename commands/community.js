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
   
    let rawdata = await fs.readFileSync('community_challenge_data.json');
    let challenge_data = await JSON.parse(rawdata);
    
    if(interaction.options.getSubcommand() == "create_challenge"){
        // Creates a new community challenge
        var name = interaction.options.getString('name');
        var emojii = interaction.options.getString('emojii');
        var dates = interaction.options.getString('dates');
        var num_required = interaction.options.getInteger('num_required');
        var state = interaction.options.getString('state');
        
        await interaction.deferReply();
        
        if(challenge_data.includes(name)){
            // Challenge already exists. Output error message.
            var embed = new Discord.MessageEmbed()
            .setTitle("Database Error")
            .setDescription(`**${name}** already exists.`);
            return await interaction.editReply({embeds: [embed]})
        }
        else {
            challenge_data[name] = { 
            "Emojii": emojii
            "Dates": dates
            "Submissions Required": num_required,
            "Challenge Status": state,
            "Participants": {}
            }
            
            // Save the data and output message
            var writedata = JSON.stringify(challenge_data, null, "\t");
            await fs.writeFileSync('community_challenge_data.json', writedata);

            var embed = new Discord.MessageEmbed()
            .setTitle("Community Challenge Created")
            .setDescription(`**${name}** created.`);
            return await interaction.editReply({embeds: [embed]})
        }
        }
    }
    
    
}

module.exports.autocomplete = async (interaction) => {
    var value = interaction.options.getFocused(true);
    var res = []
    switch(value.name){
        case 'status': {
		    res = [{name: 'Active', value: 'Active'}, {name: 'Pending', value: 'Pending'}, {name: 'Complete', value: 'Complete'}, {name: 'Not Completed', value: 'Not Completed'}];
        }
    }
    interaction.respond(res.slice(0,25))
}

module.exports.info = {
    "name": "community",
    "description": "Allows moderators to manage daily challenge stats on the boards",
    "options": [
        {
            "name": "create_challenge",
            "description": "Adds a new community challenge",
            "type": 1,
            "options": [
                {
                    "name": "name",
                    "description": "Name of the new challenge",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "emojii",
                    "description": "Emojii to represent this challenge",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "dates",
                    "description": "When this challenge was active",
                    "type": 3,
                    "required": true
                },
                {
                    "name": "num_required",
                    "description": "Number of completions required",
                    "type": 4,
                    "required": true
                },
                {
                    "name": "state",
                    "description": "Is this challenge active, completed, or not completed",
                    "type": 3,
                    "required": true,
                    "autocomplete": true
                }
            ]
        }
    ]
};