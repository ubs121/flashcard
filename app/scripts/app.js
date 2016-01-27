/*
Copyright (c) 2015 ubs121
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  // Sets app default base URL
  app.baseUrl = '/';
  if (window.location.port === '') {  // if production
    // Uncomment app.baseURL below and
    // set app.baseURL to '/your-pathname/' if running from folder in production
    // app.baseUrl = '/polymer-starter-kit/';
  }

  app.displayInstalledToast = function() {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!Polymer.dom(document).querySelector('platinum-sw-cache').disabled) {
      Polymer.dom(document).querySelector('#caching-complete').show();
    }
  };

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function() {
    console.log('Our app is ready to rock!');
  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {
    // imports are loaded and elements have been registered
  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  window.addEventListener('paper-header-transform', function(e) {
    var appName = Polymer.dom(document).querySelector('#mainToolbar .app-name');
    var middleContainer = Polymer.dom(document).querySelector('#mainToolbar .middle-container');
    var bottomContainer = Polymer.dom(document).querySelector('#mainToolbar .bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    // appName max size when condensed. The smaller the number the smaller the condensed size.
    var maxMiddleScale = 0.50;
    var auxHeight = heightDiff - detail.y;
    var auxScale = heightDiff / (1 - maxMiddleScale);
    var scaleMiddle = Math.max(maxMiddleScale, auxHeight / auxScale + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    app.$.headerPanelMain.scrollToTop(true);
  };

  app.closeDrawer = function() {
    app.$.paperDrawerPanel.closeDrawer();
  };

  // connect to database
  var db = new DataService();
  db.connect().then(function() {
    console.log('Database Connected.');

    db.getDecks().then(function(rs) {
      app.decks = rs;
    });

    if (localStorage.deck) {
      app.changeDeck(localStorage.deck);
    } else {
      // load sample data
      db.importDeck("english_sample", "data/english.csv").then(function() {
          app.changeDeck("english_sample");
      });      
    }

  });

  // change deck
  app.changeDeck = function(deckId) {
    app.deck = deckId;
    localStorage.setItem("deck", deckId);

    db.nextCard(deckId).then(function(c) {
      app.card = c;
    });
  };
  
  // update the current and move to the next
  app.next = function() {
    // Save previous card
    db.updateInterval(app.card);

     // TODO: use current deck ID
    db.nextCard('english_sample').then(function(c) {
      app.card = c;
    });
  };

  app.refresh = function() {
    if (app.route == 'home') {
      // skip current, show next
      db.nextCard('english_sample').then(function(c) {
        app.card = c;
      });
    } else if (app.route == 'decks') {
      db.getDecks().then(function(rs) {
        app.decks = rs;
      });
    }
  };

  app.add = function() {
    if (app.route == 'home') {
      console.log('add new card');
    } else if (app.route == 'decks') {
      this.$.dlgImport.open();
    }
  };

  app.importDeck = function(e) {
    var that = this;
    console.log(app.inputDeckName, app.inputDeckURL);

    // TODO: validate URL
    if (!app.inputDeckURL.startsWith('http')) {
      that.$.toast.text = "Invalid URL!";
      that.$.toast.show();
      return;
    }

    db.importDeck(app.inputDeckName, app.inputDeckURL).then(function() {
      app.refresh();

      that.$.toast.text = "Successfully imported!";
      that.$.toast.show();
    }).catch(function(err) {
      that.$.toast.text = "Import failed! " + err;
      that.$.toast.show();
    });

    // clear
    app.inputDeckName = "";
    app.inputDeckURL = "";

  };

  app.remove = function() {
    // TODO: remove deck completely
  };

})(document);
