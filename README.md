TRASHCHAT
---------

It's pure garbage!

Basic chat to showcase ws without 6 trillion dependencies.

Protocol and user case:
1) Users Access Page
2) Webserver serves .html client page
3) Users' client page starts websocket with webserver.
4) websocket server provides username and userlist.
5) websocket server broadcasts to all clients about new user

On push:
1) Clients push message with some structure
2) Server broadcasts update to all users.
3) Clients process and display as posts.

usage:
node server.js

will serve localhost:8081 using websocket ws://localhost:8888/request (and only /request)

