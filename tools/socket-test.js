const { io } = require("socket.io-client");

const client = io(`ws://localhost:3001`);
  
// client-side
client.on("connected", (data) => {
    console.log(`Connect event: `);
    console.log(data);
    // console.log(socket.id); // x8WIv7-mJelg7on_ALbx
});

client.on("message", (data) => {
    console.log(data);
});
  
client.on("disconnect", () => {
    console.log(socket.id); // undefined
});