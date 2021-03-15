import 'package:flutter/cupertino.dart';
import 'package:googleapis_auth/auth_io.dart';
import 'package:googleapis/sheets/v4.dart';

// data model
class FModel extends ChangeNotifier {
  final List<FDeck> allDecks = [
    FDeck(
        name: 'English-UB',
        sheetId: '1N6kWNFnKomm2u1rHfCSC-sgLpgUE2B6K6Rw1GYinV_Q'),
    FDeck(
        name: 'Bolor', sheetId: '1dY0c-ZXONtfhncm5eN0yfmS2GAoTONXauXpDkQRxSJw')
  ]; // all decks

  FDeck currentDeck; // current deck
  FCard currentCard; // current card

  // flip card
  void flipCard() {
    this.currentCard.flipped = !this.currentCard.flipped;
    notifyListeners();
  }

  // easy to remember
  void space() {
    this.currentCard.space();
    nextCard();
    notifyListeners();
  }

  // hard to remember
  void reset() {
    this.currentCard.reset();
    nextCard();
    notifyListeners();
  }

  // pick top card
  Future<FCard> nextCard() async {
    if (currentDeck.isEmpty()) {
      await syncGSheet(currentDeck);
    }
    // sort by interval
    this
        .currentDeck
        .cards
        .sort((FCard a, b) => a.interval.compareTo(b.interval));

    this.currentCard = this.currentDeck.cards[0]; // take first card
    this.currentCard.flipped = false; // always front faced

    return Future.value(this.currentCard);
  }

  // sync deck data with a google sheet
  Future<void> syncGSheet(FDeck deck) async {
    print("syncing ${deck.name} ...");

    var client = await clientViaServiceAccount(_credentials, _SCOPES);

    SheetsApi gs = SheetsApi(client);
    ValueRange range = await gs.spreadsheets.values.get(
        deck.sheetId, "A2:C1000",
        majorDimension: "ROWS", valueRenderOption: "UNFORMATTED_VALUE");

    print("rows ${range.values.length}");

    var tmpCards = new List<FCard>();

    // download range TODO: check local cache
    for (var row in range.values) {
      if (row.length > 1) {
        FCard c = new FCard();
        c.question = row[0].toString();
        c.answer = row[1].toString();

        if (row.length > 2) {
          c.interval = double.parse(row[2].toString());
        } else {
          c.interval = 0.0;
        }

        tmpCards.add(c); // add into collection
      }
    }

    // sync range
    if (deck.cards != null) {
      var rows = new List<List<Object>>();

      for (var c in deck.cards) {
        var r = List<Object>();
        r.add(c.question);
        r.add(c.answer);
        r.add(c.interval);

        rows.add(r);
      }

      // upload
      var range = new ValueRange();
      range.values = rows;
      await gs.spreadsheets.values
          .update(range, deck.sheetId, "A2:1000", valueInputOption: "RAW");
    }

    deck.cards = tmpCards;
  }

  // convert cards to a range
  ValueRange toRange(List<FCard> cards) {
    return null;
  }
}

// FDeck is collection of cards
class FDeck extends ChangeNotifier {
  String name; // deck label
  String sheetId; // google sheet ID
  List<FCard> cards; // cards

  FDeck({this.name, this.sheetId});

  bool isEmpty() {
    return (this.cards == null || this.cards.length == 0);
  }
}

// Card item, one row of a deck
class FCard {
  String question;
  String answer;
  double interval; // display interval
  bool flipped;

  // space the card
  void space() {
    if (this.interval > 0.0) {
      this.interval = 2 * this.interval;
    } else {
      this.interval = 1.0;
    }
  }

// reset the card
  void reset() {
    if (this.interval > 0.0) {
      this.interval = 1.01 * this.interval;
    } else {
      this.interval = 0.3;
    }
  }
}

// flashcard app credentials
final _credentials = new ServiceAccountCredentials.fromJson(r'''
{
  "type": "service_account",
  "project_id": "flashcard-121",
  "private_key_id": "69d269a1899ed928a5da7055b4acec4464988061",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCuXF1UfybqW/fl\nQTJk21+7zMkoPg01+VjdCoC5mO5QmpB0n+C7iGR5ZXWrBGT9l1SwKVbrwSW4ilcW\nxruAYu/yPKD45PaFvezmg80mOxfWgt4iRRP5xWysMiC0PzKzlDPfTXgGZ6meA6GZ\nG6XB7MdXNbRmuH8heQdrMu6Pu+KvvrDZ9x1kke2/MOjIUNFSM+NHeGe93DS4rQIf\ntGZAGeVbeE/qCqewRpRxzyVSXnSdoISVhQaa0BlgbmxEal9kbvnQggNQ7JNpsq1w\nnnc6nlm+Zazh4ScOMjCz/sFVkZq2FgJqBRZnXI4tz47CWMVYvgPfPQ9l/3I7ihnn\nm2M7fQxxAgMBAAECggEAAKVrO6BOgb0WQ7lcgVLuTYT+ZFmphR8P0R7kN/vc+zu9\naA89HxjL7Ya+m0QEh0uPpuj6T1ybgg3yMW2KXZkQRFSs8IsxrjB0X6zSnm8G4TbC\nMbyRjMIKa29yn1RiINf+YrgX5ycscd9X0phPgpLY8MXsTZqmrvYyvLcXOv1iY04X\nJ5k/PZJjh4vHxKvI7tFenc8AzLjqWa8bL82H4bjbdMvWCnrH2p+oUV7g6lDXMGxl\nohpLJ9y+Vl1DF+8p4Cb1sS6Bt02EgfEbDykGLjJX5//oFr0W4s/9K/i0P2aR9OuF\n1K3mP50RqfTKET3m9NxdbdCg6bc7V4sd7ZMSIrw0wQKBgQDw7TH5kXgFPQoE3qb7\neFohvQybQ9YeOOCe3xBXtHuNh/kTnmu0uAHWD4hWSn2XX0WV9JZsAvAgxcUj3V66\nnwnLIOpAWq02AZ7fbIPWGCgLORc2RzSJW3wuXtZuVIdR4MSEbbJ6ZrIruHGROD83\nNtk+lCTYmGxakJI/4zC2tg0AIQKBgQC5RQSNSa0agySVLKuzv/in7JWVKllHzXKq\nwnQqvOgR1Y97NHz/+4zgFWNcmCTYONzIa4REycjV1sS7ezJRCY3tUXEiKHajaUaH\ngqH6XRFn2fVvd9W5Vp1BfCf2I1tVGMxrMffGSETngSSFNtze4nG05diZhRanpkSx\n5MvzemfCUQKBgBgYAHlu3MvZUNkv0w8u+ASLvWkBnbYkBgKdWCsNN5Xt1TDrFOZb\nyIM5xm6qwGiU9IaMkUZ3/L+qR47QopqTMQ2JWyPYbZ4LB3JcjcqpW8fTi8i30j8y\nUPbqMROTjHzZt41u0vx+rK7GoUTelSPWbl9dvVmT1LIx5w5QkByVlDNBAoGBAKeK\ntJ0YnYQ2SGTmqre4ySMCnhrw2yBFuIaXpvnnL27BVCm0w72yPCmA7gQUSm2GrpJI\nOKsEV6yZtftdY5lJLKIKXmbndLI+R9vP1K9WbqEdyAhvtEURANDxeCnsu3FvJZ1i\n6JDVVgqNDPuzK3YcDXvrxz69zkj54XGGWLHsZdyhAoGAJf9A1yiws21M8WfE3Hph\nWvGtDAzb4USZAcFbycCh3ve694ve1ibv6LM7sXH8YjfkyIBcB8OcNWNprrGjBO5G\neH08mboVxE5HxNpgMqS6qynYyZQYnDylgeNmI+xlb//Ge7XvGXaHAXq09pmlRrHZ\n+bTThXeSvIU+x3Up7tO7i1M=\n-----END PRIVATE KEY-----\n",
  "client_email": "gsheets@flashcard-121.iam.gserviceaccount.com",
  "client_id": "110309591012373918449",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/gsheets%40flashcard-121.iam.gserviceaccount.com"
}
''');

const _SCOPES = const [SheetsApi.SpreadsheetsScope];
