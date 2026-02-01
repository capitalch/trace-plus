import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile_plus/core/sql_ids_map.dart';
import 'package:trace_mobile_plus/core/exceptions/token_expired_exception.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import '../models/sales_card_model.dart';
import '../services/graphql_service.dart';
import '../services/auth_service.dart';
import '../core/app_settings.dart';

class SalesProvider extends ChangeNotifier {
  final GraphQLService _graphqlService = GraphQLService();

  // Date fields - initialized to today's date
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now();
  String _selectedPeriod = 'Today'; // Track the active period button

  // Sales data
  List<SalesCardModel> _salesData = [];
  bool _isLoading = false;
  String? _errorMessage;
  Future<void>? _salesFuture;

  DateTime get startDate => _startDate;
  DateTime get endDate => _endDate;
  String get selectedPeriod => _selectedPeriod;
  List<SalesCardModel> get salesData => _salesData;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  Future<void>? get salesFuture => _salesFuture;

  // Summary calculations
  int get totalRows => _salesData.length;
  double get totalQty => _salesData.fold(0.0, (sum, sale) => sum + sale.qty);
  double get totalGP => _salesData.fold(0.0, (sum, sale) => sum + sale.grossProfit);
  double get totalSale => _salesData.fold(0.0, (sum, sale) => sum + sale.amount);

  // Constructor - initialize dates to today
  SalesProvider() {
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
    _startDate = _getStartOfDay(now.subtract(Duration(days: days)));
    _endDate = _startDate;
    _selectedPeriod = '(-$days) D';
  }

  // Method: Set dates to first and last day of current month
  void setThisMonth() {
    final now = DateTime.now();
    _startDate = _getStartOfMonth(now);
    _endDate = _getEndOfMonth(now);
    _selectedPeriod = 'This Month';
  }

  // Method: Set dates to first and last day of a specific previous month
  // monthsAgo=1 means entire last month, monthsAgo=2 means 2 months ago, etc.
  void setPreviousMonth(int monthsAgo) {
    final now = DateTime.now();
    final targetMonth = DateTime(now.year, now.month - monthsAgo, 1);
    _startDate = _getStartOfMonth(targetMonth);
    _endDate = _getEndOfMonth(targetMonth);
    _selectedPeriod = monthsAgo == 1 ? 'Previous Month' : '(-$monthsAgo) Month';
  }

  // Method: Set startDate to start of N months before last month, endDate to end of last month
  // For example: if months=3 and today is Jan 2025, range is Oct 1 2024 to Dec 31 2024
  void setLastMonths(int months) {
    final now = DateTime.now();

    // Get last month
    final lastMonth = DateTime(now.year, now.month - 1, 1);

    // Go back N months from last month to get start month
    final startMonth = DateTime(lastMonth.year, lastMonth.month - months + 1, 1);

    _startDate = _getStartOfMonth(startMonth);
    _endDate = _getEndOfMonth(lastMonth);
    _selectedPeriod = 'Last $months Months';
  }

  // Helper: Get start of day (00:00:00)
  DateTime _getStartOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day, 0, 0, 0);
  }

  // Helper: Get end of day (23:59:59)
  DateTime _getEndOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day, 23, 59, 59);
  }

  // Helper: Get first day of month
  DateTime _getStartOfMonth(DateTime date) {
    return DateTime(date.year, date.month, 1, 0, 0, 0);
  }

  // Helper: Get last day of month
  DateTime _getEndOfMonth(DateTime date) {
    return DateTime(date.year, date.month + 1, 0, 23, 59, 59);
  }

  /// Fetch sales data from GraphQL
  Future<void> fetchSalesData(GlobalProvider globalProvider) async {
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

      // Execute GraphQL query
      final result = await _graphqlService.executeGenericQuery(
        buCode: buCode,
        dbParams: dbParams,
        sqlId: SqlIdsMap.getSalesReport,
        sqlArgs: {
          'branchId': branchId,
          'finYearId': finYearId,
          'tagId': 0, // Default to all categories
          'startDate': startDateStr,
          'endDate': endDateStr,
        },
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

      // Convert to sales card models
      final List<dynamic> salesList = data as List<dynamic>;
      _salesData = salesList
          .map((item) => SalesCardModel.fromJson(item as Map<String, dynamic>))
          .toList();

      _isLoading = false;
      _errorMessage = null;
    } on TokenExpiredException {
      _isLoading = false;
      _salesData = [];
      await AuthService().handleTokenExpired();
      return;
    } catch (e) {
      _isLoading = false;
      _errorMessage = e.toString().replaceAll('Exception: ', '');
      _salesData = [];
    }

    notifyListeners();
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Refresh sales data - triggers a new fetch and updates the future
  void refreshSales(GlobalProvider globalProvider) {
    _salesFuture = fetchSalesData(globalProvider);
    notifyListeners();
  }

  /// Initialize to today's date and fetch sales data
  void initializeToday(GlobalProvider globalProvider) {
    setToday();
    refreshSales(globalProvider);
  }
}
