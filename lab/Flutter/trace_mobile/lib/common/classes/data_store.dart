import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class DataStore {
  static saveLoginDataInSecuredStorage(String loginDataJson) async {
    await const FlutterSecureStorage()
        .write(key: 'loginData', value: loginDataJson);
  }

  static getLoginDataFromSecuredStorage() async {
    var data = await const FlutterSecureStorage().read(key: 'loginData');
    return (data);
  }

  static saveDataInSecuredStorage(String key, String serializedData) async {
    await const FlutterSecureStorage()
        .write(key: key, value: serializedData);
  }

  static getDataFromSecuredStorage(String key) async {
    return await (const FlutterSecureStorage().read(key: key));
  }
}
