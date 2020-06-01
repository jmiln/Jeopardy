/* eslint no-unused-vars: 0 */

const PORT = 4321;
const express = require("express");
const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.render("JeopardyUser");
});

app.get("/host", (req, res) => {
    res.render("JeopardyHost");
});

const users = {};
io.on("connection", socket => {
    console.log("A user connected");

    // Some way to show the user's current score on their side too
    socket.on("join", user => {
        // Add new users to the list as they join in
        console.log(user + " Joined");
        users[user] ? null : users[user] = {name: user, score: 0};
    });

    socket.on("buzz", user => {
        // Highlight the user when they  buzz in
        console.log("A user buzzed in");
        socket.emit("userBuzz", user);
    });

    socket.on("disconnect", user => {
        // Take them out of the list and clear their points?
        console.log("User disconnected");
    });

    socket.on("hostScoreUpdate", (data) => {
        // Update the user's scores
        users

        // Send out the new scores to the users
        socket.emit("scoreUpdate", users);
    });
});

server.listen(PORT, () => console.log("Listening on " + PORT));
