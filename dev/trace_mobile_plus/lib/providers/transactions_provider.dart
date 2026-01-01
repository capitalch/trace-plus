import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile_plus/core/sql_ids_map.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import '../models/transaction_model.dart';
import '../models/grouped_transaction_model.dart';
import '../services/graphql_service.dart';
import '../core/app_settings.dart';

class TransactionsProvider extends ChangeNotifier {
  final GraphQLService _graphqlService = GraphQLService();

  // Date fields - initialized to today's date
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now();
  String _selectedPeriod = 'Today'; // Track the active period button
  int _maxCount = 1000; // Default max count
  String _dateType = 'entryDate'; // Default to entry date

  // Transactions data
  List<TransactionModel> _transactionsData = [];
  List<GroupedTransactionModel> _groupedTransactionsData = [];
  bool _isLoading = false;
  String? _errorMessage;
  Future<void>? _transactionsFuture;

  DateTime get startDate => _startDate;
  DateTime get endDate => _endDate;
  String get selectedPeriod => _selectedPeriod;
  int get maxCount => _maxCount;
  String get dateType => _dateType;
  List<TransactionModel> get transactionsData => _transactionsData;
  List<GroupedTransactionModel> get groupedTransactionsData => _groupedTransactionsData;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Future<void>? get transactionsFuture => _transactionsFuture;

  // Summary calculations
  int get totalRows => _transactionsData.length;

  // Constructor - initialize dates to today
  TransactionsProvider() {
    _startDate = _getStartOfDay(DateTime.now());
    _endDate = _getEndOfDay(DateTime.now());
  }

  // Method: Set both dates to today
  void setToday() {
    final now = DateTime.now();
    _startDate = _getStartOfDay(now);
    _endDate = _getEndOfDay(now);
    _selectedPeriod = 'Today';
  }

  // Method: Set startDate to N days ago, endDate to today
  void setDaysAgo(int days) {
    final now = DateTime.now();
    _startDate = _getStartOfDay(now.subtract(Duration(days: days - 1)));
    _endDate = _getEndOfDay(now);
    _selectedPeriod = '$days Days';
  }

  // Method: Set dates to first and last day of current week (Monday to Sunday)
  void setThisWeek() {
    final now = DateTime.now();
    _startDate = _getStartOfWeek(now);
    _endDate = _getEndOfWeek(now);
    _selectedPeriod = 'This Week';
  }

  // Method: Set startDate to N weeks ago, endDate to today
  void setWeeksAgo(int weeks) {
    final now = DateTime.now();
    _startDate = _getStartOfDay(now.subtract(Duration(days: weeks * 7 - 1)));
    _endDate = _getEndOfDay(now);
    _selectedPeriod = '$weeks Weeks';
  }

  // Method: Set dates to first and last day of current month
  void setThisMonth() {
    final now = DateTime.now();
    _startDate = _getStartOfMonth(now);
    _endDate = _getEndOfMonth(now);
    _selectedPeriod = 'This Month';
  }

  // Method: Set startDate to N months ago, endDate to today
  void setMonthsAgo(int months) {
    final now = DateTime.now();
    final monthsAgoDate = DateTime(now.year, now.month - months + 1, 1);
    _startDate = _getStartOfMonth(monthsAgoDate);
    _endDate = _getEndOfDay(now);
    _selectedPeriod = '$months Months';
  }

  // Method: Set dates to first and last day of current year
  void setThisYear() {
    final now = DateTime.now();
    _startDate = _getStartOfYear(now);
    _endDate = _getEndOfYear(now);
    _selectedPeriod = 'This Year';
  }

  // Method: Set max count for rows
  void setMaxCount(int count) {
    _maxCount = count;
    notifyListeners();
  }

  // Method: Set date type (tranDate or entryDate)
  void setDateType(String type) {
    _dateType = type;
    notifyListeners();
  }

  // Helper: Get start of day (00:00:00)
  DateTime _getStartOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day, 0, 0, 0);
  }

  // Helper: Get end of day (23:59:59)
  DateTime _getEndOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day, 23, 59, 59);
  }

  // Helper: Get start of week (Monday 00:00:00)
  DateTime _getStartOfWeek(DateTime date) {
    final daysToSubtract = date.weekday - 1; // Monday is 1
    final monday = date.subtract(Duration(days: daysToSubtract));
    return DateTime(monday.year, monday.month, monday.day, 0, 0, 0);
  }

  // Helper: Get end of week (Sunday 23:59:59)
  DateTime _getEndOfWeek(DateTime date) {
    final daysToAdd = 7 - date.weekday; // Sunday is 7
    final sunday = date.add(Duration(days: daysToAdd));
    return DateTime(sunday.year, sunday.month, sunday.day, 23, 59, 59);
  }

  // Helper: Get first day of month
  DateTime _getStartOfMonth(DateTime date) {
    return DateTime(date.year, date.month, 1, 0, 0, 0);
  }

  // Helper: Get last day of month
  DateTime _getEndOfMonth(DateTime date) {
    return DateTime(date.year, date.month + 1, 0, 23, 59, 59);
  }

  // Helper: Get first day of year
  DateTime _getStartOfYear(DateTime date) {
    return DateTime(date.year, 1, 1, 0, 0, 0);
  }

  // Helper: Get last day of year
  DateTime _getEndOfYear(DateTime date) {
    return DateTime(date.year, 12, 31, 23, 59, 59);
  }

  /// Group transactions by id
  List<GroupedTransactionModel> _groupTransactionsById(List<TransactionModel> transactions) {
    // Group transactions by id using a map
    final Map<int, List<TransactionModel>> groupedMap = {};

    for (var transaction in transactions) {
      if (!groupedMap.containsKey(transaction.id)) {
        groupedMap[transaction.id] = [];
      }
      groupedMap[transaction.id]!.add(transaction);
    }

    // Convert grouped map to list of GroupedTransactionModel
    final List<GroupedTransactionModel> groupedList = [];

    groupedMap.forEach((id, transactionList) {
      if (transactionList.isEmpty) return;

      // Use the first transaction for common header data
      final firstTransaction = transactionList.first;

      // Separate into debit and credit lines
      final List<TransactionLineModel> debitLines = [];
      final List<TransactionLineModel> creditLines = [];

      for (var transaction in transactionList) {
        if (transaction.debit > 0) {
          debitLines.add(TransactionLineModel(
            accName: transaction.accName,
            amount: transaction.debit,
            lineRemarks: transaction.lineRemarks,
          ));
        }
        if (transaction.credit > 0) {
          creditLines.add(TransactionLineModel(
            accName: transaction.accName,
            amount: transaction.credit,
            lineRemarks: transaction.lineRemarks,
          ));
        }
      }

      // Create grouped transaction model
      groupedList.add(GroupedTransactionModel(
        id: id,
        autoRefNo: firstTransaction.autoRefNo,
        tranDate: firstTransaction.tranDate,
        userRefNo: firstTransaction.userRefNo,
        remarks: firstTransaction.remarks,
        tranTypeId: firstTransaction.tranTypeId,
        timestamp: firstTransaction.timestamp,
        debitLines: debitLines,
        creditLines: creditLines,
      ));
    });

    return groupedList;
  }

  /// Fetch transactions data from GraphQL
  Future<void> fetchTransactionsData(GlobalProvider globalProvider) async {
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

      // Format dates for query
      final DateFormat formatter = DateFormat('yyyy-MM-dd');
      final startDateStr = formatter.format(_startDate);
      final endDateStr = formatter.format(_endDate);

      // Prepare sqlArgs
      final Map<String, dynamic> sqlArgs = {
        'endDate': endDateStr,
        'finYearId': finYearId,
        'branchId': branchId,
        'startDate': startDateStr,
        'tranTypeId': null, // null for all transaction types
        'dateType': _dateType,
        'dateFormat': 'dd/MM/yyyy',
      };

      // Add noOfRows only if maxCount is not 0 (0 means 'All')
      if (_maxCount > 0) {
        sqlArgs['noOfRows'] = _maxCount;
      } else {
        sqlArgs['noOfRows'] = null;
      }

      // Execute GraphQL query
      final result = await _graphqlService.executeGenericQuery(
        buCode: buCode,
        dbParams: dbParams,
        sqlId: SqlIdsMap.getAllTransactions,
        sqlArgs: sqlArgs,
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

      // Convert to transaction models
      final List<dynamic> transactionsList = data as List<dynamic>;
      _transactionsData = transactionsList
          .map((item) => TransactionModel.fromJson(item as Map<String, dynamic>))
          .toList();

      // Group transactions by id
      _groupedTransactionsData = _groupTransactionsById(_transactionsData);

      _isLoading = false;
      _errorMessage = null;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _transactionsData = [];
      _groupedTransactionsData = [];
    }

    notifyListeners();
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Refresh transactions data - triggers a new fetch and updates the future
  void refreshTransactions(GlobalProvider globalProvider) {
    _transactionsFuture = fetchTransactionsData(globalProvider);
    notifyListeners();
  }

  /// Initialize to today's date and fetch transactions data
  void initializeToday(GlobalProvider globalProvider) {
    setToday();
    refreshTransactions(globalProvider);
  }
}
