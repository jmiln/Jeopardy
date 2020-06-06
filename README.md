# Jeopardy

* This is currently set up to be hosted on a server, so you will need node.js to run stuff
* Once downloaded/ cloned, you will need to:
  * Run `npm install` to install the node packages it uses (express/ socket.io)
  * Run `node index.js` to start the server
* Once it's running, you can go to `localhost:4321` to get the buzzer, or `localhost:4321/host` to see the board and such


* Questions/ answers and such are loaded into the src/js/questions.js file
  * You can change catagory names, questions, and amounts will reflect on the board and what pops up
  * Remember, the answer is what is shown first, not the question

* You can also click the gear in the top right of the host's screen, put it in edit mode, and click on the headers/ cells to change the relevant info
  * These can be saved/ loaded from the same dropdown


* The page will set Double Jeopardy spots, 1 in the first board, and 2 in the second (Row 3-5 only)

* Audio/ video clips should still work, but I have not tried it now that it is not being run locally
  * This will likely just need to be youtube embed links or something for the time being

* The text from the questions/ answers are stuck in as-is, so if you put formatting in (html/ css), that should carry over as well
