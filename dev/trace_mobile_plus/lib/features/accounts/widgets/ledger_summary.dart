import 'package:flutter/material.dart';
import 'package:trace_mobile_plus/models/ledger_summary_model.dart';

class LedgerSummary extends StatelessWidget {
  final LedgerSummaryModel summary;
  const LedgerSummary({super.key, required this.summary});

  String _formatAmount(double amount) {
    final absAmount = amount.abs();
    return absAmount
        .toStringAsFixed(2)
        .replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]},',
        );
  }

  Color _getAmountColor(double amount) {
    if (amount > 0) {
      return Colors.blue[700]!;
    } else if (amount < 0) {
      return Colors.amber[700]!;
    }
    return Colors.black;
  }

  Widget _buildSummaryItem({
    required String label,
    required double amount,
    bool isBold = false,
    bool isLarge = false,
    CrossAxisAlignment alignment = CrossAxisAlignment.start,
    bool showDrCr = false,
    Color? forceColor,
  }) {
    String amountText = _formatAmount(amount);
    if (showDrCr) {
      amountText += amount >= 0 ? ' Dr' : ' Cr';
    }

    return Column(
      crossAxisAlignment: alignment,
      mainAxisSize: MainAxisSize.min,
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
        FittedBox(
          fit: BoxFit.scaleDown,
          alignment: alignment == CrossAxisAlignment.end
              ? Alignment.centerRight
              : Alignment.centerLeft,
          child: Text(
            amountText,
            style: TextStyle(
              fontSize: isLarge ? 14 : 12,
              fontWeight: isBold ? FontWeight.bold : FontWeight.w600,
              color: forceColor ?? _getAmountColor(amount),
            ),
            maxLines: 1,
            overflow: TextOverflow.visible,
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
        padding: const EdgeInsets.all(8.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Summary',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // Grid of 3 items
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Flexible(
                  fit: FlexFit.loose,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      Flexible(
                        child: _buildSummaryItem(
                          label: 'Tot Debits',
                          amount: summary.debit,
                          forceColor: Colors.blue[700],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: _buildSummaryItem(
                          label: 'Tot Credits',
                          amount: summary.credit,
                          forceColor: Colors.amber[700],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildSummaryItem(
                    label: 'Closing Balance',
                    amount: summary.closing,
                    isBold: true,
                    isLarge: true,
                    alignment: CrossAxisAlignment.end,
                    showDrCr: true,
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
