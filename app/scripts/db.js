'use strict';

const MAX_CARD = 100; //хамгийн ихдээ 100 карттай ажиллана.

class DataService {

  constructor() {
    this.db_ = null;
    this.deck_ = null;
    this.card_ = null;
    this.schemaBuilder = this._buildSchema();

    this.cards = new Array();
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


      // TODO: хоосон эсэхийг шалгаад байхгүй бол demo өгөгдөл оруулах
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
    return this.db_
      .select()
      .from(this.deck_)
      .exec();
  }

  // картуудыг санах ойд ачаалах
  loadCards(deckId) {
    this.db_
      .select()
      .from(this.card_)
      .where(this.card_.deck.eq(deckId))
      .orderBy(this.card_.interval, lf.Order.DESC)
      .limit(MAX_CARD)
      .exec()
      .then(function(rs) {
        for (i = 0; i < rs.length; i++) {
          var c = {};
          c.id = rs[i].id;
          c.question = rs[i].question;
          c.answer = rs[i].answer;
          c.interval = rs[i].interval;
          c.created = rs[i].created;
          c.deck = rs[i].deck;
          this.cards.push(c);
        }
      });
  }

  nextCard() {
    // FIXME: top 1-г олох арга хэрэгтэй,
    // Math.floor((Math.random() * rs.length - 1) + 1);

  }

  updateInterval(c) {
    return this.db_
      .update(this.card_)
      .set(this.card_.interval, c.interval)
      .where(this.card_.id.eq(c.id))
      .exec();
  }

  dataExists() {
    this.db_
      .select()
      .from(this.card_)
  }

  importCsv(deckName, csvString) {
    // FIXME: id-г зөв тооцоолох
    var newDeckId = 1;

    // insert deck
    var d = this.deck_.createRow({ id: newDeckId, name: deckName, created: new Date()});
    this.db_
      .insertOrReplace()
      .into(this.deck_)
      .values([d]).exec();

    // insert cards
    var lines = csvString.split('\n');
    var headerLine = lines[0];
    var fields = headerLine.split(',');

    var objects = [];
    for (var i = 1; i < lines.length; i++) {
      var line = lines[i];

      // The csvString that comes from the server has an empty line at the end,
      // need to ignore it.
      if (line.length == 0) {
        continue;
      }

      var values = line.split(/[,|;\t]/);
      var obj = {};
      obj.id = this.genId(obj.question);
      obj.question = values[0];
      obj.answer = values[1];
      obj.interval = 1.0; // FIXME: өмнө ажилласан утгыг дараад байна !
      obj.created = new Date();
      obj.deck = newDeckId;
      objects.push(this.card_.createRow(obj));
    }

    return this.db_
      .insertOrReplace()
      .into(this.card_)
      .values(objects).exec();
  }

  fetchData(url, onResponse) {
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


  genId(s) {
    var hash = 0, i, chr, len;
    if (s.length == 0) return hash;
    for (i = 0, len = s.length; i < len; i++) {
      chr   = s.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  loadDemo() {

    this.fetchData("data/English.csv", function(resp) {
      try {
        this.importCsv('English', resp);
      } catch(e) {
        // skip
      }
    }.bind(this));
  }
}
