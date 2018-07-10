import { Game } from './model';

let transitionsInProgress = 0;
let boxes = [];
let bestScore = 0;
let game;

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

function handleAdd(row, col, val, toMerge) {
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
  boxes.push(box);
  let container = document.getElementsByClassName('overlay-container')[0];

  container.appendChild(domBox);
}

// when boxes move, have to change id
function handleMove(transitionBox) {
  const startRow = transitionBox.startRow;
  const startCol = transitionBox.startCol;
  const finalRow = transitionBox.finalRow;
  const finalCol = transitionBox.finalCol;

  const startBox = findBox(startRow, startCol, boxes);
  const boardWidth = document.getElementsByClassName('board')[0].clientWidth;
  const finalBoxPos = getBoxPosition(finalRow, finalCol, boardWidth);

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
}

function handleMerge(transitionBox) {
  const startRow = transitionBox.startRow;
  const startCol = transitionBox.startCol;
  const finalRow = transitionBox.finalRow;
  const finalCol = transitionBox.finalCol;
  const startBox = findBox(startRow, startCol, boxes);
  const finalBox = findBox(finalRow, finalCol, boxes);
  const finalVal = startBox.val + finalBox.val;

  // add finalVal to score
  // const scores = scoreKeeper(finalVal);
  // let bestScoreElement = document.getElementsByClassName('best-score')[0];
  let currentScoreElement = document.getElementsByClassName('current-score')[0];
  const newCurrentScore = game.getScore();
  // const newBestScore = scores[1];

  // bestScoreElement.innerHTML = newBestScore;
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
    handleAdd(finalRow, finalCol, finalVal, true);
    transitionsInProgress -= 1;
  });
  // box move transition
  startBox.theDiv.style.top = boxPos[0] + 'px';
  startBox.theDiv.style.left = boxPos[1] + 'px';
  transitionsInProgress += 1;
}

export function run() {
  game = new Game(handleAdd, handleMove, handleMerge);
  game.restart();

  const newGameButton = document.getElementsByClassName('new-game-btn')[0];
  newGameButton.addEventListener('click', function() {
    const overlayContainer = document.getElementsByClassName(
      'overlay-container'
    )[0];
    while (overlayContainer.lastChild) {
      overlayContainer.removeChild(overlayContainer.lastChild);
    }

    let currentScoreElement = document.getElementsByClassName(
      'current-score'
    )[0];
    currentScoreElement.innerHTML = 0;

    boxes = [];
    game.restart();
  });

  document.addEventListener('keydown', function(pressedKey) {
    // map arrowup to up for model
    let validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    let key = pressedKey.code;

    if (validKeys.includes(key)) {
      pressedKey.preventDefault();

      if (transitionsInProgress !== 0) {
        return;
      }

      switch (key) {
        case 'ArrowUp':
          game.slide('Up');
          break;
        case 'ArrowDown':
          game.slide('Down');
          break;
        case 'ArrowLeft':
          game.slide('Left');
          break;
        case 'ArrowRight':
          game.slide('Right');
          break;
      }
    }
  });
}
