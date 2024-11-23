#!/usr/bin/env node

const http = require('http');
const httpProxy = require('http-proxy');
const portfinder = require('portfinder');
const { spawn } = require('node:child_process');

const proxy = httpProxy.createProxyServer({});

if (process.argv[2] == '-h' || process.argv[2] == '--help') {
  console.log(`USAGE: @1stvamp/proxy TARGET_URL
TARGET_URL like a local client site, e.g.: http://acme.localhost.me:3001

-h, --help    This help message.`);
  process.exit(0);
}

const target = process.argv[2];
const domain = (new URL(target)).hostname;

proxy.on('proxyReq', (proxyReq, req, res, options) => {
  proxyReq.setHeader('Host', domain);
});
proxy.on('error', (err) => {
  console.error(err);
});

portfinder.getPort((err, port) => {
  const server = http.createServer((req, res) => {
    proxy.web(req, res, {
      target: target
    });
  });

  server.listen(port);

  const ts = spawn('tailscale', ['serve', port.toString()]);
  ts.stdout.on('data', (data) => {
    console.log(`[tailscale] ${data}`);
  });
  ts.stderr.on('data', (data) => {
    console.error(`[tailscale] ${data}`);
  });

  const afton = () => {
    ts.kill('SIGINT');
    process.exit()
  };
  process.on('exit', afton);
  process.on('SIGINT', afton);
  process.on('SIGTERM', afton);
  process.on('SIGUSR1', afton);
  process.on('SIGUSR2', afton);
  process.on('uncaughtException', (err) => {
    console.error(err);
    process.exit(1)
  });
});
