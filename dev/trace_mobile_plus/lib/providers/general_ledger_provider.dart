import 'package:flutter/foundation.dart';
import 'package:trace_mobile_plus/core/sql_ids_map.dart';
import 'package:trace_mobile_plus/models/account_ledger_transaction_model.dart';
import 'package:trace_mobile_plus/models/account_selection_model.dart';
import 'package:trace_mobile_plus/models/ledger_response_model.dart';
import 'package:trace_mobile_plus/models/ledger_summary_model.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import '../services/graphql_service.dart';
import '../core/app_settings.dart';

class GeneralLedgerProvider extends ChangeNotifier {
  final GraphQLService _graphqlService = GraphQLService();

  // Account data
  List<AccountSelectionModel> _accountsList = [];
  List<AccountLedgerTransactionModel> _transactionsList = [];
  LedgerResponseModel? _ledgerResponse;
  LedgerSummaryModel? _summary;

  // Selection state
  int? _selectedAccountId;
  String? _selectedAccountName;

  // Loading states
  bool _isLoadingAccounts = false;
  bool _isLoadingTransactions = false;

  // Error state
  String? _errorMessage;

  // Search query
  String _searchQuery = '';

  // Getters
  List<AccountSelectionModel> get accountsList {
    if (_searchQuery.isEmpty) {
      return _accountsList;
    }
    return _accountsList
        .where(
          (account) => account.accName.toLowerCase().contains(
            _searchQuery.toLowerCase(),
          ),
        )
        .toList();
  }

  List<AccountLedgerTransactionModel> get transactionsList => _transactionsList;
  LedgerResponseModel? get ledgerResponse => _ledgerResponse;
  LedgerSummaryModel? get summary => _summary;
  int? get selectedAccountId => _selectedAccountId;
  String? get selectedAccountName => _selectedAccountName;
  bool get isLoadingAccounts => _isLoadingAccounts;
  bool get isLoadingTransactions => _isLoadingTransactions;
  String? get errorMessage => _errorMessage;
  String get searchQuery => _searchQuery;

  /// Fetch leaf accounts for selection
  Future<void> fetchLeafAccounts(GlobalProvider globalProvider) async {
    _isLoadingAccounts = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Get required parameters from GlobalProvider and AppSettings
      final buCode = globalProvider.selectedBusinessUnit?.buCode;
      final dbParams = AppSettings.dbParams;

      if (buCode == null || dbParams == null) {
        throw Exception(
          'Missing required parameters. Please ensure business unit is selected.',
        );
      }

      // Execute GraphQL query
      final result = await _graphqlService.executeGenericQuery(
        buCode: buCode,
        dbParams: dbParams,
        sqlId: SqlIdsMap.getLeafSubledgerAccountsOnClass,
        sqlArgs: {
          'accClassNames':
              'debtor,creditor,capital,other,loan,iexp,purchase,dexp,dincome,iincome,sale,bank,cash,card,ecash',
        },
      );

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      final data = result.data?['genericQuery'];
      if (data == null) {
        throw Exception('No data received from server');
      }

      // Check if data is a Map with an error field
      if (data is Map && data['error'] != null) {
        throw Exception('Error at server: query string not found');
      }

      // Ensure data is a List
      if (data is! List) {
        throw Exception('Invalid data format received from server');
      }

      // Convert to account selection models
      final List<dynamic> accountsData = data;
      _accountsList = accountsData
          .whereType<Map<String, dynamic>>()
          .map((item) => AccountSelectionModel.fromJson(item))
          .toList();

      _isLoadingAccounts = false;
      _errorMessage = null;
    } catch (e) {
      _isLoadingAccounts = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _accountsList = [];
    }

    notifyListeners();
  }

  /// Fetch account ledger transactions
  Future<void> fetchAccountLedger(
    int accId,
    GlobalProvider globalProvider,
  ) async {
    _isLoadingTransactions = true;
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
        sqlId: SqlIdsMap.getAccountLedger,
        sqlArgs: {'accId': accId, 'finYearId': finYearId, 'branchId': branchId},
      );

      if (result.hasException) {
        throw Exception(result.exception.toString());
      }

      // Parse the result
      final data = result.data?['genericQuery'];
      if (data == null) {
        throw Exception('No data received from server');
      }

      // Check if data is a Map with an error field
      if (data is Map && data['error'] != null) {
        throw Exception('Error at server: query string not found');
      }

      // Parse nested jsonResult structure: [{ "jsonResult": {...} }]
      final finYearStartDate = globalProvider.selectedFinYear?.startDate;
      final ledgerData = LedgerResponseModel.fromApiResponse(
        data,
        finYearStartDate,
      );
      if (ledgerData == null) {
        throw Exception('Invalid response format from server');
      }

      _ledgerResponse = ledgerData;
      _transactionsList = ledgerData.transactions ?? [];

      // Calculate summary
      _summary = _calculateSummary(_transactionsList);

      _isLoadingTransactions = false;
      _errorMessage = null;
    } catch (e) {
      _isLoadingTransactions = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _ledgerResponse = null;
      _transactionsList = [];
      _summary = null;
    }

    notifyListeners();
  }

  /// Select an account and fetch its ledger
  Future<void> selectAccount(
    int id,
    String name,
    GlobalProvider globalProvider,
  ) async {
    _selectedAccountId = id;
    _selectedAccountName = name;
    _transactionsList = [];
    _ledgerResponse = null;
    _summary = null;
    notifyListeners();

    await fetchAccountLedger(id, globalProvider);
  }

  // To be removed
  Future<void> selectFixedAccount(
    GlobalProvider globalProvider,
  ) async {
    _selectedAccountId = 439;
    _selectedAccountName = 'Advance against supply';
    _transactionsList = [];
    _ledgerResponse = null;
    _summary = null;
    notifyListeners();

    await fetchAccountLedger(439, globalProvider);
  }

  /// Set search query for filtering accounts
  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  /// Clear search query
  void clearSearch() {
    _searchQuery = '';
    notifyListeners();
  }

  /// Calculate summary from transactions
  LedgerSummaryModel _calculateSummary(
    List<AccountLedgerTransactionModel> transactions,
  ) {
    return LedgerSummaryModel.fromTransactions(transactions);
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Clear selection
  void clearSelection() {
    _selectedAccountId = null;
    _selectedAccountName = null;
    _transactionsList = [];
    _ledgerResponse = null;
    _summary = null;
    _errorMessage = null;
    notifyListeners();
  }
}
