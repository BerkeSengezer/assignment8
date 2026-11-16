# Assignment 8 — Study Programme Server

A small information server for a fictional Web Development programme. It uses Node.js, Express 5 and plain HTML, CSS and JavaScript. The course data is kept in `server.js`; there is no database or login.

## Install and run

Use Node.js 26 LTS with npm. This project was checked with Node.js v26.13.1 and Express 5.3.0.

```sh
git clone https://github.com/BerkeSengezer/assignment8.git
cd assignment8
npm ci
npm start
```

Open [http://localhost:3000](http://localhost:3000). Stop the server with Ctrl+C.

For development, use `npm run dev`. It runs `node --watch server.js`, which restarts the server after a file change.

To choose another port on macOS/Linux:

```sh
PORT=4000 npm start
```

Then open [http://localhost:4000](http://localhost:4000). Without `PORT`, the server uses 3000.

## Files

```text
assignment8/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

`server.js` contains the data, middleware and routes. `public/index.html` introduces the programme, `styles.css` styles the page, and `app.js` sends requests and displays the results. The npm files define the dependency versions and run commands.

## Routes

| Method | Path | Result |
| --- | --- | --- |
| GET | `/` | Programme page |
| GET | `/hello` | Plain-text greeting from Berke |
| GET | `/robots.txt` | Plain-text crawler rules |
| GET | `/old-page` | 302 redirect to `/hello` |
| GET | `/api/courses` | Array of three courses |
| GET | `/api/status` | Status, Node version and process uptime |
| GET | `/api/headers` | User-Agent and Accept headers |
| POST | `/api/subscribe` | 201 with `{"subscribed":true}` |
| GET | `/api/admin` | 403 with `{"error":"Forbidden"}` |
| GET | `/api/stats` | Number of requests received |
| Any | Unmatched path starting with `/api` | 404 JSON error |
| Any | Other unmatched path | 404 plain-text message |

The subscription route is only an HTTP example: it does not store a subscription or read a request body. Missing User-Agent or Accept headers are represented by `null`.

## Middleware and counting

The logger runs first and prints an ISO timestamp, the request method and the original URL, including its query string. The counter runs next, before `express.static` and the routes. Both middleware functions call `next()` so the next handler can run.

All incoming requests are counted, including the page, CSS, JavaScript, favicon requests, redirects, 403s, 404s and `/api/stats` itself. This placement makes the counter describe traffic arriving at the server rather than only successful API calls. It resets to zero when the process restarts; the first `/api/stats` request on a fresh server returns 1.

The 404 handler is last and uses `app.use`, so it also handles unmatched methods without the old Express 4 `'*'` route syntax. The public directory is resolved from `import.meta.url`, so starting Node from a different working directory does not break the page.

## Testing evidence

The outputs below were captured from the running server on 16 November 2026. Dates and ETags are shown as received; dynamic values can differ on another run. `--include` prints the status line and headers, and the redirect command intentionally does not use `--location` so that the 302 response is visible.

```sh
curl --include --silent --show-error http://localhost:3000/api/courses
```

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 173
ETag: W/"ad-gxZC2DN9+iZeg20vbYQ9fpevASs"
Date: Mon, 16 Nov 2026 16:58:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":"WEB101","title":"Web Programming","credits":6},{"id":"PRG101","title":"Programming Fundamentals","credits":5},{"id":"DSN101","title":"Interface Design","credits":4}]
```

```sh
curl --include --silent --show-error --request POST http://localhost:3000/api/subscribe
```

```http
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-oWAPIqDXuocNexKhPYW9ayyk98c"
Date: Mon, 16 Nov 2026 16:58:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```

```sh
curl --include --silent --show-error http://localhost:3000/api/admin
```

```http
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-TLNzmZqKxaTuFdX/dVWWPBu44/c"
Date: Mon, 16 Nov 2026 16:58:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}
```

```sh
curl --include --silent --show-error http://localhost:3000/old-page
```

```http
HTTP/1.1 302 Found
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 28
Date: Mon, 16 Nov 2026 16:58:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Found. Redirecting to /hello
```

```sh
curl --include --silent --show-error http://localhost:3000/api/missing
```

```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Mon, 16 Nov 2026 16:58:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

```sh
curl --include --silent --show-error http://localhost:3000/missing
```

```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 14
ETag: W/"e-vDAjs2Bjp2gdskaBRytU+hHw1Ow"
Date: Mon, 16 Nov 2026 16:58:16 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Page not found
```

### Other checks

- All seven browser buttons were tried. The subscribe button sent POST, and 403/404 responses were displayed without breaking the page.
- With the server stopped, the page displayed a request failure and re-enabled the buttons. After restarting the server, another click succeeded.
- A fresh server was started from a different working directory on port 3002. The page, CSS and JavaScript still loaded.
- The request counter increased for static files and missing routes as well as successful API requests.
- A clean `npm ci` completed using the committed lockfile.
