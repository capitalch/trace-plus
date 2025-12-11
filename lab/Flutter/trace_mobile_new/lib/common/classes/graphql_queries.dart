import 'dart:convert';

import 'package:graphql_flutter/graphql_flutter.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';

class GraphQLQueries {
  static login(String credentials) {
    return gql('''query login {
         authentication {
         doLogin(credentials:"$credentials")
        }}''');
  }

  static Future<QueryResult<Object>>? genericUpdateMaster({
    String? sqlKey,
    Map<String, dynamic>? args,
    String? tableName,
    required GlobalSettings globalSettings,
    required String entityName,
  }) {
    String value = GQLGenericUpdateValue(sqlKey: sqlKey, args: args, tableName: tableName).toString();
    var gq = gql('''
        mutation genericUpdateMaster {
          $entityName {
            genericUpdateMaster(value: "$value")
          }
        }
    ''');
    return globalSettings.getGraphQLMainClient()?.query(
        QueryOptions(document: gq, operationName: 'genericUpdateMaster'));
  }

  static Future<QueryResult<Object>>? genericView({
    required String sqlKey,
    bool isMultipleRows = false,
    Map<String, dynamic>? args,
    required GlobalSettings globalSettings,
    String entityName = 'accounts',
  }) {
    String value = GQLGenericViewValue(
      sqlKey: sqlKey,
      isMultipleRows: isMultipleRows,
      args: args,
    ).toString();
    var gq = gql('''
      query genericView {
        $entityName {
          genericView(value: "$value")
        }
      }
    ''');
    return globalSettings.getGraphQLMainClient()?.query(
      QueryOptions(document: gq, operationName: 'genericView'),
    );
  }

  static Future<QueryResult<Object>>? trialBalance({required GlobalSettings globalSettings}) {
    var gq = gql('''
      query trialBalance {
        accounts {
          trialBalance()
        }
      }
    ''');
    return globalSettings.getGraphQLMainClient().query(
      QueryOptions(document: gq, operationName: 'trialBalance'),
    );
  }

  static Future<QueryResult<Object>>? balanceSheetProfitLoss({required GlobalSettings globalSettings}) {
    var gq = gql('''
      query balanceSheetProfitLoss {
        accounts {
          balanceSheetProfitLoss()
        }
      }
    ''');
    return globalSettings.getGraphQLMainClient().query(
      QueryOptions(document: gq, operationName: 'balanceSheetProfitLoss'),
    );
  }
}

class GQLGenericViewValue {
  GQLGenericViewValue(
      {required this.sqlKey, this.isMultipleRows = false, this.args});
  final String sqlKey;
  final bool isMultipleRows;
  final Map<String, dynamic>? args;

  @override
  String toString() {
    String str = json.encode(
        {"sqlKey": sqlKey, "isMultipleRows": isMultipleRows, "args": args});
    return Uri.encodeFull(str);
  }
}

class GQLGenericUpdateValue {
  GQLGenericUpdateValue({this.sqlKey, this.args, this.tableName});
  final String? sqlKey;
  final Map<String, dynamic>? args;
  final String? tableName;

  @override
  String toString() {
    String str = json.encode({"sqlKey": sqlKey, "data": args, "tableName": tableName});
    return Uri.encodeFull(str);
  }
}
