# Flashcard

Flashcard is a progressive web app which makes remembering things easy.  It uses a very simple spaced repetition algorithm.

## Used technologies

This web app uses several modern web technologies:

* Progressive Web App
* Service Worker, offline support
* Web components
* Polymer Starter Kit
* IndexedDB by Lovefield
* 3D CSS animation
* Push Notification (HTTP long polling)
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


## Deploy on appengine

```sh
$ appcfg.py -A flashcard-121 update flashcard/
```

## Demo

https://flashcard-121.appspot.com/

## TODO
- check if data exists
- set current deck ID
- use tilt motion to flip
- import deck from Internet, drag and drop support
- add, edit cards manually
- add to home screen
- excersize notification (use push?)
- export log/result
