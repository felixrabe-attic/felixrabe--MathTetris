// MathTetris. Copyright (C) 2011 Felix Rabe

var jqCanvas;
var canvas;
var context;

$(function() {
    if (!checkForRequiredBrowserFeatures()) {
        informUserOfMissingBrowserFeatures();
    } else {
        initializeGlobalVariables();
        showGreetingScreen();
    }
})

checkForRequiredBrowserFeatures = function() {
    if (Modernizr.canvastext)
        return true;
    else
        return false;
};

informUserOfMissingBrowserFeatures = function() {
    alert("Sorry, you need a browser with good HTML5 canvas support to play this game.\n" +
          "Tested with Mozilla Firefox 6 and Google Chrome 13.");
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
    context.font = "24px sans-serif";
    context.fillStyle = "#fff";
};

drawGreeting = function() {
    context.save();
    context.textAlign = "center";
    context.font = "bold 36px sans-serif";
    context.fillText("MathTetris", canvas.width / 2, canvas.height / 2 - 40);
    context.font = "bold 24px sans-serif";
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
    this.speed = 200;
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
    this.mouseIsDown = false;
    jqCanvas.mousedown(this, function(event) { event.data.onMouseDown(event) });
    jqCanvas.mouseup(this, function(event) { event.data.onMouseUp(event) });
    jqCanvas.mousemove(this, function(event) { event.data.onMouseMove(event) });
};

Board.prototype.onMouseDown = function(event) {
    if (event.button == 0) {  // left mouse button
        this.mouseIsDown = true;
        var offsetX = event.pageX - canvas.offsetLeft;
        var offsetY = event.pageY - canvas.offsetTop;
        this.mouseDownX = offsetX;
        this.mouseDownY = offsetY;
    }
};

Board.prototype.onMouseMove = function(event) {
    if (this.mouseIsDown) {
        var offsetX = event.pageX - canvas.offsetLeft;
        var offsetY = event.pageY - canvas.offsetTop;
        var dx = offsetX - this.mouseDownX;
        var dy = offsetY - this.mouseDownY;
        if (pointsRight(dx, dy)) {
            this.drawFeedback("-->");
        } else if (pointsDown(dx, dy)) {
            this.drawFeedback("-V-");
        } else if (pointsLeft(dx, dy)) {
            this.drawFeedback("<--");
        } else {
            this.hideFeedback();
            this.draw();
        }
    }
};

Board.prototype.onMouseUp = function(event) {
    if (event.button == 0) {  // left mouse button
        this.mouseIsDown = false;
        var offsetX = event.pageX - canvas.offsetLeft;
        var offsetY = event.pageY - canvas.offsetTop;
        var dx = offsetX - this.mouseDownX;
        var dy = offsetY - this.mouseDownY;
        var canGo = true;
        if (pointsRight(dx, dy)) {
            canGo = this.fallingPiece.moveRight();
        } else if (pointsDown(dx, dy)) {
            canGo = this.fallingPiece.moveDown();
        } else if (pointsLeft(dx, dy)) {
            canGo = this.fallingPiece.moveLeft();
        } else {
            this.hideFeedback();
            this.draw();
        }
        if (!canGo) {
            // TODO: Ring a bell or something
        }
    }
    this.hideFeedback();
    this.draw();
};

pointsFarEnough = function(dx, dy) {
    var minimalDistance = 30;
    return Math.sqrt(dx * dx + dy * dy) > minimalDistance;
};

pointsRight = function(dx, dy) {
    if (!pointsFarEnough(dx, dy)) return false;
    if (dx > 0 && dx > Math.abs(dy)) {
        return true;
    } else {
        return false;
    }
};

pointsDown = function(dx, dy) {
    return pointsRight(dy, dx);
};

pointsLeft = function(dx, dy) {
    return pointsRight(-dx, dy);
};

Board.prototype.drawFeedback = function(feedback) {
    if (typeof feedback != "undefined") {
        this.lastFeedback = feedback;
    }
    if (typeof this.lastFeedback != "undefined") {
        var x = canvas.width / 2;
        var y = canvas.height / 2;
        var w = 200;
        var h = 50;
        context.clearRect(x - w / 2, y - h / 2, w, h);
        context.save();
        context.textAlign = "center";
        context.fillText(this.lastFeedback, x, y);
        context.restore();
    }
};

Board.prototype.hideFeedback = function() {
    this.lastFeedback = undefined;
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
    var canGo = this.fallingPiece.moveDown();
    if (!canGo) {
        this.mergeFallingPiece();
        this.generateNewFallingPiece();
    }
    this.draw();
    this.setTimeout();
};

Board.prototype.mergeFallingPiece = function() {
    for (var row = 0; row < this.fallingPiece.numberOfPieceRows; row++) {
        var fieldRow = this.fallingPiece.yPosition + row;
        if (fieldRow < 0 || fieldRow >= this.numberOfRows)
            continue;
        for (var column = 0; column < this.fallingPiece.numberOfPieceColumns; column++) {
            var fieldColumn = this.fallingPiece.xPosition + column;
            if (fieldColumn <= 0 || fieldColumn >= this.numberOfColumns)
                continue;
            if (this.fallingPiece.piece[row][column])
                this.fields[fieldRow][fieldColumn] = 1;
        }
    }
};

Board.prototype.draw = function() {
    resetCanvas();
    this.drawFields();
    this.fallingPiece.draw();
    this.drawFeedback();
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
    var canGo = true;
    if (this.xPosition <= 0) {
        for (var row = 0; row < this.numberOfPieceRows; row++) {
            for (var column = 0; column < 1 - this.xPosition; column++) {
                if (this.piece[row][column]) {
                    canGo = false;
                    break;
                }
            }
        }
    }
    if (canGo)
        this.xPosition--;
    return canGo;
};

Piece.prototype.moveRight = function() {
    var canGo = true;
    if (this.xPosition >= this.board.numberOfColumns - this.numberOfPieceColumns) {
        for (var row = 0; row < this.numberOfPieceRows; row++) {
            for (var column = this.numberOfPieceColumns - 1; column >= this.board.numberOfColumns - this.xPosition - 1; column--) {
                if (this.piece[row][column]) {
                    canGo = false;
                    break;
                }
            }
        }
    }
    if (canGo)
        this.xPosition++;
    return canGo;
};

Piece.prototype.moveDown = function() {
    var canGo = true;
    if (this.yPosition >= this.board.numberOfRows - this.numberOfPieceRows) {
        for (var row = this.numberOfPieceRows - 1; row >= this.board.numberOfRows - this.yPosition - 1; row--) {
            for (var column = 0; column < this.numberOfPieceColumns; column++) {
                if (this.piece[row][column]) {
                    canGo = false;
                    break;
                }
            }
        }
    }
    if (canGo)
        this.yPosition++;
    // this.flip();
    return canGo;
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
