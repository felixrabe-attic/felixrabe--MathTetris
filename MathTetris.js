// MathTetris. Copyright (C) 2011 Felix Rabe

var jqCanvas;
var canvas;
var context;

$(function() {
    if (!checkForRequiredBrowserFeatures())
        informUserOfMissingBrowserFeatures();
    else
        initializeGlobalVariables();
        showGreetingScreen();
})

function checkForRequiredBrowserFeatures() {
    if (Modernizr.canvastext)
        return true;
    else
        return false;
}

function informUserOfMissingBrowserFeatures() {
    alert("Sorry, you need a browser with good HTML5 canvas support to play this game.");
}

function initializeGlobalVariables() {
    jqCanvas = $("#gameCanvas");
    canvas = jqCanvas[0];
    context = canvas.getContext("2d");
}

function showGreetingScreen() {
    resetCanvasAndBackground();
    drawGreeting();
    waitForClick();
}

function resetCanvasAndBackground() {
    jqCanvas.unbind();
    canvas.width = canvas.width;
    context.fillStyle = "#333";
    context.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
}

function drawGreeting() {
    context.fillStyle = "#fff";
    context.textAlign = "center";
    context.font = "bold 36px sans-serif";
    context.fillText("MathTetris", canvas.width / 2, canvas.height / 2 - 40);
    context.font = "bold 24px sans-serif";
    context.fillText("Click to start a new game", canvas.width / 2, canvas.height / 2 + 40);
}

function waitForClick() {
    jqCanvas.click(startGame);
}

function startGame() {
    resetCanvasAndBackground();
    board = new Board();
    board.startGame();
}

function Board() {
    this.initializeFields();
}

Board.prototype.initializeFields = function() {
    this.numberOfLines = 15;
    this.numberOfColumns = 10;
    this.fields = new Array(this.numberOfLines);
    for (var i = 0; i < this.fields.length; i++) {
        this.fields[i] = new Array(this.numberOfColumns);
        for (var j = 0; j < this.fields[i].length; j++) {
            this.fields[i][j] = 0;
        }
    }
}

Board.prototype.startGame = function() {
}
