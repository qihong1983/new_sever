var moment = require('moment');
var fs = require('fs');

exports.inc = function(n, callback, timeout) {
    timeout = timeout || 200;
    setTimeout(function() {
        callback(null, n+1);
    }, timeout);
};

exports.fire = function(obj, callback, timeout) {
    timeout = timeout || 200;
    setTimeout(function() {
        callback(null, obj);
    }, timeout);
};

exports.getLocationContent = function(i, file_path, obj, callback, timeout) {
     console.log(i,file_path);
    timeout = timeout || 200;
    setTimeout(function () {

        fs.readFile(file_path, 'utf8', function (err, data) {
            //console.log(err, data);
            //console.log(data);
           // global.temp_data += data;
            callback(i,file_path,data);
        });
        
    },timeout);
};



exports.err = function(errMsg, callback, timeout) {
    timeout = timeout || 200;
    setTimeout(function() {
        callback(errMsg);
    }, timeout);
};

// utils
exports.log = function(msg, obj) {
    process.stdout.write(moment().format('ss.SSS')+'> ');
    if(obj!==undefined) {
        process.stdout.write(msg);
        console.log(obj);
    } else {
        console.log(msg);
    }
};

exports.wait = function(mils) {
    var now = new Date;
    while(new Date - now <= mils);
}