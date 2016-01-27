/**
 * Copyright 2015 ubs121
 *  
 * Data service for Flashcard app
 */
'use strict';

class DataService {
  constructor() {
    this.db_ = null;
    this.card_ = null;
    this.log_ = null;
    this.schemaBuilder = this._buildSchema();
  }

  // connect to db
  connect() {
    if (this.db_ !== null) {
      return Promise.resolve(this.db_);
    }
    
    //var opts = {storeType: lf.schema.DataStoreType.INDEXED_DB};
    return this.schemaBuilder.connect().then(function(db){
      this.db_ = db;
      this.card_ = db.getSchema().table('card');
      this.log_ = db.getSchema().table('log');
      return db;
    }.bind(this));
  }

  _buildSchema() {
    var schemaBuilder = lf.schema.create('flashcard', 1);

    schemaBuilder.createTable('card').
        addColumn('question', lf.Type.STRING).
        addColumn('answer', lf.Type.STRING).
        addColumn('created', lf.Type.DATE_TIME).
        addColumn('deck', lf.Type.STRING).
        addPrimaryKey(['question']);


    schemaBuilder.createTable('log').
        addColumn('question', lf.Type.STRING).
        addColumn('interval', lf.Type.NUMBER).
        addColumn('updated', lf.Type.DATE_TIME).
        addPrimaryKey(['question']).
        addIndex('idxInterval', ['interval'], false, lf.Order.ASC);

    console.log('_buildSchema succeeded !');

    return schemaBuilder;
  }

  getDecks() {
    return this.db_
      .select(lf.fn.distinct(this.card_.deck).as('name'))
      .from(this.card_)
      .exec();
  }

  // calculate next card
  nextCard(deckId) {
    var c = this.card_;
    var l = this.log_;

    return this.db_
      .select(c.question.as('question'), c.answer.as('answer'), c.deck.as('deck'), l.interval.as('interval'))
      .from(c)
      .leftOuterJoin(l, l.question.eq(c.question))
      .where(c.deck.eq(deckId))
      .orderBy(this.log_.interval)
      .limit(30)
      .exec()
      .then(function(rs) {

          if (rs.length > 0) {
            // FIXME: choose random index
            var i = Math.floor((Math.random() * rs.length - 1) + 1);
            
            var card = {};
            card.question = rs[i].question;
            card.answer = rs[i].answer;
            card.interval = rs[i].interval;
            card.created = rs[i].created;
            card.deck = rs[i].deck;

            return card;
          } else {
            return {};
          }
      });
  }

  updateInterval(c) {
    this.db_.
      update(this.log_).
      set(this.log_.interval, c.interval).
      set(this.log_.updated, new Date()).
      where(this.log_.question.eq(c.question)).
      exec();
  }

  // import deck (cards) from the given path into database
  importDeck(deckId, filePath) {
    var that = this;
    
    return fetch(filePath, {mode: 'no-cors'}).then(function(response) {
      return response.text();
    }).then(function(csvText) {
      var lines = csvText.split(/[\n\r]/);
      
      var cardObjects = [];
      var intervalObjects = [];

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        // The csvText that comes from the server has an empty line at the end,
        // need to ignore it.
        if (line.length == 0) {
          continue;
        }

        var values = line.split(/[,;\|\t]/);

        if (values.length > 1) {
          var obj = {};
          // TODO: support image cards
          obj.question = values[0];
          obj.answer = values[1] || '';
          obj.created = new Date();
          obj.deck = deckId;

          cardObjects.push(that.card_.createRow(obj));

          var io = {};
          io.question = obj.question;
          io.updated = new Date();
          io.interval = 1;

          intervalObjects.push(that.log_.createRow(io));
        }
      }

      // insert placeholder rows for intervals
      that.db_.
        insert().
        into(that.log_).
        values(intervalObjects).exec();

      return that.db_.
        insertOrReplace().
        into(that.card_).
        values(cardObjects).exec();
    });
    
  }
}