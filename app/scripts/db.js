var DataService = function() {
  // Following member variables are initialized within getConnection().
  this.db_ = null;
  this.deck_ = null;
  this.card_ = null;
  window.fs = this;
};


/**
 * Initializes member variables that can't be initialized before getting a
 * connection to the database.
 * @private
 */
DataService.prototype.onConnected_ = function() {
  this.deck_ = this.db_.getSchema().table('Deck');
  this.card_ = this.db_.getSchema().table('Card');

  this.loadDemo();
};


/**
 * Instantiates the DB connection (re-entrant).
 * @return {!IThenable<!lf.Database>}
 */
DataService.prototype.getConnection = function() {
  if (this.db_ != null) {
    return new Promise(function(resolve, reject) { resolve(this.db_); } );
  }

  var connectOptions = {storeType: lf.schema.DataStoreType.INDEXED_DB};
  return this.buildSchema_().connect(connectOptions).then(
      function(db) {
        this.db_ = db;
        this.onConnected_();
        return db;
      }.bind(this));
};


/**
 * Builds the database schema.
 * @return {!lf.schema.Builder}
 * @private
 */
DataService.prototype.buildSchema_ = function() {
  var schemaBuilder = lf.schema.create('flashcard', 1);

  schemaBuilder.createTable('Deck').
      addColumn('id', lf.Type.INTEGER).
      addColumn('name', lf.Type.STRING).
      addColumn('created', lf.Type.DATE_TIME).
      addPrimaryKey(['id']);

  schemaBuilder.createTable('Card').
      addColumn('id', lf.Type.INTEGER).
      addColumn('question', lf.Type.STRING).
      addColumn('answer', lf.Type.STRING).
      addColumn('interval', lf.Type.NUMBER).
      addColumn('created', lf.Type.DATE_TIME).
      addPrimaryKey(['id']).
      addIndex('idxInterval', ['interval'], false, lf.Order.DESC);


  return schemaBuilder;
};


// data insert
DataService.prototype.importDecks = function(rs) {
  var deckRows = rs.map(
          function(obj) { obj.created = new Date();  return this.deck_.createRow(obj); }, this);

  return this.db_.insertOrReplace().into(this.deck_).values(deckRows).exec();
};


DataService.prototype.importCards = function(rs) {
  var cardRows = rs.map(
          function(obj) { obj.created = new Date();  obj.interval = 1; return this.card_.createRow(obj); }, this);

  return this.db_.insertOrReplace().into(this.card_).values(cardRows).exec();
};

DataService.prototype.getJson = function(url, onResponse) {
  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var arr = JSON.parse(xmlhttp.responseText);
          onResponse(arr);
      }
  }
  xmlhttp.open("GET", url, true);
  xmlhttp.send();
};

// demo data
DataService.prototype.loadDemo = function() {
  var row = this.deck_.createRow({
    'id': 3,
    'name': 'Capitals',
    'created': new Date()
  });

  this.db_.insertOrReplace().into(this.deck_).values([row]).exec();

  this.getJson("data/Deck.json", function(resp) {
    console.log('Decks: ' + resp.length);
    console.log(this.importDecks(resp));
  }.bind(this));

  this.getJson("data/Card.json", function(resp) {
    console.log('Cards: ' + resp.length);
    try {
      this.importCards(resp);
    } catch(e) {
      // skip
    }
  }.bind(this));
}
