/* eslint no-unused-vars: 0 */

const PORT = 4321;
const ROOM_ID_LEN = 6;
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
const users = {};

// io.on('connection', function (socket) {
//     socket.emit('request', /* */ ); // emit an event to the socket
//     io.emit('broadcast', /* */ ); // emit an event to all connected sockets
//     socket.on('reply', function () { /* */ }); // listen to the event
// });

io.on("connection", socket => {
    socket.on("join", (user, validate) => {
        const userList = users[user.roomID] ? users[user.roomID].filter(u => u.name.toUpperCase() === user.name.toUpperCase()) : null;
        if (!userList) {
            return validate("Invalid Room");
        } else if (!userList.length) {
            // There's nobody by that name here
            users[user.roomID].push({
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
            return validate("This name is already in use, please try again.");
        }
        socket.join(user.roomID);
        console.log(`[Room ${user.roomID}] ${user.name} joined!`);
        io.to(user.roomID).emit("userConnect", user);
        io.to(user.roomID).emit("updateUsers", users[user.roomID]);
    });

    socket.on("hostJoin", (roomID) => {
        console.log("Host joined - " + socket.id);
        // Send the host an ID for people to connect to
        if (!roomID || !roomID.toString().length === ROOM_ID_LEN || !roomID.toString.match(/[a-zA-Z0-9]/)) {
            roomID = randomString(ROOM_ID_LEN);
        }
        users[roomID] = [];
        socket.join(roomID);
        socket.emit("hostJoined", roomID);

        // Send out any current users
        io.to(roomID).emit("scoreUpdate", users[roomID]);
        io.to(roomID).emit("updateUsers", users[roomID]);
    });

    socket.on("clearBuzzes", (roomID) => {
        console.log("Clearing Buzzes");
        for (const user of users[roomID]) {
            user.buzzed = false;
        }
        io.to(roomID).emit("updateUsers", users[roomID]);
    });

    socket.on("clearScores", (roomID) => {
        console.log("Clearing Scores");
        for (const user of users[roomID]) {
            user.score = 0;
        }
        io.to(roomID).emit("updateUsers", users[roomID]);
    });

    socket.on("buzz", (user) => {
        // Highlight the user when they  buzz in
        if (!users[user.roomID].find(a => a.buzzed)) {
            console.log(user.name + " buzzed in");
            const u = users[user.roomID].find(u => u.socketID === socket.id);
            if (u) {
                u.buzzed = true;
                io.to(user.roomID).emit("updateUsers", users[user.roomID]);
            } else {
                console.log("Something went wrong in buzz");
                console.log(user, socket.id);
            }
        }
    });

    socket.on("disconnect", () => {
        // Take them out of the list and clear their points?
        let user, roomID;
        for (const room of Object.keys(users)) {
            user = users[room].find(u => u.socketID === socket.id);
            if (user) {
                roomID = room;
                break;
            }
        }
        if (user && user.name) {
            if (roomID) {
                // Remove the user from the room's scoreboard if they were in a room
                users[roomID].splice(users[roomID].indexOf(user), 1);
            }

            console.log(user.name + " disconnected");
            io.to(roomID).emit("userDisconnect", user);
            if (users && users[roomID]) {
                users[roomID].splice(users[roomID].indexOf(user));
            }
            io.to(roomID).emit("updateUsers", users[roomID]);
        } else {
            console.log("Host disconnected");
        }
    });

    socket.on("hostScoreUpdate", (userName, amount, roomID) => {
        // Update the user's scores
        updateScore(userName.toUpperCase(), amount, roomID);
        // Send out the new scores to the users
        io.to(roomID).emit("updateUsers", users[roomID], roomID);
    });
});

function updateScore(userName, amount, roomID) {
    console.log("Updating scores: " + userName + ", " + amount);
    const user = users[roomID].find(u => u.name === userName);
    if (!user) {
        console.log("Something broke, I could not find the user to update");
    } else {
        user.score += parseInt(amount);
    }
}

const letters = "abcdefghijklmnopqrstuvwxyz";
const numbers = "1234567890";
const charset = letters + letters.toUpperCase() + numbers;

function randomString(length) {
    let res = "";
    for (let i=0; i < length; i++) {
        res += charset[Math.floor(Math.random()*charset.length)];
    }
    return res;
}

server.listen(PORT, () => console.log("Listening on " + PORT));
