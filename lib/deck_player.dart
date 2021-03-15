import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'model.dart';

// Deck player
class DeckPlayer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var data = context.select((FModel dat) => dat);

    return Scaffold(
      appBar: AppBar(
          title: Row(
        children: [
          Text(data.currentDeck.name),
          Expanded(
              child: IconButton(
                  icon: Icon(Icons.sync),
                  onPressed: () {
                    print("syncing...");
                    data.syncGSheet(data.currentDeck);
                  })),
        ],
      )),
      body: FutureBuilder<FCard>(
        future: data.nextCard(),
        builder: (BuildContext context, AsyncSnapshot<FCard> snapshot) {
          List<Widget> children;
          if (snapshot.hasData) {
            children = <Widget>[
              Expanded(
                child: FlipCard(),
              ),
              ButtonBar(
                alignment: MainAxisAlignment.spaceAround,
                children: <Widget>[
                  RaisedButton(
                    child: const Text('Hard'),
                    onPressed: () => data.reset(),
                  ),
                  RaisedButton(
                    child: const Text('Easy'),
                    onPressed: () => data.space(),
                  ),
                ],
              ),
            ];
          } else if (snapshot.hasError) {
            children = <Widget>[
              Icon(
                Icons.error_outline,
                color: Colors.red,
                size: 60,
              ),
              Padding(
                padding: const EdgeInsets.only(top: 16),
                child: Text('Error: ${snapshot.error}'),
              )
            ];
          } else {
            children = <Widget>[
              SizedBox(
                child: CircularProgressIndicator(),
                width: 60,
                height: 60,
              ),
              const Padding(
                padding: EdgeInsets.only(top: 16),
                child: Text('Downloading data...'),
              )
            ];
          }

          return Column(children: children);
        },
      ),
    );
  }
}

class FlipCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    print("FlipCard.build");
    return Consumer<FModel>(builder: (context, data, child) {
      return SizedBox.expand(
        child: Card(
            child: new InkWell(
          onTap: () => data.flipCard(),
          child: Center(
            child: Text(data.currentCard.flipped
                ? data.currentCard.answer
                : data.currentCard.question),
          ),
        )),
      );
    });
  }
}
