import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
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
  String _searchQuery = '';
  String _debouncedSearchQuery = '';
  Timer? _debounceTimer;
  List<String> _searchHistory = [];
  Set<int> _hiddenProductIds = {};
  bool _showActiveOnly = true; // Show active products (clos/op/sale != 0) by default
  bool _showJakarOnly = false; // Show Jakar products (age > 360) by default off
  static const String _searchHistoryKey = 'products_search_history';
  static const int _maxHistoryItems = 10;

  List<ProductsModel> get products => _products;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Future<void>? get productsFuture => _productsFuture;
  String get searchQuery => _searchQuery;
  List<String> get searchHistory => _searchHistory;
  Set<int> get hiddenProductIds => _hiddenProductIds;
  int get hiddenProductsCount => _hiddenProductIds.length;
  bool get showActiveOnly => _showActiveOnly;
  bool get showJakarOnly => _showJakarOnly;

  /// Helper to normalize text for search (remove special chars, lowercase, trim)
  String _normalizeSearchText(String text) {
    return text
        .toLowerCase()
        .replaceAll('-', '')
        .replaceAll('_', '')
        .trim();
  }

  /// Get filtered products based on debounced search query
  List<ProductsModel> get filteredProducts {
    // Start with all products or search-filtered products
    List<ProductsModel> filtered;

    if (_debouncedSearchQuery.isEmpty) {
      filtered = _products;
    } else {
      final normalizedQuery = _normalizeSearchText(_debouncedSearchQuery);
      if (normalizedQuery.isEmpty) {
        filtered = _products;
      } else {
        filtered = _products.where((product) {
          final searchableText = [
            product.catName,
            product.brandName,
            product.label,
            product.info,
            product.productCode,
          ].map((field) => _normalizeSearchText(field)).join(' ');

          return searchableText.contains(normalizedQuery);
        }).toList();
      }
    }

    // Apply active products filter
    if (_showActiveOnly) {
      filtered = filtered.where((product) {
        return product.clos != 0 || product.op != 0 || product.sale != 0;
      }).toList();
    }

    // Apply Jakar filter (products with age > 360 days)
    if (_showJakarOnly) {
      filtered = filtered.where((product) {
        return product.age > 360;
      }).toList();
    }

    // Filter out hidden products
    filtered = filtered.where((product) {
      return !_hiddenProductIds.contains(product.id);
    }).toList();

    return filtered;
  }

  /// Calculate total purchase price (excl. GST) for filtered products
  double get totalPurchasePrice {
    return filteredProducts.fold(0.0, (sum, product) {
      return sum + (product.lastPurchasePrice * product.clos);
    });
  }

  /// Calculate total purchase price (incl. GST) for filtered products
  double get totalPurchasePriceGst {
    return filteredProducts.fold(0.0, (sum, product) {
      return sum + (product.lastPurchasePriceGst * product.clos);
    });
  }

  /// Update search query with debouncing (1200ms delay)
  void setSearchQuery(String query) {
    _searchQuery = query;

    // Cancel previous timer if it exists
    _debounceTimer?.cancel();

    // Set up new timer for debounced search
    _debounceTimer = Timer(const Duration(milliseconds: 1800), () {
      _debouncedSearchQuery = query;
      // Save to history if query is not empty
      if (query.trim().isNotEmpty) {
        addToSearchHistory(query);
      }
      notifyListeners();
    });
  }

  /// Clear search query
  void clearSearch() {
    _debounceTimer?.cancel();
    _searchQuery = '';
    _debouncedSearchQuery = '';
    notifyListeners();
  }

  /// Load search history from SharedPreferences
  Future<void> loadSearchHistory() async {
    final prefs = await SharedPreferences.getInstance();
    _searchHistory = prefs.getStringList(_searchHistoryKey) ?? [];
    notifyListeners();
  }

  /// Save search history to SharedPreferences
  Future<void> _saveSearchHistory() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setStringList(_searchHistoryKey, _searchHistory);
  }

  /// Add search term to history
  Future<void> addToSearchHistory(String query) async {
    final normalizedQuery = query.trim();
    if (normalizedQuery.isEmpty) return;

    // Remove if already exists (to move to top)
    _searchHistory.remove(normalizedQuery);

    // Add to beginning
    _searchHistory.insert(0, normalizedQuery);

    // Limit to max items
    if (_searchHistory.length > _maxHistoryItems) {
      _searchHistory = _searchHistory.sublist(0, _maxHistoryItems);
    }

    await _saveSearchHistory();
    notifyListeners();
  }

  /// Remove search term from history
  Future<void> removeFromSearchHistory(String query) async {
    _searchHistory.remove(query);
    await _saveSearchHistory();
    notifyListeners();
  }

  /// Clear all search history
  Future<void> clearSearchHistory() async {
    _searchHistory.clear();
    await _saveSearchHistory();
    notifyListeners();
  }

  /// Hide a product from view
  void hideProduct(int productId) {
    _hiddenProductIds.add(productId);
    notifyListeners();
  }

  /// Unhide a product (restore to view)
  void unhideProduct(int productId) {
    _hiddenProductIds.remove(productId);
    notifyListeners();
  }

  /// Clear all hidden products (restore all)
  void clearHiddenProducts() {
    _hiddenProductIds.clear();
    notifyListeners();
  }

  /// Toggle active products filter
  void toggleActiveOnlyFilter() {
    _showActiveOnly = !_showActiveOnly;
    notifyListeners();
  }

  /// Toggle Jakar products filter (age > 360 days)
  void toggleJakarFilter() {
    _showJakarOnly = !_showJakarOnly;
    notifyListeners();
  }

  /// Reset filters to default values
  void resetFilters() {
    _showActiveOnly = true; // Default: show active products
    _showJakarOnly = false; // Default: Jakar filter off
    notifyListeners();
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }

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
