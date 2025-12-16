import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:trace_mobile/common/classes/data_store.dart';
import 'package:trace_mobile/common/classes/utils.dart';

class GlobalSettings extends ChangeNotifier {
  static const webUrl = 'https://develop.cloudjiffy.net/graphql';
  static const localUrl = 'https://develop.cloudjiffy.net/graphql';
  // static const localUrl = 'http://10.0.2.2:5000/graphql';
  GlobalSettings() {
    // constructor loads loginData from secured storage
    loadLoginDataFromSecuredStorage();
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
}
