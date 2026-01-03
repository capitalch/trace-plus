import 'package:flutter/foundation.dart';
import 'package:trace_mobile_plus/core/sql_ids_map.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import 'package:trace_mobile_plus/models/products_model.dart';
import 'package:trace_mobile_plus/services/graphql_service.dart';
import 'package:trace_mobile_plus/core/app_settings.dart';

class ProductsProvider extends ChangeNotifier {
  final GraphQLService _graphqlService = GraphQLService();

  List<ProductsModel> _products = [];
  bool _isLoading = false;
  String? _errorMessage;
  Future<void>? _productsFuture;

  List<ProductsModel> get products => _products;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Future<void>? get productsFuture => _productsFuture;

  /// Fetch products data from GraphQL
  Future<void> fetchProductsData(GlobalProvider globalProvider) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Get required parameters from GlobalProvider and AppSettings
      final branchId = globalProvider.selectedBranch?.branchId;
      final finYearId = globalProvider.selectedFinYear?.finYearId;
      final buCode = globalProvider.selectedBusinessUnit?.buCode;
      final dbParams = AppSettings.dbParams;

      if (branchId == null ||
          finYearId == null ||
          buCode == null ||
          dbParams == null) {
        throw Exception(
          'Missing required parameters. Please ensure branch, financial year, and business unit are selected.',
        );
      }

      // Execute GraphQL query
      final result = await _graphqlService.executeGenericQuery(
        buCode: buCode,
        dbParams: dbParams,
        sqlId: SqlIdsMap.getProductsInfo,
        sqlArgs: {
          'branchId': branchId,
          'finYearId': finYearId,
          'buCode': buCode,
          'dbParams': dbParams,
        },
      );

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      // Parse the result
      final data = result.data?['genericQuery'] as List<dynamic>?;
      if (data == null || data.isEmpty) {
        _products = [];
      } else {
        _products = data.map((item) {
          return ProductsModel.fromJson(item);
        }).toList();
      }

      _isLoading = false;
      _errorMessage = null;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _products = [];
    }

    notifyListeners();
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Refresh products data - triggers a new fetch and updates the future
  void refreshProducts(GlobalProvider globalProvider) {
    _productsFuture = fetchProductsData(globalProvider);
    notifyListeners();
  }

  /// Initialize and fetch products data
  void initialize(GlobalProvider globalProvider) {
    refreshProducts(globalProvider);
  }
}
