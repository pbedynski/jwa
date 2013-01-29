var spdy = require('spdy'),
    fs = require('fs'),
    path = require('path'),
    nodeStatic = require('node-static');
    util = require('util');

var options = {
	key: fs.readFileSync(__dirname + '/keys/spdy-key.pem'),
	cert: fs.readFileSync(__dirname + '/keys/spdy-cert.pem'),
	ca: fs.readFileSync(__dirname + '/keys/spdy-csr.pem')
};

var port = 8081;

var webroot = '../public';
var file = new(nodeStatic.Server)(webroot, {
  cache: 600
});

spdy.createServer(options, function(req, res) {
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
            console.log('%s - %s', req.url, res.message);
        }
    });
    })
}).listen(port);

console.log('Server running at http://localhost:%d/', port);