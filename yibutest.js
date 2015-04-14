var path_arr = [ '/t1.js', '/min/common/js/sea/sea.js', '/t2.js','/t3.js'];


var fs = require('fs');
var http = require('http');
var path = require('path');
var domain = require('domain');

var async = require('async');

var root=__dirname;
var t = require('./t');
var log = t.log;


function cb(filepath) {
	//console.log(11122);

}

async.forEachLimit(path_arr,path_arr.length, function(item, callback){
    // console.log(item);
     var file_path = path.join(__dirname, item);
     //return callback;

     //console.log(item,callback);
        // fs.readFile(file_path, 'utf8', function (err, data) {
        //     //console.log(err, data);
        //     //console.log(data);
        //    // global.temp_data += data;
        //     //callback(data);
        //     console.log(file_path);
        //     console.log(data);
        //     callback(data);
        // });

	//return callback;

	var version = getFile(file_path, callback);

	console.log(version,'version');


}, function(err){
    //console.log(err,'asdfaf');
});


function getFile(file_path,callback) {
	var version = fs.readFile(file_path, 'utf8', function (err, data) {
		console.log(file_path);
		if (err == null) {
			//console.log(data);
			version  = data;
			//console.log(version);
			callback();
		} else {
			//console.log('has error');
			version = null;
			callback();
		}
    });
	console.log('Called taskDone(), returning...');
	console.log(version);
    return version;
}

// function sequest(i, limit) {


// 	console.log(async.forEachLimit);
// 	var file_path = path.join(root, path_arr[i]);

// 		// function cb(i, file_path,data) {
			
			
// 		// }  
		

// 		async.series([
// 		    function(cb) { 

// 		    	t.getLocationContent(i, file_path, undefined, cb);

// 		    },function () {
// 				// var options = {
// 				// 	hostname : 'img1sw.baidu.com',
// 				// 	port: 80,
// 				// 	path: path_arr[i],
// 				// 	method : 'GET'
// 				// };

// 				// var req = http.get(options, function (res) {
// 				// 	// console.log('状态友：' + res.statusCode);
// 				// 	// console.log('响应头：' + JSON.stringify(res.headers));
// 				// 	res.setEncoding('utf8');
// 				// 	res.on('data', function (chunk) {
// 				// 		console.log('响应内容：' + chunk);
// 				// 	});
// 				// 	req.end('asf');
// 				// });
// 		    }
// 		], function(err, results) {
// 			//console.log(err, results);
// 		    log('err : -->', err); // -> undefined
// 		    log('result : -->', results); // -> [ 3, undefined, null, {}, [], 'abc' ]
// 		  //  console.log(global.temp_data,'asdfasfasdfadsf');
// 		});

	
// 		 if (i < limit) {
// 			sequest(++i, path_arr.length -1);
// 		 }

// }


// sequest(0, path_arr.length-1);


// console.log(path_arr);