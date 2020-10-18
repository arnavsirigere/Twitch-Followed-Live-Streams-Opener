require('dotenv').config();
const database = require('kvaluedb');
const fetch = require('node-fetch');
const express = require('express');
const app = express();
const server = app.listen(3000, () => console.log('Server is ready!'));
const io = require('socket.io')(server);

app.all('/', (req, res) => {
  res.send('Alive!');
});

app.get('/live', (req, res) => {
  let streamers = Object.keys(database.list());
  streamers = streamers.filter((streamer) => database.get(streamer));
  res.send({ streamers });
});

io.sockets.on('connection', (socket) => console.log(`New connection : ${socket.id}`));

getAccessToken()
  .then(() => {
    checkStreamers().catch((err) => console.log(err));
    // Checking if a streamer goes live every 5 seconds
    setInterval(() => checkStreamers().catch((err) => console.log(err)), 5000);
  })
  .catch((err) => console.log(err));

async function checkStreamers() {
  const streamers = await getFollowedStreamers();
  // Deleting streamer from DB if they were unfollowed
  const streamersInDB = Object.keys(database.list());
  for (let streamer of streamersInDB) {
    if (!streamers.includes(streamer)) {
      database.delete(streamer);
    }
  }
  for (let i = 0; i < streamers.length; i++) {
    const streamer = streamers[i];
    checkStreamerIsLive(streamer).then((isLive) => {
      if (database.has(streamer)) {
        const wasLive = database.get(streamer);
        if (!wasLive && isLive) {
          io.sockets.emit('broadcast', { streamer });
        }
      }
      database.set(streamer, isLive);
    });
  }
}

async function checkStreamerIsLive(streamer) {
  const url = `https://api.twitch.tv/helix/streams?user_login=${streamer}`;
  const response = await fetch(url, { headers: { 'CLIENT-ID': process.env.CLIENT_ID, Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } });
  const responseData = await response.json();
  return responseData.data.length !== 0;
}

async function getFollowedStreamers() {
  const url = `https://api.twitch.tv/helix/users/follows?from_id=${process.env.USER_ID}&first=100`;
  const response = await fetch(url, { headers: { 'CLIENT-ID': process.env.CLIENT_ID, Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } });
  const responseData = await response.json();
  const streamersData = responseData.data;
  const streamers = Array.from({ length: streamersData.length }, (_, i) => streamersData[i].to_name);
  return streamers;
}

async function getAccessToken() {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`;
  const response = await fetch(url, { method: 'POST' });
  const responseData = await response.json();
  const { access_token, expires_in } = responseData;
  process.env.ACCESS_TOKEN = access_token;
  setTimeout(getAccessToken, expires_in);
}
