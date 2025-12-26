import 'package:flutter/foundation.dart';

class SalesProvider extends ChangeNotifier {
  // Date fields - initialized to today's date
  DateTime _startDate = DateTime.now();
  DateTime _endDate = DateTime.now();

  DateTime get startDate => _startDate;
  DateTime get endDate => _endDate;

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
    notifyListeners();
  }

  // Method: Set startDate to N days ago, endDate to today
  void setDaysAgo(int days) {
    final now = DateTime.now();
    _startDate = _getStartOfDay(now.subtract(Duration(days: days)));
    _endDate = _getEndOfDay(now);
    notifyListeners();
  }

  // Method: Set dates to first and last day of current month
  void setThisMonth() {
    final now = DateTime.now();
    _startDate = _getStartOfMonth(now);
    _endDate = _getEndOfMonth(now);
    notifyListeners();
  }

  // Method: Set dates to first and last day of a specific previous month
  // monthsAgo=1 means entire last month, monthsAgo=2 means 2 months ago, etc.
  void setPreviousMonth(int monthsAgo) {
    final now = DateTime.now();
    final targetMonth = DateTime(now.year, now.month - monthsAgo, 1);
    _startDate = _getStartOfMonth(targetMonth);
    _endDate = _getEndOfMonth(targetMonth);
    notifyListeners();
  }

  // Method: Set startDate to N months ago from today, endDate to today
  void setLastMonths(int months) {
    final now = DateTime.now();
    _startDate = _getStartOfDay(DateTime(now.year, now.month - months, now.day));
    _endDate = _getEndOfDay(now);
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

  // Helper: Get first day of month
  DateTime _getStartOfMonth(DateTime date) {
    return DateTime(date.year, date.month, 1, 0, 0, 0);
  }

  // Helper: Get last day of month
  DateTime _getEndOfMonth(DateTime date) {
    return DateTime(date.year, date.month + 1, 0, 23, 59, 59);
  }
}
