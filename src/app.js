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

  if (game.isGameOver()) {
    console.log('OVER');
    let board = document.getElementsByClassName('board')[0];
    const listener = function(event) {
      board.removeEventListener('animationend', listener);
      // let gameoverContainer = board;
      // console.log(gameoverContainer);
      let gameoverOverlay = document.createElement('div');
      gameoverOverlay.classList.add('gameover-overlay');
      let message = document.createElement('p');
      message.innerHTML = 'Game over!';
      message.classList.add('message');
      // let tryAgainBtn = document.createElement('button');
      // tryAgainBtn.onclick = function() {
      //   container.removeChild(gameoverOverlay);
      //   backgroundContainer.classList.remove('fade-effect');
      //   overlayContainer.classList.remove('fade-effect');
      //   resetBoxVisuals();
      // };
      gameoverOverlay.appendChild(message);
      // gameoverOverlay.appendChild(tryAgainBtn);
      // tryAgainBtn.innerHTML = 'Try again';
      // tryAgainBtn.classList.add('try-again');
      board.appendChild(gameoverOverlay);
    };

    board.addEventListener('animationend', listener);
    let backgroundContainer = document.getElementsByClassName(
      'background-container'
    )[0];
    let overlayContainer = document.getElementsByClassName(
      'overlay-container'
    )[0];
    backgroundContainer.classList.add('fade-effect');
    overlayContainer.classList.add('fade-effect');
    // board.classList.add('fade-effect');
  }
}

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

  // let bestScoreElement = document.getElementsByClassName('best-score')[0];
  let currentScoreElement = document.getElementsByClassName('current-score')[0];
  const newCurrentScore = game.getScore();
  // const newBestScore = scores[1];

  // bestScoreElement.innerHTML = newBestScore;
  currentScoreElement.innerHTML = newCurrentScore;

  const boardWidth = document.getElementsByClassName('board')[0].clientWidth;
  const boxPos = getBoxPosition(finalRow, finalCol, boardWidth);

  const startBoxDiv = startBox.theDiv;
  const finalBoxDiv = finalBox.theDiv;
  deleteBox(startRow, startCol, boxes);
  deleteBox(finalRow, finalCol, boxes);
  startBoxDiv.addEventListener('transitionend', function() {
    // remove both boxes to create the new box
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
