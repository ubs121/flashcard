package mn.flashcard;

import mn.flashcard.Db.Card;
import android.app.Activity;
import android.content.Intent;
import android.content.res.Resources;
import android.database.SQLException;
import android.os.Bundle;
import android.os.SystemClock;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.webkit.WebView;
import android.widget.Button;
import android.widget.Chronometer;
import android.widget.ToggleButton;

/**
 * Үндсэн активити
 * 
 */
public class CardView extends Activity {
	/**
	 * Цэс
	 */
	static final int MENU_CHANGE_DECK = 0;
	static final int MENU_PREFERENCES = 1;
	static final int PICK_DECK_REQUEST = 0;
	static final int PREFERENCES_UPDATE = 1;

	/**
	 * Төлөв хадгалах хувьсагчид
	 */
	int deckId;
	String cardTemplate;
	Db.Card card;

	/**
	 * Дэлгэцийн объектууд
	 */
	WebView mCard;
	ToggleButton mFlipCard;
	Button mSelectRemembered, mSelectNotRemembered;
	Chronometer mTimer;

	@Override
	public void onCreate(Bundle savedInstanceState) throws SQLException {
		super.onCreate(savedInstanceState);

		requestWindowFeature(Window.FEATURE_NO_TITLE);
		setContentView(R.layout.flashcard);

		Resources r = getResources();
		cardTemplate = r.getString(R.string.card_template);

		if (savedInstanceState != null) {
			deckId = savedInstanceState.getInt("currentDeck");
		}

		// Өгөгдлийн санг нээх
		Db.openDatabase(this);

		if (deckId <= 0) {
			// сэдвийн жагсаалт харуулах
			openDeckPicker();
		}

		mCard = (WebView) findViewById(R.id.flashcard);
		mSelectRemembered = (Button) findViewById(R.id.select_remembered);
		mSelectNotRemembered = (Button) findViewById(R.id.select_notremembered);
		mTimer = (Chronometer) findViewById(R.id.card_time);
		mFlipCard = (ToggleButton) findViewById(R.id.flip_card);

		card = new Card();
		// Картыг сонгох
		nextCard(deckId);
	}

	void openDeckPicker() {
		startActivityForResult(new Intent(this, DeckPicker.class),
				PICK_DECK_REQUEST);
	}

	public boolean onCreateOptionsMenu(Menu menu) {
		menu.add(0, MENU_CHANGE_DECK, 0, "Сэдэв солих");
		menu.add(1, MENU_PREFERENCES, 0, "Тохиргоо");
		return true;
	}

	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
		switch (item.getItemId()) {
		case MENU_CHANGE_DECK:
			openDeckPicker();
			return true;
		}
		return false;
	}

	@Override
	public void onSaveInstanceState(Bundle outState) {
		if (deckId > 0) {
			outState.putInt("currentDeck", deckId);
		}
	}

	@Override
	public void onResume() {
		super.onResume();

		nextCard(deckId);
	}

	@Override
	protected void onActivityResult(int requestCode, int resultCode,
			Intent intent) {
		super.onActivityResult(requestCode, resultCode, intent);
		if (requestCode == PICK_DECK_REQUEST) {
			if (resultCode != RESULT_OK) {
				return;
			}
			if (intent == null) {
				return;
			}
			// Сонгогдсон сэдвийг унших
			deckId = intent.getExtras().getInt("deck");

			nextCard(deckId);
		}
	}

	// Дараагийн картыг авах.
	void nextCard(int currentDeck) {
		if (currentDeck <= 0) {
			return;
		}

		try {
			Db.getNextCard(this.deckId, card);

			mFlipCard.setChecked(false);
			mTimer.setBase(SystemClock.elapsedRealtime());
			mTimer.start();

			// картыг харуулах.
			displayCardQuestion();
		} catch (Exception ex) {
			updateCard("", "Карт олдсонгүй!");
		}
	}

	public void onFlip(View v) {
		ToggleButton btn = (ToggleButton) v;
		if (btn.isChecked()) {
			displayCardAnswer();
		} else {
			displayCardQuestion();
		}
	}

	// Асуулт харуулах
	void displayCardQuestion() {
		if (card == null) {
			updateCard("", "Карт олдсонгүй!");
			nextCard(deckId);
		} else {
			mSelectRemembered.setVisibility(View.GONE);
			mSelectNotRemembered.setVisibility(View.GONE);

			updateCard(String.valueOf(card.id), card.question);
		}
	}

	// Хариуг харуулах
	void displayCardAnswer() {
		if (card == null) {
			updateCard("", "Карт олдсонгүй!");
			return;
		}

		mTimer.stop();
		mSelectRemembered.setVisibility(View.VISIBLE);
		mSelectNotRemembered.setVisibility(View.VISIBLE);
		mSelectRemembered.requestFocus();

		updateCard("", card.answer);
	}

	void updateCard(String id, String content) {
		String cardText = cardTemplate.replace("::content::", content);
		cardText = cardText.replace("::id::", id);
		mCard.loadDataWithBaseURL("", cardText, "text/html", "utf-8", null);
	}

	// Картыг цээжилсэн
	public void onRemembered(View view) {
		// Картыг тогтоосон учраас хойш тавих.
		card.space();
		nextCard(deckId);
	}

	// Картыг санахгүй байсан
	public void onNotRemembered(View view) {
		card.reset();
		nextCard(deckId);
	}

}