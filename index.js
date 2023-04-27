const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const yaml = require('js-yaml');
const fs = require("fs");
const schedule = require('node-schedule');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

let usedRooms = [];
let usedCourses = [];

//Load the config file
let Config = null;

try {
    let fileContents = fs.readFileSync('./config.yml', 'utf8');
    Config = yaml.load(fileContents);
}
catch (e) {
    console.log(e);
}

//Load the maps file
let Maps = null;
try {
    let mapContents = fs.readFileSync('./maps.json');
    Maps = JSON.parse(mapContents)
}
catch (e) {
    console.log(e);
}

//Create a collection of commands and commandData
const commands = new Collection();
//Command data is a list of JSON objects that need to be sent to register the slash commands
const commandsData = [];

//We load all the command files and save the command and the commandData
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    //Load the file
    const command = require(`./commands/${file}`);
    //Add to command collection
    commands.set(command.info.name, command);

    //Load the commandData
    const commandData = require(`./commands/${file}`);
    var json = commandData.info
    commandsData.push(json);
}

//Load the rest API for registering slash commands, auto deals with rate limits
const rest = new REST({ version: '9' }).setToken(Config.Token);

//Send all the slash commandData to the discord API to register the commands for the guild only
(async () => {
    if(Config.Commands.SetupCommands){
        try {
            console.log('Started refreshing application (/) commands.');
    
            await rest.put(
                Routes.applicationGuildCommands(Config.ClientID, Config.GuildID),
                { body: commandsData },
            );
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    }
    
})();

//creates data files if they dont exist
const data = new Uint8Array(Buffer.from('{}'));

fs.access("data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("data.json", data, (err) => {
                if (err) throw err;
                console.log("Created data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("data.json already exists")
    }
})
fs.access("daily_challenge_data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("daily_challenge_data.json", data, (err) => {
                if (err) throw err;
                console.log("Created daily_challenge_data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("daily_challenge_data.json already exists")
    }
})

// D.JS Client listeners
client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));
client.on('reconnecting', () => console.log('Reconnecting WS...'));
client.on('disconnect', () => {
    console.log('Disconnected, trying to restart...');
    process.exit();
});

// NodeJS process listeners
process.on('unhandledRejection', console.error);
process.on('warning', console.warn);

// On ready statment
client.on("ready", async() => {
    console.log("Online!")
    console.log("^ The above message is for Pterodactyl to pickup and mark the server as online. ^\n")
    console.log("------------------------------------------------------------------------------------------------------")
    console.log("The bot is now online")
    console.log(`Logged in as ${client.user.username} || ${client.user.id}`)
    console.log("------------------------------------------------------------------------------------------------------")
    console.log(`Invite me to a server with the following link.\nhttps://discordapp.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=125952&scope=bot`);
    console.log("------------------------------------------------------------------------------------------------------")
    main(true)
});

//Listen for commands coming from chat and context menus
client.on('interactionCreate', async interaction => {
    if (!(interaction.isCommand() || interaction.isContextMenu())) return;
    if(!interaction.inGuild()){
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true })
        return;
    }

    //Find the commands we want to run
    const command = commands.get(interaction.commandName);

    if (!command) return;

    try {
        //Run the command
        await command.run(interaction, Config, Maps, client);
    } catch (error) {
        console.error(error);
    }
});

//Listen for autocomplete
client.on('interactionCreate', async interaction => {
    if (!interaction.isAutocomplete()) return;

    //Find the commands we want to auto complete for
    const command = commands.get(interaction.commandName);

    if (!command) return;

    try {
        //Run the autocomplete resolver
        await command.autocomplete(interaction, Maps, client);
    } catch (error) {
        console.error(error);
    }
});

// Log in
client.login(Config.Token);

// Main function - schedule cron jobs
async function main(){
      let jobEasy = schedule.scheduleJob('00 45 * * * *', printRandomEasyGameMessage); // fires every day, at xx:45:xx
      let jobHard = schedule.scheduleJob('00 15 * * * *', printRandomHardGameMessage); // fires every day, at xx:15:xx
      let jobLanguage = schedule.scheduleJob('00 0-59 * * * *', printLanguageGameMessage); // fires on Saturday at 15 minutes before 10 am, 2 pm , and 6 pm EST.
}

// Print the random easy game message in #find-a-game
async function printRandomEasyGameMessage(){
    let course = getNotRecentlyUsedEasyCourse();
    printRandomGameMessage(course);
}

// Print the random hard game message in #find-a-game
async function printRandomHardGameMessage(){
    let course = getNotRecentlyUsedHardCourse();
    printRandomGameMessage(course);
}



// Print the random game message in #find-a-game
async function printRandomGameMessage(course){

    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.ChannelID);

    let room = getNotRecentlyUsedRoom();

    usedRooms.push(room);
    if(usedRooms.length > 2){
        usedRooms.shift();
    }
    
    usedCourses.push(course);
    if(usedCourses.length > 14){
        usedCourses.shift();
    }
    
    let currentDate = Date.now() + 900000;
    let currentDateString = currentDate.toString();
    let currentDateSubstring = currentDateString.substr(0, currentDateString.length - 3);

    let embed = new MessageEmbed()
    .setTitle("Game starting soon!")
    .setDescription(`
    The next scheduled game will start in **15 minutes** (at <t:${currentDateSubstring}:t>) in room **${room}**. If this is full, try **${room}1** or **${room}2**, etc.

    If you are the first player to create a room, please see the following guidelines:

    Created rooms should be setup with a player count max of 5.

    Games must wait until <t:${currentDateSubstring}:t> to start unless the room is already full.

    The course will be **${course}**.
    `)
    .setTimestamp();
    channel.send({embeds: [embed]})
}

// Add logic to not repeat recently used room names
function getNotRecentlyUsedRoom(){
    let room = Maps.RoomIDs[Math.floor(Math.random() * Maps.RoomIDs.length)]
    while (usedRooms.includes(room)){
        room = Maps.RoomIDs[Math.floor(Math.random() * Maps.RoomIDs.length)]
    }
    return room
}

// Add logic to not repeat recently played Easy courses
function getNotRecentlyUsedEasyCourse(){
    let course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)]
    while (usedCourses.includes(course) || course.endsWith('Hard')){
        course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)];
    }
    return course
}

// Add logic to not repeat recently played Hard courses
function getNotRecentlyUsedHardCourse(){
    let course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)]
    while (usedCourses.includes(course) || course.endsWith('Easy')){
        course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)];
    }
    return course
}

async function printLanguageGameMessage() {
    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.ChannelID);
    
    let currentDate = Date.now() + 900000;
    let currentDateString = currentDate.toString();
    let currentDateSubstring = currentDateString.substr(0, currentDateString.length - 3);

    let embed = new MessageEmbed()
    .setTitle("Non-English games starting soon!")
    .setDescription(`
    The next scheduled non-English games will start in **15 minutes** (at <t:${currentDateSubstring}:t>).
    Room **<French>** (French)
    Room **<German>** (German)
    Room **<Italian>** (Italian)
    Room **<Spanish>** (Spanish)

    If these rooms are full, try adding a 1 or a 2 to the end of the room name, etc.

    If you are the first player to create a room, please see the following guidelines:

    Created rooms should be setup with a player count max of 5.

    Games must wait until <t:${currentDateSubstring}:t> to start unless the room is already full.

    The course will be **<Course Name>**, or you can choose a different one amongst yourselves.
    `)
    .setTimestamp();
    channel.send({embeds: [embed]})  
}