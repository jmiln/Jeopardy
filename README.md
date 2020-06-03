# Jeopardy

Base template for keeping score of a Jeopardy game

## Instructions

* This is currently set up to be hosted on a server, so you will need node.js to run stuff
* Once downloaded/ cloned, you will need to: 
  * Run `npm install` to install the node packages it uses (express/ socket.io)
  * Run `node index.js` to start the server
* Once it's running, you can go to `localhost:4321` to get the buzzer, or `localhost:4321/host` to see the board and such


* Questions/ answers and such are loaded into the src/js/questions.js file, no way to alter that other than manually
  * Changing catagory names, questions, and amounts will reflect on the board and what pops up
  * Remember, the answer is what is shown first, not the question


* The page will set Double Jeopardy spots, 1 in the first board, and 2 in the second (Row 3-5 only)


* In order to add audio files into a question, make a sub folder for audio files, then stick something like this in your answer in src/questions.js. (I used a folder called `Video Sources`)
`answer: "<audio controls src='/Video Sources/BohemianRhapsody.mp4'></audio>\",`


* The text from the questions/ answers are stuck in as-is, so if you put formatting in, that should carry over as well
