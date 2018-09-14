"use strict";
var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log(msg);
};

page.open("http://127.0.0.1:9000/", function(status) {
    if (status === "success") {
   
        page.evaluate(function() {
            window.angular.element($0).scope().drawClick();
            window.angular.element($0).scope().saveImage();
        });
            phantom.exit(0);
    } else {
      phantom.exit(1);
    }
});
/*
page.open("http://go.drawthe.net/", function(status) {
    if (status === "success") {
            page.evaluate(function() {
                angular.element($0).scope().acedata = `
                title:
                    text: "test"
                `
                angular.element($0).scope().drawClick();
                //angular.element($0).scope().saveImage();
            });
            phantom.exit(0);
    } else {
      phantom.exit(1);
    }
});*/
/*
var page = require('webpage').create();

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function (msg) {
    console.log(msg);
};

page.onAlert = function (msg) {
    console.log(msg);
};

console.log("* Script running in the Phantom context.");
console.log("* Script will 'inject' itself in a page...");
page.open("http://localhost:9000/index.html", function (status) {
    if (status === "success") {
        console.log(page.injectJs("injectme.js") ? "... done injecting itself!" : "... fail! Check the $PWD?!");
        page.evaluateJavaScript(angular.element($0).scope().acedata = `
        title:
            text: "test"
        `)
        page.evaluateJavaScript(angular.element($0).scope().drawClick());
        page.evaluateJavaScript(angular.element($0).scope().saveImage());
        phantom.exit(0);
    } else {
        phantom.exit(1);
    }
});*/