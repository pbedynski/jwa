var spdy = require('spdy'),
	fs = require('fs'),
	path = require('path');

var options = {
	key: fs.readFileSync(__dirname + '/keys/spdy-key.pem'),
	cert: fs.readFileSync(__dirname + '/keys/spdy-cert.pem'),
	ca: fs.readFileSync(__dirname + '/keys/spdy-csr.pem')
};

var port = 8081;

spdy.createServer(options, function(request, response) {
     
    var filePath = '../public/' + request.url;
    if (filePath == './public/')
        filePath = './index.html';
   var extname = path.extname(filePath);
   switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.html':
            contentType = 'text/html';
            break;
        case '.jpg':
            contentType = 'image';
            break;
        case '.png':
            contentType = 'image';
            break;           
    }


    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });

}).listen(port);

console.log('Server running at http://localhost:%d/', port);