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
    console.log("Hello world")
    
    const response = {
      data: await testDataReading()
    };
    res.status(200);
    res.send(response);
});


async function testDataReading() {
  const fileName = "8_22_2024 NCAA Data Log.txt"
  try {
    const data = fs.readFileSync(fileName, 'utf8');
    return JSON.parse(data)
  } catch (err) {
    console.error(err);
  }
}