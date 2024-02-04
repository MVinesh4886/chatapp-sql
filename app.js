require("dotenv").config();

const express = require("express");
const db = require("./config/database");
const path = require("path");
const cron = require("node-cron");
const User = require("./models/User");
const Messages = require("./models/message");
const Group = require("./models/group");
const GroupMember = require("./models/member");
const oldMessage = require("./models/oldMessage");
const userRoute = require("./routes/user");
const chatRoute = require("./routes/message");
const groupRoute = require("./routes/group");
const groupMemberRoute = require("./routes/member");

const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http); //socket.io is a JavaScript library that enables real-time, bidirectional communication between the web browser and the server

User.hasMany(Group); //a User can have multiple groups.
Group.belongsTo(User); //a group belongs to a single user.

Group.hasMany(GroupMember); //a group can have multiple group members.
GroupMember.belongsTo(User); //a group member belongs to a single user.

User.hasMany(Messages); //a user can have multiple messages.
Messages.belongsTo(Group); //messages belongs to a single group.

//This is to move the messages from chat model to the archivedChat model
User.hasMany(oldMessage); //a user can have multiple messages.
oldMessage.belongsTo(Group); //messages belongs to a single group.

User.belongsToMany(Group, { through: "GroupMember" }); //a user can belong to multiple groups, and a group can have multiple users.
Group.belongsToMany(User, { through: "GroupMember" }); //a group can belong to multiple users, and a users can have multiple groups.

// const cors = require("cors"); //cross-origin resource sharing: allows web browsers to make requests to a different domain than the one the web page originated from.

app.use(express.json());

// app.use(
//   cors({
//     origin: "http://127.0.0.1:5500",
//     // methods: ["GET", "POST", "DELETE", "PUT"],
//     credentials: true, // This indicates that the server should include any cookies or authorization headers in the cross-origin request
//   })
// );

app.use("/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/group", groupRoute);
app.use("/api/member", groupMemberRoute);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, `public/${req.url}`));
});

io.on("connection", (socket) => {
  console.log("A user connected"); // when the client connects to the server or logs in then this message is logged.

  //if the client emits the sendMessage event, socket.on receives the message and io.emit returns the message the data from the database.
  socket.on("sendMessage", (message) => {
    io.emit("message", message);
  });

  //if the client logsout from the server, then this message is logged.
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // console.log(socket);
  console.log("Id of the socket: ", socket.id); // client socket on the console and the server socket will be same.
});

// ┌────────────── second (optional)
// │ ┌──────────── minute
// │ │ ┌────────── hour
// │ │ │ ┌──────── date (1-31)
// │ │ │ │ ┌────── month (1-12) or names
// │ │ │ │ │ ┌──── day (0-7) or names
// │ │ │ │ │ │
// │ │ │ │ │ │
// * * * * * *

//at every five minute move the chat to the archived chat model  - /5 * * * * or 2 minutes /2 * * * *
//once a day - 0 0 * * *
cron.schedule("*/10 * * * *", async () => {
  try {
    const chats = await Messages.findAll();

    // Move the chat content to the ArchivedChat model
    for (const chat of chats) {
      await oldMessage.upsert(
        // the upsert method will update the existing record if it exist else insert a new record.
        {
          // id: chat.id,
          content: chat.content,
          userId: chat.userId,
          groupId: chat.groupId,
        },
        { where: { id: chat.id } }
      );
    }

    // Empty the chat model
    await Messages.destroy({ truncate: true });

    console.log("Chat content moved to OldChat successfully!");
  } catch (error) {
    console.error("Error moving chat content:", error);
  }
});

const PORT = process.env.PORT;

db.sync()
  .then((result) => {
    // console.log(result);
    console.log("Database and tables created!");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });

http.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
