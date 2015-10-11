package mn.flashcard;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import android.app.ListActivity;
import android.content.Intent;
import android.database.SQLException;
import android.os.Bundle;
import android.view.View;
import android.widget.ListView;
import android.widget.SimpleAdapter;

/**
 * Сэдвийн жагсаалт харуулах дэлгэц
 * 
 */
public class DeckPicker extends ListActivity {
	static final int MENU_NEW_DECK = 0;

	ArrayList<HashMap<String, String>> mDeckList;
	SimpleAdapter mAdapter;

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) throws SQLException {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.deck_picker);

		mDeckList = new ArrayList<HashMap<String, String>>();
		mAdapter = new SimpleAdapter(this, mDeckList,
				android.R.layout.simple_list_item_1, new String[] { "deck" },
				new int[] { android.R.id.text1 });

		this.setListAdapter(mAdapter);

		populateDecks();
	}

	void populateDecks() {
		mDeckList.clear();
		this.getListView().clearChoices();

		// баазаас сэдвүүд татах
		List<String> lst = Db.getDeckList();

		for (String s : lst) {
			HashMap<String, String> o = new HashMap<String, String>();
			o.put("deck", s);
			o.put("id", s);
			mDeckList.add(o);
		}

		mAdapter.notifyDataSetChanged();
	}

	@Override
	protected void onListItemClick(ListView l, View v, int position, long id) {
		@SuppressWarnings("unchecked")
		HashMap<String, String> data = (HashMap<String, String>) this
				.getListAdapter().getItem(position);
		String deckName = data.get("deck");

		if (deckName != null) {
			Intent intent = this.getIntent();

			int deck_id = Db.findDeckIdByName(deckName);

			intent.putExtra("deck", deck_id);
			setResult(RESULT_OK, intent);

			finish();
		}
	}

}