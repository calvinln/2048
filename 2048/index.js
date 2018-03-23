let gameBoard = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];

function draw() {
  document.querySelector("body").innerHTML =
    gameBoard[0] +
    "<br>" +
    gameBoard[1] +
    "<br>" +
    gameBoard[2] +
    "<br>" +
    gameBoard[3];
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function fullBoard(board) {
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (board[i][j] == 0) {
        return false;
      }
    }
  }
  return true;
}

function generateNumber(board, num) {
  if (fullBoard(board)) {
    return;
  }

  count = 0;
  let copy = [];
  for (let i = 0; i < 4; i++) {
    copy.push(board[i].slice(0));
  }
  let startVals = [2, 4];
  while (count < num) {
    let arr = getRandomInt(4);
    let pos = getRandomInt(4);
    if (copy[arr][pos] == 0) {
      let twoOrFour = startVals[getRandomInt(2)];
      copy[arr][pos] = twoOrFour;
      count += 1;
    }
  }
  return copy;
}

let bestScore = 0;
let score = 0;

function scoreKeeper() {
  if (score >= bestScore) {
    bestScore = score;
  }
  console.log("The score is : " + score);
  console.log("The best score is : " + bestScore);
}

function initialize(board) {
  let count = 0;
  gameBoard = generateNumber(board, 2);
  draw();
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
    arr[i] = 0;
  }

  return arr;
}

// TODO: change to constant name

let left = 37;
let up = 38;
let right = 39;
let down = 40;

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
    let row = board[i].splice(0).reverse();
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

document.addEventListener("keydown", function(key) {
  if (fullBoard(gameBoard)) {
    console.log("Cannot add any more numbers, game over!");
    return;
  }
  switch (key.keyCode) {
    case left:
      gameBoard = generateNumber(slideBoardLeft(gameBoard), 1);
      break;
    case right:
      let boardReversed = reverseBoard(gameBoard);
      let slideBoardReversed = slideBoardLeft(boardReversed);
      gameBoard = generateNumber(reverseBoard(slideBoardReversed), 1);
      break;
    case up:
      let upBoardRotated = upRotateBoard(gameBoard);
      let slideUpBoardRotated = slideBoardLeft(upBoardRotated);
      gameBoard = generateNumber(upRotateBoard(slideUpBoardRotated), 1);
      break;
    case down:
      let bottomBoardRotated = bottomRotateBoard(gameBoard);
      let slideBottomBoardRotated = slideBoardLeft(bottomBoardRotated);
      gameBoard = generateNumber(
        bottomRotateBoard(
          bottomRotateBoard(bottomRotateBoard(slideBottomBoardRotated))
        ),
        1
      );
      break;
  }
  draw();
});

initialize(gameBoard);
