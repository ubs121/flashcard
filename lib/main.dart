import 'package:flashcard/deck_chooser.dart';
import 'package:flashcard/deck_player.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'deck_player.dart';
import 'model.dart';

void main() {
  runApp(FlashcardApp());
}

class FlashcardApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
        providers: [
          ChangeNotifierProvider(create: (context) => FModel()),
        ],
        child: MaterialApp(
          title: 'Flashcard',
          theme: ThemeData(
            primarySwatch: Colors.blue,
            visualDensity: VisualDensity.adaptivePlatformDensity,
          ),
          initialRoute: '/',
          routes: {
            '/': (context) => DeckChooser(),
            '/play': (context) => DeckPlayer(),
          },
        ));
  }
}
