import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile_plus/models/account_ledger_transaction_model.dart';

class TransactionCard extends StatelessWidget {
  final AccountLedgerTransactionModel transaction;

  const TransactionCard({
    super.key,
    required this.transaction,
  });

  String _formatDate(String dateStr) {
    try {
      // Parse date from 'YYYY-MM-DD' format
      final date = DateTime.parse(dateStr);
      // Format to 'dd/MM/yyyy'
      return DateFormat('dd/MM/yyyy').format(date);
    } catch (e) {
      return dateStr; // Return original if parsing fails
    }
  }

  String _formatAmount(double amount) {
    return amount.toStringAsFixed(2).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]},',
        );
  }

  Color _getAmountColor() {
    if (transaction.debit > 0) {
      return Colors.red[700]!;
    } else if (transaction.credit > 0) {
      return Colors.green[700]!;
    }
    return Colors.black;
  }

  String _getAmountWithDrCr() {
    if (transaction.debit > 0) {
      return '${_formatAmount(transaction.debit)} Dr';
    } else if (transaction.credit > 0) {
      return '${_formatAmount(transaction.credit)} Cr';
    }
    return '0.00';
  }

  @override
  Widget build(BuildContext context) {
    // Don't display opening balance row
    if (transaction.isOpeningBalance) {
      return const SizedBox.shrink();
    }

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 4.0),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Line 1: Date, autoRefNo, userRefNo | Amount (right aligned)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Left side: Date and reference numbers
                Expanded(
                  child: Wrap(
                    spacing: 8,
                    runSpacing: 4,
                    children: [
                      // Date
                      Text(
                        _formatDate(transaction.tranDate),
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                        ),
                      ),

                      // Reference details (autoRefNo, userRefNo)
                      if (transaction.getLine1Details().isNotEmpty)
                        Text(
                          transaction.getLine1Details(),
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey[700],
                          ),
                        ),
                    ],
                  ),
                ),

                const SizedBox(width: 8),

                // Right side: Amount with Dr/Cr
                Text(
                  _getAmountWithDrCr(),
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: _getAmountColor(),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            // Line 2: otherAccounts, tranType, instrNo, lineRefNo, lineRemarks, remarks
            // Max 3 lines with ellipsis
            if (transaction.getLine2Details().isNotEmpty)
              Text(
                transaction.getLine2Details(),
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                  height: 1.3,
                ),
                maxLines: 3,
                overflow: TextOverflow.ellipsis,
              ),
          ],
        ),
      ),
    );
  }
}
