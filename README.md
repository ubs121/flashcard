# Flashcard

Flashcard is a progressive web app which makes remembering things easy. It uses a very simple spaced repetition algorithm.


## How ro run locally

Install node.js, gulp and bower.

```sh
$ npm install
$ bower install
$ npm install -g gulp
```

And serve up a with gulp.

```sh
$ gulp serve
```

Type in the url bar:

```
http://localhost:5080
```

## How to create a new deck

Deck is a group of cards. You can create a deck file using the following format.

```
Cash or charge;Бэлнээр үү, картаар уу|
Catch you later;Дараа уулзая|
Certainly;Яг тийм|
```

And put that file on some storage. For example, Google Drive could be used for this purpose. 

Then copy the URL of the file and import into the app using plus button (+).

Happy learning!


## Used technologies

This web app uses the latest web technologies:

* Progressive Web App
* Service Worker, Offline support
* Web components
* Polymer Starter Kit
* IndexedDB by Lovefield
* 3D CSS animation
* Web Notification
* Device sensor (tilt)
* Add to home screen
* Google App Engine
* ES6 by Babel.js

## TODO
- use tilt motion to flip
- support cards with image

## Known bugs

- Lovefield query doesn't work on iOS  devices

## Roadmap

- Support Anki package format (*.apkg)
