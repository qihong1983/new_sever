var path_arr = [ '/t1.js', '/min/common/js/sea/sea.js', '/t2.js','/t3.js'];


var fs = require('fs');
var http = require('http');
var path = require('path');
var domain = require('domain');

var async = require('async');

var root=__dirname;
var t = require('./t');
var log = t.log;





//console.log(file_path);


function sequest(i, limit) {



	//var file_path = path.join(root, file);
		var d = domain.create();
		var kk = path.join(root, path_arr[i]);
		console.log(kk);
		fs.exists(kk, function( exists ) {


			if ( exists ) {

				fs.readFileSync(kk,'utf8',d.bind(function (err, data) {
	//				
				

						//console.log(data,'asdfsadf');
						console.log(data,'aaaaa');

				}));
			} else {
				var options = {
								hostname : 'img1sw.baidu.com',
								port: 80,
								path: path_arr[i],
								method : 'GET'
							};



							var req = http.getSync(options, function (res) {
								// console.log('状态友：' + res.statusCode);
								// console.log('响应头：' + JSON.stringify(res.headers));
								res.setEncoding('utf8');
								res.on('data', function (chunk) {
									console.log('响应内容：' + chunk);
								});
								req.end('asf');
							});


			}


	});
	

	
	if (i < limit) {
		sequest(i + 1, path_arr.length - 1);
	}

}


sequest(0, path_arr.length - 1);
// console.log(path_arr);