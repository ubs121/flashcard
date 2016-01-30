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

Deck is a group of cards. You can create a deck file using the following format (question|answer).

```
Cash or charge;Бэлнээр үү, картаар уу|
Catch you later;Дараа уулзая|
Certainly;Яг тийм|
```

And put this file on some storage. For example, Google Drive could be used for this purpose. 

After that copy the URL and import into the app using plus button (+) inside the deck list.

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

## Requirement

* **Responsiveness** - App is equally functional on mobile and desktop, using responsive design to ensure its displayed in a a usable state.
* **Inputs** - All form inputs have appropriate types, labels, placeholders, and immediately validated.
* **Offline functionality** - Application defaults to offline-first fuctionality, functioning if a network connection doesn't  exist.
* **Accessibility** - All images have alternative text, focus is appropriately managed, elements are semantically used appropriately. When semantic elements are not used ARIA roles are properly applied. Colors and contrast are managed.
* **Components** - If components are used, they are self-contained units of functionality and declaratively configurable.
* **Home Screen Installable** - The application is installable to user's home screen.
* **Architecture** - Application follows the recommended architecture for progressive web applications.
* **App delivery** - App includes a build process. Assets are minimized and concatenated as appropriate.


## TODO
- deploy to app engine
- use tilt motion to flip
- support cards with image

## Known bugs

- Lovefield query doesn't work on iOS  devices

## Roadmap

- Support Anki package format (*.apkg)