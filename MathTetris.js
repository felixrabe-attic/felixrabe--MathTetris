// MathTetris. Copyright (C) 2011 Felix Rabe

var jqCanvas;
var canvas;
var context;

$(function() {
    setTimeout(function() {
        if (!checkForRequiredBrowserFeatures()) {
            informUserOfMissingBrowserFeatures();
        } else {
            initializeGlobalVariables();
            showGreetingScreen();
        }
    }, 200);
})

getProperties = function(object) {
    var keys = [];
    for (var key in object)
        if (object.hasOwnProperty(key))
            keys.push(key);
    keys.sort();
    return keys;
};

checkForRequiredBrowserFeatures = function() {
    if (Modernizr.canvastext && Modernizr.fontface)
        return true;
    else
        return false;
};

informUserOfMissingBrowserFeatures = function() {
    alert("Sorry, you need a browser with good HTML5 canvas and font-face support to play this game.");
};

initializeGlobalVariables = function() {
    jqCanvas = $("#gameCanvas");
    canvas = jqCanvas[0];
    context = canvas.getContext("2d");
};

showGreetingScreen = function() {
    resetCanvas();
    drawGreeting();
    jqCanvas.click(startGame);
};

resetCanvas = function() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#666";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.font = "16px Oswald";
    context.fillStyle = "#fff";
};

drawGreeting = function() {
    context.save();
    context.textAlign = "center";
    context.font = "bold 36px Oswald, sans-serif";
    context.fillText("MathTetris", canvas.width / 2, canvas.height / 2 - 40);
    context.font = "bold 24px Oswald, sans-serif";
    context.fillText("Click to start a new game", canvas.width / 2, canvas.height / 2 + 40);
    context.restore();
};

startGame = function() {
    jqCanvas.unbind();
    board = new Board();
    board.bindUserEvents();
    board.dropNewPiece();
};

Board = function() {
    this.initializeFields();
    this.speed = 600;
    this.fallingPiece = null;
};

Board.prototype.initializeFields = function() {
    this.numberOfRows = 20;
    this.numberOfColumns = 14;
    this.fieldSize = 25;
    this.fieldPadding = 3;
    this.fieldDelta = this.fieldSize + this.fieldPadding;

    this.fields = new Array(this.numberOfRows);
    for (var i = 0; i < this.numberOfRows; i++) {
        this.fields[i] = new Array(this.numberOfColumns);
        for (var j = 0; j < this.numberOfColumns; j++) {
            this.fields[i][j] = false;
        }
    }
};

Board.prototype.bindUserEvents = function() {
    jqCanvas.mousedown(this, function(event) { event.data.onMouseDown(event) });
    jqCanvas.mouseup(this, function(event) { event.data.onMouseUp(event) });
    jqCanvas.mousemove(this, function(event) { event.data.onMouseMove(event) });
};

Board.prototype.onMouseDown = function(event) {
    alert(getProperties(event));
};

Board.prototype.onMouseUp = function(event) {
};

Board.prototype.onMouseMove = function(event) {
    var offsetX = event.pageX - canvas.offsetLeft;
    var offsetY = event.pageY - canvas.offsetTop;
    this.drawFeedback(offsetX + " " + offsetY);
};

Board.prototype.drawFeedback = function(feedback) {
    var x = 400;
    var y = canvas.height - 80;
    context.clearRect(x, y, 200, 50);
    context.save();
    context.fillText(feedback, x + 10, y + 30);
    context.restore();
};

Board.prototype.dropNewPiece = function() {
    this.generateNewFallingPiece();
    this.draw();
    this.setTimeout();
};

Board.prototype.generateNewFallingPiece = function() {
    this.fallingPiece = new Piece(this);
};

Board.prototype.setTimeout = function() {
    if (typeof this.timeoutID == "number") {
        clearTimeout(this.timeoutID);
    }
    this.timeoutID = setTimeout(function(that) { that.progress(); }, this.speed, this);
};

Board.prototype.progress = function() {
    this.fallingPiece.moveDown();
    this.draw();
    this.setTimeout();
};

Board.prototype.draw = function() {
    resetCanvas();
    this.drawFields();
    this.fallingPiece.draw();
};

Board.prototype.drawFields = function() {
    for (var row = 0; row < this.numberOfRows; row++) {
        for (var column = 0; column < this.numberOfColumns; column++) {
            if (this.fieldIsOccupied(row, column))
                this.drawField(row, column, "#fcc");
            else
                this.drawField(row, column, "#555");
        }
    }
};

Board.prototype.fieldIsOccupied = function(row, column) {
    return this.fields[row][column];
};

Board.prototype.drawField = function(row, column, fillStyle) {
    context.save();
    context.fillStyle = fillStyle;
    context.fillRect(this.columnToCanvasX(column), this.rowToCanvasY(row), this.fieldSize, this.fieldSize);
    context.restore();
};

Board.prototype.columnToCanvasX = function(column) {
    return Math.floor((canvas.width - this.numberOfColumns * this.fieldDelta + this.fieldPadding) / 2 + column * this.fieldDelta);
};

Board.prototype.rowToCanvasY = function(row) {
    return Math.floor(canvas.height - 150 - this.fieldDelta * (this.numberOfRows - row) + this.fieldPadding);
};

Piece = function(board) {
    this.board = board;

    var PIECE_TEMPLATES = [
            [ [ 0, 0, 0, 0 ],
              [ 1, 1, 1, 1 ],
              [ 0, 0, 0, 0 ],
              [ 0, 0, 0, 0 ] ],

            [ [ 0, 0, 0, 0 ],
              [ 1, 1, 1, 0 ],
              [ 0, 1, 0, 0 ],
              [ 0, 0, 0, 0 ] ],

            [ [ 0, 0, 0, 0 ],
              [ 1, 1, 0, 0 ],
              [ 1, 1, 0, 0 ],
              [ 0, 0, 0, 0 ] ],

            [ [ 0, 0, 0, 0 ],
              [ 1, 1, 0, 0 ],
              [ 0, 1, 1, 0 ],
              [ 0, 0, 0, 0 ] ],

            [ [ 0, 0, 0, 0 ],
              [ 1, 1, 1, 0 ],
              [ 0, 0, 1, 0 ],
              [ 0, 0, 0, 0 ] ]
        ];

    this.numberOfPieceRows = PIECE_TEMPLATES[0].length;
    this.numberOfPieceColumns = this.numberOfPieceRows;  // square

    this.xPosition = Math.floor((this.board.numberOfColumns - this.numberOfPieceColumns) / 2);
    this.yPosition = 0;

    this.piece = PIECE_TEMPLATES[Math.floor(Math.random() * PIECE_TEMPLATES.length)];
    if (Math.random() >= 0.5)
        this.flip();
    var numberOfDirections = 4;
    for (var i = 0; i < Math.floor(Math.random() * numberOfDirections); i++)
        this.rotateClockwise();
};

Piece.prototype.rotateClockwise = function() {
    var pieceHeight = this.piece.length;
    var pieceWidth = this.piece[0].length;

    var newPiece = new Array(pieceWidth);  // columns become rows
    for (var newRow = 0; newRow < pieceWidth; newRow++) {
        newPiece[newRow] = new Array(pieceHeight);  // rows become columns
        for (var newColumn = 0; newColumn < pieceHeight; newColumn++) {
            newPiece[newRow][newColumn] = this.piece[pieceHeight - newColumn - 1][newRow];
        }
    }

    this.piece = newPiece;
};

Piece.prototype.rotateCounterClockwise = function() {
    var pieceHeight = this.piece.length;
    var pieceWidth = this.piece[0].length;

    var newPiece = new Array(pieceWidth);  // columns become rows
    for (var newRow = 0; newRow < pieceWidth; newRow++) {
        newPiece[newRow] = new Array(pieceHeight);  // rows become columns
        for (var newColumn = 0; newColumn < pieceHeight; newColumn++) {
            newPiece[newRow][newColumn] = this.piece[newColumn][pieceWidth - newRow - 1];
        }
    }

    this.piece = newPiece;
};

Piece.prototype.flip = function() {
    for (var row = 0; row < this.numberOfPieceRows; row++) {
        pieceRow = this.piece[row]
        // Flip each row by swapping individual cells:
        for (var column = 0; column < Math.floor(this.numberOfPieceColumns / 2); column++) {
            // Swap
            var firstValue = pieceRow[column];
            var secondValue = pieceRow[pieceRow.length - column];
            pieceRow[column] = secondValue;
            pieceRow[pieceRow.length - column] = firstValue;
        }
    }
};

Piece.prototype.moveLeft = function() {
    this.xPosition--;
};

Piece.prototype.moveRight = function() {
    this.xPosition++;
};

Piece.prototype.moveDown = function() {
    this.yPosition++;
    // this.flip();
};

Piece.prototype.draw = function() {
    for (var pieceRow = 0; pieceRow < this.numberOfPieceRows; pieceRow++) {
        var boardRow = pieceRow + this.yPosition;
        for (var pieceColumn = 0; pieceColumn < this.numberOfPieceColumns; pieceColumn++) {
            var boardColumn = pieceColumn + this.xPosition;
            if (this.fieldIsOccupied(pieceRow, pieceColumn))
                this.board.drawField(boardRow, boardColumn, "#cfc");
            // else do NOT draw at all
        }
    }
};

Piece.prototype.fieldIsOccupied = function(row, column) {
    return this.piece[row][column] == 1;
};
