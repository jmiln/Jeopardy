const users = {};
const log = [];
const totalColumns = 5;
let selectedValue = 0;
let currentCat = "";
let boardWidth, boardHeight;

// Capitalizes the first letter of each word
String.prototype.toProperCase = function() {
    return this.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};

function loadBoard() {
    // Set each catagory header for both boards
    for (board of ["board1", "board2"]) {
        setDailyDoubles(board);

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
                
                if (!thisCell.classList.contains("visited")) {
                    thisCell.classList.add("visited");    
                    showQuestion(boardID, thisX, thisY);
                } else {
                    thisCell.classList.remove("visited");
                }
            }
        });
    }

    // Get the size of the table so I can overlay it later?
    boardHeight = document.getElementById("board1").offsetHeight;
    boardWidth  = document.getElementById("board1").offsetWidth;

    // Load the questions in from a JSON file? Or just load it from the object above?
    loadUsers();
}

function setDailyDoubles(boardID) {
    const boardContents = questions[boardID];
    const ddNum = parseInt(boardID.replace("board", ""));
    let prevCat;
    // Set daily double locations, one in the first board, 2 in the second.
    // Bottom 3 rows only, and max of 1 per category 
    let targetCat = Math.floor(Math.random() * 5); // Picks one out of the 5 categories
    let targetRow = Math.floor(Math.random() * 3) + 2;  // Picks one of the available cells
    
    let thisCat = boardContents[Object.keys(boardContents)[targetCat]];
    let thisRow = thisCat[Object.keys(thisCat)[targetRow]];
    thisRow.dailyDouble = true;

    if (ddNum === 2) {
        prevCat = targetCat;
        while (targetCat === prevCat) {
            targetCat = Math.floor(Math.random() * 5);
        }
        targetRow = Math.floor(Math.random() * 3) + 2;
        thisCat = boardContents[Object.keys(boardContents)[targetCat]];
        thisRow = thisCat[Object.keys(thisCat)[targetRow]];
        thisRow.dailyDouble = true;
    }
}

function showQuestion(boardID, x, y, bypassDD=false) {
    // Fill in the list to be shown
    const questionDiv = document.getElementById("question");
    const boardContents = questions[boardID];
    const thisCat = boardContents[Object.keys(boardContents)[x]];
    const thisQ   = thisCat[Object.keys(thisCat)[y]];
    const ddDiv = document.getElementById("dd");

    if (thisQ.dailyDouble && ddDiv.classList.contains("hidden")) {
        // This needs to pop up a different screen before you get to the actual q/a
        const ddDiv = document.getElementById("dd");
        ddDiv.innerHTML = `
            <div class="qDailyDouble">Daily Double!</div>
            <div class="qControls">
                <button onclick='closeQDD()'>Go Back</button>
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
                <button onclick='closeQDD()'>Go Back</button>
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

function closeQDD() {
    const qdd = document.getElementById("tableContainer").querySelectorAll(`#dd,#question`);
    qdd.forEach(open => {
        if (!open.classList.contains("hidden")) {
            open.classList.add("hidden");
        }
    });
}

function addUser(boardID) {
    let uNameText = document.getElementById("newUserText");
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
    const userDiv = document.getElementById("users");
    
    // Wipe the div out so we can reset it
    userDiv.innerHTML = "";

    // Add in each user
    Object.keys(users).forEach((userName, ix) => {
        const score = users[userName].score;
        const userID = "user" + ix;
        const div = document.createElement("div");
        div.className = "user";
        div.id        = userID;
        div.innerHTML = 
           `<div class="uName">${userName.toProperCase()}</div>
            <div class="uScore">${score}</div>
            <a class="menter" href="javascript:void(0)" onClick="crementUser('${userID}', 1)">+</a>
            <a class="menter" href="javascript:void(0)" onClick="crementUser('${userID}', -1)">-</a>`;
        userDiv.appendChild(div);
    });
}

function crementUser(uID, dir) {
    const userDiv = document.getElementById("users");
    const userName  = userDiv.querySelector(`#${uID} .uName`).innerText;
    const customAmountArea = document.getElementById("customAmountText");
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
    
    // Change the score
    const userScore = userDiv.querySelector(`#${uID} .uScore`);
    userScore.innerText = score.toString()
}

function clearBoard(num) {
    if (confirm("Are you sure you want to clear all selected tiles?")) {
        const currentBoard = document.querySelector("#tableContainer table:not(.hidden)");
        const allSelected = currentBoard.querySelectorAll(".visited,.selected");
        allSelected.forEach(selected => {
            selected.classList.remove("visited");
            selected.classList.remove("selected");
        });
        selectedValue = 0;
        log.push("Board has been cleared"); 
    }
}

function swapBoard() {
    const hiddenBoard = document.querySelector("#tableContainer table.hidden");
    const currentBoard = document.querySelector("#tableContainer table:not(.hidden)");
    
    const currentID = currentBoard.id.replace("board", "");
    const swapButton = document.getElementById("boardSwapButton");
    swapButton.innerText = "Show Board " + currentID;
    
    hiddenBoard.classList.toggle("hidden");
    currentBoard.classList.toggle("hidden");
}

function resetScores() {
    if (confirm("Are you sure you want to clear all players' scores?")) {
        const userDiv = document.getElementById("users");
        const scores = userDiv.querySelectorAll(".uScore");
        scores.forEach(score => {
            score.innerText = "0";
        });
        Object.keys(users).forEach(user => {
            users[user].score = 0;
        });
        log.push("Scores have been reset");
    }
}

function showHistory() {
    // Fill in the list to be shown
    const historyTA = document.getElementById("historyTA");
    historyTA.innerHTML = log.join("\n");            

    // Show the list (Or hide it if it's up)
    const histDiv = document.getElementById("tableContainer").querySelector("#history");
    if (histDiv.classList.contains("hidden")) {
        histDiv.classList.remove("hidden");
        historyTA.scrollTop = historyTA.scrollHeight;
        document.getElementById("histButton").innerText = "Hide History";
    } else {
        histDiv.classList.add("hidden");
        document.getElementById("histButton").innerText = "Show History";
    }
}