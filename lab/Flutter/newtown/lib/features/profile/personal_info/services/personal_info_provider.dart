import 'package:flutter/cupertino.dart';

import '/api/api.dart';
import '/local_storage/token_storage.dart';
import '../models/personal_info.dart';

class PersonalInfoProvider with ChangeNotifier {
  final _api = DioApi();
  final _tokenStorage = TokenStorage.instance;
  late PersonalInfo _info;

  PersonalInfo get info => _info;

  Future<PersonalInfo> fetchPersonalInfo() async {
    final token = await _tokenStorage.getToken();
    final response = await _api
        .get('/profile/personalDetails/get', headers: {'token': token});
    if (response.success) {
      final dynamic data = response.data['data'];
      _info = PersonalInfo.fromJson(data);
      return _info;
    } else {
      _info = PersonalInfo(); //TODO: Remove if server send empty response
      return _info;
      //throw Exception(response.errorMsg);
    }
  }

  Future<bool> updatePersonalInfo(PersonalInfo info) async {
    final token = await _tokenStorage.getToken();
    final response = await _api.post('/profile/personalDetails/add',
        headers: {'token': token}, body: info.toJson());
    if (response.success) {
      //await fetchPersonalInfo();
      return response.success;
    }
    throw Exception(response.errorMsg);
  }
}
