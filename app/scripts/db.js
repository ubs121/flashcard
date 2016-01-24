/**
 * Copyright 2015 ubs121
 */

// Өгөгдлийн үйлчилгээ
var DataService = function() {
 this.db_ = null;
 this.card_ = null;
 this.cards = new Array();
 this.decks = new Array();
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
     var mc = rawDb.createObjectStore("card", { keyPath: 'question' });
     mc.createIndex('ixInterval', 'interval', { unique: false });
     mc.createIndex('ixDeck', 'deck', { unique: false });
   };

   return resolver.promise;
};

// import deck from somewhere
DataService.prototype.import = function(deckId, csvPath) {
  console.log('Importing sample data...');

  if (this.db_ == null) {
      console.log('this.db_ is null !!!');
  }

  fetch(csvPath).then(function(response) {
    return response.text();
  }).then(function(csvStr) {
    this.importCsv(deckId, csvStr);
    console.log('import is done.');
  }.bind(this)).catch(function(err) {
    console.log('Demo data import failed', err);
  });
};

// import csv into database
DataService.prototype.importCsv = function(deckId, csvString) {
  // create a transaction
  var trans = this.db_.transaction("card", "readwrite");
  var storeCard = trans.objectStore("card");
  trans.oncomplete = function(event) {
    console.log('importCsv succeeded.');
  };

  trans.onerror = function(event) {
    // ignore duplicated error message
    // console.log('importCsv failed', event);
  };

  // insert cards
  var lines = csvString.split(/[\r\n]/);
  var headerLine = lines[0];
  var fields = headerLine.split(/[,|;\t]/);

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
    c.answer = values[1];
    //c.interval = 1.0;
    c.created = new Date();
    c.deck = deckId;

    var request = storeCard.add(c);
  }
};

DataService.prototype.nextCard = function() {
  if (this.cards.length == 0) {
    return {};
  }

  // sort cards
  this.cards.sort(function(a, b) {return (a.interval - b.interval); });

  // pick first, but randomize
  var firstCard = this.cards[0];

  var i=1;
  while (i<this.cards.length && this.cards[i].interval == firstCard.interval) {
    i++;
  }

  //
  // Math.floor((Math.random() * rs.length - 1) + 1);
};

DataService.prototype.updateInterval = function(c) {
  // interval талбарт оноосон утгыг баазад хадгалах
};

// check if data exists
DataService.prototype.dataExists = function()  {
    return false;
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