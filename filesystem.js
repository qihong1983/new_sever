/***
 * @author 齐洪
 * @date 2015-03-26
 * 一个基于Node.js的简单文件服务器并写入url combo功能
 *     combo 例：
 *			 http://127.0.0.1/??t1.js,t2.js?t=333332323,t3.js
 */


var fs = require("fs"),

    http = require("http"),

    url = require("url"),

    path = require("path"),

    mime = require("./mime").mime,

    util = require('util');

/**
 * www根目录
 */

var root=__dirname;

/** 
 * 配置abc.json
 */

var abc=JSON.parse(fs.readFileSync('./abc.json','utf-8'));

var mock_online_address = abc.mock_online_address;

var online_host = abc.online_host;

var online_port = abc.online_port;

var local_host = abc.local_host;

var local_port = abc.local_port;
    
if (!path.existsSync(root)) {

    util.error(root+"文件夹不存在，请重新制定根文件夹！");

    process.exit();

}
    
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

    res.push("<title>Node.js文件服务器</title>");

    res.push("</head>");

    res.push("<body width='100%'>");

    res.push("<ul>");

    files.forEach(function (val, index) {

        var stat = fs.statSync(path.join(parent,val));

        if (stat.isDirectory(val)) {

            val = path.basename(val) + "/";

        } else {

            val = path.basename(val);

        }

        res.push("<li><a href='"+val+"'>"+val+"</a></li>");

    });

    res.push("</ul>");

    res.push("<div style='position:relative;width:98%;bottom:5px;height:25px;background:yellow;'>");

    res.push("<div style='margin:0 auto;height:100%;line-height:25px;text-align:center'>Powered By Node.js</div>");

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


	var hashStr = req.url;

	var hash = require("crypto").createHash('sha1').update(hashStr).digest('base64');

	var filename = [];
	var filename_source = [];
	var filename_t = [];
	for (var i = 0; i < pathname.length; i++) {

		filename_source[i] = pathname[i];

		pathname[i] = filename_source[i].split(mock_online_address)[1];
		 

		console.log(filename_source[i],'adsfasdf');

		


		console.log(pathname[i],i);

		if (pathname[i] == undefined) {

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

	function seqRequest(i, limit) {
		console.log(filename[i],'------------------------');
		 filename_t[i] = filename[i];
		fs.exists(filename[i], function( exists ) {

			if (exists) {

				fs.readFile(filename[i], 'utf-8', function (err, file) {

					if (err == null) {
						
						temp_file += file;

						if (i < limit) {

							seqRequest(i + 1, filename.length - 1);

						} else {

							var contentType = mime.lookupExtension(path.extname(temp_file));

							if (req.headers['if-none-match'] == hash) {

								res.writeHead(304);

								res.end();

								return;

							}

					        res.writeHead(200,{

					            "Content-Type":contentType,

					            "Content-Length":Buffer.byteLength(temp_file,'utf-8'),

					            "Server":"NodeJs("+process.version+")",

					            "Etag" : hash

					        });

					        res.write(temp_file,"utf-8");

					        res.end();

						}
					} else {
						if (err.code == 'EISDIR') {
							 var body="400 Bad Request";
							res.writeHead(400, {

					        "Content-Type":"text/html;charset=utf-8",

					        "Content-Length":Buffer.byteLength(body,'utf8'),

					        "Server":"NodeJs(" + process.version + ")"

					    });

					    res.write(body);

					    res.end();
						}


					}
				});
			} else {

				// console.log(filename_source[i],'&&&&&&&&');
				// console.log(temp_file);
				// console.log(online_host+':'+online_port+filename_source[i]);
				var reqData='';
				var post_options = {
				    host: online_host,
				    port: online_port,
				    path: filename_source[i],
				    method: 'GET',
				    headers: {
				      'Content-Type': "text/plain;charset=utf-8",
				      'Content-Length': reqData.length
				    }
				  };
					//http.get('http://'+online_host+':'+online_port+filename_source[i], function (res) {
					http.get('http://' + online_host + ':' + filename_source[i], function (response) {

						console.log(response.statusCode);

						if (response.statusCode == 404) {
							var body="文件不存在:-(";

						    res.writeHead(404, {

						        "Content-Type":"text/html;charset=utf-8",

						        "Content-Length":Buffer.byteLength(body,'utf8'),

						        "Server":"NodeJs(" + process.version + ")"

						    });

						    res.write(body);

						    res.end();

						    return ;
						}



				         
				 
				         response.on("data",function (chunk) {
				 
				             temp_file += chunk;
				 
				         }).on("end", function () {
				 
				            res.writeHead(200, {

						        "Content-Type":"text/plain;charset=utf-8",

						        "Content-Length":Buffer.byteLength(temp_file,'utf8'),

						        "Server":"NodeJs(" + process.version + ")"

						    });

						    res.write(temp_file);

						    res.end();
				 
				         }).on('error', function (e) {
				 
				             console.log("Got error: " + e.message);
				 
				         });


					});



   
   

				//url combo的文件没有找到怎么办

				// console.log(filename);
				// console.log(pathname);

				    // var body="文件不存在:-(";

				    // res.writeHead(404, {

				    //     "Content-Type":"text/html;charset=utf-8",

				    //     "Content-Length":Buffer.byteLength(body,'utf8'),

				    //     "Server":"NodeJs(" + process.version + ")"

				    // });

				    // res.write(body);

				    // res.end();
			}

		});
	   
	}

	seqRequest(0, filename.length - 1);
	
}

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
			//console.log(url.parse(req.url).pathname.split(mock_online_address)[1]);
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

		//console.log(files,'files');

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
    		 console.log(pathname,'????????????');
    		comboPress(pathname, req, res);

    	} else {

    		filename=path.join(root,pathname);

        	existsFile(filename,req,res,pathname);

    	}

    }

}).listen(local_port, local_host).on('close',function (stat) {

	console.log(stat);

});

/**
 * 服务器开启提示
 */
util.debug("服务器开始运行 http://"+local_host+":"+local_port+mock_online_address);