// MathTetris. Copyright (C) 2011 Felix Rabe

$(document).ready(function() {
    if (checkForRequiredBrowserFeatures()) {
        showGreetingScreen();
    } else {
        informUserOfMissingBrowserFeatures();
    }
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
    gameCanvas = document.getElementById("gameCanvas");
    alert(gameCanvas);
    canvasContext = gameCanvas.getContext("2d");
    canvasContext.fillRect(50, 50, 700, 500);
}
