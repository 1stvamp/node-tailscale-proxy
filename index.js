var http = require('http'),
    httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader('Host', 'foobar');
});

var server = http.createServer(function(req, res) {
  proxy.web(req, res, {
    target: 'http://127.0.0.1:5050'
  });
});

console.log("listening on port 5050")
server.listen(5050);
