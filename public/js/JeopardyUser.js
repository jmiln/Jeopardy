function loadFunc() {
    const windowHeight = window.innerHeight;
    const windowWidth  = window.innerWidth;
    let buttonSize = 0;
    if (windowHeight > windowWidth) {
        buttonSize = windowWidth * .8;
    } else {
        buttonSize = windowHeight * .8;
    }

    const buzzerBtn = document.getElementById("buzzerBtn");
    buzzerBtn.style.width  = buttonSize + "px";
    buzzerBtn.style.height = buttonSize + "px";
}

const socket     = io()
const formDiv    = document.querySelector("#reg")
const buzzerDiv  = document.querySelector("#buzzer")
const buzzerName = document.querySelector("#buzzer #uName");

let user = {};

function getUserInfo() {
    user = JSON.parse(localStorage.getItem("user")) || {};
    if (user.name) {
        formDiv.querySelector("[name=name]").value = user.name;
    }
}
function saveUserInfo() {
    localStorage.setItem("user", JSON.stringify(user));
}

formDiv.addEventListener("submit", (e) => {
    e.preventDefault();
    user.name = formDiv.querySelector("[name=name]").value;
    socket.emit("join", user);
    saveUserInfo();
    buzzerName.innerText = user.name;
    formDiv.classList.add("hidden");
    buzzerDiv.classList.remove("hidden");
});

buzzerDiv.addEventListener("click", () => {
    socket.emit("buzz", user);
});

socket.on("scoreUpdate", (data) => {
    console.log(`Data: ${data.name}, ${data.score}`);
});

getUserInfo();
