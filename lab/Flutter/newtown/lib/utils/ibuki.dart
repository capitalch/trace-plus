import 'dart:async' show Future, StreamController;

class Ibuki {
  static StreamController<Map<String, dynamic>> _streamController =
      StreamController.broadcast();

  static void emit(dynamic id, dynamic data) {
    _streamController.add({"id": id, "data": data});
  }

  static Stream<Map<dynamic, dynamic>> filterOn(dynamic id) {
    return (_streamController.stream.where((d) => d['id'] == id));
  }

  static Future<Map<dynamic, dynamic>> filterOnFuture(dynamic id) {
    return _streamController.stream.where((d) => d['id'] == id).first;
  }

  static void close() {
    _streamController.close();
  }
}

// void httpPost (String id, {dynamic args}) async {
//   dynamic d  = await globals.httpPost(id, args: args);
//   List<dynamic> resultSet = json.decode((d.body)).toList();
//   _streamController.add({'id': id, 'data': resultSet});
// }
