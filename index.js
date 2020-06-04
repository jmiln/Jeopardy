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

// io.on('connection', function (socket) {
//     socket.emit('request', /* */ ); // emit an event to the socket
//     io.emit('broadcast', /* */ ); // emit an event to all connected sockets
//     socket.on('reply', function () { /* */ }); // listen to the event
// });

io.on("connection", socket => {
    socket.on("checkUser", (uName) => {
        console.log(uName);
        console.log(users);
        const active = users.filter(u => u.active && u.name === uName.toUpperCase())
        if (active.length) {
            return io.to(socket.id).emit("validateName", false);
        }
        return io.to(socket.id).emit("validateName", true);
    })
    socket.on("join", (user, validate) => {
        const userList = users.filter(u => u.name.toUpperCase() === user.name.toUpperCase())
        if (!userList.length) {
            // There's nobody by that name here
            users.push({
                score: 0,
                name: user.name.toUpperCase(),
                buzzed: false,
                active: true,
                socketID: socket.id
            });
            validate(true);
        } else if (!userList.filter(u => u.active).length) {
            // There has been someone by that name, but they're inactive
            if (userList.length > 1) console.log(userList.length + " people here by the name " + user.name);
            const u = userList[0];
            u.socketID = socket.id;
            u.active = true;
            validate(true);
        } else {
            // There is someone by that name, active here
            console.log(userList.length + " people here by the name " + user.name);
            validate(false);
        }
        console.log(user.name + " joined" + (user ? " back!" : "!"));
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

    socket.on("buzz", (user) => {
        // Highlight the user when they  buzz in
        if (!users.find(a => a.buzzed)) {
            console.log(user.name + " buzzed in");
            const u = users.find(u => u.socketID === socket.id);
            if (u) {
                u.buzzed = true;
                io.emit("updateUsers", users);
            } else {
                console.log("Something went wrong in buzz");
                console.log(user, socket.id);
            }
        }
    });

    socket.on("disconnect", () => {
        // Take them out of the list and clear their points?
        const user = users.find(u => u.socketID === socket.id);
        if (user && user.name) {
            console.log(user.name + " disconnected");
            io.emit("userDisconnect", user);
            users.splice(users.indexOf(user));
            io.emit("updateUsers", users);
        } else {
            console.log("Host disconnected");
        }
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
