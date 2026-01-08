import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile_plus/core/sql_ids_map.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import '../models/account_model.dart';
import '../services/graphql_service.dart';
import '../core/app_settings.dart';

class ProfitLossProvider extends ChangeNotifier {
  final GraphQLService _graphqlService = GraphQLService();

  // Profit & Loss data - separate lists for income and expenses
  List<AccountModel> _incomeData = [];
  List<AccountModel> _expensesData = [];
  bool _isLoading = false;
  String? _errorMessage;
  Future<void>? _profitLossFuture;
  DateTime? _toDate;
  String _searchQuery = '';

  List<AccountModel> get incomeData =>
      _searchQuery.isEmpty ? _incomeData : _getFilteredAccounts(_incomeData);

  List<AccountModel> get expensesData => _searchQuery.isEmpty
      ? _expensesData
      : _getFilteredAccounts(_expensesData);

  String get searchQuery => _searchQuery;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Future<void>? get profitLossFuture => _profitLossFuture;
  DateTime? get toDate => _toDate;

  // Calculate total income (where closingDc == 'C')
  double get totalIncome {
    double total = 0;
    for (var account in _incomeData) {
      if (account.closingDc == 'C') {
        total += account.closing;
      } else {
        total -= account.closing;
      }
    }
    return total;
  }

  // Calculate total expenses (where closingDc == 'D')
  double get totalExpenses {
    double total = 0;
    for (var account in _expensesData) {
      if (account.closingDc == 'D') {
        total += account.closing;
      } else {
        total -= account.closing;
      }
    }
    return total;
  }

  /// Fetch profit & loss data from GraphQL
  Future<void> fetchProfitLoss(GlobalProvider globalProvider) async {
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

      // Calculate toDate as last date of financial year
      final finYear = globalProvider.selectedFinYear;
      if (finYear != null) {
        _toDate = _getFinYearEndDate(finYear.endDate);
      } else {
        throw Exception('Financial year not selected.');
      }

      // Format date for query
      final DateFormat formatter = DateFormat('yyyy-MM-dd');
      final toDateStr = formatter.format(_toDate!);

      // Execute GraphQL query
      final result = await _graphqlService.executeBalanceSheetProfitLoss(
        buCode: buCode,
        dbParams: dbParams,
        sqlId: SqlIdsMap.getBalanceSheetProfitLoss,
        sqlArgs: {
          'branchId': branchId,
          'finYearId': finYearId,
          'toDate': toDateStr,
        },
      );

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      // Parse the result
      final data = result.data?['balanceSheetProfitLoss'];
      if (data == null) {
        throw Exception('No data received from server');
      }

      // Check if data is a Map with an error field
      if (data is Map && data['error'] != null) {
        throw Exception('Error at server: query string not found');
      }

      // Convert to account models
      final rawData = data is List && data.isNotEmpty ? data[0] : data;
      final jsonResult = rawData is Map ? rawData['jsonResult'] : null;

      if (jsonResult == null) {
        _incomeData = [];
        _expensesData = [];
        _isLoading = false;
        _errorMessage = null;
        notifyListeners();
        return;
      }

      if (jsonResult is! Map) {
        throw Exception('Invalid data format received from server');
      }

      // Separate income and expenses
      final incomeJson = jsonResult['incomes'];
      final expensesJson = jsonResult['expenses'];
      final profitOrLoss = jsonResult['profitOrLoss'];

      if (incomeJson is List) {
        _incomeData = incomeJson
            .map((item) => AccountModel.fromJson(item as Map<String, dynamic>))
            .toList();
      } else {
        _incomeData = [];
      }

      if (expensesJson is List) {
        _expensesData = expensesJson
            .map((item) => AccountModel.fromJson(item as Map<String, dynamic>))
            .toList();
      } else {
        _expensesData = [];
      }

      if(profitOrLoss >=0 ){
        // It's a profit, add to expenses data
        _expensesData.add(AccountModel(
          id: 0,
          accName: 'Profit for the year',
          accCode: '',
          accType: 'PL',
          opening: 0,
          openingDc: 'C',
          debit: 0,
          credit: 0,
          closing: profitOrLoss,
          closingDc: 'C',
          parentId: null,
          pkey: 0,
          children: [],
        ));
      } else {
        // It's a loss, add to incomes data
        _incomeData.add(AccountModel(
          id: 0,
          accName: 'Loss for the year',
          accCode: '',
          accType: 'PL',
          opening: 0,
          openingDc: 'D',
          debit: 0,
          credit: 0,
          closing: -profitOrLoss,
          closingDc: 'D',
          parentId: null,
          pkey: 0,
          children: [],
        ));
      }

      _isLoading = false;
      _errorMessage = null;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _incomeData = [];
      _expensesData = [];
    }

    notifyListeners();
  }

  /// Helper: Get financial year end date from string
  DateTime _getFinYearEndDate(String endDateStr) {
    try {
      // Parse the date string (expected format: yyyy-MM-dd)
      final DateFormat formatter = DateFormat('yyyy-MM-dd');
      final date = formatter.parse(endDateStr);
      // Return with time set to end of day
      return DateTime(date.year, date.month, date.day, 23, 59, 59);
    } catch (e) {
      // Fallback to current date if parsing fails
      final now = DateTime.now();
      return DateTime(now.year, now.month, now.day, 23, 59, 59);
    }
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Refresh profit & loss data - triggers a new fetch and updates the future
  void refreshProfitLoss(GlobalProvider globalProvider) {
    _profitLossFuture = fetchProfitLoss(globalProvider);
    notifyListeners();
  }

  /// Initialize and fetch profit & loss data
  void initialize(GlobalProvider globalProvider) {
    refreshProfitLoss(globalProvider);
  }

  /// Set search query and filter accounts
  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  /// Clear search query
  void clearSearch() {
    _searchQuery = '';
    notifyListeners();
  }

  /// Get filtered accounts based on search query
  List<AccountModel> _getFilteredAccounts(List<AccountModel> accounts) {
    if (_searchQuery.isEmpty) return accounts;

    final query = _searchQuery.toLowerCase();
    List<AccountModel> filtered = [];

    for (var account in accounts) {
      final matchedAccount = _filterAccount(account, query);
      if (matchedAccount != null) {
        filtered.add(matchedAccount);
      }
    }

    return filtered;
  }

  /// Recursively filter account and its children
  AccountModel? _filterAccount(AccountModel account, String query) {
    final nameMatches = account.accName.toLowerCase().contains(query);

    // Filter children
    List<AccountModel> filteredChildren = [];
    for (var child in account.children) {
      final matchedChild = _filterAccount(child, query);
      if (matchedChild != null) {
        filteredChildren.add(matchedChild);
      }
    }

    // Include account if name matches or any child matches
    if (nameMatches || filteredChildren.isNotEmpty) {
      return AccountModel(
        id: account.id,
        accName: account.accName,
        accCode: account.accCode,
        accType: account.accType,
        opening: account.opening,
        openingDc: account.openingDc,
        debit: account.debit,
        credit: account.credit,
        closing: account.closing,
        closingDc: account.closingDc,
        parentId: account.parentId,
        pkey: account.pkey,
        children: filteredChildren,
      );
    }

    return null;
  }
}
