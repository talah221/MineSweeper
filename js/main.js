'use strict'
const EMPTY = ''

var gTimerInterval;
var MINE = '&#128163'
var gValue = ''
var gBoard = buildBoard()
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0 // should be an interval
}
//onload main func
function init() {
    gGame.isOn=true;
    gBoard = buildBoard();
    setMinesNegsCount(gBoard)
    renderBoard(gBoard);

}
// Builds the board Set mines at random locations Call setMinesNegsCount() Return the created board
function buildBoard(height = 4, width = 4) {
    var board = []
    for (var i = 0; i < height; i++) {
        board[i] = []
        for (var j = 0; j < width; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: true
            }
            board[i][j] = cell
        }
    }
    board[getRandomInt(0,height-1)][getRandomInt(0,height-1)].isMine=true;
    board[getRandomInt(0,width-1)][getRandomInt(0,width-1)].isMine=true;

    return board;
}

// Count mines around each cell and set the cell's minesAroundCount.
function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) {
                if (checkIfInBoard(gBoard, i - 1, j - 1)) board[i - 1][j - 1].minesAroundCount += 1;
                if (checkIfInBoard(gBoard, i - 1, j - 1)) board[i - 1][j].minesAroundCount += 1;
                if (checkIfInBoard(gBoard, i - 1, j + 1)) board[i - 1][j + 1].minesAroundCount += 1;
                if (checkIfInBoard(gBoard, i, j + 1)) board[i][j + 1].minesAroundCount += 1;
                if (checkIfInBoard(gBoard, i, j - 1)) board[i][j - 1].minesAroundCount += 1;
                if (checkIfInBoard(gBoard, i + 1, j + 1)) board[i + 1][j + 1].minesAroundCount += 1;
                if (checkIfInBoard(gBoard, i + 1, j)) board[i + 1][j].minesAroundCount += 1;
                if (checkIfInBoard(gBoard, i + 1, j - 1)) board[i + 1][j - 1].minesAroundCount += 1
            }

        }
    }
    return board;
}



// Render the board as a <table> to the page
function renderBoard(board) {
    var strHTML = '<table><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board.length; j++) {
            gValue = ''
            var cell = board[i][j];
            var className = `cell cell${i}-${j}`
            if (cell.minesAroundCount > 0) gValue = board[i][j].minesAroundCount;
            if (cell.isMine) gValue = MINE;
            if (!cell.isShown) gValue = ''
            strHTML += `<td class='${className}' onclick=cellClicked(this,${i},${j})>${gValue}</td>`

        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    var elBoard = document.querySelector(".board");
    elBoard.innerHTML = strHTML;
}

// Called when a cell (td) is clicked

function cellClicked(elCell, i, j) {
    gBoard[i][j].isShown = true;
    renderBoard(gBoard)
    checkGameOver(i,j)
    }


// Called on right click to mark a cell (suspected to be a mine) Search the web (and implement) how to hide the context menu on right click
function cellMarked() {

}

// Game ends when all mines are marked, and all the other cells are shown
function checkGameOver(i,j) {
    if(gBoard[i][j].isMine){
        alert('Game Over')
        gGame.isOn=false;
    }



}
// When user clicks a cell with no mines around, we need to open not only that cell, but also its neighbors.
function expandShown(board, elCell, i, j) {

}

function checkIfInBoard(board, i, j) {
    return (i >= 0 && i < board.length &&
        j >= 0 && j < board[i].length);
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }