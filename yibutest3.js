var Wind = require("wind");
var Task =  Wind.Async.Task;

var A = eval(Wind.compile("async", function () {
    console.log("Start A");
    $await(Wind.Async.sleep(3000));
    console.log("Finish A");
}));

var B = eval(Wind.compile("async", function () {
    console.log("Start B");
    $await(Wind.Async.sleep(5000));
    console.log("Finish B");
}));

var C = eval(Wind.compile("async", function () {
    console.log("Start C");
    console.log("Finish C");
}));

var task = eval(Wind.compile("async", function () {
    $await(A());
    $await(B());
    $await(C());
}));
task().start();