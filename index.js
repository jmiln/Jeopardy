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
const users = {};  // A mapping of user's socket IDs to the roomID they are in
const hosts = {};  // A mapping of host's socket IDs to the roomID they're hosting
const rooms = {};  // This contains all the rooms, and which users are in there

// io.on('connection', function (socket) {
//     socket.emit('request', /* */ );              // Emit an event to the socket
//     io.emit('broadcast', /* */ );                // Emit an event to all connected sockets
//     socket.on('reply', function () { /* */ });   // Listen to the event
// });

io.on("connection", socket => {
    let type = "";
    socket.on("join", (user, validate) => {
        type = "user";
        const userList = rooms[user.roomID] ? rooms[user.roomID].filter(u => u.name.toUpperCase() === user.name.toUpperCase()) : null;
        if (!userList) {
            return validate("Invalid Room");
        } else if (!userList.length) {
            // There's nobody by that name here
            rooms[user.roomID].push({
                score: 0,
                name: user.name,
                buzzed: false,
                active: true,
                socketID: socket.id
            });
            validate(true);
        } else if (!userList.filter(u => u.active).length) {
            // There has been someone by that name, but they're inactive, so let this user take over
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
        users[socket.id] = user.roomID;
        console.log(`[Room ${user.roomID}] ${user.name} joined!`);
        io.to(user.roomID).emit("userConnect", user);
        io.to(user.roomID).emit("updateUsers", rooms[user.roomID]);
    });

    socket.on("hostJoin", (roomID) => {
        type = "host";
        // Send the host an ID for people to connect to
        if (!roomID || !roomID.toString().length === ROOM_ID_LEN || !roomID.toString.match(/[a-zA-Z0-9]/)) {
            while (!rooms[roomID]) {
                // Ensure that there are no duplicate rooms created
                roomID = randomString(ROOM_ID_LEN);
                rooms[roomID] = rooms[roomID] ? rooms[roomID] : [];
            }
        }
        socket.join(roomID);
        socket.emit("hostJoined", roomID);
        console.log(`[Room ${roomID}] Host joined - ${socket.id}`);

        hosts[socket.id] = {
            roomID: roomID
        };

        // Send out any current users
        io.to(roomID).emit("scoreUpdate", rooms[roomID]);
        io.to(roomID).emit("updateUsers", rooms[roomID]);
    });

    socket.on("clearBuzzes", (roomID) => {
        console.log(`Clearing Buzzes for ${roomID}`);
        for (const user of rooms[roomID]) {
            user.buzzed = false;
        }
        io.to(roomID).emit("updateUsers", rooms[roomID]);
    });

    socket.on("clearScores", (roomID) => {
        console.log(`Clearing Scores for room ${roomID}`);
        for (const user of rooms[roomID]) {
            user.score = 0;
        }
        io.to(roomID).emit("updateUsers", rooms[roomID]);
    });

    socket.on("buzz", (user) => {
        // Highlight the user when they  buzz in
        if (!rooms[user.roomID].find(a => a.buzzed)) {
            console.log(user.name + " buzzed in, in room " + user.roomID);
            const u = rooms[user.roomID].find(u => u.socketID === socket.id);
            if (u) {
                u.buzzed = true;
                io.to(user.roomID).emit("updateUsers", rooms[user.roomID]);
            } else {
                console.log("Something went wrong in buzz");
                console.log(user, socket.id);
            }
        }
    });

    socket.on("disconnect", () => {
        if (type === "host") {
            // Host disconnected, kick all users out
            console.log("Host disconnected");
            io.to(hosts[socket.id].roomID).emit("forceClose");
            delete rooms[hosts[socket.id].roomID];
        } else {
            // Take them out of the list and clear their points?
            if (users[socket.id]) {
                // If there is a user, then there's a room, so tell the host that they left
                const roomID = users[socket.id];
                if (rooms[roomID]) {
                    const user = rooms[roomID].find(u => u.socketID == socket.id);

                    // Remove the user from the room's scoreboard if they were in a room
                    console.log(`[Room ${roomID}] ${user ? user.name : "User"} disconnected`);

                    rooms[roomID].splice(rooms[roomID].indexOf(user), 1);
                    io.to(roomID).emit("userDisconnect", user);
                    io.to(roomID).emit("updateUsers", rooms[roomID]);
                }
            } else {
                // The user never joined a room, so didn't get assigned a name or room
            }
        }
    });

    socket.on("hostScoreUpdate", (uID, amount, roomID) => {
        // Update the user's scores
        updateScore(uID, amount, roomID);
        // Send out the new scores to the users
        io.to(roomID).emit("updateUsers", rooms[roomID], roomID);
    });
});

function updateScore(uID, amount, roomID) {
    if (!rooms || !rooms[roomID]) return false;
    const user = rooms[roomID].find(u => u.socketID === uID);
    console.log("Updating scores: " + user.name + ", " + amount);
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
