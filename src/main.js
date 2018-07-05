import * as app from './app';

app.run();

// --------------------------------------------------------------
// MODEL

let addHandler;
let mergeHandler;
let moveHandler;
let boxes = [];
let gameBoard = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
let bestScore = 0;
let score = 0;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

// TODO: For these functions, maybe just manipulate the input for simplicity?
// TODO: rename it to flipBoard
function reverseBoard(board) {
  let result = [];
  for (let i = 0; i < 4; i++) {
    let row = board[i].slice().reverse();
    result.push(row);
  }
  return result;
}

// TODO: rename to rotateBoardLeft
function upRotateBoard(board) {
  result = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    result[i].push(board[0][i]);
    result[i].push(board[1][i]);
    result[i].push(board[2][i]);
    result[i].push(board[3][i]);
  }
  return result;
}

// TODO: rename to rotateBoardRight
// TODO: this can be implemented by a rotateBoardLeft and a flipBoard
function bottomRotateBoard(board) {
  result = [[], [], [], []];
  for (let i = 0; i < 4; i++) {
    result[i].push(board[3][i]);
    result[i].push(board[2][i]);
    result[i].push(board[1][i]);
    result[i].push(board[0][i]);
  }
  return result;
}

function validateMove(newBoard, oldBoard) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (newBoard[i][j] != oldBoard[i][j]) {
        return true;
      }
    }
  }
  return false;
}

function copyBoard(board) {
  let copy = [];
  for (let i = 0; i < 4; i++) {
    copy.push(board[i].slice());
  }
  return copy;
}

function initialize(add, move, merge) {
  addHandler = add;
  moveHandler = move;
  mergeHandler = merge;
  gameBoard = placeNewNumber(gameBoard, 2);
}

function getBoard() {
  return gameBoard;
}

function slideBoardLeft(board) {
  let resultBoard = [];
  let movePositionBoard = [];
  for (let i = 0; i < 4; i++) {
    const rowAndStates = slideRowLeft(board[i], i);
    const numOfTransitions = rowAndStates[1].length;
    resultBoard.push(rowAndStates[0]);
    for (let j = 0; j < numOfTransitions; j++) {
      movePositionBoard.push(rowAndStates[1][j]);
    }
  }
  return [resultBoard, movePositionBoard];
}

function slideRowLeft(row, rowNumber) {
  let copyOfRow = row.slice();
  let currentIndex = 0;
  let states = [];
  // return an array of objects that has what position it was from and moved to. Then it will
  // make a board of transitions and we can rotate that board like we rotate gameBoard
  // to accomodate for the different directions

  for (let i = 1; i < 4; i++) {
    if (copyOfRow[i] === 0) {
      continue;
    }

    let boxState = {};

    // if currentIndex is 0, swap it with the next index value
    if (copyOfRow[currentIndex] === 0) {
      // moveHandler();
      let value = copyOfRow[i];
      copyOfRow[currentIndex] = value;
      boxState.name = 'move';
      boxState.startCol = i;
      boxState.startRow = rowNumber;
      boxState.finalCol = currentIndex;
      boxState.finalRow = rowNumber;
      boxState.val = value;

      states.push(boxState);
    }
    // currentIndex value is the same as i, merge into one
    else if (copyOfRow[currentIndex] === copyOfRow[i]) {
      copyOfRow[currentIndex] += copyOfRow[i];
      // mergeHandler()
      boxState.name = 'merge';
      boxState.startCol = i;
      boxState.startRow = rowNumber;
      boxState.finalCol = currentIndex;
      boxState.finalRow = rowNumber;
      boxState.val = copyOfRow[currentIndex];

      states.push(boxState);
      currentIndex += 1;
    }
    // currentIndex is not same value as i AND value before i is 0
    else if (
      copyOfRow[currentIndex] !== copyOfRow[i] &&
      copyOfRow[i - 1] === 0
    ) {
      // if currentIndex + 1 is 0, we move i there. ex [2, 0, 0, 4]
      if (copyOfRow[currentIndex + 1] === 0) {
        copyOfRow[currentIndex + 1] = copyOfRow[i];
        boxState.name = 'move';
        boxState.startCol = i;
        boxState.startRow = rowNumber;
        boxState.finalCol = currentIndex + 1;
        boxState.finalRow = rowNumber;
        boxState.val = copyOfRow[currentIndex + 1];

        // -------------------------
        currentIndex += 1;
        // -------------------------

        states.push(boxState);
      } else {
        // moving i to i - 1, there isn't consecutive zeroes, just 1 zero before it
        copyOfRow[i - 1] = copyOfRow[i];
        boxState.name = 'move';
        boxState.startCol = i;
        boxState.startRow = rowNumber;
        boxState.finalCol = i - 1;
        boxState.finalRow = rowNumber;
        boxState.val = copyOfRow[i - 1];

        //-------------------------
        // currentIndex += 1;
        //-------------------------
        states.push(boxState);
      }
    } else {
      currentIndex += 1;
      continue;
    }
    copyOfRow[i] = 0;
  }
  return [copyOfRow, states];
}

function slide(direction, board) {
  let transitions;
  switch (direction) {
    case 'Up':
      const upBoard = upRotateBoard(board);
      const slideUpBoard = slideBoardLeft(upBoard);
      gameBoard = upRotateBoard(slideUpBoard[0]);

      if (!validateMove(board, gameBoard)) {
        return 0;
      }

      transitions = slideUpBoard[1];

      for (let i = 0; i < transitions.length; i++) {
        let aTransition = transitions[i];
        const initialRowStart = aTransition.startCol;
        const initialColStart = aTransition.startRow;
        const newFinalRow = aTransition.finalCol;
        const newFinalCol = aTransition.finalRow;
        aTransition.startRow = initialRowStart;
        aTransition.startCol = initialColStart;
        aTransition.finalRow = newFinalRow;
        aTransition.finalCol = newFinalCol;
      }

      doTransitions(transitions);
      break;
    case 'Down':
      let bottomBoard = bottomRotateBoard(board);
      let slideBottomBoard = slideBoardLeft(bottomBoard);
      transitions = slideBottomBoard[1];
      gameBoard = bottomRotateBoard(
        bottomRotateBoard(bottomRotateBoard(slideBottomBoard[0]))
      );

      if (!validateMove(board, gameBoard)) {
        return 0;
      }

      for (let i = 0; i < transitions.length; i++) {
        let initialRowStart;
        let aTransition = transitions[i];
        const tempStartCol = aTransition.startCol;
        const finalCol = aTransition.startRow;
        const initialColStart = aTransition.finalRow;
        if (tempStartCol === 0) {
          initialRowStart = 3;
        } else if (tempStartCol === 1) {
          initialRowStart = 2;
        } else if (tempStartCol === 2) {
          initialRowStart = 1;
        } else {
          initialRowStart = 0;
        }
        let tempFinalCol = aTransition.finalCol;
        let newFinalRow;
        if (tempFinalCol === 0) {
          newFinalRow = 3;
        } else if (tempFinalCol === 1) {
          newFinalRow = 2;
        } else if (tempFinalCol === 2) {
          newFinalRow = 1;
        } else {
          newFinalRow = 0;
        }
        aTransition.finalCol = finalCol;
        aTransition.startCol = initialColStart;
        aTransition.startRow = initialRowStart;
        aTransition.finalRow = newFinalRow;
      }
      doTransitions(transitions);
      break;
    case 'Left':
      const boardAndState = slideBoardLeft(board);
      gameBoard = boardAndState[0];

      if (!validateMove(board, gameBoard)) {
        return 0;
      }

      transitions = boardAndState[1];

      doTransitions(transitions);
      break;
    case 'Right':
      // slide right only needs to worry about the change in col
      let boardReversed = reverseBoard(board);
      let slideReversedBoard = slideBoardLeft(boardReversed);
      gameBoard = reverseBoard(slideReversedBoard[0]);

      if (!validateMove(board, gameBoard)) {
        return 0;
      }

      transitions = slideReversedBoard[1];

      for (let i = 0; i < transitions.length; i++) {
        let aTransition = transitions[i];
        let initialColStart;

        const alteredStartCol = aTransition.startCol;
        if (alteredStartCol === 1) {
          initialColStart = 2;
        } else if (alteredStartCol === 2) {
          initialColStart = 1;
        } else if (alteredStartCol === 0) {
          initialColStart = 3;
        } else {
          initialColStart = 0;
        }

        aTransition.startCol = initialColStart;

        let newFinalCol;
        const alteredFinalCol = aTransition.finalCol;

        if (alteredFinalCol === 0) {
          newFinalCol = 3;
        } else if (alteredFinalCol === 1) {
          newFinalCol = 2;
        } else if (alteredFinalCol === 2) {
          newFinalCol = 1;
        } else {
          newFinalCol = 0;
        }
        aTransition.finalCol = newFinalCol;
      }
      doTransitions(transitions);
      break;
  }
  board = getBoard();
  gameBoard = placeNewNumber(board, 1);
}

function deleteBox(row, col, boxes) {
  const boxesLength = boxes.length;
  for (let k = 0; k < boxesLength; k++) {
    const aBox = boxes[k];
    if (aBox.rowBoxPosition === row && aBox.colBoxPosition === col) {
      boxes.splice(k, 1);
      return;
    }
  }
}

function doTransitions(transitionArray) {
  const numOfTransitions = transitionArray.length;

  for (let i = 0; i < numOfTransitions; i++) {
    const boxTransition = transitionArray[i];
    const boxName = boxTransition.name;
    if (boxName === 'move') {
      moveHandler(boxTransition);
    } else if (boxName === 'merge') {
      mergeHandler(boxTransition);
    }
  }
}

function placeNewNumber(board, num) {
  let copy = copyBoard(board);

  let emptyIndexes = [];
  for (let j = 0; j < 4; j++) {
    for (let k = 0; k < 4; k++) {
      // changed from "" to 0
      if (board[j][k] === 0) {
        emptyIndexes.push([j, k]);
      }
    }
  }

  let startVals = [2, 2, 2, 2, 2, 4];
  for (let j = 0; j < num; j++) {
    let index = getRandomInt(emptyIndexes.length);
    let emptySlot = emptyIndexes[index];
    emptyIndexes.splice(index, 1);
    let twoOrFour;
    if (getRandomInt(10) < 9) {
      twoOrFour = 2;
    } else {
      twoOrFour = 4;
    }
    const row = emptySlot[0];
    const col = emptySlot[1];
    copy[row][col] = twoOrFour;

    addHandler(row, col, twoOrFour, false);
  }
  return copy;
}

function scoreKeeper(val) {
  score += val;
  if (score >= bestScore) {
    bestScore = score;
  }
  return [score, bestScore];
}

function newGame() {
  score = 0;
  boxes = [];
  gameBoard = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
  gameBoard = placeNewNumber(gameBoard, 2);
  // have to clear dom children for visual box
}

// --------------------------------------------------------------
// CONTROLLER - no dom or css above this line
let transitionsInProgress = 0;

function printBoxes(boxes) {
  for (let i = 0; i < boxes.length; i++) {
    console.log(boxes[i]);
  }
}

function findBox(row, col, boxes) {
  const boxesLength = boxes.length;
  for (let k = 0; k < boxesLength; k++) {
    const aBox = boxes[k];
    if (aBox.rowBoxPosition === row && aBox.colBoxPosition === col) {
      return aBox;
    }
  }
}

function getBoxPosition(row, col, boardWidth) {
  const boxSize = (boardWidth * 107) / 500;
  const space = (boardWidth - 4 * boxSize) / 5;
  const anchorOffset = space / 2;
  const topPosition = anchorOffset + space * row + boxSize * row;
  const leftPosition = anchorOffset + space * col + boxSize * col;
  return [topPosition, leftPosition];
}

function addColor(val, box) {
  switch (val) {
    case 2:
      box.classList.add('two');
      break;
    case 4:
      box.classList.add('four');
      break;
    case 8:
      box.classList.add('eight');
      break;
    case 16:
      box.classList.add('one-six');
      break;
    case 32:
      box.classList.add('three-two');
      break;
    case 64:
      box.classList.add('six-four');
      break;
    case 128:
      box.classList.add('one-two-eight');
      break;
    case 256:
      box.classList.add('two-five-six');
      break;
    case 512:
      box.classList.add('five-one-two');
      break;
    case 1024:
      box.classList.add('one-zero-two-four');
      break;
    case 2048:
      // has a gold glow around the box
      // glow color = #E7C677
      box.classList.add('two-zero-four-eight');
      break;
    case 4096:
      box.classList.add('four-zero-nine-six');
      break;
  }
}

function controllerAdd(row, col, val, toMerge) {
  let box = {};
  box.rowBoxPosition = row;
  box.colBoxPosition = col;
  box.val = val;
  // box.id = "row" + row + "col" + col;
  let domBox = document.createElement('div');
  box.theDiv = domBox;
  const boardWidth = document.getElementsByClassName('board')[0].clientWidth;
  const boxPos = getBoxPosition(row, col, boardWidth);
  domBox.classList.add('overlay-box');

  addColor(val, domBox);

  if (toMerge) {
    domBox.classList.add('merge-effect');
  } else {
    domBox.classList.add('bounce-effect');
  }
  domBox.style.top = boxPos[0] + 'px';
  domBox.style.left = boxPos[1] + 'px';
  domBox.innerHTML = val;
  // domBox.setAttribute("id", box.id);
  boxes.push(box);
  let container = document.getElementsByClassName('overlay-container')[0];

  container.appendChild(domBox);
}

// when boxes move, have to change id
function controllerMove(transitionBox) {
  const startRow = transitionBox.startRow;
  const startCol = transitionBox.startCol;
  const finalRow = transitionBox.finalRow;
  const finalCol = transitionBox.finalCol;
  // console.log("startRow: " + startRow);
  // console.log("finalRow: " + finalRow);
  // console.log("startCol: " + startCol);
  // console.log("finalCol: " + finalCol);
  const startBox = findBox(startRow, startCol, boxes);
  const boardWidth = document.getElementsByClassName('board')[0].clientWidth;
  const finalBoxPos = getBoxPosition(finalRow, finalCol, boardWidth);
  // console.log(startBox);
  // console.log(boxes);
  //
  startBox.theDiv.style.top = finalBoxPos[0] + 'px';
  startBox.theDiv.style.left = finalBoxPos[1] + 'px';
  startBox.colBoxPosition = finalCol;
  startBox.rowBoxPosition = finalRow;
  transitionsInProgress += 1;

  const listener = function(event) {
    transitionsInProgress -= 1;
    startBox.theDiv.removeEventListener('transitionend', listener);
  };
  startBox.theDiv.addEventListener('transitionend', listener);
  // startBox.id = "row" + row + "col" + finalCol;
  // startBox.theDiv.setAttribute("id", startBox.id);
}

function controllerMerge(transitionBox) {
  const startRow = transitionBox.startRow;
  const startCol = transitionBox.startCol;
  const finalRow = transitionBox.finalRow;
  const finalCol = transitionBox.finalCol;
  const startBox = findBox(startRow, startCol, boxes);
  const finalBox = findBox(finalRow, finalCol, boxes);
  const finalVal = startBox.val + finalBox.val;

  // add finalVal to score
  const scores = scoreKeeper(finalVal);
  let bestScoreElement = document.getElementsByClassName('best-score')[0];
  let currentScoreElement = document.getElementsByClassName('current-score')[0];
  const newCurrentScore = scores[0];
  const newBestScore = scores[1];

  bestScoreElement.innerHTML = newBestScore;
  currentScoreElement.innerHTML = newCurrentScore;

  const boardWidth = document.getElementsByClassName('board')[0].clientWidth;
  const boxPos = getBoxPosition(finalRow, finalCol, boardWidth);

  // have to change the id of the boxes to be deleted. when transition ends, the call back will remove
  // the element with the start and final box id, but at that time, there could be a new box that
  // moved and had its' id changed to the one we are trying to remove. therefore, removing the wrong
  // box(s)
  // look into remove by reference of the start and final box, don't need setattribute id strings at all

  // startBox.id = startBox.id + "delete";
  // finalBox.id = finalBox.id + "delete";
  // finalBox.theDiv.setAttribute("id", finalBox.id);
  // startBox.theDiv.setAttribute("id", startBox.id);
  // let startBoxListener = document.getElementById(startBox.id);
  // deleteBox(row, startCol, boxes);
  // deleteBox(row, finalCol, boxes);
  // startBoxListener.addEventListener("transitionend", function(event) {
  //   document.getElementById(startBox.id).remove();
  //   document.getElementById(finalBox.id).remove();
  //   addHandler(row, finalCol, finalVal);
  // });

  const startBoxDiv = startBox.theDiv;
  const finalBoxDiv = finalBox.theDiv;
  deleteBox(startRow, startCol, boxes);
  deleteBox(finalRow, finalCol, boxes);
  startBoxDiv.addEventListener('transitionend', function(event) {
    // remove both boxes to create the new box
    // can send extra arguement to addHandler to say that its a merge and not add bounce class
    startBoxDiv.remove();
    finalBoxDiv.remove();
    addHandler(finalRow, finalCol, finalVal, true);
    transitionsInProgress -= 1;
  });
  // box move transition
  startBox.theDiv.style.top = boxPos[0] + 'px';
  startBox.theDiv.style.left = boxPos[1] + 'px';
  transitionsInProgress += 1;
}

const newGameButton = document.getElementsByClassName('new-game-btn')[0];

newGameButton.addEventListener('click', function() {
  const overlayContainer = document.getElementsByClassName(
    'overlay-container'
  )[0];
  while (overlayContainer.lastChild) {
    overlayContainer.removeChild(overlayContainer.lastChild);
  }

  let currentScoreElement = document.getElementsByClassName('current-score')[0];
  currentScoreElement.innerHTML = 0;

  newGame();
});

document.addEventListener('keydown', function(pressedKey) {
  // map arrowup to up for model
  let validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  let key = pressedKey.code;
  let board = getBoard();

  if (validKeys.includes(key)) {
    pressedKey.preventDefault();

    if (transitionsInProgress !== 0) {
      return;
    }

    switch (key) {
      case 'ArrowUp':
        slide('Up', board);
        break;
      case 'ArrowDown':
        slide('Down', board);
        break;
      case 'ArrowLeft':
        slide('Left', board);
        break;
      case 'ArrowRight':
        slide('Right', board);
        break;
    }
  }
});

initialize(controllerAdd, controllerMove, controllerMerge);
