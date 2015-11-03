/**
 * @license
 * Copyright 2015 ubs121
 */

const MAX_CARD = 100; //хамгийн ихдээ 100 карттай ажиллана.

 /** @enum {string} */
 var TABLE = {
   DECK: 'Deck',
   CARD: 'Card'
 };

/** @constructor */
var Resolver = function() {
 /** @type {!Function} */
 this.resolve;

 /** @type {!Function} */
 this.reject;

 /** @type {!Promise} */
 this.promise = new Promise((function(res, rej) {
   this.resolve = res;
   this.reject = rej;
 }).bind(this));
};

// Өгөгдлийн үйлчилгээ
var DataService = function() {
 this.db_ = null;
 this.deck_ = null;
 this.card_ = null;
 this.cardArray = new Array();
 this.deckArray = new Array();
 window.ds = this;

};

DataService.prototype.connect = function() {
   var resolver = new Resolver();

   if (this.db_ != null) {
     resolver.resolve(this.db_);
   }

   var req = window.indexedDB.open('flashcard', 1);

   req.onsuccess = function(ev) {
     this.db_ = ev.target.result;
     resolver.resolve(ev.target.result);
   }.bind(this);

   req.onerror = function(e) {
     resolver.reject(e);
   };

   req.onupgradeneeded = function(ev) {
     var rawDb = ev.target.result;
     var md = rawDb.createObjectStore(TABLE.DECK, { keyPath: 'id' });
     var mc = rawDb.createObjectStore(TABLE.CARD, { keyPath: 'question' });
     mc.createIndex('ixInterval', 'interval', { unique: false });
     mc.createIndex('ixDeck', 'deck', { unique: false });
   };

   return resolver.promise;
};

DataService.prototype.loadCards = function(deckId) {
  try {
    this.cardArray = [];
    var store = this.db_.transaction(TABLE.CARD, "readonly").objectStore(TABLE.CARD);

    // filter by deck using ixDeck
    var indexDeck = store.index("ixDeck");
    var boundKeyRange = IDBKeyRange.bound(deckId, deckId+1, false, true);

    // record counter
    var n = 0;

    var request = indexDeck.openCursor(boundKeyRange);
    request.onsuccess = function(evt) {
       var cursor = evt.target.result;
       if (cursor) {
          var c = cursor.value;
          this.cardArray.push(c);

          if (n < MAX_CARD) {
            cursor.continue();
          }
          n++;
       }
    }.bind(this);
  }
  catch(e){
     console.log(e);
  }
}

DataService.prototype.nextCard = function() {
  if (this.cardArray.length == 0) {
    return {};
  }

  // sort cards
  this.cardArray.sort(function(a, b){return a.interval - b.interval});

  // pick first, but randomize
  var firstCard = this.cardArray[0];

  var i=1;
  while (i<this.cardArray.length && this.cardArray[i].interval == firstCard.interval) {
    i++;
  }

  //
  // Math.floor((Math.random() * rs.length - 1) + 1);
}

DataService.prototype.updateInterval = function(c) {
  // interval талбарт оноосон утгыг баазад хадгалах
}

// check if data exists
DataService.prototype.dataExists = function()  {
    return false;
}

DataService.prototype.loadDecks = function() {
  try {
    this.deckArray = [];
    var store = this.db_.transaction(TABLE.DECK, "readonly").objectStore(TABLE.DECK);
    var request = store.openCursor();
    request.onsuccess = function(evt) {
       var cursor = evt.target.result;
       if (cursor) {
          var d = cursor.value;
          this.deckArray.push(d);
          cursor.continue();
       }
    }.bind(this);
  }
  catch(e){
     console.log(e);
  }
}

// import csv into database
DataService.prototype.importCsv = function(deckName, csvString) {
  if (this.db_ == null) {
      console.log('this.db_ is null !!!');
  }

  // FIXME: id-г зөв тооцоолох
  var newDeckId = 1;

  // insert deck
  var deckStore = this.db_.transaction(TABLE.DECK, "readwrite").objectStore(TABLE.DECK);
  deckStore.add({ id: newDeckId, name: deckName});

  // create a transaction
  var trans = this.db_.transaction(TABLE.CARD, "readwrite");
  var store = trans.objectStore(TABLE.CARD);
  trans.oncomplete = function(event) {
    console.log('importCsv succeeded.');
  };

  trans.onerror = function(event) {
    // ignore duplicated error message
    //console.log('importCsv failed', event);
  };

  // insert cards
  var lines = csvString.split('\n');
  var headerLine = lines[0];
  var fields = headerLine.split(',');

  for (var i = 1; i < lines.length; i++) {
    var line = lines[i];

    // The csvString that comes from the server has an empty line at the end,
    // need to ignore it.
    if (line.length == 0) {
      continue;
    }

    var values = line.split(/[,|;\t]/);
    var c = {};
    c.question = values[0];
    c.id = this.genId(c.question);
    c.answer = values[1];
    c.interval = 1.0; // FIXME: өмнө ажилласан утгыг дараад байна !
    c.created = new Date();
    c.deck = newDeckId;

    var request = store.add(c);
  }
}

DataService.prototype.fetchData = function(url, onResponse) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          //var arr = JSON.parse(xmlhttp.responseText);
          onResponse(xmlhttp.responseText);
      }
  };
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
}

DataService.prototype.genId = function(s) {
  var hash = 0, i, chr, len;
  if (s.length == 0) return hash;
  for (i = 0, len = s.length; i < len; i++) {
    chr   = s.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
