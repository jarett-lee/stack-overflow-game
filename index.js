const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const port = process.env.PORT || 5000;

var tokengen = require('rand-token');

require('./sockets.js')(server, { origins: '*:*' });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// app.use(express.static('public'))

app.get('/', (req, res) => {
    res.sendFile("/", {root: 'public'});
});

app.get('/*.*', (req, res) => {
    res.sendFile(`${req.params[0]}.${req.params[1]}`, { root: 'public' });
})

server.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port", process.env.PORT || 3000);
});