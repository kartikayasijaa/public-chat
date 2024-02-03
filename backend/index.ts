import dotenv from "dotenv";
import Express, { Application } from "express";
import socket, { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import { UserType } from "./utils/types";
dotenv.config();

const app: Application = Express();
app.use(Express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

app.get("/", (_, res) => {
  res.status(200).json({
    message: "Server is running",
  });
});

const PORT = process.env.PORT || 3002;

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

io.on("connection", (socket) => {
  console.log("User connected");
  socket.on("setup", (user: UserType) => {
    console.log(user);
    socket.join("group");
  });
  socket.on("message", (message) => {
    console.log(message)
    socket.broadcast.to("group").emit("message", message);
  });
  socket.on("file", (file) => {
    console.log({file})
    socket.broadcast.to("group").emit("file", file);
  })
});
