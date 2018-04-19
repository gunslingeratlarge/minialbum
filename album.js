var http = require("http");
var url = require("url");
var fs = require("fs");
var path = require("path");
var ejs = require("ejs");
var querystring = require("querystring");
var sd = require("silly-datetime");
var formidable = require("formidable");
var util = require("util");
var server = http.createServer(function(req,res) {
    var requrl = req.url;
    var pathname = url.parse(requrl).pathname;
    if (pathname === "/favicon.ico") {
        return;
    }
    pathname = decodeURI(pathname);
    //如果是首页的话，就读取首页
    if (pathname === "/") {
        pathname = "/index";
    }
    var extname = path.extname(pathname);
    var dirs = [];
    var files  = fs.readdirSync("./uploads");
    console.log(files[0]);
    for (var i = 0; i < files.length; i++) {
        var stats = fs.statSync("./uploads/" + files[i]);
        if (stats.isDirectory()) {
            dirs.push(files[i]);
        }
    }
    console.log("xxxx:" +pathname.substr(1));
    if (pathname.indexOf(".") !== -1) {
        //当是请求文件的时候。注意这里文件的路径，所以我们前端写的路径应该是相对这个js文件的路径（或者说命令提示符的路径？）
        fs.readFile("."+ pathname, function (err,data) {
            getMime(extname,function(mime) {
                res.writeHead(200,{"Content-type":mime});
                res.end(data);
            });

        })
    } else {
        //当是路径（文件夹）之类
        if (pathname === "/index") {
            fs.readFile("./views/index.html", function (err, data) {
                res.writeHead(200, {"Content-type": "text/html;charset=utf-8"});
                res.end(data);
            });
            //当是文件夹页，显示所有的文件夹
        } else if (pathname === "/dirlist") {
            fs.readFile("./views/dirlist.ejs", function (err,data) {
                var template = data.toString();
                var dictionary = {
                    titles:dirs
                };
                var html = ejs.render(template,dictionary);
                res.writeHead(200, {"Content-type": "text/html;charset=utf-8"});
                res.end(html);
            });
        } else if (dirs.indexOf(pathname.substr(1)) !== -1){
            //如果请求的这个路径在dirs中
            fs.readFile("./views/category.ejs",function (err,data) {
                var template = data.toString();
                var pics = fs.readdirSync("./uploads" + pathname);
                for (var i = 0; i < pics.length; i++) {
                    pics[i] = "uploads" + pathname + "/" + pics[i];
                }
                var dictionary = {
                    categoryName:pathname.substr(1),
                    images:pics
                };
                var html = ejs.render(template,dictionary);
                res.writeHead(200, {"Content-type": "text/html;charset=utf-8"});
                res.end(html);
            })
        } else if (pathname === "/createdir") {
            var query =  url.parse(requrl).query;
            var dirtobe = querystring.parse(query).dir;
            console.log(dirtobe);
            fs.mkdir("./uploads/" + dirtobe,function (err) {
               res.write("mkdir " + dirtobe + " success");
               res.end();
            });


        }  else if (pathname === "/admin") {
            fs.readFile("./views/admin.ejs",function (err,data) {
                var template = data.toString();
                var dictionary = {
                  dirs:dirs
                };
                var html = ejs.render(template,dictionary);
                res.writeHead(200, {"Content-type": "text/html;charset=utf-8"});
                res.end(html);
                console.log("write admin");
            })
        } else if (pathname === "/uploadpic" && req.method.toLowerCase() === "post") {
            console.log(1);
            var form = new formidable.IncomingForm();
            form.uploadDir = "./uploads";
            form.parse(req,function (err,fields,files) {
                //var ttt = sd.format(new Date(), 'YYYYMMDDHHmmss');
                //var ran = parseInt(Math.random() * 89999 + 10000);
                //var extname = path.extname(files.uploadingpic.name);
                console.log(util.inspect({fields: fields, files: files}));
                var uploaddir = fields.uploaddir;
                var name = files.uploadingpic.name;
                fs.rename(files.uploadingpic.path,"./uploads/"+uploaddir + "/" + name,function(err){
                    if(err){
                        throw err;
                    }
                    res.writeHead(200, {'content-type': 'text/plain;charset=utf-8'});
                    res.end("成功");
                });
            });
        }
    }
});
server.listen(3000,"127.0.0.1");

function getMime(extname, callback) {
    fs.readFile("./mime.json",function (err,data) {
       var  MimeJson = JSON.parse(data);
       var mime = MimeJson[extname] || "text/plain";
       callback(mime);
    })
}