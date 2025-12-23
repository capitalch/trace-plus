import 'package:flutter/foundation.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import 'token_storage_service.dart';

class GraphQLService {
  static const String _graphqlEndpoint = 'http://localhost:8000/graphql';

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
    final HttpLink httpLink = HttpLink(_graphqlEndpoint);

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
    );
  }

  /// Refresh the GraphQL client (call after login/logout to update auth token)
  Future<void> refreshClient() async {
    final newClient = await _createClient();
    _clientNotifier?.value = newClient;
  }

  /// Create GraphQL client without authentication (for public queries like login)
  GraphQLClient getPublicClient() {
    final HttpLink httpLink = HttpLink(_graphqlEndpoint);

    return GraphQLClient(
      cache: GraphQLCache(store: InMemoryStore()),
      link: httpLink,
    );
  }

  /// Get the GraphQL endpoint
  static String get graphqlEndpoint => _graphqlEndpoint;
}
