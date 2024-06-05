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
fs.access("weekly_leaderboards_data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("weekly_leaderboards_data.json", data, (err) => {
                if (err) throw err;
                console.log("Created weekly_leaderboards_data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("weekly_leaderboards_data.json already exists")
    }
})
fs.access("racemode_data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("racemode_data.json", data, (err) => {
                if (err) throw err;
                console.log("Created racemode_data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("racemode_data.json already exists")
    }
})
fs.access("historical_leaderboards_data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("historical_leaderboards_data.json", data, (err) => {
                if (err) throw err;
                console.log("Created historical_leaderboards_data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("historical_leaderboards_data.json already exists")
    }
})
fs.access("community_challenge_data.json", fs.F_OK, (err) => {
    if (err) {
        if(err.code == "ENOENT"){
            fs.writeFile("community_challenge_data.json", data, (err) => {
                if (err) throw err;
                console.log("Created community_challenge_data.json as it didnt exist")
                return
            })
        }else{
            console.error(err)
            return
        }
    }else{
        console.log("community_challenge_data.json already exists")
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
      let jobLanguage = schedule.scheduleJob('00 45 12,16,20 * * 6,7', printLanguageGameMessage); // fires on Saturdays and Sundays at 15 minutes before 9 am, 1 pm , and 5 pm EST.
      //let jobLanguageIt = schedule.scheduleJob('00 45 6,14 * * 1,3,5', printItLanguageGameMessage); // fires daily at 15 minutes before 3 am and 11 am EST (9 am and 5 pm CEST) on Monday/Wednesday/Friday
      let weeklyReminder = schedule.scheduleJob('00 00 18 * * 2-7', printWeeklyReminderMessage); // fires every day, at 2:00:00 PM EST, except Monday
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
    if(usedRooms.length > 5){
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
    .setTitle(":golf: :golf: :golf: Game starting soon! :golf: :golf: :golf:")
    .setDescription(`
    The next scheduled game will start in **15 minutes** (at <t:${currentDateSubstring}:t>) in room **${room}**. If this is full, try **${room}1** or **${room}2**, etc.

    If you are the first player to create a room, please see the following guidelines:

    Created rooms should be setup with a **player count max of 4**.

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
    let featureMap = Maps.FeatureMap;
    let course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)]
    while (usedCourses.includes(course) || course.endsWith('Hard')){
        course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)];
    }
    if (featureMap != '') {
        if (!usedCourses.includes(featureMap + ' - Easy') && !usedCourses.includes(featureMap + ' - Hard')) {
            course = featureMap + ' - Easy';
        }
        if (usedCourses.includes(featureMap + ' - Easy')) {
            usedCourses.splice(usedCourses.indexOf(featureMap + ' - Easy'), 1);
        }
    }
    return course
}

// Add logic to not repeat recently played Hard courses
function getNotRecentlyUsedHardCourse(){
    let featureMap = Maps.FeatureMap;
    let course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)]
    while (usedCourses.includes(course) || course.endsWith('Easy')){
        course = Maps.Maps[Math.floor(Math.random() * Maps.Maps.length)];
    }
    if (featureMap != '') {
        if (!usedCourses.includes(featureMap + ' - Easy') && !usedCourses.includes(featureMap + ' - Hard')) {
            course = featureMap + ' - Hard';
        }
        if (usedCourses.includes(featureMap + ' - Hard')) {
            usedCourses.splice(usedCourses.indexOf(featureMap + ' - Hard'), 1);
        }
    }
    return course
}

// Print the non-English game message in #find-a-game
async function printLanguageGameMessage() {
    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.ChannelID);
    
    let currentDate = Date.now() + 900000;
    let currentDateString = currentDate.toString();
    let currentDateSubstring = currentDateString.substr(0, currentDateString.length - 3);

    let embed = new MessageEmbed()
    .setTitle(":flag_fr: :flag_de: :flag_it: :flag_es: Non-English games starting soon! :flag_es: :flag_it: :flag_de: :flag_fr:")
    .setDescription(`
    The next scheduled non-English games will start in **15 minutes** (at <t:${currentDateSubstring}:t>).
    
    Room **JOUEURS** (French)
    Room **SPIELER** (German)
    Room **GIOCATORI** (Italian)
    Room **JUGADORES** (Spanish)

    If these rooms are full, try adding a 1 or a 2 to the end of the room name, etc.

    If you are the first player to create a room, please see the following guidelines:

    Created rooms should be setup with a **player count max of 4**.

    Games must wait until <t:${currentDateSubstring}:t> to start unless the room is already full.

    The course will be **Tourist Trap - Easy**, or you can choose a different one amongst yourselves.
    `)
    .setTimestamp();
    channel.send({embeds: [embed]})  
}

// Print the non-English game message in #find-a-game
async function printItLanguageGameMessage() {
    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.ChannelID);
    
    let currentDate = Date.now() + 900000;
    let currentDateString = currentDate.toString();
    let currentDateSubstring = currentDateString.substr(0, currentDateString.length - 3);

    let embed = new MessageEmbed()
    .setTitle(":flag_it: Italian games starting soon! :flag_it:")
    .setDescription(`
    In order to celebrate the launch of Passport: Venice, we are highlighting games in Italian.
    
    The next scheduled Italian games will start in **15 minutes** (at <t:${currentDateSubstring}:t>) in room **GIOCATORI**. If this is full, try GIOCATORI1 or GIOCATORI2, etc.

    If you are the first player to create a room, please see the following guidelines:

    Created rooms should be setup with a **player count max of 4**.

    Games must wait until <t:${currentDateSubstring}:t> to start unless the room is already full.

    The course will be **Venice - Easy**.
    `)
    .setTimestamp();
    channel.send({embeds: [embed]})  
}

// Print the weekly leaderboard reminder message
async function printWeeklyReminderMessage() {
    var easyCourse = "";
    var hardCourse = "";
    for (var map in Maps.Leaderboards) {
        if (Maps.Leaderboards[map].startsWith("Weekly")) {
            if (Maps.Leaderboards[map].endsWith("Easy")) {
                easyCourse += Maps.Leaderboards[map] + "\n";
            }
            else if (Maps.Leaderboards[map].endsWith("Hard")) {
                hardCourse += Maps.Leaderboards[map] + "\n";
            }
        }
    }

    let rawdata = await fs.readFileSync('weekly_leaderboards_data.json');
    let challenge_data = await JSON.parse(rawdata);

    var sortable = [];
    for (var player in challenge_data) {
        var totalScore = challenge_data[player]["Current Season"]["Points"];
        if (totalScore > 0) {
            sortable.push([player, totalScore]);
        }
    }

    sortable.sort(function(a,b){
        return b[1] - a[1];
    });

    var tbl = ":trophy: **__Current Season Points:__** :muscle:\n"; 
    if (sortable.length==0)
    {
        tbl += "No points awarded yet.";
    }
    
    var rank = 0;
    var previous_score = 1000;
    for (var i=0;i<sortable.length;i++) {
        if (sortable[i][1] < previous_score)
        {
            rank++;
        }
        previous_score = sortable[i][1];
        tbl += `#${rank}: <@${sortable[i][0]}> - ${sortable[i][1]}\n`;
    }

    let guild = await client.guilds.cache.find(i => i.id == Config.GuildID);
    let channel = await guild.channels.fetch(Config.CoursesLeageChannelID);

    let embed = new MessageEmbed()
    .setTitle(":star: Weekly Leaderboards! :star:")
    .setDescription(`Just a reminder to all of the Leaderboard enthusiasts! The Weekly Leaderboard competition is happening right now!\n\n`
        + `:golf: **__This Week's Courses:__** :person_golfing:\n`
        + easyCourse
        + hardCourse + `\n`
        + tbl + `\n\n`
        + "Check out the **https://discord.com/channels/752022800562389015/966336175843446886** channel for the rules and how to compete!")
    .setTimestamp();
    channel.send({embeds: [embed]})
}