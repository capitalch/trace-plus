import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:http/http.dart' as http;
import 'package:trace_mobile/common/classes/data_store.dart';
import 'package:trace_mobile/common/classes/utils.dart';
import '../../features/authentication/models/login_response.dart';
import '../../features/authentication/models/user_payload.dart';

class GlobalSettings extends ChangeNotifier {
  static const webUrl = 'https://develop.cloudjiffy.net/graphql';
  static const localUrl = 'https://develop.cloudjiffy.net/graphql';
  // static const localUrl = 'http://10.0.2.2:5000/graphql';

  // For REST API - remove /graphql
  static const restApiLocalUrl = 'http://localhost:8000';  // For web/desktop
  // static const restApiLocalUrl = 'http://10.0.2.2:8000';  // For Android emulator
  GlobalSettings() {
    // constructor loads loginData from secured storage
    loadLoginDataFromSecuredStorage();
    loadLoginData(); // Load REST API login data
    _initGraphQLLoginClient();
  }

  int? clientId, lastUsedBranchId, id; // id is actually userId
  GraphQLClient? _graphQLLoginClient;
  String? lastUsedBuCode, token, uid, userType;
  String serverUrl = kReleaseMode ? webUrl : localUrl;
  List<dynamic>? buCodes = [];
  List<dynamic>? buCodesWithPermissions;
  Map<String, String> unitInfo = {};
  List<Map<String, dynamic>> allBranches = [];
  List<Map<String, dynamic>> allFinYears = [];
  Map<String, dynamic> currentFinYearMap = {};
  Map<String, dynamic> currentBranchMap = {};

  // New properties for REST API login
  String? _accessToken;
  UserPayload? _userPayload;
  bool _isLoggedIn = false;

  String? get accessToken => _accessToken;
  UserPayload? get userPayload => _userPayload;
  bool get isLoggedIn => _isLoggedIn;

  GraphQLClient? get graphQLLoginClient {
    _graphQLLoginClient?.resetStore();
    return _graphQLLoginClient;
  }

  void _initGraphQLLoginClient() {
    _graphQLLoginClient = GraphQLClient(
        link: HttpLink(
          serverUrl,
        ),
        cache: GraphQLCache(store: InMemoryStore()));
    graphQLLoginClient?.resetStore();
  }

  GraphQLClient getGraphQLMainClient() {
    String selectionCriteria = [
      (lastUsedBuCode ?? ''),
      ':',
      currentFinYearMap['finYearId'],
      ':',
      (getCurrentBranchId())
    ].join();
    GraphQLClient graphQLMainClient = GraphQLClient(
        link: HttpLink(serverUrl, defaultHeaders: {
          'authorization': (token == null) ? '' : 'Bearer $token',
          'SELECTION-CRITERIA': selectionCriteria
        }),
        cache: GraphQLCache(store: InMemoryStore()));
    return graphQLMainClient;
  }

  void changeCurrentFinYear(int cnt) {
    int currentFinYearId = currentFinYearMap['finYearId'];
    currentFinYearId = currentFinYearId + cnt;
    var el = allFinYears
        .where((element) => element['finYearId'] == currentFinYearId);
    el.isNotEmpty ? (currentFinYearMap = el.first) : null;
    notifyListeners();
  }

  int getCurrentBranchId() {
    return currentBranchMap['branchId'] ?? 1;
  }

  String getLoginDataAsJson() {
    Map<String, dynamic> jsonObject = {
      'buCodes': buCodes,
      'buCodesWithPermissions': buCodesWithPermissions,
      'clientId': clientId,
      'lastUsedBranchId': getCurrentBranchId(),
      'lastUsedBuCode': lastUsedBuCode,
      'token': token,
      'uid': uid,
      'userType': userType,
      'id': id,
    };
    return json.encode(jsonObject);
  }

  bool isUserLoggedIn() {
    bool ret = (token == null) || (uid == null) || (clientId == null);
    return (!ret);
  }

  void justNotifyListeners() {
    notifyListeners();
  }

  Future loadLoginDataFromSecuredStorage() async {
    String? jLoginData = await DataStore.getLoginDataFromSecuredStorage();
    if (Utils.isValidJson(jLoginData)) {
      setLoginDataFromJson(jLoginData);
      notifyListeners();
    }
  }

  void resetLoginData() async {
    buCodes = buCodesWithPermissions =
        clientId = lastUsedBuCode = token = uid = userType = id = null;
    currentBranchMap = {};
    currentFinYearMap = {};
    await DataStore.saveLoginDataInSecuredStorage(getLoginDataAsJson());
    notifyListeners();
  }

  void setCurrentBranchMap(branchId) {
    var el = allBranches.where((element) => element['branchId'] == branchId);
    if (el.isNotEmpty) {
      currentBranchMap = el.first;
    }
  }

  void setDemoLoginData() {
    var demoLoginData = {
      'buCodes': ['demoUnit1'],
      "buCodesWithPermissions": [],
      'clientId': 2,
      'lastUsedBranchId': 1,
      'lastUsedBuCode': 'demoUnit1',
      'token':
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJkIiwidXNlclR5cGUiOiJhIiwiaWQiOjIsImNsaWVudElkIjoyfQ.rZd0cUhxNqIHrl8Pp2pylYm0DLZA5kPRP6xx61xgkNw',
      'uid': 'd',
      'userType': 'a',
      "id": 2,
    };
    allBranches.add({'id': 1, 'branchName': 'Head office', 'branchCode': 'HD'});
    setLoginData(demoLoginData,
        isNotifyListeners: false, isSaveDataInSecuredStorage: false);
  }

  void setLastUsedBranch(String branchId) {
    lastUsedBranchId = int.parse(branchId);
    setCurrentBranchMap(lastUsedBranchId);
  }

  void setLastUsedBuCode(String buCode) {
    lastUsedBuCode = buCode;
    // notifyListeners();
  }

  void setLoginData(dynamic loginData,
      {bool isNotifyListeners = true,
      isSaveDataInSecuredStorage = true}) async {
    buCodes = loginData['buCodes'];
    buCodesWithPermissions = loginData['buCodesWithPermissions'];
    clientId = loginData['clientId'];
    lastUsedBranchId = loginData['lastUsedBranchId'] ?? 1;
    setCurrentBranchMap(loginData['lastUsedBranchId']);
    lastUsedBuCode = loginData['lastUsedBuCode'];
    token = loginData['token'];
    uid = loginData['uid'];
    userType = loginData['userType'];
    id = loginData['id'];
    if (isSaveDataInSecuredStorage) {
      await DataStore.saveLoginDataInSecuredStorage(getLoginDataAsJson());
    }
    isNotifyListeners ? notifyListeners() : null;
  }

  void setLoginDataFromJson(loginDataJson) {
    Map<String, dynamic> loginDataObject = json.decode(loginDataJson);
    setLoginData(loginDataObject);
  }

  void setUnitInfoFinYearsBranches({
    dynamic branches,
    dynamic currentFinYearObject,
    dynamic finYears,
    dynamic uInfo,
  }) {
    unitInfo = Map<String, String>.from(
        uInfo ?? {'unitName': 'Unit info is not provided'});
    allBranches = List<Map<String, dynamic>>.from(branches);
    allFinYears = List<Map<String, dynamic>>.from(finYears);
    currentFinYearMap = Map<String, dynamic>.from(currentFinYearObject);
    setCurrentBranchMap(lastUsedBranchId);
    // notifyListeners();
  }

  /// Store login response data
  Future<void> setLoginDataRest(LoginResponse response) async {
    _accessToken = response.accessToken;
    _userPayload = response.payload;
    _isLoggedIn = true;

    // Store to secure storage
    await DataStore.saveLoginDataInSecuredStorage(
      jsonEncode({
        'accessToken': _accessToken,
        'payload': _userPayload!.toJson(),
      }),
    );

    notifyListeners();
  }

  /// Load login data from secure storage
  Future<void> loadLoginData() async {
    final loginDataJson = await DataStore.getLoginDataFromSecuredStorage();
    if (loginDataJson != null && loginDataJson.isNotEmpty) {
      try {
        final data = jsonDecode(loginDataJson);
        if (data.containsKey('accessToken') && data.containsKey('payload')) {
          _accessToken = data['accessToken'];
          _userPayload = UserPayload.fromJson(data['payload']);
          _isLoggedIn = true;
          notifyListeners();
        }
      } catch (e) {
        // If parsing fails, it might be old format, ignore
      }
    }
  }

  /// Clear login data (logout)
  Future<void> clearLoginData() async {
    _accessToken = null;
    _userPayload = null;
    _isLoggedIn = false;
    await DataStore.saveLoginDataInSecuredStorage('');
    notifyListeners();
  }

  /// Get authorization headers for authenticated requests
  Map<String, String> getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
    };
  }

  /// Make authenticated HTTP GET request
  Future<http.Response> get(String endpoint) async {
    final uri = Uri.parse('$restApiLocalUrl$endpoint');
    return await http.get(uri, headers: getAuthHeaders())
        .timeout(const Duration(seconds: 10));
  }

  /// Make authenticated HTTP POST request
  Future<http.Response> post(String endpoint, {Object? body}) async {
    final uri = Uri.parse('$restApiLocalUrl$endpoint');
    return await http.post(
      uri,
      headers: getAuthHeaders(),
      body: body != null ? jsonEncode(body) : null,
    ).timeout(const Duration(seconds: 10));
  }
}
