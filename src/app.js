import { Game, EventName, Direction } from './model';

let transitionsInProgress = 0;
let boxes = [];
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

function setColor(val, box) {
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

function addBox(location, value, effect) {
  let box = {};
  box.rowBoxPosition = location.row;
  box.colBoxPosition = location.column;
  box.val = value;
  let domBox = document.createElement('div');
  box.theDiv = domBox;
  const boardWidth = document.getElementById('board').clientWidth;
  const boxPos = getBoxPosition(location.row, location.column, boardWidth);
  domBox.classList.add('overlay-box');

  setColor(value, domBox);

  domBox.classList.add(effect);

  domBox.style.top = boxPos[0] + 'px';
  domBox.style.left = boxPos[1] + 'px';
  domBox.innerHTML = value;
  boxes.push(box);
  let container = document.getElementById('overlay-container');

  container.appendChild(domBox);
}

function handleAdd(event) {
  addBox(event.startLocation, event.value, 'bounce-effect');
}

function handleMove(event) {
  const startRow = event.startLocation.row;
  const startCol = event.startLocation.column;
  const finalRow = event.endLocation.row;
  const finalCol = event.endLocation.column;

  const startBox = findBox(startRow, startCol, boxes);
  const boardWidth = document.getElementById('board').clientWidth;
  const finalBoxPos = getBoxPosition(finalRow, finalCol, boardWidth);

  startBox.theDiv.style.top = finalBoxPos[0] + 'px';
  startBox.theDiv.style.left = finalBoxPos[1] + 'px';
  startBox.colBoxPosition = finalCol;
  startBox.rowBoxPosition = finalRow;
  transitionsInProgress += 1;

  const listener = function() {
    transitionsInProgress -= 1;
    startBox.theDiv.removeEventListener('transitionend', listener);
  };
  startBox.theDiv.addEventListener('transitionend', listener);
}

function handleMerge(event) {
  const startRow = event.startLocation.row;
  const startCol = event.startLocation.column;
  const finalRow = event.endLocation.row;
  const finalCol = event.endLocation.column;
  const startBox = findBox(startRow, startCol, boxes);
  const finalBox = findBox(finalRow, finalCol, boxes);

  const boardWidth = document.getElementById('board').clientWidth;
  const boxPos = getBoxPosition(finalRow, finalCol, boardWidth);

  const startBoxDiv = startBox.theDiv;
  const finalBoxDiv = finalBox.theDiv;
  deleteBox(startRow, startCol, boxes);
  deleteBox(finalRow, finalCol, boxes);
  startBoxDiv.addEventListener('transitionend', function() {
    // remove both boxes to create the new box
    startBoxDiv.remove();
    finalBoxDiv.remove();
    addBox(event.endLocation, event.value, 'merge-effect');
    transitionsInProgress -= 1;
  });

  // box move transition
  startBox.theDiv.style.top = boxPos[0] + 'px';
  startBox.theDiv.style.left = boxPos[1] + 'px';
  transitionsInProgress += 1;
}

function eventHandler(event) {
  let name = event.name;
  if (name === EventName.NUMBER_MOVED) {
    handleMove(event);
  } else if (name === EventName.NUMBER_MERGED) {
    handleMerge(event);
  } else {
    handleAdd(event);
  }
}

export function run() {
  showBestScore(getSavedBestScore());
  game = new Game(eventHandler, false);
  if (window.location.href === 'https://2048.calvinln.com/test') {
    game = new Game(eventHandler, true);
  }

  let savedBoard = getSavedBoard();
  if (savedBoard) {
    let savedScore = getSavedScore();
    updateScore(savedScore, 0);
    game.reload(savedBoard, savedScore);
  } else {
    game.restart();
  }

  const newGameButton = document.getElementById('new-game-btn');
  newGameButton.addEventListener('click', function() {
    const overlayContainer = document.getElementById('overlay-container');
    while (overlayContainer.lastChild) {
      overlayContainer.removeChild(overlayContainer.lastChild);
    }

    let currentScoreElement = document.getElementById('current-score');
    currentScoreElement.innerHTML = 0;

    boxes = [];
    game.restart();
    saveBoard(game.getBoard());
    saveScore(game.getScore());
  });

  function showGameOver() {
    let board = document.getElementById('board');
    const listener = function(event) {
      board.removeEventListener('animationend', listener);
      let gameoverOverlay = document.createElement('div');
      gameoverOverlay.id = 'gameover-overlay';
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
      event.stopPropagation();
    };

    board.addEventListener('animationend', listener(event));
    let backgroundContainer = document.getElementById('background-container');
    let overlayContainer = document.getElementById('overlay-container');
    backgroundContainer.classList.add('fade-effect');
    overlayContainer.classList.add('fade-effect');
  }

  function updateScore(newScore, previousScore) {
    let scoreDiff = newScore - previousScore;
    if (scoreDiff > 0) {
      let scoreAnimationElement = document.createElement('div');
      let scoreBox = document.getElementById('current-score');
      scoreBox.innerHTML = newScore;
      scoreAnimationElement.innerHTML = '+' + scoreDiff;
      scoreAnimationElement.id = 'score-animation';
      let scoreContainer = document.getElementById('left-score-rectangle');
      scoreContainer.appendChild(scoreAnimationElement);
      scoreAnimationElement.addEventListener('animationend', function() {
        document.getElementById('score-animation').remove();
      });
    }
  }

  function getSavedBoard() {
    return JSON.parse(window.localStorage.getItem('board'));
  }

  function saveBoard(board) {
    window.localStorage.setItem('board', JSON.stringify(board));
  }

  function getSavedScore() {
    let savedScore = window.localStorage.getItem('score');
    if (savedScore === null) {
      savedScore = 0;
    }
    return parseInt(savedScore, 10);
  }

  function saveScore(score) {
    window.localStorage.setItem('score', score);
  }

  function getSavedBestScore() {
    let savedBestScore = window.localStorage.getItem('bestScore');
    if (savedBestScore === null) {
      savedBestScore = 0;
    }
    return parseInt(savedBestScore, 10);
  }

  function saveBestScore(bestScore) {
    window.localStorage.setItem('bestScore', bestScore);
  }

  function showBestScore(bestScore) {
    document.getElementById('best-score').innerHTML = bestScore;
  }

  document.addEventListener('keydown', function(pressedKey) {
    // map arrowup to up for model
    let validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    let key = pressedKey.code;

    if (validKeys.includes(key)) {
      pressedKey.preventDefault();

      if (transitionsInProgress !== 0) {
        return;
      }

      if (game.isGameOver()) {
        return;
      }

      let previousScore = game.getScore();

      switch (key) {
        case 'ArrowUp':
          game.slide(Direction.UP);
          break;
        case 'ArrowDown':
          game.slide(Direction.DOWN);
          break;
        case 'ArrowLeft':
          game.slide(Direction.LEFT);
          break;
        case 'ArrowRight':
          game.slide(Direction.RIGHT);
          break;
      }
      let newScore = game.getScore();
      updateScore(newScore, previousScore);
      if (newScore > getSavedBestScore()) {
        saveBestScore(newScore);
        showBestScore(newScore);
      }
      saveBoard(game.getBoard());
      saveScore(game.getScore());
      if (game.isGameOver()) {
        showGameOver();
      }
    }
  });
}
