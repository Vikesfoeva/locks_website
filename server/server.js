const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");
const path = require('path');
const fs = require('node:fs');

const {MongoClient, ServerApiVersion} = require("mongodb");
const data = fs.readFileSync("mongopassword.txt", 'utf8');
const password = JSON.parse(data)["password"];
const uri = `mongodb+srv://lenzbMongo:${password}@locksoftheweek.rfsnr.mongodb.net/?retryWrites=true&w=majority&appName=locksOfTheWeek`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

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
// https://www.youtube.com/watch?v=5Vxx5UkjV4s

app.post("/api/triggerSubmission", async (req, res) => {
  const selections = req.body;
  // Do things with selections
  res.status(200);
  res.send({message: "Submission successful"});
})

app.get("/api/testing", async (req, res) => {
    const results= await getSampleDataMongo();

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

async function getSampleDataMongo() {
  const dbName = "locks_data";
  const colName = "2024_sample_data";

  const db = client.db(dbName);

  const collection = db.collection(colName);
  const res = await collection.find().toArray();
  await client.close();
  return res[0]['NCAA_data']
}
