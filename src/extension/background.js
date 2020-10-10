console.log('Chrome extension is ready!');

const socket = io.connect('https://Twitch-Followed-Live-Streams-Opener.arnavsirigere.repl.co');

socket.on('connect', () => console.log('Client connected'));

socket.on('broadcast', (data) => openTwitch(data.streamer));

function openTwitch(streamer) {
  const url = `https://twitch.tv/${streamer}`;
  chrome.tabs.create({ url });
}
