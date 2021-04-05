const Discord = require("discord.js");
const yaml = require('js-yaml');
const fs = require("fs");

const bot = new Discord.Client({ disableEveryone: true });

let Config = null;
let usedCourses = []

try {
    let fileContents = fs.readFileSync('./config.yml', 'utf8');
    Config = yaml.load(fileContents);
}
catch (e) {
    console.log(e);
}


// D.JS Client listeners
bot.on("error", (e) => console.error(e));
bot.on("warn", (e) => console.warn(e));
//bot.on("debug", (e) => console.info(e));
bot.on('reconnecting', () => console.log('Reconnecting WS...'));
bot.on('disconnect', () => {
    console.log('Disconnected, trying to restart...');
    process.exit();
});

// NodeJS process listeners
process.on('unhandledRejection', console.error);
process.on('warning', console.warn);

// On ready statment
bot.on("ready", async() => {
    console.log("Online!")
    console.log("^ The above message is for Pterodactyl to pickup and mark the server as online. ^\n")
    console.log("------------------------------------------------------------------------------------------------------")
    console.log("The bot is now online")
    console.log(`Logged in as ${bot.user.username} || ${bot.user.id}`)
    console.log("------------------------------------------------------------------------------------------------------")
    console.log(`Invite me to a server with the following link.\nhttps://discordapp.com/api/oauth2/authorize?client_id=${bot.user.id}&permissions=125952&scope=bot`);
    console.log("------------------------------------------------------------------------------------------------------")
    main(true)
});

bot.login(Config.Token);

function main(early){
    let ms = msToNextHour()
    if(early){
        setTimeout(send, (ms+100) + 1200000, early)
    }else{
        setTimeout(send, (ms+100) - 600000, early)
    }
    
}

function send(early){

    let guild = bot.guilds.cache.find(i => i.id == Config.GuildID)
    let channel = guild.channels.cache.find(i => i.id == Config.ChannelID)

    let room = Config.RoomIDs[Math.floor(Math.random() * Config.RoomIDs.length)]

    let course = getNotRecentlyUsedCourse()

    usedCourses.push(course)
    if(usedCourses.length > 2){
        usedCourses.shift()
    }

    if (early){
        let emebd = new Discord.MessageEmbed()
        .setTitle("Game starting soon!")
        .setDescription(`
        The next scheduled game will start in 10 minutes (at the bottom of the hour) in room **${room}**. If this is full try **${room}1** or **${room}2**, etc.
        
        The course will be **${course}**. If you want to join, drop a :thumbsup: reaction on this message so people know there are enough players.
        `)
        channel.send(emebd).then(function (message) {message.react("👍")})
    }else{
        let emebd = new Discord.MessageEmbed()
        .setTitle("Game starting soon!")
        .setDescription(`
        The next scheduled game will start in 10 minutes (at the top of the hour) in room **${room}**. If this is full try **${room}1** or **${room}2**, etc.
        
        The course will be **${course}**. If you want to join, drop a :thumbsup: reaction on this message so people know there are enough players.
        `)
        channel.send(emebd).then(function (message) {message.react("👍")})
    }
    
    console.log("-----------------------------------------")
    console.log(`              Message Sent`)
    console.log(`Room: ${room}`)
    console.log(`Map: ${course}`)
    console.log(new Date().toUTCString())
    console.log(`Used Courses: ${usedCourses}`)
    console.log("-----------------------------------------")

    main(!early)
}

function msToNextHour() {
    return (3600000 - new Date().getTime() % 3600000);
}

function getNotRecentlyUsedCourse(){
    let course = Config.Maps[Math.floor(Math.random() * Config.Maps.length)]
    while (course in usedCourses){
        course = Config.Maps[Math.floor(Math.random() * Config.Maps.length)]
    }
    return course
}
