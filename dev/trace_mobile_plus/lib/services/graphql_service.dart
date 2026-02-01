import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'token_storage_service.dart';
import '../core/app_settings.dart';
import '../core/exceptions/token_expired_exception.dart';
import '../graphql/queries/generic_query.dart';
import '../graphql/queries/trial_balance.dart';
import '../graphql/queries/balance_sheet_profit_loss.dart';

class GraphQLService {
  final TokenStorageService _tokenStorage = TokenStorageService();

  // Singleton pattern
  static final GraphQLService _instance = GraphQLService._internal();
  factory GraphQLService() => _instance;
  GraphQLService._internal();

  // ValueNotifier to manage GraphQL client state
  ValueNotifier<GraphQLClient>? _clientNotifier;

  /// Initialize and get the GraphQL client notifier
  Future<ValueNotifier<GraphQLClient>> getClientNotifier() async {
    if (_clientNotifier == null) {
      final client = await _createClient();
      _clientNotifier = ValueNotifier(client);
    }
    return _clientNotifier!;
  }

  /// Create GraphQL client with authentication
  Future<GraphQLClient> _createClient() async {
    final HttpLink httpLink = HttpLink(AppSettings.graphQlUrl);

    // Create auth link that dynamically gets token
    final AuthLink authLink = AuthLink(
      getToken: () async {
        final token = await _tokenStorage.getToken();
        return token != null ? 'Bearer $token' : null;
      },
    );

    // Combine links
    final Link link = authLink.concat(httpLink);

    // Create and return client
    return GraphQLClient(
      cache: GraphQLCache(store: InMemoryStore()),
      link: link,
      defaultPolicies: DefaultPolicies(
        query: Policies(fetch: FetchPolicy.noCache),
        mutate: Policies(fetch: FetchPolicy.noCache)
      )
    );
  }

  /// Refresh the GraphQL client (call after login/logout to update auth token)
  Future<void> refreshClient() async {
    final newClient = await _createClient();
    _clientNotifier?.value = newClient;
  }

  /// Check if the query result indicates a token expiration error
  void _checkTokenExpiration(QueryResult result) {
    if (result.hasException) {
      final exception = result.exception;
      if (exception != null) {
        final errorString = exception.toString().toLowerCase();
        if (errorString.contains('401') ||
            errorString.contains('unauthorized') ||
            errorString.contains('token expired') ||
            errorString.contains('jwt expired') ||
            errorString.contains('invalid token') ||
            errorString.contains('token is invalid') ||
            errorString.contains('authentication failed')) {
          throw TokenExpiredException();
        }
      }
    }
  }

  /// Execute GenericQuery with authentication
  Future<QueryResult> executeGenericQuery({
    required String buCode,
    Map<String, String?>? dbParams,
    required String sqlId,
    Map<String, dynamic>? sqlArgs,
  }) async {
    // Get dbName from AppSettings
    final dbName = AppSettings.dbName;
    if (dbName == null) {
      throw Exception('Database name not available in AppSettings');
    }

    final client = await getClientNotifier();

    // Create value object
    final valueObject = {
      'buCode': buCode,
      'dbParams': dbParams,
      'sqlId': sqlId,
      'sqlArgs': sqlArgs ?? {},
    };

    // Convert to JSON string
    final valueString = jsonEncode(valueObject);

    final QueryOptions options = QueryOptions(
      document: gql(genericQuery),
      variables: {'dbName': dbName, 'value': valueString},
      fetchPolicy: FetchPolicy.noCache,
    );

    final result = await client.value.query(options).timeout(
      const Duration(seconds: 30),
      onTimeout: () {
        throw Exception('Query timeout: The request took too long to complete');
      },
    );

    _checkTokenExpiration(result);
    return result;
  }

  Future<QueryResult> executeTrialBalance({
    required String buCode,
    Map<String, String?>? dbParams,
    required String sqlId,
    Map<String, dynamic>? sqlArgs,
  }) async {
    // Get dbName from AppSettings
    final dbName = AppSettings.dbName;
    if (dbName == null) {
      throw Exception('Database name not available in AppSettings');
    }

    final client = await getClientNotifier();

    // Create value object
    final valueObject = {
      'buCode': buCode,
      'dbParams': dbParams,
      'sqlId': sqlId,
      'sqlArgs': sqlArgs ?? {},
    };

    // Convert to JSON string
    final valueString = jsonEncode(valueObject);

    final QueryOptions options = QueryOptions(
      document: gql(trialBalance),
      variables: {'dbName': dbName, 'value': valueString},
      fetchPolicy: FetchPolicy.noCache,
    );

    final result = await client.value.query(options).timeout(
      const Duration(seconds: 30),
      onTimeout: () {
        throw Exception('Query timeout: The request took too long to complete');
      },
    );

    _checkTokenExpiration(result);
    return result;
  }

  Future<QueryResult> executeBalanceSheetProfitLoss({
    required String buCode,
    Map<String, String?>? dbParams,
    required String sqlId,
    Map<String, dynamic>? sqlArgs,
  }) async {
    // Get dbName from AppSettings
    final dbName = AppSettings.dbName;
    if (dbName == null) {
      throw Exception('Database name not available in AppSettings');
    }

    final client = await getClientNotifier();

    // Create value object
    final valueObject = {
      'buCode': buCode,
      'dbParams': dbParams,
      'sqlId': sqlId,
      'sqlArgs': sqlArgs ?? {},
    };

    // Convert to JSON string
    final valueString = jsonEncode(valueObject);

    final QueryOptions options = QueryOptions(
      document: gql(balanceSheetProfitLoss),
      variables: {'dbName': dbName, 'value': valueString},
      fetchPolicy: FetchPolicy.noCache,
    );

    final result = await client.value.query(options).timeout(
      const Duration(seconds: 30),
      onTimeout: () {
        throw Exception('Query timeout: The request took too long to complete');
      },
    );

    _checkTokenExpiration(result);
    return result;
  }

  /// Create GraphQL client without authentication (for public queries like login)
  GraphQLClient getPublicClient() {
    final HttpLink httpLink = HttpLink(AppSettings.graphQlUrl);

    return GraphQLClient(
      cache: GraphQLCache(store: InMemoryStore()),
      link: httpLink,
    );
  }

  /// Get the GraphQL endpoint
  static String get graphqlEndpoint => AppSettings.graphQlUrl;
}
