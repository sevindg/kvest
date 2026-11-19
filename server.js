// Минимальный статический сервер для предпросмотра квеста.
// Поддерживает аргументы --port / --host (и позиционный порт), без зависимостей.
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function argValue(name, fallback) {
  const i = args.findIndex(a => a === name || a.startsWith(name + '='));
  if (i === -1) return fallback;
  const a = args[i];
  return a.includes('=') ? a.split('=')[1] : (args[i + 1] || fallback);
}
const positional = args.find(a => /^\d+$/.test(a));
const PORT = Number(argValue('--port', positional || process.env.PORT || 7100));
const HOST = argValue('--host', '0.0.0.0');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon'
};

const root = __dirname;

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.normalize(path.join(root, urlPath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, HOST, () => {
  console.log(`Quest server: http://localhost:${PORT}/`);
});
