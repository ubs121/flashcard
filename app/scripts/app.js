/*
Copyright (c) 2015 ubs121
*/
(
function(document) {
    'use strict';

    // Grab a reference to our auto-binding template
    // and give it some initial binding values
    // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
    var app = document.querySelector('#app');
    var deckSection = document.querySelector('#decks');
    var homeSection = document.querySelector('#home');

    console.log('deckSection', deckSection);

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
    addEventListener('paper-header-transform', function(e) {
        var appName = document.querySelector('#mainToolbar .app-name');
        var middleContainer = document.querySelector('#mainToolbar .middle-container');
        var bottomContainer = document.querySelector('#mainToolbar .bottom-container');
        var detail = e.detail;
        var heightDiff = detail.height - detail.condensedHeight;
        var yRatio = Math.min(1, detail.y / heightDiff);
        var maxMiddleScale = 0.50;
        // appName max size when condensed. The smaller the number the smaller the condensed size.
        var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1 - maxMiddleScale)) + maxMiddleScale);
        var scaleBottom = 1 - yRatio;

        // Move/translate middleContainer
        Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

        // Scale bottomContainer and bottom sub title to nothing and back
        Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

        // Scale middleContainer appName
        Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
    });

    // Close drawer after menu item is selected if drawerPanel is narrow
    app.onDataRouteClick = function() {
        var drawerPanel = document.querySelector('#paperDrawerPanel');
        if (drawerPanel.narrow) {
            drawerPanel.closeDrawer();
        }
    };

    // Scroll page to top and expand header
    app.scrollPageToTop = function() {
        document.getElementById('mainContainer').scrollTop = 0;
    };

    app._onAdd = function() {
        if (this.route == "home") {
            cardEl.add();
        } else {
            deckEl.add();
        }
    };

    app._loadData = function() {
      if (!window.db) {
        return;
      }

      if (!window.db.dataExists) {
        // load demo data
        window.db.fetchData("data/English.csv", function(csvStr) {
          try {
            window.db.importCsv('English', csvStr);
          } catch(e) {
            console.log('Demo data import failed', e);
          }
        });
      }

      window.db.loadDecks();
      // FIXME: load cards for last used deck
      window.db.loadCards(1);

      console.log('_loadData finished.');
    };

    app.fetchData = function(url, onResponse) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
              //var arr = JSON.parse(xmlhttp.responseText);
              onResponse(xmlhttp.responseText);
          }
      };
      xmlhttp.open("GET", url, true);
      xmlhttp.send();
    };



    // connect to database
    window.db = new DataService();
    window.db.connect().then(function() {
      console.log('Database Connected.');
      app._loadData();

      var cardEl = document.createElement("flash-card");
      cardEl.deck = localStorage.getItem('deck') || 1;
      //cardEl.bind('deck', new PathObserver(this, 'params.deck'));
      homeSection.appendChild(cardEl);

      var deckEl = document.createElement("deck-list");
      deckSection.appendChild(deckEl);
    });


})(document);
