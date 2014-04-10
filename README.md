kunkka
======

Simple web interface for [peerflix](https://github.com/mafintosh/peerflix)

Usage
-----

1. `npm install`
2. `npm start`
3. Go to `http://localhost:3000`
4. Enter a magnet/torrent link
5. You can access the stream from `http://localhost:8888`

Environment Options

| Name | Description |
| ---- | ----------- |
| `KUNKKA_WATCH_PORT` | Port where peerflix listens (defaults to 8888)
| `KUNKKA_WATCH_URL`  | Url root of peerflix server (defaults to `http://localhost:<KUNKKA_WATCH_PORT>`)

License
-------
http://marksteve.mit-license.org
