var http = require("http");
var fs = require("fs");
var url = require("url");
var path = require("path");
var ejs = require("ejs");
http.createServer(function (req,res) {

    var pathname = url.parse(req.url).pathname;
    if (pathname === "/favicon.ico") {
        return;
    }
    pathname = decodeURI(pathname);
    console.log(pathname);
    var exname = path.extname(pathname);

    if (exname === ".jpg" || exname === "jpeg") {
        console.log("!!!./uploads" + pathname);
        fs.readFile("./uploads/" + pathname,function (err,data) {
            if (err) {
                res.writeHead(404,{"Content-type" : "text/html; charset=utf-8"});
                res.write("找不到图片");
                console.log("res.end()");
                res.end();
                return;
            }
            res.writeHead(200,"Content-type:image/jpg");
            res.write(data);
            res.end();
        })
    } else if (exname === ".html") {
        fs.readFile("./views/category.ejs" , function(err,data) {
            if (err) {
                res.writeHead(404,{"Content-type" : "text/html; charset=utf-8"});
                res.write("找不到html");
                res.end();
                return;
            }
            res.writeHead(200,"Content-type:text/html");
            var dictionary = {
                categoryName:"风景",
                images:["风景/a.jpg","风景/b.jpg"]
            };
            var html = ejs.render(data.toString(),dictionary);
            res.write(html);
            res.end();
        })
    }

}).listen("3001","127.0.0.1");