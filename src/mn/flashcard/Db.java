package mn.flashcard;

import java.util.ArrayList;
import java.util.List;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

class Db {

	/**
	 * Өгөгдлийн сан.
	 */
	static final String dbFile = "/sdcard/flashcard.db";
	static final String DECK_TABLE = "decks";
	static final String CARD_TABLE = "cards";

	static class DatabaseHelper extends SQLiteOpenHelper {

		DatabaseHelper(Context context) {
			super(context, dbFile, null, 1);
		}

		@Override
		public void onCreate(SQLiteDatabase db) {
			db.execSQL("CREATE TABLE " + DECK_TABLE
					+ " (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);");
			db.execSQL("CREATE TABLE "
					+ CARD_TABLE
					+ " (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, answer TEXT, interval FLOAT, deck_id INTEGER );");

			db.execSQL("create index ix_interval on cards(interval);");
			db.execSQL("create index ix_deck on cards(deck_id);");
		}

		@Override
		public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
			// db.execSQL("DROP TABLE IF EXISTS " + DECK_TABLE);
			// db.execSQL("DROP TABLE IF EXISTS " + CARD_TABLE);
			//
			// onCreate(db);
		}
	}

	static DatabaseHelper mOpenHelper;

	/**
	 * SQLite файл нээнэ.
	 */
	static void openDatabase(Context ctx) throws SQLException {
		mOpenHelper = new DatabaseHelper(ctx);
	}

	static List<String> getDeckList() {
		SQLiteDatabase db = mOpenHelper.getWritableDatabase();
		List<String> lst = new ArrayList<String>();
		Cursor cur = db.rawQuery("SELECT name FROM " + DECK_TABLE, null);
		try {
			while (cur.moveToNext()) {
				lst.add(cur.getString(0));
			}
		} catch (Exception ex) {
			Log.e("db", ex.toString());
		} finally {
			cur.close();
			db.close();
		}

		return lst;
	}

	static int findDeckIdByName(String deckName) {
		int id = -1;
		SQLiteDatabase db = mOpenHelper.getReadableDatabase();
		Cursor cur = db.rawQuery("SELECT id FROM " + DECK_TABLE
				+ " WHERE name='" + deckName + "'", null);
		try {
			if (cur.moveToFirst()) {
				id = cur.getInt(0);
			}
		} catch (Exception ex) {
			Log.e("db", ex.toString());
		} finally {
			cur.close();
			db.close();
		}
		return id;
	}

	static void insertDeck(String deck) {
		SQLiteDatabase db = mOpenHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put("name", deck);
		try {
			db.insert(DECK_TABLE, null, values);
		} finally {
			db.close();
		}
	}

	static void renameDeck(String oldName, String newName) {
		SQLiteDatabase db = mOpenHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put("name", newName);
		try {
			db.update(DECK_TABLE, values, "name='" + oldName + "'", null);
		} finally {
			db.close();
		}
	}

	static void deleteDeck(String deck) {
		SQLiteDatabase db = mOpenHelper.getWritableDatabase();
		ContentValues values = new ContentValues();
		values.put("name", deck);
		try {
			db.delete(DECK_TABLE, " name = '" + deck + "'", null);
		} finally {
			db.close();
		}
	}

	static int queryScalar(String query) throws SQLException {
		SQLiteDatabase db = mOpenHelper.getReadableDatabase();

		Cursor cursor = db.rawQuery(query, null);
		int scalar = -1;
		try {
			if (!cursor.moveToFirst()) {
				throw new SQLException("No query result: " + query);
			}

			scalar = cursor.getInt(0);
		} finally {
			cursor.close();
			db.close();
		}

		return scalar;
	}

	/**
	 * Сэдэв дотроос хамгийн ойрхон интервалтай картыг сонгох.
	 */
	static final String getCardSql = "select id,interval,question,answer "
			+ " from (SELECT * FROM cards WHERE deck_id=? ORDER BY interval LIMIT 50) "
			+ " order by random() limit 1";

	static void getNextCard(int deck_id, Card card) throws SQLException {
		SQLiteDatabase db = mOpenHelper.getReadableDatabase();
		Cursor cursor = null;
		try {
			cursor = db.rawQuery(getCardSql,
					new String[] { String.valueOf(deck_id) });

			cursor.moveToFirst();
			card.id = cursor.getLong(0);
			card.interval = cursor.getDouble(1);
			card.question = cursor.getString(2);
			card.answer = cursor.getString(3);
		} finally {
			db.close();
			if (cursor != null) {
				cursor.close();
			}
		}
	}

	/**
	 * Карт
	 * 
	 */
	static class Card {

		/**
		 * Картын дугаар, сөрөг байж болно.
		 */
		long id;

		/**
		 * Асуулт, хариулт.
		 */
		String question, answer;
		/**
		 * Карт дуудах интервал
		 */
		double interval = 1.0;

		/**
		 * Картыг цээжилсэн учраас хойш тавих.
		 */
		void space() {
			double newInterval = 1;
			if (interval != 0) {
				newInterval = 2 * interval; // Very basic spaced repetition.
			}

			SQLiteDatabase db = mOpenHelper.getWritableDatabase();
			ContentValues values = new ContentValues();
			values.put("interval", newInterval);
			try {
				db.update(CARD_TABLE, values, "id='" + id + "'", null);
				Log.d("db", "Space interval: " + newInterval);
			} finally {
				db.close();
			}
		}

		/**
		 * Цээжлээгүй бол интервалыг шинэчилэн давтах.
		 */
		void reset() {
			double newInterval = 0.3;
			if (interval != 0) {
				newInterval = 1.01 * interval;
			}
			SQLiteDatabase db = mOpenHelper.getWritableDatabase();
			ContentValues values = new ContentValues();
			values.put("interval", newInterval);
			try {
				db.update(CARD_TABLE, values, "id='" + id + "'", null);
				Log.d("db", "Reset interval: " + newInterval);
			} finally {
				db.close();
			}
		}
	}

}