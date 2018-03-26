let gameBoard = [
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""],
  ["", "", "", ""]
];

function draw(board) {
  let rows = document.querySelectorAll("tr");
  for (let i = 0; i < 4; i++) {
    for (let k = 0; k < 4; k++) {
      let value = board[i][k];
      let cell = rows[i].cells[k];
      cell.innerHTML = value;

      if (value == 2) {
        cell.style.backgroundColor = "#EEE4DB";
      } else if (value == 4) {
        cell.style.backgroundColor = "#EBDFC5";
      } else if (value == 8) {
        cell.style.backgroundColor = "#F0B37E";
      } else if (value == 16) {
        cell.style.backgroundColor = "#F49668";
      } else if (value == 32) {
        cell.style.backgroundColor = "#F57E64";
      } else if (value == 64) {
        cell.style.backgroundColor = "#F56144";
      } else if (value == 128) {
        cell.style.backgroundColor = "#F1CF75";
      } else if (value == 256) {
        cell.style.backgroundColor = "#EFCC68";
      } else if (value == 512) {
        cell.style.backgroundColor = "#EBCB5E";
      } else if (value == 1024) {
        cell.style.backgroundColor = "#EFC549";
      } else if (value == 2048) {
        cell.style.backgroundColor = "#EDC43A";
      } else if (value == 4096) {
        cell.style.backgroundColor = "#3D3936";
        cell.style.color = "#FDFDF8";
      } else {
        cell.style.backgroundColor = "#CDC1B5";
      }
      if (value > 4) {
        cell.style.color = "#FCFED3";
      } else {
        cell.style.color = "#857b72";
      }
    }
  }
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

Object.prototype.isEmpty = function() {
  for (let key in this) {
    if (this.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

// collect all empty indexes and randomly choose one to spawn new number
function placeNewNumber(board, num) {
  let copy = copyBoard(board);

  let emptyIndexes = [];
  for (let j = 0; j < 4; j++) {
    for (k = 0; k < 4; k++) {
      if (board[j][k] === "") {
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
    copy[emptySlot[0]][emptySlot[1]] = twoOrFour;
  }
  return copy;
}

let bestScore = 0;
let score = 0;

function scoreKeeper() {
  if (score >= bestScore) {
    bestScore = score;
  }
}

function initialize(board) {
  let count = 0;
  gameBoard = placeNewNumber(board, 2);
  draw(gameBoard);
}

function slideRowLeft(row) {
  let arr = row.slice();
  let currentIndex = 0;

  for (let i = 1; i < 4; i++) {
    if (arr[i] == 0) {
      continue;
    }

    if (arr[currentIndex] == 0) {
      arr[currentIndex] = arr[i];
    } else if (arr[currentIndex] == arr[i]) {
      arr[currentIndex] += arr[i];
      score += arr[currentIndex];
      scoreKeeper();
      currentIndex += 1;
    } else if (arr[currentIndex] != arr[i] && arr[i - 1] == 0) {
      if (arr[currentIndex + 1] == 0) {
        arr[currentIndex + 1] = arr[i];
      } else {
        arr[i - 1] = arr[i];
      }
      currentIndex += 1;
    } else {
      currentIndex += 1;
      continue;
    }
    arr[i] = "";
  }
  return arr;
}

function slideBoardLeft(board) {
  let result = [];
  for (let i = 0; i < 4; i++) {
    result.push(slideRowLeft(board[i]));
  }
  return result;
}

function printBoard(board) {
  for (let i = 0; i < 4; i++) {
    console.log(board[i]);
  }
}

function reverseBoard(board) {
  let result = [];
  for (let i = 0; i < 4; i++) {
    let row = board[i].slice().reverse();
    result.push(row);
  }
  return result;
}

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

function slideBoard(key, board) {
  let newBoard;
  switch (key) {
    case "ArrowLeft":
      newBoard = slideBoardLeft(board, 1);
      break;
    case "ArrowRight":
      let boardReversed = reverseBoard(board);
      let slideBoardReversed = slideBoardLeft(boardReversed);
      newBoard = reverseBoard(slideBoardReversed);
      break;
    case "ArrowUp":
      let upBoardRotated = upRotateBoard(board);
      let slideUpBoardRotated = slideBoardLeft(upBoardRotated);
      newBoard = upRotateBoard(slideUpBoardRotated);
      break;
    case "ArrowDown":
      let bottomBoardRotated = bottomRotateBoard(board);
      let slideBottomBoardRotated = slideBoardLeft(bottomBoardRotated);
      newBoard = bottomRotateBoard(
        bottomRotateBoard(bottomRotateBoard(slideBottomBoardRotated))
      );
      break;
  }
  return newBoard;
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

function gameOver(keyMoves, gameBoard) {
  let originalBoard = copyBoard(gameBoard);
  let falseCount = 0;

  for (let i of keyMoves) {
    let newBoard = slideBoard(i, originalBoard);
    let valid = validateMove(newBoard, originalBoard);
    if (!valid) {
      falseCount += 1;
    }
    originalBoard = copyBoard(gameBoard);
  }
  if (falseCount >= 4) {
    console.log("Game Over!");
  }
}

document.addEventListener("keydown", function(pressedKey) {
  let validKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  let key = pressedKey.code;
  if (validKeys.includes(key)) {
    let newBoard = slideBoard(key, gameBoard);
    let valid = validateMove(newBoard, gameBoard);
    if (valid) {
      gameBoard = placeNewNumber(newBoard, 1);
      draw(gameBoard);
      gameOver(validKeys, gameBoard);
    }
  }
});

initialize(gameBoard);
