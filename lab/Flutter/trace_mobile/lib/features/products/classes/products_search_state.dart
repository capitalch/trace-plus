import 'package:flutter/cupertino.dart';

class ProductsSearchState extends ChangeNotifier {
  String _searcFromTag = '';
  String get searchFromTag {
    return _searcFromTag;
  }

  set searchFromTag(String val) {
    _searcFromTag = val;
    if (val != '') {
      notifyListeners(); // enforce refresh only when value not empty
    }
  }
}
