const fs = require("fs");

let userID = BigInt("211650687296077825");
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
    console.log(map);
    for (let i=0; i<numToGenerate; i++)
    {
        let score = Math.floor((Math.random() * -20) + 1);
        data[map][i] = score;
        console.log(userID + i);
    }
});

var writedata = JSON.stringify(data, null, "\t");
fs.writeFileSync('./data.json', writedata);

