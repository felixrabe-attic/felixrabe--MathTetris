// MathTetris. Copyright (C) 2011 Felix Rabe

$(function() {
    if (!checkForRequiredBrowserFeatures())
        informUserOfMissingBrowserFeatures();
    else
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

function showGreetingScreen() {
    resetCanvas();
    drawBackground();
    drawGreeting();
}

function resetCanvas() {
    canvas = getCanvas();
    canvas.width = gameCanvas.width;
}

function getCanvas() {
    return document.getElementById("gameCanvas");
}

function getContext() {
    return getCanvas().getContext("2d");
}

function drawBackground() {
    canvas = getCanvas();
    context = getContext();
    context.fillStyle = "#333";
    context.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
}

function drawGreeting() {
    canvas = getCanvas();
    context = getContext();
    context.fillStyle = "#fff";
    context.textAlign = "center";
    context.font = "bold 36px sans-serif";
    context.fillText("MathTetris", canvas.width / 2, canvas.height / 2 - 40);
    context.font = "bold 24px sans-serif";
    context.fillText("Click to start a new game", canvas.width / 2, canvas.height / 2 + 40);
}
