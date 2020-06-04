// Capitalizes the first letter of each word
String.prototype.toProperCase = function() {
    return this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

function loadFunc() {
    const windowHeight = window.innerHeight;
    const windowWidth  = window.innerWidth;
    let buttonSize = 0;
    if (windowHeight > windowWidth) {
        buttonSize = windowWidth * .6;
    } else {
        buttonSize = windowHeight * .6;
    }

    const buzzerBtn = document.getElementById("buzzerBtn");
    buzzerBtn.style.width  = buttonSize + "px";
    buzzerBtn.style.height = buttonSize + "px";
}

const socket     = io()
const formDiv    = document.querySelector("#reg")
const buzzerDiv  = document.querySelector("#buzzer")
const buzzerName = document.querySelector("#buzzer #uName");
const buzzerScore = document.querySelector("#buzzer #uScore");

let user = {};

function getUserInfo() {
    user = JSON.parse(localStorage.getItem("user")) || {};
    if (user.name) {
        formDiv.querySelector("[name=name]").value = user.name.toProperCase();
    }
}
function saveUserInfo() {
    localStorage.setItem("user", JSON.stringify(user));
}

formDiv.addEventListener("submit", (e) => {
    e.preventDefault();
    user.name = formDiv.querySelector("[name=name]").value.toUpperCase();
    socket.emit("join", user);
    saveUserInfo();
    buzzerName.innerText = user.name.toProperCase();
    formDiv.classList.add("hidden");
    buzzerDiv.classList.remove("hidden");
});

buzzerDiv.addEventListener("click", () => {
    socket.emit("buzz", user);
});

socket.on("updateUsers", users => {
    const u = users.find(u => u.name === user.name);
    if (!u) return;
    buzzerScore.innerText = u.score;
});

getUserInfo();
