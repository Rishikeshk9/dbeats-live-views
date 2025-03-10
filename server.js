const express = require("express");
const app = express();
const server = require("http").createServer(app);
const port = process.env.PORT || 8000;
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    transports: ["websocket"],
    credentials: true,
  },
  allowEIO3: true,
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

io.on("connection", (socket) => {
  let roomId;

  socket.on("joinlivestream", async (room) => {
    await socket.join(room.toString());
    roomId = room;
    console.log(room);
    console.log(io.sockets.adapter.rooms.get(room).size);
    let roomSize = io.sockets.adapter.rooms.get(room).size;
    let details = {
      room: room,
      roomSize: roomSize,
    };
    socket.emit("count", details);
    io.to(room).emit("livecount", details);
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    if (roomId != undefined) {
      let roomSize = io.sockets.adapter.rooms.get(roomId).size;
      io.to(roomId).emit("removecount", roomSize);
    }
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
