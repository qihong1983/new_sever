/***
 * @author 齐洪
 * @date 2015-03-26
 * 一个基于Node.js的简单文件服务器并写入url combo功能
 *     combo 例：
 *			 http://127.0.0.1/??t1.js,t2.js?t=333332323,t3.js
 */

/**
 * 依赖的模块
 */




var chalk = require('chalk');



console.log(chalk.red(" __                             __"));
console.log(chalk.yellow("/\\ \\                           /\\ \\"));
console.log(chalk.green("\\ \\ \\___      __     __  __  __\\ \\ \\/'\\"));
console.log(chalk.cyan(" \\ \\  _ `\\  /'__`\\  /\\ \\/\\ \\/\\ \\\\ \\ , <"));
console.log(chalk.gray("  \\ \\ \\ \\ \\/\\ \\L\\.\\_\\ \\ \\_/ \\_/ \\\\ \\ \\\\`\\"));
console.log(chalk.white("   \\ \\_\\ \\_\\ \\__/.\\_\\\\ \\___x___/' \\ \\_\\ \\_\\"));
console.log(chalk.blue("    \\\/_/\\/_/\\/__/\\/_/ \\/__//__/    \\/_/\\/_/")+'	'+chalk.bgWhite(chalk.black("v0.0.1")));
console.log('\n');




var fs = require("fs"),

    http = require("http"),

    url = require("url"),

    path = require("path"),

    mime = require("./mime").mime,

    util = require('util');

    var async = require("async");
    var a_json  = {};

 //    var EventEmitter = require('events').EventEmitter;   
	// var ee = new EventEmitter();
	// // ee.setMaxListeners(15);
	// // ee.setMaxListeners(0);
	// ee._maxListeners = 200;

	

/**
 * www根目录
 */	

var root=__dirname;


if (!path.existsSync(root)) {

    util.error(root+"文件夹不存在，请重新制定根文件夹！");

    process.exit();

}
/** 
 * 配置abc.json
 */

var abc=JSON.parse(fs.readFileSync('./abc.json','utf-8'));



var mock_online_address = abc.mock_online_address;

var online_host = abc.online_host;

var online_port = abc.online_port;

var local_host = abc.local_host;

var local_port = abc.local_port;

    
/**
 * 显示文件夹下面的文件
 */
function listDirectory(parentDirectory, req,res) {

    fs.readdir(parentDirectory, function(error, files) {

        var body = formatBody(parentDirectory, files);

        res.writeHead(200, {

            "Content-Type" : "text/html;charset=utf-8",

            "Content-Length" : Buffer.byteLength(body, 'utf8'),

            "Server":"NodeJs(" + process.version + ")"

        });

        res.write(body, 'utf8');

        res.end();

    });

}

/**
 * 显示文件内容
 */
function showFile(file, req, res) {

	var hashStr = req.url;

	var hash = require("crypto").createHash('sha1').update(hashStr).digest('base64');

    fs.readFile(filename, 'binary', function(err, file) {

        var contentType = mime.lookupExtension(path.extname(filename));

        if(req.headers['if-none-match'] == hash) {

			res.writeHead(304);

			res.end();

			return;

		}

        res.writeHead(200, {

            "Content-Type" : contentType,

            "Content-Length" : Buffer.byteLength(file, 'binary'),

            "Server" : "NodeJs(" + process.version + ")",

            "Etag": hash

        });

        res.write(file,"binary");

        res.end();

    });
}

/**
 * 在Web页面上显示文件列表，格式为<ul><li></li><li></li></ul>
 */
function formatBody(parent, files) {

    var res = [],

        length = files.length;

    res.push("<!doctype>");

    res.push("<html>");

    res.push("<head>");

    res.push("<meta http-equiv='Content-Type' content='text/html;charset=utf-8'></meta>");

    res.push("<title>hawk前端开发http服务器</title>");

    res.push("</head>");

    res.push("<body width='100%'>");
     res.push("<div style='position:relative;width:98%;bottom:5px;height:25px;background:cyan;'>");

    res.push("<div style='margin:0 auto;height:100%;line-height:25px;text-align:center;color:gray; font-family:微软雅黑,黑体'>hawk-前端开发http模块</div>");

    res.push("<ul>");

    files.forEach(function (val, index) {

        var stat = fs.statSync(path.join(parent,val));

        if (stat.isDirectory(val)) {

            val = path.basename(val) + "/";

        } else {

            val = path.basename(val);

        }

        res.push("<li><a style='color:black' href='"+val+"'>"+val+"</a></li>");

    });

    res.push("</ul>");

   

    res.push("</div>");

    res.push("</body>");

    return res.join("");

}

/**
 * 如果文件找不到，显示404错误
 */
function write404(req, res) {

    var body="文件不存在:-(";

    res.writeHead(404, {

        "Content-Type":"text/html;charset=utf-8",

        "Content-Length":Buffer.byteLength(body,'utf8'),

        "Server":"NodeJs(" + process.version + ")"

    });

    res.write(body);

    res.end();

}

/**
 * 判断文件是否存在,路径问题是否带有“/”
 */
 var exists_i = 0;

function existsFile(filename, req, res, pathname) {

	    path.exists(filename, function(exists) {

            if (!exists) {

                util.error('找不到文件'+filename);

                write404(req,res);

            } else {

                fs.stat(filename,function(err,stat){

                    if (stat.isFile()) {

                        showFile(filename, req, res);

                    } else if (stat.isDirectory()){


							listDirectory(filename, req,res);
		     //            if (filename.charAt(filename.length -1) != '\\') {

							// res.writeHead(302, {

						 //       // "Location":pathname+'/'

							// 	 "Location": pathname + '/'
						    
						 //    });

							// res.end();
							//  //return ;
       //              	}

                        //listDirectory(filename,req,res);
                    }
                });
            }
        });
} 

function getFileName(str){

	var reg = /[^\\\/]*[\\\/]+/g;
	
	//xxx\或者是xxx/

	str = str.replace(reg,'');

	return str;

}

/**
 * 如果是combo
 */
function comboPress (pathname, req,res) {


	
	res.setMaxListeners(113100090909090909090909);

	//console.log(res);
	// global.req = req;
	// global.res = res;


	//console.log(pathname);

	var hashStr = req.url;

	var hash = require("crypto").createHash('sha1').update(hashStr).digest('base64');

	var combo_url = [];

	var filename = [];

	var filename_source = [];

	var filename_t = [];

	for (var i = 0; i < pathname.length; i++) {

		filename_source[i] = pathname[i];
		combo_url[i] = '/'+filename_source[i].split(mock_online_address)[1];
		pathname[i] = filename_source[i].split(mock_online_address)[1];
		 

		if (pathname[i] == undefined) {


			combo_url[i] = filename_source[i];
			//取线上
			pathname[i] = online_host+ ':'+online_port+filename_source[i];
			
			//var temp = path.join(root, pathname[i]);

			filename.push(pathname[i]);
		   // return ;
		} else {
			var temp = path.join(root, pathname[i]);

			filename.push(temp);
		}

	}


	

	var temp_file = '';
//var path_arr = [ '/min/static/fa/js/home.js','/test1.js','/min/common/js/sea/sea.js', '/test2.js'];
	//console.log(combo_url);
	//console.log(path_arr);
	console.log(combo_url);
	combo_url.forEach(function (filepath, index) {
		//console.log(__dirname+filepath);
    var k = 'a'+index;
    console.log(k);
    a_json[filepath] = function (callback) {
    	//console.log(__dirname+filepath);
        fs.readFile(__dirname+filepath, 'binary',  function (err, file_content) {
            callback(null,file_content);
            //return ;
        });
    }
});

function getOnlineContent(o) {

    (function (o) {
    	console.log(1111);
        var options = {
            hostname : 'img1sw.baidu.com',
            port: 80,
            path: o,
            method : 'GET'
        };
        http.get(options, function (res) {
        	
        	res.setMaxListeners(100000000000);

            console.log('状态友：' + res.statusCode);
            if (res.statusCode == 404) {
            	write404(global.req, global.res);

 
            } else if (res.statusCode == 200) {

	            // console.log('响应头：' + JSON.stringify(res.headers));
	            res.setEncoding('utf8');
	            var chunks = [];
	            var content = '';
	            var size = 0;  
	            res.on('data', function (chunk) {

	                content += chunk;
	                chunks.push(chunk);

	                res.on('end', function () {
	                    size = size + 1;
	                    chunks.length;
	                    global.combo_file_object[o] = '';

	                    global.combo_file_object[o] = content;

	                    if (size == chunks.length) {
	                    	//console.log('resetsonresetsonresetsonresetsonresetsonresetson');
	                    	//console.log(req.headers['if-none-match']);
	                        resetJson(global.combo_file_object,req,res);        

	                    }
	                    return ;
	                });

	                res.on('error', function () {
	                    console.log('\n\nerror\n\n');
	                });
	            });
            }

        });
    })(o);
}

global.json_object_mumber = 0;

function resetJson(obj) {
    global.json_object_mumber++;

    if (global.json_object_mumber == global.json_undefined_total) {

        global.combo_file_object = obj;
        getLastContent();
    }
}

function getLastContent() {
    var last_res = '';
    
    for (var o in global.combo_file_object) {
        last_res += global.combo_file_object[o];
    }



        res.writeHead(200, {

            "Content-Type" : "text/plain;charset=utf-8",

            "Content-Length" : Buffer.byteLength(last_res, 'utf8'),
			

           // 11334

            "Server":"NodeJs(" + process.version + ")"

        });

        res.write(last_res, 'utf8');

        //console.log(last_res);

        res.end(last_res, 'utf8');
        last_res = '';
   // console.log(last_res);
    console.log(Buffer.byteLength(last_res, 'binary'));
}

function lll(msg) {
    global.combo_file_object = msg;
    global.json_undefined_total = 0;
    var is_hasOnline = true;
    for(var o in msg){ 
        if (global.combo_file_object[o] == undefined) {


            global.json_undefined_total++;

            getOnlineContent(o);

            is_hasOnline = false;

        } else {
        	//global.json_undefined_total++;
        }
    }

    console.log(global.combo_file_object);

    if (is_hasOnline) {
    	console.log('asdf');
    	getLastContent();
    }
    // console.log();
    // getLastContent();

    //resetJson(global.combo_file_object);

}
async.series(a_json,function(err, results) {
    lll(results);
    a_json = {};
});
	
}


function serverStart() {
/**
 * 创建服务器
 */


http.createServer(function (req, res) {

	    //将url地址的中的%20替换为空格，不然Node.js找不到文件

	    var pathname=url.parse(req.url).pathname.replace(/%20/g,' '),

	        re=/(%[0-9A-Fa-f]{2}){3}/g;

		var hashStr = req.url;

		var hash = require("crypto").createHash('sha1').update(hashStr).digest('base64');

	    //能够正确显示中文，将三字节的字符转换为utf-8编码
	    pathname=pathname.replace(re, function (word) {

	        var buffer = new Buffer(3),

	            array = word.split('%');

	        array.splice(0, 1);

	        array.forEach(function (val, index) {

	            buffer[index]=parseInt('0x'+val, 16);

	        });

	        return buffer.toString('utf8');

	    });


		pathname = getFileName(pathname);


		if (url.parse(req.url).pathname.split(mock_online_address)[1] == undefined) {

			if (url.parse(req.url).pathname.split(pathname)[0] === mock_online_address) {

				pathname = url.parse(req.url).pathname.split(mock_online_address)[0] + pathname;
				
			} else if (url.parse(req.url).pathname.split(pathname)[0] === '/') {


				var mock_online_address_temp = mock_online_address.substr(1,mock_online_address.length);

				if (url.parse(req.url).path.indexOf(mock_online_address_temp) > 0) {

					pathname = url.parse(req.url).pathname.split(mock_online_address)[0];

				} else {
					pathname = url.parse(req.url).pathname;
					// var body="文件不存在:-(";

				 //    res.writeHead(404, {

				 //        "Content-Type":"text/html;charset=utf-8",

				 //        "Content-Length":Buffer.byteLength(body,'utf8'),

				 //        "Server":"NodeJs(" + process.version + ")"

				 //    });

				 //    res.write(body);

				 //    res.end();
				}

			} else {

				var mock_online_address_temp = mock_online_address.substr(1,mock_online_address.length);

				if (url.parse(req.url).path.indexOf(mock_online_address_temp) > 0) {

					pathname = url.parse(req.url).pathname.split(mock_online_address)[0];

				} else {
					var body="文件不存在:-(";

				    res.writeHead(404, {

				        "Content-Type":"text/html;charset=utf-8",

				        "Content-Length":Buffer.byteLength(body,'utf8'),

				        "Server":"NodeJs(" + process.version + ")"

				    });

				    res.write(body);

				    res.end();
				}

			}
		} else {

			if (url.parse(req.url).pathname.split(pathname)[0] === mock_online_address) {

				pathname = '/' + pathname;

			} else if (url.parse(req.url).pathname.split(pathname)[0] === '/') {


				pathname = url.parse(req.url).pathname.split(mock_online_address)[1];

			} else {
				//pathname = '/' + pathname;
				//把文件和路径切出来
	
				pathname = url.parse(req.url).pathname.split(mock_online_address)[1];

			}
		}


		if (req.url.indexOf("??") == 1) {

			var arr = req.url.split("??")[1].split(',');

			var files = [];

			arr.forEach(function (v, k) {

		    	files.push('/'+v);

			});



			pathname = files;

			for (var i = 0; i < pathname.length; i++) {

				pathname[i] = pathname[i].split("?")[0];

			}
		}



	    if (pathname=='/') {

	        listDirectory(root,req,res);

	    } else {

	    	//如果等于1,url就是有??
	    	if (req.url.indexOf("??") == 1) {

	    		comboPress(pathname, req, res);

	    	} else {

	    		filename=path.join(root,pathname);

	        	existsFile(filename,req,res,pathname);

	    	}

	    }

	}).listen(local_port, local_host).on('close',function (stat) {

		console.log(stat);

	});
} 


serverStart();









// __                             __
// /\ \                           /\ \
// \ \ \___      __     __  __  __\ \ \/'\
//  \ \  _ `\  /'__`\  /\ \/\ \/\ \\ \ , <
//   \ \ \ \ \/\ \L\.\_\ \ \_/ \_/ \\ \ \\`\
//    \ \_\ \_\ \__/.\_\\ \___x___/' \ \_\ \_\
//     \/_/\/_/\/__/\/_/ \/__//__/    \/_/\/_/

/**
 * 服务器开启提示
 */

 	console.log('\n');
 	var mock_online_address_temp = mock_online_address.substr(1,mock_online_address.length);
	util.debug(


		chalk.blue("服务器开始运行 ")+chalk.cyan('复制根目录地址访问：')+chalk.bgRed("http://"+local_host+":"+local_port+mock_online_address)+'\n'+
		chalk.blue('combo功能示例^_^：') + chalk.bgRed("http://"+local_host+":"+local_port + '/??' + mock_online_address_temp+'t1.js,'+mock_online_address_temp+'t2.js')+'\n'+
		chalk.blue('关闭按：')+chalk.green('ctrl+c\n')+
		chalk.blue('配置文件在根目录：')+chalk.green('abc.json')+'\n'+
		chalk.blue('abc.json配置文件：\n')+chalk.green(JSON.stringify({
												"mock_online_address":mock_online_address ,
												"online_host": online_host,
												"online_port": 80,
												"local_host": local_host,
												"local_port": local_port
											}, null, 4))+'\n'

	);

// chalk.blue('Hello world!');
// chalk.bgBlack('aldskjfalsdjf;ads');

