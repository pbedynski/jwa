var spdy = require('spdy'),
    fs = require('fs'),
    path = require('path'),
    nodeStatic = require('node-static');
    util = require('util'),
    http = require('http');


// var options = {
// 	key: fs.readFileSync(__dirname + '/keys/spdy-key.pem'),
// 	cert: fs.readFileSync(__dirname + '/keys/spdy-cert.pem'),
// 	ca: fs.readFileSync(__dirname + '/keys/spdy-csr.pem')
// };

var PORT = process.env.VCAP_APP_PORT ||  8081;
var PROCESS_NAME = 'Server-Static';
var LOG_PROCESS_NAME = '('+PROCESS_NAME+')';


var webroot = 'public/';
var file = new(nodeStatic.Server)(webroot, {
  cache: 600
});

http.createServer(function(req, res) {
    req.addListener('end', function(){
        file.serve(req,res, function(err, result){
            if (err) {
                console.error('Error serving %s - %s', req.url, err.message);
                if (err.status === 404 || err.status === 500) {
                    file.serveFile(util.format('/%d.html', err.status), err.status, {}, req, res);
                } else {
                  res.writeHead(err.status, err.headers);
                  res.end();
              }
          } else {
            console.log('%s %s - %s from ',LOG_PROCESS_NAME, req.url, res.message, req.headers.host);
        }
    });
    })
}).listen(PORT, function(){
  console.log('%s Server running at http://localhost:%d/', LOG_PROCESS_NAME, PORT);  
});

