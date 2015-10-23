'use strict';

class DataService {
  constructor() {
    this.db_ = null;
    this.deck_ = null;
    this.card_ = null;
    this.schemaBuilder = this._buildSchema();
  }

  connect() {
    if (this.db_ !== null) {
      return Promise.resolve(this.db_);
    }

    // connect to db
    //var opts = {storeType: lf.schema.DataStoreType.INDEXED_DB};
    return this.schemaBuilder.connect().then(function(db){
      this.db_ = db;
      this.deck_ = db.getSchema().table('Deck');
      this.card_ = db.getSchema().table('Card');

      console.log('Connected to db !');

      // demo data
      this.loadDemo();
      return db;
    }.bind(this));

  }

  _buildSchema() {
    var schemaBuilder = lf.schema.create('flashcard', 1);
    console.log('_buildSchema succeeded !');

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
        addColumn('deck', lf.Type.INTEGER).
        addPrimaryKey(['id']).
        addIndex('idxInterval', ['interval'], false, lf.Order.DESC);

    return schemaBuilder;
  }

  getDecks() {
    return this.connect().then(function() {
      return this.db_
        .select()
        .from(this.deck_)
        //.where(this.deck_.name.match(/500.*/))
        .exec();
    }.bind(this));
  }

  nextCard() {
    return this.connect().then(function() {
      return this.db_
        .select()
        .from(this.card_)
        .where(this.card_.deck.eq(1))
        .orderBy(this.card_.interval, lf.Order.DESC)
        .limit(10)
        .exec()
          .then(function(rs) {
              var randIndex = Math.floor((Math.random() * rs.length - 1) + 1)

              var card = {};
              card.id = rs[randIndex].id;
              card.question = rs[randIndex].question;
              card.answer = rs[randIndex].answer;
              card.interval = rs[randIndex].interval;
              card.created = rs[randIndex].created;
              card.deck = rs[randIndex].deck;

              return card;
            });
    }.bind(this));
  }

  updateInterval(c) {
    return this.db_
      .update(this.card_)
      .set(this.card_.interval, c.interval)
      .where(this.card_.id.eq(c.id))
      .exec();
  }

  importDecks(rs) {
    var deckRows = rs.map(
            function(obj) { obj.created = new Date();  return this.deck_.createRow(obj); }, this);

    return this.db_.insertOrReplace().into(this.deck_).values(deckRows).exec();
  }

  importCards(rs) {
    var cardRows = rs.map(
            function(obj) { obj.created = new Date();  obj.interval = 1; return this.card_.createRow(obj); }, this);

    return this.db_.insertOrReplace().into(this.card_).values(cardRows).exec();
  }

  getJson(url, onResponse) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var arr = JSON.parse(xmlhttp.responseText);
            onResponse(arr);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  }


  loadDemo() {
    this.getJson("data/Deck.json", function(resp) {
      try {
        this.importDecks(resp);
      } catch(e) {
        // skip
      }
    }.bind(this));

    this.getJson("data/Card.json", function(resp) {
      try {
        this.importCards(resp);
      } catch(e) {
        // skip
      }
    }.bind(this));
  }
}
