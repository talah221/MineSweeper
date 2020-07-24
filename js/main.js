'use strict'
const EMPTY = '?'
const FLAG = '🚩'
const MINE = '&#128163'
const normalEMOJI = '😀'
const loseEMOJI = '😭'
const winEMOJI = '😎'

var gBoard;
var gValue;
var gIsWin;
var gClickCounter;
var gRightClickCounter;
var isHint;
var gHintCounter;
var gIsSafeClick;
var gSafeClickCounter;
var gTimerInterval;
var gSeconds;

var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    shownCount: 0,
    markedCount: 0,
    gameLives: 3,
}

function init() {
    clearInterval(gTimerInterval);
    gBoard = buildBoard(gLevel.SIZE, gLevel.SIZE);
    renderBoard(gBoard);
    gIsWin = false;
    isHint = false;
    setMinesNegsCount(gBoard)
    gClickCounter = 0;
    gRightClickCounter = 0;
    gSeconds = 0;
    gHintCounter = 0;
    gSafeClickCounter = 3;
    gIsSafeClick = false;
    gGame.gameLives = 3;

    document.querySelector('.emoji').innerText = normalEMOJI
    document.querySelector('.hintscount').innerText=gHintCounter

    cleanHintsBgc()
    renderLives()
    renderMines()



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
    if (currCell.isShown) return;
    if (isHint) {
        currCell.isShown = true;
        setTimeout(function () {
            currCell.isShown = false
            currCell.isMarked = false;
            renderBoard(gBoard)
        }, 1000)
        renderBoard(gBoard)
        isHint = false;
        return;
    }
    // if (gIsSafeClick) {
    //     var safeCell = getRandomSafeCell()
    //     gSafeClickCounter++
    //     safeCell.isShown = true
    //     setTimeout(function () {
    //         safeCell.isShown = false
    //     }, 2500)
    //     renderBoard(gBoard)
    //     gIsSafeClick = false;
    // }




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

    if (currCell.minesAroundCount === 0) expandShown(gBoard, currCell, i, j);


}

function cellMarked(i, j) {
    if (gBoard[i][j].isShown) return;
    if (gClickCounter === 0 && gRightClickCounter === 0) setInterval(gameTimer, 1000);
    gRightClickCounter++
    var elCell = document.querySelector(`.cell${i}-${j}`)
    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true;
        elCell.innerText = FLAG
        // gLevel.MINES--
    }
    else {
        gBoard[i][j].isMarked = false;
        elCell.innerText = EMPTY
        // gLevel.MINES++
    }
    renderMines()
    checkVictory()
}

function checkGameOver(i, j) {
    var currCell = gBoard[i][j]
    if (gBoard[i][j].isMine && gGame.gameLives > 0) {
        setTimeout(function () { currCell.isShown = false; renderBoard(gBoard) }, 3000)
        gGame.gameLives--
        alert('You Have: ' + gGame.gameLives + ' lives left')
        renderLives()
    }

    if (gBoard[i][j].isMine && gGame.gameLives === 0) {

        showAllBombs()
        clearInterval(gTimerInterval);
        gSeconds = 0;
        var elTimer = document.querySelector('.timer span')
        elTimer.innerText = gSeconds;
        var elEmoji = document.querySelector('.emoji')
        elEmoji.innerText = loseEMOJI
        alert('Game Over')
        setTimeout(init, 2500)
    }
}

function expandShown(board, elCell, cellI, cellJ) {
    if (gBoard[cellI][cellJ].isMine) return;
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
            if (gBoard[i][j].isMine) gBoard[i][j].isShown = true;
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
        gIsWin = true;
        var elEmoji = document.querySelector('.emoji')
        elEmoji.innerText = winEMOJI;
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
    document.querySelector('.hintscount').innerText=gHintCounter
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


function renderLives() {
    var elLives = document.querySelector('.lives')
    var str = ''
    for (var i = 0; i < gGame.gameLives; i++) {
        str += '💖';
    }
    elLives.innerText = str;
document.querySelector('.livescount').innerText=gGame.gameLives
}


// function safeClick(){
//     gIsSafeClick=true;
// } 
// function getRandomSafeCell() {
//     var isSafeCell = gBoard[getRandomInt(0, gBoard.length)][getRandomInt(0, gBoard[0].length)].isMine
//     if (!isSafeCell) {
//         return isSafeCell;
//     }
//     else getRandomSafeCell()
// }

function renderMines() {
    var elMines = document.querySelector('.mines')
    var str = ''
    for (var i = 0; i < gLevel.MINES; i++) {
        str += '💣'
    }
    elMines.innerText = str;
    document.querySelector('.minescount').innerText=gLevel.MINES;
}