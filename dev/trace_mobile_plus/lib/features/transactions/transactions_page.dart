import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile_plus/core/routes.dart';
import 'package:trace_mobile_plus/providers/transactions_provider.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import 'package:trace_mobile_plus/models/transaction_model.dart';

class TransactionsPage extends StatelessWidget {
  const TransactionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // AppBar Section
      appBar: AppBar(
        toolbarHeight: 54,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go(Routes.dashboard),
        ),
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Color.fromARGB(255, 90, 105, 128),
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
        elevation: 0,
        titleSpacing: 0,
        backgroundColor: Colors.teal[500],
        actions: const [SizedBox(width: 16)],
        title: LayoutBuilder(
          builder: (context, constraints) {
            return Consumer<TransactionsProvider>(
              builder: (context, provider, _) {
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Text('Transactions'),
                    const SizedBox(width: 10),
                    SizedBox(
                      width: constraints.maxWidth - 130,
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildPeriodButton(
                              context,
                              label: 'Today',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setToday();
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '2 Days',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setDaysAgo(2);
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '3 Days',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setDaysAgo(3);
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: 'This Week',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setThisWeek();
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '2 Weeks',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setWeeksAgo(2);
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '3 Weeks',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setWeeksAgo(3);
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: 'This Month',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setThisMonth();
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '2 Months',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setMonthsAgo(2);
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '3 Months',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setMonthsAgo(3);
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '6 Months',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setMonthsAgo(6);
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: 'This Year',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                  context,
                                  listen: false,
                                );
                                provider.setThisYear();
                                provider.refreshTransactions(globalProvider);
                              },
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                );
              },
            );
          },
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(34),
          child: _buildSecondaryAppBar(context),
        ),
      ),

      // Body with transactions data
      body: Consumer<TransactionsProvider>(
        builder: (context, provider, _) {
          // Trigger initial load if transactionsFuture is null (first time page loads)
          if (provider.transactionsFuture == null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              final globalProvider = Provider.of<GlobalProvider>(
                context,
                listen: false,
              );
              provider.refreshTransactions(globalProvider);
            });
          }

          return FutureBuilder<void>(
            future: provider.transactionsFuture,
            builder: (context, snapshot) {
              // Show loading indicator
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator());
              }

              // Show error message
              if (snapshot.hasError || provider.errorMessage != null) {
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.error_outline,
                          size: 64,
                          color: Colors.red[300],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'Error loading transactions',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[700],
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          snapshot.error?.toString() ??
                              provider.errorMessage ??
                              '',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () {
                            final globalProvider = Provider.of<GlobalProvider>(
                              context,
                              listen: false,
                            );
                            provider.refreshTransactions(globalProvider);
                          },
                          icon: const Icon(Icons.refresh),
                          label: const Text('Retry'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.teal,
                            foregroundColor: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }

              // Show empty state
              if (provider.transactionsData.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.inbox_outlined,
                        size: 64,
                        color: Colors.grey[400],
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No transactions found',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.grey[600],
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Try selecting a different date range',
                        style: TextStyle(fontSize: 14, color: Colors.grey[500]),
                      ),
                    ],
                  ),
                );
              }

              // Show transactions data
              return RefreshIndicator(
                onRefresh: () {
                  final globalProvider = Provider.of<GlobalProvider>(
                    context,
                    listen: false,
                  );
                  return provider.fetchTransactionsData(globalProvider);
                },
                child: ListView(
                  padding: const EdgeInsets.only(top: 16.0, bottom: 64.0),
                  children: [
                    // Row count at top
                    _buildRowCountHeader(context),

                    // Transaction cards with separators
                    ...provider.transactionsData.asMap().entries.expand((entry) {
                      final index = entry.key;
                      final transaction = entry.value;
                      return [
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          child: _buildTransactionCard(transaction, index),
                        ),
                        if (index < provider.transactionsData.length - 1)
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                              vertical: 4.0,
                            ),
                            child: Divider(
                              color: Colors.grey[500],
                              thickness: 2,
                              height: 2,
                            ),
                          ),
                      ];
                    }),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildSecondaryAppBar(BuildContext context) {
    return Consumer<TransactionsProvider>(
      builder: (context, provider, _) {
        // Format dates for display
        String formatDate(DateTime date) {
          return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
        }

        return Container(
          height: 34,
          decoration: BoxDecoration(
            color: Colors.grey[300],
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Period
                Expanded(
                  flex: 2,
                  child: Row(
                    children: [
                      Icon(
                        Icons.calendar_today,
                        color: Colors.teal[700],
                        size: 18,
                      ),
                      const SizedBox(width: 8),
                      Flexible(
                        child: Text(
                          provider.selectedPeriod,
                          style: TextStyle(
                            color: Colors.grey[800],
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                // Start Date
                Expanded(
                  flex: 2,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.event, color: Colors.grey[600], size: 16),
                      const SizedBox(width: 4),
                      Text(
                        formatDate(provider.startDate),
                        style: TextStyle(color: Colors.grey[800], fontSize: 13),
                      ),
                    ],
                  ),
                ),
                // Arrow
                Icon(Icons.arrow_forward, color: Colors.grey[600], size: 16),
                // End Date
                Expanded(
                  flex: 2,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.event, color: Colors.grey[600], size: 16),
                      const SizedBox(width: 4),
                      Text(
                        formatDate(provider.endDate),
                        style: TextStyle(color: Colors.grey[800], fontSize: 13),
                      ),
                    ],
                  ),
                ),
                // Max Count
                InkWell(
                  onTap: () => _showMaxCountDialog(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.indigo[100],
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: Colors.indigo[300]!),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.format_list_numbered, size: 14, color: Colors.indigo[700]),
                        const SizedBox(width: 4),
                        Text(
                          provider.maxCount > 0 ? provider.maxCount.toString() : 'All',
                          style: TextStyle(
                            color: Colors.indigo[700],
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRowCountHeader(BuildContext context) {
    return Consumer<TransactionsProvider>(
      builder: (context, provider, _) {
        final NumberFormat intFormatter = NumberFormat('#,##0');

        return Container(
          margin: const EdgeInsets.only(
            top: 0,
            bottom: 12,
            left: 16,
            right: 16,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.indigo[500]!, Colors.purple[500]!],
            ),
            borderRadius: BorderRadius.circular(8),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.format_list_numbered,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Rows: ${intFormatter.format(provider.totalRows)}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildTransactionCard(TransactionModel transaction, int index) {
    final NumberFormat currencyFormatter = NumberFormat('#,##0.00');
    final DateFormat dateFormatter = DateFormat('dd/MM/yyyy');
    final DateFormat timeFormatter = DateFormat('hh:mm a');

    // Determine card gradient based on transaction type
    List<Color> cardGradient;
    switch (transaction.tranTypeId) {
      case 1: // Journal
        cardGradient = [Colors.blue[50]!, Colors.blue[100]!];
        break;
      case 2: // Payment
        cardGradient = [Colors.red[50]!, Colors.red[100]!];
        break;
      case 3: // Receipt
        cardGradient = [Colors.green[50]!, Colors.green[100]!];
        break;
      case 4: // Sales
        cardGradient = [Colors.teal[50]!, Colors.teal[100]!];
        break;
      case 5: // Purchase
        cardGradient = [Colors.purple[50]!, Colors.purple[100]!];
        break;
      default:
        cardGradient = [Colors.grey[50]!, Colors.grey[100]!];
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: cardGradient,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Index, Transaction Type, and Date
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Text(
                        '#${index + 1}',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: Colors.green[800],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: Colors.indigo[700],
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          transaction.tranTypeName,
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Text(
                    dateFormatter.format(transaction.tranDate),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Account Name
              Row(
                children: [
                  Icon(Icons.account_balance_wallet, size: 16, color: Colors.teal[700]),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      transaction.accName,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Debit and Credit amounts
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildAmountItem(
                    'Debit',
                    currencyFormatter.format(transaction.debit),
                    transaction.debit > 0 ? Colors.red[700]! : Colors.grey[600]!,
                  ),
                  Container(
                    width: 2,
                    height: 40,
                    color: Colors.grey[400],
                  ),
                  _buildAmountItem(
                    'Credit',
                    currencyFormatter.format(transaction.credit),
                    transaction.credit > 0 ? Colors.green[700]! : Colors.grey[600]!,
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Reference Numbers
              Row(
                children: [
                  Icon(Icons.tag, size: 16, color: Colors.orange[700]),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Ref: ${transaction.autoRefNo}',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[700],
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),

              // User Ref No (if available)
              if (transaction.userRefNo != null && transaction.userRefNo!.isNotEmpty) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.bookmark_outline, size: 16, color: Colors.blue[700]),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'User Ref: ${transaction.userRefNo}',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[700],
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],

              // Instrument Number (if available)
              if (transaction.instrNo != null && transaction.instrNo!.isNotEmpty) ...[
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.receipt_long, size: 16, color: Colors.purple[700]),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Instr: ${transaction.instrNo}',
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[700],
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],

              // Remarks (if available)
              if (transaction.remarks != null && transaction.remarks!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.comment_outlined, size: 16, color: Colors.amber[700]),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        transaction.remarks!,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[800],
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ),
                  ],
                ),
              ],

              // Line Remarks (if available)
              if (transaction.lineRemarks != null && transaction.lineRemarks!.isNotEmpty) ...[
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.note_outlined, size: 16, color: Colors.pink[700]),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        transaction.lineRemarks!,
                        style: TextStyle(
                          fontSize: 13,
                          color: Colors.grey[800],
                        ),
                      ),
                    ),
                  ],
                ),
              ],

              // Timestamp
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.access_time, size: 16, color: Colors.blue[700]),
                  const SizedBox(width: 6),
                  Text(
                    timeFormatter.format(transaction.timestamp.toLocal()),
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAmountItem(String label, String value, Color color) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey[700],
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  Widget _buildPeriodButton(
    BuildContext context, {
    required String label,
    required VoidCallback onPressed,
  }) {
    return Consumer<TransactionsProvider>(
      builder: (context, provider, _) {
        final isActive = provider.selectedPeriod == label;

        return TextButton(
          onPressed: onPressed,
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            backgroundColor: isActive
                ? Colors.lightBlue[300]
                : Colors.white.withValues(alpha: 0.9),
            foregroundColor: isActive ? Colors.white : Colors.teal[700],
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        );
      },
    );
  }

  void _showMaxCountDialog(BuildContext context) {
    final provider = Provider.of<TransactionsProvider>(context, listen: false);
    int selectedCount = provider.maxCount;

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Select Max Row Count'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  RadioListTile<int>(
                    title: const Text('1000'),
                    value: 1000,
                    groupValue: selectedCount,
                    onChanged: (value) {
                      setState(() {
                        selectedCount = value!;
                      });
                    },
                  ),
                  RadioListTile<int>(
                    title: const Text('2000'),
                    value: 2000,
                    groupValue: selectedCount,
                    onChanged: (value) {
                      setState(() {
                        selectedCount = value!;
                      });
                    },
                  ),
                  RadioListTile<int>(
                    title: const Text('3000'),
                    value: 3000,
                    groupValue: selectedCount,
                    onChanged: (value) {
                      setState(() {
                        selectedCount = value!;
                      });
                    },
                  ),
                  RadioListTile<int>(
                    title: const Text('5000'),
                    value: 5000,
                    groupValue: selectedCount,
                    onChanged: (value) {
                      setState(() {
                        selectedCount = value!;
                      });
                    },
                  ),
                  RadioListTile<int>(
                    title: const Text('All'),
                    value: 0,
                    groupValue: selectedCount,
                    onChanged: (value) {
                      setState(() {
                        selectedCount = value!;
                      });
                    },
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(dialogContext).pop();
                  },
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () {
                    provider.setMaxCount(selectedCount);
                    final globalProvider = Provider.of<GlobalProvider>(
                      context,
                      listen: false,
                    );
                    provider.refreshTransactions(globalProvider);
                    Navigator.of(dialogContext).pop();
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.teal,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Apply'),
                ),
              ],
            );
          },
        );
      },
    );
  }
}
