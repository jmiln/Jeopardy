
const users = {

};
const log = [];
const totalColumns = 5;
// Capitalizes the first letter of each word
String.prototype.toProperCase = function() {
    return this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

let selectedValue = 0;
let currentCat = "";
let boardWidth, boardHeight;

function loadBoard() {
    // Set each catagory header for both boards
    for (board of ["board1", "board2"]) {
        const boardContents = questions[board];
        const catHeaders = document.querySelectorAll(`#${board} thead td`);
        Object.keys(questions[board]).forEach((cat, ix) => {
            catHeaders[ix].innerText = cat;
        });

        const boardCells = document.querySelectorAll(`#${board} tbody td`);
        boardCells.forEach((thisCell, ix) => {
            const thisX = ix % totalColumns;
            const thisY = Math.floor(ix / totalColumns);
            const thisCat = boardContents[Object.keys(boardContents)[thisX]];
            const thisQ   = thisCat[Object.keys(thisCat)[thisY]];
            thisCell.innerHTML = "$" + thisQ.amount;

            thisCell.onclick = function() {
                const boardID = this.parentElement.parentElement.parentElement.id;
                
                // Set the current category
                currentCat = thisCell.parentElement.parentElement.parentElement.querySelectorAll("thead td")[thisX].innerText;
                
                selectedValue = parseInt(thisCell.innerText.replace("$", ""));

                const allSelected = document.getElementsByClassName("selected");
                while (allSelected.length > 0) {
                    allSelected[0].classList.remove('selected');
                }
                thisCell.classList.toggle("selected");
                thisCell.classList.toggle("visited");
                
                showQuestion(boardID, thisX, thisY);
            }
        });
    }

    // This *should* get the size of the table so I can overlay it later?
    // Seems to work even though it throws an error...
    boardHeight = document.getElementById("board1").offsetHeight;
    boardWidth  = document.getElementById("board1").offsetWidth;

    // Load the questions in from a JSON file? Or just load it from the object above?
    loadUsers();
}

function showQuestion(boardID, x, y, bypassDD=false) {
    // Fill in the list to be shown
    const questionDiv = document.getElementById(boardID).parentElement.querySelector("#question" + boardID.replace("board", ""));
    const boardContents = questions[boardID];
    const thisCat = boardContents[Object.keys(boardContents)[x]];
    const thisQ   = thisCat[Object.keys(thisCat)[y]];
    const ddDiv = document.getElementById(boardID).parentElement.querySelector("#dd" + boardID.replace("board", ""));

    if (thisQ.dailyDouble && ddDiv.classList.contains("hidden")) {
        // This needs to pop up a different screen before you get to the actual q/a
        const ddDiv = document.getElementById(boardID).parentElement.querySelector("#dd" + boardID.replace("board", ""));
        ddDiv.innerHTML = `
            <div class="qDailyDouble">Daily Double!</div>
            <div class="qControls">
                <button onclick='closeQDD("${boardID}")'>Go Back</button>
                <button onclick='showQuestion("${boardID}", ${x}, ${y}, true)'>Continue</button>
            </div>
        `;

        // Show/ unhide the div
        ddDiv.classList.remove("hidden");
    } else if (questionDiv.classList.contains("hidden")) {
        // Fill out the question Div
        questionDiv.innerHTML = "";
        questionDiv.innerHTML = `
            <div class="aDiv">${thisQ.answer}</div>
            <div class="qDiv hidden">${thisQ.question}</div>
            <div class="qControls">
                <button onclick='closeQDD("${boardID}")'>Go Back</button>
                <button onclick='this.parentElement.parentElement.getElementsByClassName("qDiv")[0].classList.remove("hidden")'>Show Answer</button>
            </div>
        `;

        // Show/ unhide the div
        questionDiv.classList.remove("hidden");
    } else {
        // Should never be an else since it should pop up above the board, and will have a button there
        console.log("Missed all")
    }
}

function closeQDD(boardID) {
    boardID = boardID.toString().replace("board", "");
    const qdd = document.getElementById("board"+boardID).parentElement.querySelectorAll(`#dd${boardID},#question${boardID}`);
    qdd.forEach(open => {
        if (!open.classList.contains("hidden")) {
            open.classList.add("hidden");
        }
    });
}

function addUser(boardID) {
    let uNameText = document.getElementById("newUserText" + boardID);
    let newUName = uNameText.value;
    if (!newUName || !newUName.length) return alert("Empty name field!");
    newUName = newUName.toProperCase();
    
    if (users[newUName]) {
        alert("This user already exists");
    } else {
        users[newUName] = {
            score: 0
        };                    
        uNameText.value = "";
        loadUsers();
    }
}

function loadUsers() {
    // Grab the div that shows the users
    const userDivs = document.querySelectorAll("div.users");
    
    // Wipe the div out so we can reset it
    for ([index, userDiv] of userDivs.entries()) {
        userDiv.innerHTML = "";

        // Add in each user
        Object.keys(users).forEach((userName, ix) => {
            const score = users[userName].score;
            const userID = "user" + ix;
            const div = document.createElement("div");
            div.className = "user " + userID;
            div.innerHTML = 
            `<div class="uName">${userName.toProperCase()}</div>
                <div class="uScore">${score}</div>
                <a class="menter" href="javascript:void(0)" onClick="crementUser('${userID}', 1, ${index})">+</a>
                <a class="menter" href="javascript:void(0)" onClick="crementUser('${userID}', -1, ${index})">-</a>`;
            userDiv.appendChild(div);
        });
    }
}

function crementUser(uID, dir, boardID=null) {
    const userDivs = document.querySelectorAll("div.users");
    const userName  = userDivs[0].querySelector(`.${uID} .uName`).innerText;
    const customAmountArea = document.getElementById("customAmountText"+boardID);
    const customAmount = customAmountArea && customAmountArea.value ? parseInt(customAmountArea.value) : null;
    
    let score;
    if (customAmount && customAmount > 0) {
        // Up it by the custom set amount
        score = users[userName].score + (customAmount * dir);
        users[userName].score = score;
        
        // Then wipe out the textArea
        customAmountArea.value = "";
        log.push(`${userName}${userName.endsWith("s") ? "'" : "'s"} score was ${dir > 0 ? "in" : "de"}creased by a custom amount: ${customAmount}`);
    } else {
        score = users[userName].score + (selectedValue * dir);
        users[userName].score = score;
        log.push(`${userName}${userName.endsWith("s") ? "'" : "'s"} score was ${dir > 0 ? "in" : "de"}creased by ${selectedValue} from ${currentCat}`);
    }
    
    // Change the score for both boards
    for (userDiv of userDivs) {        
        const userScore = userDiv.querySelector(`.${uID} .uScore`);
        userScore.innerText = score.toString()
    }
}

function clearBoard(num) {
    if (confirm("Are you sure you want to clear all selected tiles?")) {
        const allSelected = document.querySelectorAll(`#board${num} .visited,#board${num} .selected`);
        allSelected.forEach(selected => {
            selected.classList.remove("visited");
            selected.classList.remove("selected");
        });
        log.push("Board has been cleared");
    }
}

function resetScores() {
    if (confirm("Are you sure you want to clear all players' scores?")) {
        const userDivs = document.querySelectorAll("div.users");
        userDivs.forEach(userDiv => {
            const scores = userDiv.querySelectorAll(".uScore");
            scores.forEach(score => {
                score.innerText = "0";
            });
        });
        Object.keys(users).forEach(user => {
            users[user].score = 0;
        });
        log.push("Scores have been reset");
    }
}

function showHistory(num) {
    // Fill in the list to be shown
    const historyTA = document.getElementById("history"+num);
    historyTA.innerHTML = log.join("\n");            

    // Show the list (Or hide it if it's up)
    const histDiv = document.querySelector("#board"+num).parentElement.querySelector(".history");
    if (histDiv.classList.contains("hidden")) {
        histDiv.classList.remove("hidden");
        historyTA.scrollTop = historyTA.scrollHeight;
        document.getElementById("histButton" + num).innerText = "Hide History";
    } else {
        histDiv.classList.add("hidden");
        document.getElementById("histButton" + num).innerText = "Show History";
    }
}


