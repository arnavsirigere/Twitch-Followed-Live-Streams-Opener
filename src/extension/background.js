console.log('Chrome extension is ready!');

const socket = io.connect('https://Twitch-Followed-Live-Streams-Opener.arnavsirigere.repl.co');

socket.on('connect', () => console.log('Client connected'));

socket.on('broadcast', (data) => openTwitch(data.streamer));

function openTwitch(streamer) {
  chrome.tabs.query({}, (tabs) => {
    const url = `https://www.twitch.tv/${streamer}`;
    const openTabs = Array.from({ length: tabs.length }, (_, i) => tabs[i].url);
    if (!openTabs.includes(url)) {
      chrome.tabs.create({ url });
    }
  });
}
