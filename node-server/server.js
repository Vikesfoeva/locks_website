const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../app/build')));

// https://nextjs.org/docs/pages/building-your-application/configuring/custom-server
// https://cloud.mongodb.com/v2/6338a25facf4b341141699c2#/clusters/detail/locksOfTheWeek
// https://leejjon.medium.com/create-a-react-app-served-by-express-js-node-js-and-add-typescript-33705be3ceda

app.use((req, res) => {
    res.status(200).send('Hello, world!');
});


// Start the server
const PORT = process.env.PORT || 8080+Math.floor(Math.random()*1000);
app.listen(PORT, () => {
    console.log(`App listening on port http//:localhost:${PORT}`);
    console.log('Press Ctrl+C to quit.');
});