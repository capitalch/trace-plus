import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:dio/dio.dart';

class HttpProvider1 extends ChangeNotifier {
  late List<Item> _items = [];
  late String _data ='';

  List<Item> get items => _items;
  String get data => _data;

  void httpGetItem(String url) async {
    final uri = Uri.parse(url);
    final response = await http.get(uri);
    if (response.statusCode == 200) {
      final List data = jsonDecode(response.body);
      // Assuming the response body is a JSON object
      // _item = Item.fromJson({'id': 1, 'title': 'Sample Title', 'body': data});
      _items = data.map(  (json) => Item.fromJson(json)).toList();
      _data = data.toString();
      notifyListeners();
    } else {
      throw Exception('Failed to load item');
    }
  }

  void dioGetItems(String url) async {
    final response = await Dio().get(url);
    if (response.statusCode == 200) {
      final List data = response.data;
      _items = data.map((json) => Item.fromJson(json)).toList();
      notifyListeners();
    } else {
      throw Exception('Failed to load items via Dio');
    }
  } 

}

class Item {
  final int id;
  final String title;
  final String body;

  Item({required this.id, required this.title, required this.body});

  factory Item.fromJson(Map<String, dynamic> json) {
    return Item(
      id: json['id'],
      title: json['title'],
      body: json['body'],
    );
  }
}
