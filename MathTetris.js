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
    context.clearRect(0, 0, canvas.width, canvas.height);
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
    board = new Board();
    board.startGame();
}

function Board() {
    this.initializeFields();
}

Board.prototype.initializeFields = function() {
    this.numberOfLines = 15;
    this.numberOfColumns = 10;
    this.fieldSize = 30;
    this.fieldPadding = 3;
    this.fieldDelta = this.fieldSize + this.fieldPadding;

    this.fields = new Array(this.numberOfLines);
    for (var i = 0; i < this.numberOfLines; i++) {
        this.fields[i] = new Array(this.numberOfColumns);
        for (var j = 0; j < this.numberOfColumns; j++) {
            this.fields[i][j] = Math.random() > 0.8;
        }
        this.fields[i][0] = true;
    }
}

Board.prototype.startGame = function() {
    jqCanvas.click(this.mouseClicked);
    this.redraw();
}

Board.prototype.redraw = function() {
    resetCanvasAndBackground();
    for (var i = 0; i < this.numberOfLines; i++) {
        var y = canvas.height - 200 - this.fieldDelta * i;
        for (var j = 0; j < this.numberOfColumns; j++) {
            var x = (canvas.width - this.numberOfColumns * this.fieldDelta + this.fieldPadding) / 2 + j * this.fieldDelta;
            if (this.fields[i][j])
                context.fillStyle = "#fff";
            else
                context.fillStyle = "#339";
            context.fillRect(x, y, this.fieldSize, this.fieldSize);
        }
    }
}

Board.prototype.mouseClicked = function(event) {

}
