var Db = function() {
  // Following member variables are initialized within getDbConnection().
  this.db_ = null;
  window.ls = this;

  console.log('Database created.');
};


/**
 * Initializes member variables that can't be initialized before getting a
 * connection to the database.
 * @private
 */
Db.prototype.onConnected_ = function() {
};


/**
 * Instantiates the DB connection (re-entrant).
 * @return {!IThenable<!lf.Database>}
 */
Db.prototype.getConnection = function() {
  if (this.db_ != null) {
    return this.db_;
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
Db.prototype.buildSchema_ = function() {
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
    addColumn('interval', lf.Type.DOUBLE).
    addPrimaryKey(['id']).
    addIndex('idxInterval', ['interval'], false, lf.Order.DESC);


  return schemaBuilder;
};