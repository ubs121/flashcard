import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'model.dart';

// Deck catalog
class DeckChooser extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var data = context.select((FModel dat) => dat);
    return Scaffold(
      appBar: AppBar(
        title: Text("Choose a deck"),
      ),
      body: ListView.builder(
          padding: const EdgeInsets.all(8),
          itemCount: data.allDecks.length,
          itemBuilder: (BuildContext context, int index) => _DeckItem(index)),
      floatingActionButton: FloatingActionButton(
        onPressed: () => {
          // add a new deck
          _AddDeckDlg()
        },
        tooltip: 'Add a deck',
        child: Icon(Icons.add),
      ),
    );
  }
}

// single deck item in the list
class _DeckItem extends StatelessWidget {
  final int index;

  _DeckItem(this.index, {Key key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    var data = context.select((FModel dat) => dat);
    var item = data.allDecks[index];

    return Card(
      child: InkWell(
        onTap: () {
          data.currentDeck = item;
          Navigator.pushNamed(context, '/play');
        },
        splashColor: Colors.blue.withAlpha(30),
        child: Text('Deck: ${item.name}'),
      ),
    );
  }
}

// new deck form
class _AddDeckDlg extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("New deck"),
      ),
      body: Container(
        margin: EdgeInsets.all(8.0),
        padding: EdgeInsets.all(16.0),
        child: Column(
          children: <Widget>[
            TextField(
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Deck label',
              ),
              onSubmitted: (string) {},
            ),
            TextField(
              decoration: InputDecoration(
                border: OutlineInputBorder(),
                labelText: 'Sheet ID',
              ),
              onSubmitted: (string) => {},
            ),
            RaisedButton(
                onPressed: () => Navigator.pop(context), child: Text("add"))
          ],
        ),
      ),
    );
  }
}
