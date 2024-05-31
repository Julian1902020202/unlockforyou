import createBareServer from '@tomphttp/bare-server-node';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import serveStatic from 'serve-static';
import * as custombare from './static/customBare.mjs';
import fs from 'fs';

const PORT = process.env.PORT || 3000;
const bareServer = createBareServer('/bare/', {
  logErrors: false,
  localAddress: undefined
});

const serve = serveStatic(join(
  dirname(fileURLToPath(import.meta.url)),
  'static'
), {
  fallthrough: false,
  maxAge: 5 * 60 * 1000
});

const serveStaticGoogle = serveStatic(join(
  dirname(fileURLToPath(import.meta.url)),
  'static/google'
), {
  fallthrough: false,
  maxAge: 5 * 60 * 1000
});

const server = http.createServer();

server.on('request', (request, response) => {
  try {
    if (custombare.route(request, response)) return true;

    if (bareServer.shouldRoute(request)) {
      bareServer.routeRequest(request, response);
    } else {
      // Serve from /static/google if URL starts with /static/google
      if (request.url.startsWith('/static/google')) {
        serveStaticGoogle(request, response, err => handleServeStaticError(err, request, response));
      } else {
        // Default serve from /static
        serve(request, response, err => handleServeStaticError(err, request, response));
      }
    }
  } catch (e) {
    response.writeHead(500, "Internal Server Error", {
      "Content-Type": "text/plain"
    });
    response.end(e.stack);
  }
});

function handleServeStaticError(err, request, response) {
  if (err) {
    response.writeHead(err?.statusCode || 500, null, {
      "Content-Type": "text/plain"
    });
    response.end(err?.stack);
  } else {
    // Inject custom JavaScript into HTML responses
    if (request.url.endsWith('.html')) {
      const filePath = join(dirname(fileURLToPath(import.meta.url)), 'static', request.url);

      fs.readFile(filePath, 'utf8', (err, fileContent) => {
        if (err) {
          response.writeHead(500, {
            "Content-Type": "text/plain"
          });
          response.end('Failed to load file');
        } else {
          // Read the custom JavaScript file
          fs.readFile(join(dirname(fileURLToPath(import.meta.url)), 'static/customScript.js'), 'utf8', (err, customScript) => {
            if (err) {
              response.writeHead(500, {
                "Content-Type": "text/plain"
              });
              response.end('Failed to load custom script');
            } else {
              // Modify the response to include the custom script
              response.writeHead(200, {
                "Content-Type": "text/html"
              });
              response.write(fileContent.replace('</body>', `<script>${customScript}</script></body>`));
              response.end();
            }
          });
        }
      });
    } else {
      response.end();
    }
  }
}

server.on('upgrade', (req, socket, head) => {
  if (bareServer.shouldRoute(req)) {
    bareServer.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

server.listen(PORT);

if (process.env.UNSAFE_CONTINUE)
  process.on("uncaughtException", (err, origin) => {
    console.error(`Critical error (${origin}):`);
    console.error(err);
    console.error("UNSAFELY CONTINUING EXECUTION");
    console.error();
  });

console.log(`Server running at http://localhost:${PORT}/.`);
