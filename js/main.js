'use strict'
const EMPTY = ''
const FLAG = '🚩'
const MINE = '&#128163'
const normalEMOJI = '😀'
const loseEMOJI = '😭'
const winEMOJI='😎'

var gTimerInterval;
var gIsWin;
var gSeconds;
var gClickCounter;
var gRightClickCounter;
var gValue;
var gBoard;
var gHintCounter;
var isHint;

var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0 // should be an interval
}

function init() {
    gBoard = buildBoard(gLevel.SIZE, gLevel.SIZE);
    gIsWin=false;
    isHint = false;
    clearInterval(gTimerInterval);
    setMinesNegsCount(gBoard)
    renderBoard(gBoard);
    gClickCounter = 0;
    gRightClickCounter = 0;
    gSeconds = 0;
    cleanHintsBgc()
    gHintCounter = 0;
    var elEmoji=document.querySelector('.emoji')
    elEmoji.innerText=normalEMOJI



}
function buildBoard(height = 4, width = 4) {
    var board = []
    for (var i = 0; i < height; i++) {
        board[i] = []
        for (var j = 0; j < width; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,

            }
            board[i][j] = cell
        }
    }
    for (var q = 0; q < gLevel.MINES; q++) {
        var currCell = board[getRandomInt(0, board.length - 1)][getRandomInt(0, board[0].length - 1)]
        currCell.isMine ? q-- : currCell.isMine = true;
    }
    // setMinesNegsCount(gBoard)
    return board;

}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            if (board[i][j].isMine) {
                if (checkIfInBoard(gBoard, i - 1, j - 1)) board[i - 1][j - 1].minesAroundCount += 1;
                if (checkIfInBoard(gBoard, i - 1, j)) board[i - 1][j].minesAroundCount += 1;
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

function renderBoard(board) {
    var strHTML = '<table><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board.length; j++) {
            gValue = ''
            var cell = board[i][j];
            var className = `cell cell${i}-${j}`
            if (cell.isShown) className = `cell cell${i}-${j} shown`
            if (cell.minesAroundCount > 0) gValue = board[i][j].minesAroundCount;
            if (cell.isMine) gValue = MINE;
            if (cell.isMarked) gValue = FLAG;
            if (!cell.isShown && !cell.isMarked) gValue = EMPTY

            strHTML += `<td class='${className}' onclick=cellClicked(${i},${j}) oncontextmenu="cellMarked(${i},${j})">${gValue}</td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'
    var elBoard = document.querySelector(".board");
    elBoard.innerHTML = strHTML;
}

function cellClicked(i, j) {
    var currCell = gBoard[i][j]
    if (isHint) {
        currCell.isShown = true;
        setTimeout(function () {
            currCell.isShown = false
            renderBoard(gBoard)
        }, 1000)
        renderBoard(gBoard)
        isHint=false;
        return;
    }

    if (currCell.isShown) return;
    if (gClickCounter === 0 && gRightClickCounter === 0) gTimerInterval = setInterval(gameTimer, 1000);
    if (gClickCounter === 0 && currCell.isMine) {
        currCell.isMine = false;
        gBoard[getRandomInt(0, gBoard.length - 1)][getRandomInt(0, gBoard[0].length - 1)].isMine = true;
    }
    gClickCounter++
    if (currCell.isMarked) return;
    currCell.isShown = true;


    checkGameOver(i, j);
    checkVictory();
    renderBoard(gBoard);

    if (gBoard[i][j].minesAroundCount === 0) expandShown(gBoard, currCell, i, j);


}

function cellMarked(i, j) {
    if (gBoard[i][j].isShown) return;
    if (gClickCounter === 0 && gRightClickCounter === 0) setInterval(gameTimer, 1000);
    gRightClickCounter++
    var elCell = document.querySelector(`.cell${i}-${j}`)
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j]
        gBoard[i][j].isMarked = true;
        elCell.innerText = FLAG
    }
    else {
        gBoard[i][j].isMarked = false;
        elCell.innerText = EMPTY
    }
    checkVictory()
}

function checkGameOver(i, j) {

    if (gBoard[i][j].isMine) {
        showAllBombs()
        clearInterval(gTimerInterval);
        gSeconds = 0;
        var elTimer = document.querySelector('.timer span')
        elTimer.innerText = gSeconds;
        var elEmoji=document.querySelector('.emoji')
        elEmoji.innerText=loseEMOJI
        alert('Game Over')
        setTimeout(init, 2500)
    }
}

function expandShown(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (checkIfInBoard(gBoard, i, j) && !gBoard[i][j].isMine) gBoard[i][j].isShown = true;
            renderBoard(gBoard);

        }
    }
}

function showAllBombs() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine) {
                gBoard[i][j].isShown = true;
            }


        }
    }
}

function checkVictory() {
    var minesMarked = 0;
    var cellsShown = 0;
    var totalCells = 0;

    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].isMine && gBoard[i][j].isMarked) minesMarked++;
            if (gBoard[i][j].isShown && !gBoard[i][j].isMine) cellsShown++;
            totalCells++
        }
    }

    if (totalCells === minesMarked + cellsShown) {
        gIsWin=true;
        var elEmoji=document.querySelector('.emoji')
        elEmoji.innerText=winEMOJI;
        alert('You Win')
        setTimeout(init, 2000)
    }
}

function checkIfInBoard(board, i, j) {
    return (i >= 0 && i < board.length &&
        j >= 0 && j < board[i].length);
}

function getHint(elHint) {
    if (gHintCounter >= 3) return;
    elHint.style.backgroundColor = 'wheat'
    isHint = true;
    gHintCounter++
}


function gameTimer() {
    var elTimer = document.querySelector('.timer span')
    elTimer.innerText = gSeconds;
    gSeconds++;

}

function mediumLvl() {
    gLevel.SIZE = 8
    gLevel.MINES = 12
    gBoard = buildBoard(gLevel.SIZE, gLevel.SIZE);
    init();
}
function easyLvl() {
    gLevel.SIZE = 4
    gLevel.MINES = 2
    gBoard = buildBoard(gLevel.SIZE, gLevel.SIZE);
    init();
}
function expertLvl() {
    gLevel.SIZE = 12
    gLevel.MINES = 30
    gBoard = buildBoard(gLevel.SIZE, gLevel.SIZE);
    init();
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function cleanHintsBgc() {
    for (var i = 1; i < 4; i++) {  // gHintCounter.length
        var elHint = document.querySelector(`.hint-${i}`)
        elHint.style.backgroundColor = ''

    }

}

// function emojiStatus(){
//    var elEmoji=document.querySelector('.emoji')

//    if (gIsWin){
//     elEmoji.innerText=winEMOJI;
//    }
//    if(gIsWin){

//        elEmoji.innerText=loseEMOJI;
//    }
// }