import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

/// Format a number as currency with commas and 2 decimal places
String formatCurrency(double amount) {
  final formatter = NumberFormat('#,##0.00');
  return formatter.format(amount);
}

/// Format balance with debit/credit indicator
String formatBalanceWithDc(double amount, String dc) {
  final formatted = formatCurrency(amount);
  return '$formatted $dc';
}

/// Get background color based on account type
Color getAccountTypeColor(String accType) {
  switch (accType) {
    case 'A': // Asset
      return Colors.blue[50]!;
    case 'L': // Liability
      return Colors.red[50]!;
    case 'I': // Income
      return Colors.green[50]!;
    case 'E': // Expense
      return Colors.orange[50]!;
    default:
      return Colors.grey[50]!;
  }
}

/// Get text color based on account type
Color getAccountTypeTextColor(String accType) {
  switch (accType) {
    case 'A': // Asset
      return Colors.blue[900]!;
    case 'L': // Liability
      return Colors.red[900]!;
    case 'I': // Income
      return Colors.green[900]!;
    case 'E': // Expense
      return Colors.orange[900]!;
    default:
      return Colors.grey[900]!;
  }
}
