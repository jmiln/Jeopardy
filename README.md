# Jeopardy

Base template for keeping score of a Jeopardy game

## Instructions

* Click the green download button on the upper right of the page
* Once you have it downloaded, you should be able to open it by double clicking on the Jeopardy.html file
  * This will load it up with basic/ testing questions and answers
  * Fill in the info in src/questions.js to customize the questions and answers.
    * You can change the category names and amounts, and it will show up on the board
    * If you change the question names, it doesn't change anything at this time
  * It now has the two boards showing at the same spot, and you can swap between with the button below
* The page will set Double Jeopardy spots, 1 in the first board, and 2 in the second (Row 3-5 only)

* In order to add audio files into a question, make a sub folder for audio files, then stick something like this in your answer in src/questions.js. (I used a folder called `Video Sources`)
`answer: "<audio controls src='/Video Sources/BohemianRhapsody.mp4'></audio>\",`

* The text from the questions/ answers is stuck in as-is, so if you put formatting in, that should carry over as well
