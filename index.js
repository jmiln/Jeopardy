/* eslint no-unused-vars: 0 */

const PORT = 4321;
const express = require("express");
const app = express();

const server = require("http").createServer(app);
const io = require("socket.io")(server);

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/views/JeopardyUser.html");
});

app.get("/host", (req, res) => {
    res.sendFile(__dirname + "/views/JeopardyHost.html");
});

const {inspect} = require("util");
const users = [];
io.on("connection", socket => {
    console.log("Connection event");

    // Some way to show the user's current score on their side too
    socket.on("join", user => {
        // Add new users to the list as they join in
        if (!users.filter(a => a.name === user.name.toUpperCase()).length) {
            users.push({
                score: 0,
                name: user.name.toUpperCase(),
                buzzed: false
            });
        }
        console.log(user.name + " joined!");
        io.emit("updateUsers", users);
    });

    socket.on("clearBuzzes", () => {
        console.log("Clearing Buzzes");
        for (const user of users) {
            user.buzzed = false;
        }
        io.emit("updateUsers", users);
    });

    socket.on("clearScores", () => {
        console.log("Clearing Scores");
        for (const user of users) {
            user.score = 0;
        }
        io.emit("updateUsers", users);
    });

    socket.on("buzz", user => {
        // Highlight the user when they  buzz in
        if (!users.filter(a => a.buzzed).length) {
            console.log(user.name + " buzzed in");
            const u = users.find(u => u.name === user.name);
            u.buzzed = true;
            io.emit("updateUsers", users);
        }
    });

    socket.on("disconnect", user => {
        // Take them out of the list and clear their points?
        console.log(user.name ? user.name : "Host" + " disconnected");
    });

    socket.on("hostLoad", () => {
        console.log("Host joined");
        // Send out any current users
        io.emit("scoreUpdate", users);
        io.emit("updateUsers", users);
    });
    socket.on("hostScoreUpdate", (userName, amount) => {
        // Update the user's scores
        updateScore(userName.toUpperCase(), amount);
        // Send out the new scores to the users
        io.emit("updateUsers", users);
    });
});

function updateScore(userName, amount) {
    console.log("Updating scores: " + userName + ", " + amount);
    const user = users.find(u => u.name === userName);
    if (!user) {
        console.log("Something broke, I could not find the user to update");
    } else {
        user.score += parseInt(amount);
    }
}

server.listen(PORT, () => console.log("Listening on " + PORT));
