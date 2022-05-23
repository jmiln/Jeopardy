// Capitalizes the first letter of each word
String.prototype.toProperCase = function() {
    return this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

function loadFunc() { // eslint-disable-line no-unused-vars
    const windowHeight = window.innerHeight;
    const windowWidth  = window.innerWidth;
    let buttonSize = 0;
    console.log("windowSize: " + windowWidth, windowHeight);
    const btnPercent = windowWidth < 1000 ? .8 : .6;
    console.log("BtnPercent: " + btnPercent);
    if (windowHeight > windowWidth) {
        buttonSize = windowWidth * btnPercent;
    } else {
        buttonSize = windowHeight * btnPercent;
    }

    const buzzerBtn = document.getElementById("buzzerBtn");
    buzzerBtn.style.width  = buttonSize + "px";
    buzzerBtn.style.height = buttonSize + "px";
}

const socket      = io(); // eslint-disable-line no-undef
const formDiv     = document.querySelector("#reg");
const buzzerDiv   = document.querySelector("#buzzer");
const buzzerName  = document.querySelector("#buzzer #uName");
const buzzerScore = document.querySelector("#buzzer #uScore");

let user = {};

function getUserInfo() {
    user = JSON.parse(localStorage.getItem("user")) || {};
    const winLocVars = getVariables();
    if (user.name) {
        formDiv.querySelector("[name=name]").value = user.name.toProperCase();
    }
    if (winLocVars.roomID && winLocVars.roomID.length === 6 && winLocVars.roomID.match(/[a-zA-Z0-9]{6}/)) {
        formDiv.querySelector("[name=room]").value = winLocVars.roomID;
    } else if (user.roomID) {
        formDiv.querySelector("[name=room]").value = user.roomID;
    }
}
function saveUserInfo() {
    localStorage.setItem("user", JSON.stringify(user));
}

function getVariables() {
    const query = window.location.search.substring(1);
    const vars = query.split(/&(?![A-Za-z]+;|#[0-9]+;)/);
    const out = {};
    vars.forEach((v) => {
        const [key, val] = v.split("=");
        out[key] = val;
    });
    return out;
}

formDiv.addEventListener("submit", async (e) => {
    e.preventDefault();
    user.name = formDiv.querySelector("[name=name]").value.trim().toUpperCase();
    user.roomID = formDiv.querySelector("[name=room]").value.trim();
    socket.emit("join", user, function(valid) {
        if (valid && !valid.length) {
            saveUserInfo();
            buzzerName.innerText = user.name.toProperCase();
            formDiv.classList.add("hidden");
            buzzerDiv.classList.remove("hidden");
        } else {
            alert(valid);
        }
    });
});

buzzerDiv.addEventListener("click", () => {
    socket.emit("buzz", user, socket.id);
});

socket.on("updateUsers", users => {
    const u = users.find(u => u.socketID === socket.id);
    if (!u) return;
    buzzerScore.innerText = u.score.toLocaleString();
});
socket.on("forceClose", () => {
    formDiv.classList.remove("hidden");
    buzzerDiv.classList.add("hidden");
    alert("The host has closed the game");
});

getUserInfo();
