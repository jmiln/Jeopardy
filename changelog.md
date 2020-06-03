# Changelog

## June 1-2, 2020 Update

- Got stuff switched over to get ready for a hosted version
- It now uses express and socket.io to load the pages & communicate between em
- Now includes a buzzer as then main page, and the board at /host
- Currently no way to load questions other than if you have access to the sever
- When a user loads in, it will put them into the scoreboard, and when they buzz, it will highlight them until you clear em

## May 24, 2020 Update 2

- Got the catagory headers to resize the text based on how many characters there are
- Changed some things around so the board, q/a, and double jeopardy panes are all sized based off of the larger of the two boards, in case of header sizes or something making it taller

## May 24, 2020 Update 1

- Added the sound for Daily double and got it to play when clicked on
- Added some stuff to support adding audio files into questions
- Added a favicon icon so the console would shut up about it missing
- Changed q/a so they don't show up at the same time when show question is clicked
- Added an animation to go along with the sound for a daily double

## May 21. 2020 Update 1

Changed it do auto-set the daily doubles when the page is loaded, and removed those fields from the src/questions.js file

## May 19, 2020 Update 2

Changed it to have just one board display, with a button to swap between boards.

- Adjusted how it displays the current selected cell to an inner border, rather than an outer one that only shows on some of the edges, and took away the text highlighting for it
- Removed the duplicate scoreboards, bottom controls, and board so it's easier on the backend and looks nicer. The two boards display in the same space now, and just toggle which shows.
- Changed it to no longer show the headers as clickable

## May 19, 2020 Update 1

Added in questions and split up the bits into files

- Split stuff up into the HTML, JS, and CSS
- Put together questions.js to hold onto the questions & answers
- Got questions to pop up over the board, and daily double as an in between

## May 17, 2020 Update 1

Added history

- Added the history button
- Added an overlay to the table for the logs to show

## May 16, 2020 Update 2

Quick fix

- Fixed the custom amount not being able to be removed, thought that was fixed prior
- Started on a history, currently only shows in the console

## May 16, 2020 Update 1

Small QoL update and added reset buttons

- Removed the hover, so it's easier to see when you clicked on something
- Added in buttons for clearing the board, resetting the scores, and showing the history
  - Clearing the board works   (With confirmation)
  - Clearing the scores works  (With confirmation)

- Added in red text & border to show last selected cell
