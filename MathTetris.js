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
    resetCanvas();
    drawGreeting();
    jqCanvas.click(startGame);
}

function resetCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#333";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGreeting() {
    context.fillStyle = "#fff";
    context.textAlign = "center";
    context.font = "bold 36px sans-serif";
    context.fillText("MathTetris", canvas.width / 2, canvas.height / 2 - 40);
    context.font = "bold 24px sans-serif";
    context.fillText("Click to start a new game", canvas.width / 2, canvas.height / 2 + 40);
}

function startGame() {
    jqCanvas.unbind();
    board = new Board();
    board.dropNewPiece();
}

function Board() {
    this.initializeFields();
    this.speed = 800;
    this.fallingPiece = null;
}

Board.prototype.initializeFields = function() {
    this.numberOfLines = 20;
    this.numberOfColumns = 14;
    this.fieldSize = 25;
    this.fieldPadding = 3;
    this.fieldDelta = this.fieldSize + this.fieldPadding;

    this.fields = new Array(this.numberOfLines);
    for (var i = 0; i < this.numberOfLines; i++) {
        this.fields[i] = new Array(this.numberOfColumns);
        for (var j = 0; j < this.numberOfColumns; j++) {
            this.fields[i][j] = false;
        }
    }
}

Board.prototype.dropNewPiece = function() {
    this.generateNewFallingPiece();
    this.draw();
    setTimeout(this.onTimeout, this.speed);
}

Board.prototype.generateNewFallingPiece = function() {
    this.fallingPiece = new Piece(this, Math.floor(this.numberOfColumns / 2), this.numberOfLines - 2);
}

Board.prototype.draw = function() {
    resetCanvas();
    this.drawFields();
    this.fallingPiece.draw();
}

Board.prototype.drawFields = function() {
    for (var row = 0; row < this.numberOfLines; row++) {
        for (var column = 0; column < this.numberOfColumns; column++) {
            if (this.fieldIsOccupied(row, column))
                this.drawField(row, column, "#fff");
            else
                this.drawField(row, column, "#555");
        }
    }
}

Board.prototype.fieldIsOccupied = function(row, column) {
    return this.fields[row][column];
}

Board.prototype.drawField = function(row, column, fillStyle) {
    context.fillStyle = fillStyle;
    context.fillRect(this.columnToCanvasX(column), this.rowToCanvasY(row), this.fieldSize, this.fieldSize);
}

Board.prototype.columnToCanvasX = function(column) {
    return (canvas.width - this.numberOfColumns * this.fieldDelta + this.fieldPadding) / 2 + column * this.fieldDelta + 0.5;
}

Board.prototype.rowToCanvasY = function(row) {
    return canvas.height - 150 - this.fieldDelta * row + 0.5;
}

Board.prototype.onTimeout = function() {
    this.fallingPiece.moveDown();
    this.draw();
}

function Piece(board, xPosition, yPosition) {
    this.board = board;
    this.xPosition = xPosition;
    this.yPosition = yPosition;

    PIECE_TEMPLATES = [

            [ 0, 0, 0, 0,
              1, 1, 1, 1,
              0, 0, 0, 0,
              0, 0, 0, 0 ],

            [ 0, 0, 0, 0,
              1, 1, 1, 0,
              0, 1, 0, 0,
              0, 0, 0, 0 ],

            [ 0, 0, 0, 0,
              1, 1, 0, 0,
              1, 1, 0, 0,
              0, 0, 0, 0 ],

            [ 0, 0, 0, 0,
              1, 1, 0, 0,
              0, 1, 1, 0,
              0, 0, 0, 0 ],

            [ 0, 0, 0, 0,
              1, 1, 1, 0,
              0, 0, 1, 0,
              0, 0, 0, 0 ],

        ];

    this.pieceTemplate = PIECE_TEMPLATES[Math.floor(Math.random() * PIECE_TEMPLATES.length)];
    this.flip = Math.random() >= 0.5;
    this.rotation = Math.floor(Math.random() * 4);
}

Piece.prototype.moveDown = function() {
    this.yPosition -= 1;
}

Piece.prototype.draw = function() {

}
