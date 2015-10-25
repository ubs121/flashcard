/**
 * @license
 * Copyright 2015 ubs121
 */

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


 /** @type {number} */
 var startTime;

/** @type {IDBDatabase} */
var db = null;


/** @enum {string} */
var TABLE = {
  DECK: 'deck',
  CARD: 'card'
};

function openDb() {
  var resolver = new Resolver();
  var req = window.indexedDB.open('flashcard');

  req.onsuccess = function(ev) {
    resolver.resolve(ev.target.result);
  };
  req.onerror = function(e) {
    resolver.reject(e);
  };
  
  req.onupgradeneeded = function(ev) {
    var rawDb = ev.target.result;
    var md = rawDb.createObjectStore(TABLE.DECK, { keyPath: 'id' });
    var mc = rawDb.createObjectStore(TABLE.CARD, { keyPath: 'question' });
    mc.createIndex('ixInterval', 'interval', { unique: false });
  };

  return resolver.promise;
}

function main() {
  return openDb().then(function(database) {
    db = database;
  });
}
