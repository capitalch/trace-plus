import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile_plus/core/sql_ids_map.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import '../models/account_model.dart';
import '../services/graphql_service.dart';
import '../core/app_settings.dart';

class TrialBalanceProvider extends ChangeNotifier {
  final GraphQLService _graphqlService = GraphQLService();

  // Trial balance data
  List<AccountModel> _accountsData = [];
  bool _isLoading = false;
  String? _errorMessage;
  Future<void>? _trialBalanceFuture;
  DateTime? _toDate;
  String _searchQuery = '';

  List<AccountModel> get accountsData => _searchQuery.isEmpty
      ? _accountsData
      : _getFilteredAccounts();

  String get searchQuery => _searchQuery;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Future<void>? get trialBalanceFuture => _trialBalanceFuture;
  DateTime? get toDate => _toDate;

  // Calculate totals - only sum root parent accounts
  double get totalOpeningDebit {
    double total = 0;
    for (var account in _accountsData) {
      if (account.openingDc == 'D') {
        total += account.opening;
      }
    }
    return total;
  }

  double get totalOpeningCredit {
    double total = 0;
    for (var account in _accountsData) {
      if (account.openingDc == 'C') {
        total += account.opening;
      }
    }
    return total;
  }

  double get totalDebit {
    double total = 0;
    for (var account in _accountsData) {
      total += account.debit;
    }
    return total;
  }

  double get totalCredit {
    double total = 0;
    for (var account in _accountsData) {
      total += account.credit;
    }
    return total;
  }

  double get totalClosingDebit {
    double total = 0;
    for (var account in _accountsData) {
      if (account.closingDc == 'D') {
        total += account.closing;
      }
    }
    return total;
  }

  double get totalClosingCredit {
    double total = 0;
    for (var account in _accountsData) {
      if (account.closingDc == 'C') {
        total += account.closing;
      }
    }
    return total;
  }

  /// Fetch trial balance data from GraphQL
  Future<void> fetchTrialBalance(GlobalProvider globalProvider) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Get required parameters from GlobalProvider and AppSettings
      final branchId = globalProvider.selectedBranch?.branchId;
      final finYearId = globalProvider.selectedFinYear?.finYearId;
      final buCode = globalProvider.selectedBusinessUnit?.buCode;
      final dbParams = AppSettings.dbParams;

      if (branchId == null || finYearId == null || buCode == null || dbParams == null) {
        throw Exception('Missing required parameters. Please ensure branch, financial year, and business unit are selected.');
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
      final result = await _graphqlService.executeTrialBalance(
        buCode: buCode,
        dbParams: dbParams,
        sqlId: SqlIdsMap.getTrialBalance,
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
      final data = result.data?['trialBalance'];
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
        _accountsData = [];
        _isLoading = false;
        _errorMessage = null;
        notifyListeners();
        return;
      }

      if (jsonResult is! List) {
        throw Exception('Invalid data format received from server');
      }

      final List<dynamic> accountsList = jsonResult;
      _accountsData = accountsList
          .map((item) => AccountModel.fromJson(item as Map<String, dynamic>))
          .toList();

      _isLoading = false;
      _errorMessage = null;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _accountsData = [];
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

  /// Refresh trial balance data - triggers a new fetch and updates the future
  void refreshTrialBalance(GlobalProvider globalProvider) {
    _trialBalanceFuture = fetchTrialBalance(globalProvider);
    notifyListeners();
  }

  /// Initialize and fetch trial balance data
  void initialize(GlobalProvider globalProvider) {
    refreshTrialBalance(globalProvider);
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
  List<AccountModel> _getFilteredAccounts() {
    if (_searchQuery.isEmpty) return _accountsData;

    final query = _searchQuery.toLowerCase();
    List<AccountModel> filtered = [];

    for (var account in _accountsData) {
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
