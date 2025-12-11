import 'package:flutter/cupertino.dart';

class ProductsTagsState extends ChangeNotifier {
  List<String> _productsTags = [];

  List<String> get productsTags {
    return _productsTags;
  }

  set productsTags(List<String> tagsList) {
    _productsTags = tagsList;
    notifyListeners();
  }

  void addTag(String tag) {
    tag = tag.trim();
    if ((tag != '') && (!_productsTags.contains(tag))) {
      _productsTags.add(tag);
      _productsTags.sort();
      notifyListeners();
    }
  }

  void removeTag(String tag) {
    _productsTags.remove(tag);
    _productsTags.sort();
    notifyListeners();
  }
}
