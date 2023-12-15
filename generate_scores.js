const fs = require("fs");

let userID = 211650687296077826n;
let numToGenerate = 25;

//Load the maps file
let Maps = null;
try {
    let mapContents = fs.readFileSync('./maps.json');
    Maps = JSON.parse(mapContents)
}
catch (e) {
    console.log(e);
}

let data = JSON.parse("{}");

Maps.Leaderboards.forEach(map => {
    data[map] = {};
    for (let i=0n; i<numToGenerate; i++)
    {
        let score = Math.floor((Math.random() * -30) + 1);
        data[map][(userID + i).toString()] = [score, new Date().toJSON()];
    }
});

var writedata = JSON.stringify(data, null, "\t");
fs.writeFileSync('./data.json', writedata);

