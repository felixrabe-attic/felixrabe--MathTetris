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
    board.progressCounter = 0;
    board.setTimeout();
};

Board = function() {
    this.initializeFields();
    this.speed = 150;
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
    jqCanvas.mousedown(this, function(event) {
        this_ = event.data;
        this_.onMouseDown(event)
    });
    jqCanvas.mouseup(this, function(event) {
        this_ = event.data;
        this_.onMouseUp(event)
    });
    jqCanvas.mousemove(this, function(event) {
        this_ = event.data;
        this_.onMouseMove(event)
    });
};

var Direction = {
    NONE: 0,
    RIGHT: 1,
    DOWN: 2,
    UP: 3,
    LEFT: 4
};

Board.prototype.onMouseDown = function(event) {
    if (event.button == 0) {  // left mouse button
        this.mouseIsDown = true;
        this.mouseDirection = Direction.NONE;
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
        if (mousePointsFarEnough(dx, dy)) {
            if (mousePointsRight(dx, dy)) {
                this.changeDirection("RIGHT");
            } else if (mousePointsDown(dx, dy)) {
                this.changeDirection("DOWN");
            } else if (mousePointsLeft(dx, dy)) {
                this.changeDirection("LEFT");
            }
        } else {
            this.hideFeedback();
        }
    }
};

Board.prototype.onMouseUp = function(event) {
    if (event.button == 0) {  // left mouse button
        this.mouseIsDown = false;
        this.mouseDirection = Direction.NONE;
    }
    this.hideFeedback();
};

Board.prototype.changeDirection = function(direction) {
    this.drawFeedback(direction);
    this.mouseDirection = Direction[direction];
};

mousePointsFarEnough = function(dx, dy) {
    var minimalDistance = 35;
    return Math.sqrt(dx * dx + dy * dy) > minimalDistance;
};

mousePointsRight = function(dx, dy) {
    if (!mousePointsFarEnough(dx, dy)) return false;
    if (dx > 0 && dx > Math.abs(dy)) {
        return true;
    } else {
        return false;
    }
};

mousePointsDown = function(dx, dy) {
    return mousePointsRight(dy, dx);
};

mousePointsLeft = function(dx, dy) {
    return mousePointsRight(-dx, dy);
};

Board.prototype.drawFeedback = function(feedback) {
    if (typeof feedback != "undefined") {
        this.lastFeedback = feedback;
    }
    if (typeof this.lastFeedback != "undefined") {
        var x = canvas.width / 2;
        var y = canvas.height / 2;
        var w = 150;
        var h = 35;
        context.clearRect(x - w / 2, y - h / 2, w, h);
        context.save();
        context.textAlign = "center";
        context.fillText(this.lastFeedback, x, y + 8);
        context.restore();
    }
};

Board.prototype.hideFeedback = function() {
    this.lastFeedback = undefined;
    this.draw();
};

Board.prototype.dropNewPiece = function() {
    this.generateNewFallingPiece();
    this.draw();
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
    this.progressCounter = (this.progressCounter + 1) % 3;
    if (this.mouseDirection == Direction.DOWN) {
        this.progressCounter = 0;
    } else if (this.mouseDirection == Direction.LEFT) {
        this.fallingPiece.moveLeft();
        this.draw();
    } else if (this.mouseDirection == Direction.RIGHT) {
        this.fallingPiece.moveRight();
        this.draw();
    }
    if (this.progressCounter == 0) {
        this.movePieceDownOrMerge();
        this.draw();
    }
    this.setTimeout();
};

Board.prototype.movePieceDownOrMerge = function() {
    var canGo = this.fallingPiece.moveDown();
    if (!canGo) {
        this.mergeFallingPiece();
        this.removeFullRows();
        this.generateNewFallingPiece();
    }
}

Board.prototype.mergeFallingPiece = function() {
    for (var row = 0; row < this.fallingPiece.numberOfPieceRows; row++) {
        var fieldRow = this.fallingPiece.yPosition + row;
        if (fieldRow < 0 || fieldRow >= this.numberOfRows)
            continue;
        for (var column = 0; column < this.fallingPiece.numberOfPieceColumns; column++) {
            var fieldColumn = this.fallingPiece.xPosition + column;
            if (fieldColumn < 0 || fieldColumn >= this.numberOfColumns)
                continue;
            if (this.fallingPiece.piece[row][column])
                this.fields[fieldRow][fieldColumn] = 1;
        }
    }
};

Board.prototype.removeFullRows = function() {
    var rowsNotFull = this.getListOfRowsNotFull();
    var rowsNotFullIndex = rowsNotFull.length - 1;
    var row = this.numberOfRows - 1;  // bottom-up
    while (row > 0) {
        var otherRow = -1;
        if (rowsNotFullIndex >= 0)
            otherRow = rowsNotFull[rowsNotFullIndex];
        for (var column = 0; column < this.numberOfColumns; column++) {
            this.fields[row][column] = otherRow >= 0 ? this.fields[otherRow][column] : 0;
        }
        rowsNotFullIndex--;
        row--;
    }
}

Board.prototype.getListOfRowsNotFull = function() {
    var rowsNotFull = new Array();
    for (var row = 0; row < this.numberOfRows; row++) {
        var removeThisRow = true;
        for (var column = 0; column < this.numberOfColumns; column++) {
            if (!this.fields[row][column]) {
                removeThisRow = false;
                break;
            }
        }
        if (!removeThisRow)
            rowsNotFull.push(row);
    }
    return rowsNotFull;
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

Board.prototype.hasSpaceAt = function(row, column) {
    if (row < 0 || row >= this.numberOfRows)
        return false;
    if (column < 0 || column >= this.numberOfColumns)
        return false;
    if (this.fields[row][column])
        return false;
    return true;
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
    this.rotateClockwise();
    this.rotateClockwise();
    this.rotateClockwise();
};

Piece.prototype.flip = function() {
    for (var row = 0; row < this.numberOfPieceRows; row++) {
        pieceRow = this.piece[row]
        // Flip each row by swapping individual cells:
        for (var column = 0; column < Math.floor(this.numberOfPieceColumns / 2); column++) {
            // Swap
            var firstValue = pieceRow[column];
            var secondValue = pieceRow[pieceRow.length - column - 1];
            pieceRow[column] = secondValue;
            pieceRow[pieceRow.length - column - 1] = firstValue;
        }
    }
};

Piece.prototype.moveLeft = function() {
    var canGo = this.checkSpaceAtOffset(0, -1);
    if (canGo)
        this.xPosition--;
    return canGo;
};

Piece.prototype.moveRight = function() {
    var canGo = this.checkSpaceAtOffset(0, 1);
    if (canGo)
        this.xPosition++;
    return canGo;
};

Piece.prototype.moveDown = function() {
    var canGo = this.checkSpaceAtOffset(1, 0);
    if (canGo)
        this.yPosition++;
    return canGo;
};

Piece.prototype.checkSpaceAtOffset = function(rowOffset, columnOffset) {
    for (var row = 0; row < this.numberOfPieceRows; row++) {
        var boardRow = row + this.yPosition + rowOffset;
        for (var column = 0; column < this.numberOfPieceColumns; column++) {
            var boardColumn = column + this.xPosition + columnOffset;
            if (this.piece[row][column] && !this.board.hasSpaceAt(boardRow, boardColumn)) {
                return false;
            }
        }
    }
    return true;
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
