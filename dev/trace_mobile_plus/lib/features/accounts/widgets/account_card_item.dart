import 'package:flutter/material.dart';
import '../../../models/account_model.dart';

class AccountCardItem extends StatefulWidget {
  final AccountModel account;
  final int depth;
  final int rowIndex;

  const AccountCardItem({
    super.key,
    required this.account,
    required this.depth,
    required this.rowIndex,
  });

  @override
  State<AccountCardItem> createState() => _AccountCardItemState();
}

class _AccountCardItemState extends State<AccountCardItem> {
  bool _isExpanded = false;

  bool get hasChildren => widget.account.children.isNotEmpty;

  void _toggleExpand() {
    setState(() {
      _isExpanded = !_isExpanded;
    });
  }

  Color _getRowColorByType() {
    // Alternating row colors
    if (widget.rowIndex.isEven) {
      return Colors.white;
    } else {
      return Colors.grey[50]!;
    }
  }

  String _getAccountTypePrefix() {
    switch (widget.account.accType.toUpperCase()) {
      case 'A':
      case 'ASSET':
        return 'A: ';
      case 'L':
      case 'LIABILITY':
        return 'L: ';
      case 'E':
      case 'EXPENSE':
        return 'E: ';
      case 'I':
      case 'INCOME':
        return 'I: ';
      default:
        return '';
    }
  }

  Color _getAccountTypeColor() {
    switch (widget.account.accType.toUpperCase()) {
      case 'A':
      case 'ASSET':
        return Colors.blue[700]!;
      case 'L':
      case 'LIABILITY':
        return Colors.amber[700]!;
      case 'E':
      case 'EXPENSE':
        return Colors.pink[700]!;
      case 'I':
      case 'INCOME':
        return Colors.green[700]!;
      default:
        return Colors.black;
    }
  }

  FontWeight _getFontWeight() {
    // Bold for parent accounts, semi-bold for children
    return hasChildren ? FontWeight.bold : FontWeight.w600;
  }

  String _formatCurrency(double amount) {
    if (amount == 0) return '0.00';
    return amount.toStringAsFixed(2).replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]},',
        );
  }

  Widget _buildAccountNameRow() {
    return Padding(
      padding: EdgeInsets.only(
        left: 8 + (widget.depth * 20.0),
        right: 8,
        top: 8,
        bottom: 4,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Left: Expand icon + Account name
          Expanded(
            child: Row(
              children: [
                // Expand/collapse icon (if has children)
                if (hasChildren)
                  GestureDetector(
                    onTap: _toggleExpand,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      child: Icon(
                        _isExpanded
                            ? Icons.keyboard_arrow_down
                            : Icons.keyboard_arrow_right,
                        size: 20,
                      ),
                    ),
                  )
                else
                  const SizedBox(width: 18), // Space for alignment

                // Account name with type prefix
                Expanded(
                  child: Text(
                    '${_getAccountTypePrefix()}${widget.account.accName}',
                    style: TextStyle(
                      fontWeight: _getFontWeight(),
                      fontSize: 13.5,
                      color: _getAccountTypeColor(),
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(width: 8),

          // Right: Closing balance
          Text(
            '${_formatCurrency(widget.account.closing)} ${widget.account.closingDc}',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailsRow() {
    return Padding(
      padding: EdgeInsets.only(
        left: 8 + (widget.depth * 20.0) + 8, // Extra indent
        right: 8,
        bottom: 8,
      ),
      child: Wrap(
        spacing: 8,
        runSpacing: 4,
        children: [
          // Opening
          _buildDetailItem(
            'Op: ${_formatCurrency(widget.account.opening)} ${widget.account.openingDc}',
          ),

          // Debit
          _buildDetailItem(
            'Dr: ${_formatCurrency(widget.account.debit)}',
            color: Colors.blue[700],
          ),

          // Credit
          _buildDetailItem(
            'Cr: ${_formatCurrency(widget.account.credit)}',
            color: Colors.green[700],
          ),

          // Closing
          // _buildDetailItem(
          //   'Cl: ${_formatCurrency(widget.account.closing)} ${widget.account.closingDc}',
          //   color: Colors.purple[700],
          // ),
        ],
      ),
    );
  }

  Widget _buildDetailItem(String text, {Color? color}) {
    return Text(
      text,
      style: TextStyle(
        fontSize: 12,
        color: color ?? Colors.grey[800],
        fontWeight: FontWeight.w600,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          decoration: BoxDecoration(
            color: _getRowColorByType(),
            border: Border(
              bottom: BorderSide(
                color: Colors.grey[300]!,
                width: 0.5,
              ),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Line 1: Account name + Closing balance
              _buildAccountNameRow(),

              // Line 2: Opening, Debit, Credit
              _buildDetailsRow(),
            ],
          ),
        ),

        // Children (if expanded)
        if (_isExpanded && hasChildren)
          ...widget.account.children.asMap().entries.map((entry) {
            return AccountCardItem(
              account: entry.value,
              depth: widget.depth + 1,
              rowIndex: widget.rowIndex + entry.key + 1,
            );
          }),
      ],
    );
  }
}
