console.log('Chrome extension is ready!');

const server = 'https://Twitch-Followed-Live-Streams-Opener.arnavsirigere.repl.co';

const socket = io.connect(server);

socket.on('connect', () => console.log('Client connected'));

socket.on('broadcast', (data) => openTwitch(data.streamer));

function openTwitch(streamer) {
  chrome.tabs.query({}, (tabs) => {
    const url = `https://www.twitch.tv/${streamer}`.toLowerCase();
    const openTabs = Array.from({ length: tabs.length }, (_, i) => tabs[i].url.toLowerCase());
    if (!openTabs.includes(url)) {
      chrome.tabs.create({ url });
    }
  });
}

// Open the current followed streams that are live when the browser launches
openLiveStreams().catch((err) => console.log(err));

async function openLiveStreams() {
  const response = await fetch(`${server}/live`);
  const responseData = await response.json();
  const { streamers } = responseData;
  for (let streamer of streamers) {
    openTwitch(streamer);
  }
}
