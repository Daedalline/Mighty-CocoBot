const fs = require("fs");

let rawdata = fs.readFileSync('daily_challenge_data.json');
let challenge_data = JSON.parse(rawdata);

for (var userID in challenge_data) {
    challenge_data[userID]["Current Season"]["Participation Awards"] = 0;
    challenge_data[userID]["Lifetime"]["Participation Awards"] = 0;
}

var writedata = JSON.stringify(challenge_data, null, "\t");
fs.writeFileSync('./daily_challenge_data.json', writedata);

