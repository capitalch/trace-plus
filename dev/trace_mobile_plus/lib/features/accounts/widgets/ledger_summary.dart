import 'package:flutter/material.dart';
import 'package:trace_mobile_plus/models/ledger_summary_model.dart';

class LedgerSummary extends StatelessWidget {
  final LedgerSummaryModel summary;

  const LedgerSummary({
    super.key,
    required this.summary,
  });

  String _formatAmount(double amount) {
    final absAmount = amount.abs();
    return absAmount.toStringAsFixed(2).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]},',
        );
  }

  Color _getAmountColor(double amount) {
    if (amount > 0) {
      return Colors.green[700]!;
    } else if (amount < 0) {
      return Colors.red[700]!;
    }
    return Colors.black;
  }

  Widget _buildSummaryItem({
    required String label,
    required double amount,
    bool isBold = false,
    bool isLarge = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[600],
            fontWeight: FontWeight.w500,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _formatAmount(amount),
          style: TextStyle(
            fontSize: isLarge ? 18 : 16,
            fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
            color: _getAmountColor(amount),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(8.0),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Summary',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),

            // Grid of 4 items (2x2)
            Row(
              children: [
                Expanded(
                  child: _buildSummaryItem(
                    label: 'Opening Balance',
                    amount: summary.opening,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildSummaryItem(
                    label: 'Total Debit',
                    amount: summary.debit,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            Row(
              children: [
                Expanded(
                  child: _buildSummaryItem(
                    label: 'Total Credit',
                    amount: summary.credit,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildSummaryItem(
                    label: 'Closing Balance',
                    amount: summary.closing,
                    isBold: true,
                    isLarge: true,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
