import 'package:flutter/material.dart';
import '../../../models/account_model.dart';
import '../../../core/utils/formatters.dart';

class AccountTreeItem extends StatefulWidget {
  final AccountModel account;
  final int depth;
  final ScrollController scrollController;
  final int rowIndex;

  const AccountTreeItem({
    super.key,
    required this.account,
    this.depth = 0,
    required this.scrollController,
    required this.rowIndex,
  });

  @override
  State<AccountTreeItem> createState() => _AccountTreeItemState();
}

class _AccountTreeItemState extends State<AccountTreeItem> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    final hasChildren = widget.account.children.isNotEmpty;
    final screenWidth = MediaQuery.of(context).size.width;
    final fixedWidth = screenWidth * 0.35;
    final indent = 4.0 + (widget.depth * 6.0);

    return Column(
      children: [
        // Main Row
        Container(
          decoration: BoxDecoration(
            color: _getRowColorByType(),
            border: Border(
              bottom: BorderSide(color: Colors.grey[200]!, width: 0.5),
            ),
          ),
          child: Row(
            children: [
              // Fixed Account Name Column
              Container(
                width: fixedWidth,
                padding: EdgeInsets.only(
                  left: indent,
                  right: 4,
                  top: 4,
                  bottom: 4,
                ),
                decoration: BoxDecoration(
                  border: Border(
                    right: BorderSide(color: Colors.grey[300]!, width: 1),
                  ),
                ),
                child: Row(
                  children: [
                    // Expand/Collapse Icon
                    if (hasChildren)
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _isExpanded = !_isExpanded;
                          });
                        },
                        child: Icon(
                          _isExpanded
                              ? Icons.keyboard_arrow_down
                              : Icons.keyboard_arrow_right,
                          size: 18,
                          color: Colors.grey[600],
                        ),
                      )
                    else
                      const SizedBox(width: 18),

                    const SizedBox(width: 6),

                    // Account Name
                    Expanded(
                      child: Text(
                        '${_getAccountTypePrefix()}${widget.account.accName}',
                        style: TextStyle(
                          fontSize: _getFontSize(),
                          fontWeight: _getFontWeight(),
                          color: _getTextColor(),
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

              // Scrollable Columns
              Expanded(
                child: SingleChildScrollView(
                  controller: widget.scrollController,
                  scrollDirection: Axis.horizontal,
                  physics: const ClampingScrollPhysics(),
                  child: Row(
                    children: [
                      _buildDataCell(
                        '${formatCurrency(widget.account.opening)} ${widget.account.openingDc}',
                      ),
                      _buildDataCell(
                        formatCurrency(widget.account.debit),
                        color: Colors.blue[700],
                      ),
                      _buildDataCell(
                        formatCurrency(widget.account.credit),
                        color: Colors.green[700],
                      ),
                      _buildDataCell(
                        '${formatCurrency(widget.account.closing)} ${widget.account.closingDc}',
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        // Child Accounts (if expanded)
        if (_isExpanded && hasChildren)
          ...widget.account.children.asMap().entries.map((entry) {
            return AccountTreeItem(
              account: entry.value,
              depth: widget.depth + 1,
              scrollController: widget.scrollController,
              rowIndex: widget.rowIndex * 100 + entry.key,
            );
          }),
      ],
    );
  }

  Widget _buildDataCell(String text, {Color? color}) {
    return Container(
      width: 140,
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
      child: Text(
        text,
        textAlign: TextAlign.right,
        style: TextStyle(
          fontSize: _getFontSize(),
          fontWeight: FontWeight.w500,
          color: color ?? Colors.black87,
        ),
      ),
    );
  }

  String _getAccountTypePrefix() {
    switch (widget.account.accType.toUpperCase()) {
      case 'A':
        return 'A: ';
      case 'L':
        return 'L: ';
      case 'E':
        return 'E: ';
      case 'I':
        return 'I: ';
      default:
        return '';
    }
  }

  Color _getRowColorByType() {
    // Get base color based on account type
    Color baseColor;
    switch (widget.account.accType.toUpperCase()) {
      case 'A': // Asset
        baseColor = Colors.blue[50]!;
        break;
      case 'L': // Liabilities
        baseColor = Colors.amber[50]!;
        break;
      case 'E': // Expenses
        baseColor = Colors.pink[50]!;
        break;
      case 'I': // Income
        baseColor = Colors.green[50]!;
        break;
      default:
        baseColor = Colors.grey[50]!;
    }

    // Make child rows slightly lighter
    if (widget.depth > 0) {
      return baseColor.withOpacity(0.5);
    }

    return baseColor;
  }

  double _getFontSize() {
    if (widget.depth == 0) return 13;
    if (widget.depth == 1) return 12;
    return 11;
  }

  FontWeight _getFontWeight() {
    if (widget.depth == 0) return FontWeight.bold;
    if (widget.depth == 1) return FontWeight.w600;
    return FontWeight.normal;
  }

  Color _getTextColor() {
    if (widget.depth <= 1) return Colors.black87;
    return Colors.black54;
  }
}
