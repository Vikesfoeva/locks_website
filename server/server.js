const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require('path');
const fs = require('node:fs');

// npx kill-port 8080
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});


// https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
// https://cloud.mongodb.com/v2/6338a25facf4b341141699c2#/clusters/detail/locksOfTheWeek
// https://leejjon.medium.com/create-a-react-app-served-by-express-js-node-js-and-add-typescript-33705be3ceda

app.get("/api/testing", async (req, res) => {
    results= await testDataReading();
    const output = [];

    for (let i = 0; i < results.length; i++) {
      const ele = results[i];
      const homeName = ele['home_team'];
      const awayName = ele['away_team'];
      let total = 0;
      let homeLine = 0;
      let awayLine = 0;
      output.push({
        key: `${homeName}|${awayName}|${i}|`,
        cfb_nfl: ele['sport_title'],
        name_away: awayName,
        line_away: awayLine,
        name_home: homeName,
        line_home: homeLine,
        under: total,
        over: total,
        time: getGameTime(ele['commence_time']),
        selected: {
          over: false,
          under: false,
          line_away: false,
          line_home: false,
        } 
      })
    }

    res.status(200);
    res.send({data: output});
});

function getGameTime(thisTime) {
  const val = new Date(thisTime);
                  
  const dayLong = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(val);
  const dayShort = val.getDate();
  const month = new Intl.DateTimeFormat("en-US", { month: "long" }).format(val);
  let hours = val.getHours();
  let modifer = "AM";
  if (hours >= 12) {
    modifer = "PM"
  }
  if (hours > 12) {
    hours = hours - 12;
  } else if (hours === 0) {
    hours = 12
  }
  let minutes = val.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }

  const gameTime = `${hours}:${minutes} ${modifer}`;
  return `${gameTime} ${dayLong}, ${month} ${dayShort}`;
}

async function testDataReading() {
  const fileName = "8_22_2024 NCAA Data Log.txt"
  try {
    const data = fs.readFileSync(fileName, 'utf8');
    return JSON.parse(data)
  } catch (err) {
    console.error(err);
  }
}