import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile_plus/core/routes.dart';
import 'package:trace_mobile_plus/providers/transactions_provider.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import 'package:trace_mobile_plus/models/grouped_transaction_model.dart';

class TransactionsPage extends StatelessWidget {
  const TransactionsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          context.go(Routes.dashboard);
        }
      },
      child: Scaffold(
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
                    const Text('Trans'),
                    const SizedBox(width: 8),
                    Expanded(
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
              if (provider.groupedTransactionsData.isEmpty) {
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
                    ...provider.groupedTransactionsData.asMap().entries.expand((
                      entry,
                    ) {
                      final index = entry.key;
                      final transaction = entry.value;
                      return [
                        _buildGroupedTransactionCard(transaction, index),
                        if (index < provider.groupedTransactionsData.length - 1)
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
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
      ),
    );
  }

  Widget _buildSecondaryAppBar(BuildContext context) {
    return Consumer2<TransactionsProvider, GlobalProvider>(
      builder: (context, provider, globalProvider, _) {
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
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                // Start Date
                Text(
                  formatDate(provider.startDate),
                  style: TextStyle(color: Colors.grey[800], fontSize: 13),
                ),
                // Arrow
                Icon(Icons.arrow_forward, color: Colors.grey[600], size: 16),
                // End Date
                Text(
                  formatDate(provider.endDate),
                  style: TextStyle(color: Colors.grey[800], fontSize: 13),
                ),
                const SizedBox(width: 8),
                // Date Type Selection
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    color: Colors.teal[100],
                    borderRadius: BorderRadius.circular(4),
                    border: Border.all(color: Colors.teal[300]!),
                  ),
                  child: DropdownButton<String>(
                    value: provider.dateType,
                    underline: const SizedBox(),
                    isDense: true,
                    style: TextStyle(
                      color: Colors.teal[700],
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                    ),
                    dropdownColor: Colors.teal[50],
                    items: const [
                      DropdownMenuItem(
                        value: 'entryDate',
                        child: Text('Entry Date'),
                      ),
                      DropdownMenuItem(
                        value: 'tranDate',
                        child: Text('Tran Date'),
                      ),
                    ],
                    onChanged: (String? newValue) {
                      if (newValue != null) {
                        provider.setDateType(newValue);
                        final globalProvider = Provider.of<GlobalProvider>(
                          context,
                          listen: false,
                        );
                        provider.refreshTransactions(globalProvider);
                      }
                    },
                  ),
                ),
                const SizedBox(width: 8),
                // Max Count
                InkWell(
                  onTap: () => _showMaxCountDialog(context),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.indigo[100],
                      borderRadius: BorderRadius.circular(4),
                      border: Border.all(color: Colors.indigo[300]!),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.format_list_numbered,
                          size: 14,
                          color: Colors.indigo[700],
                        ),
                        const SizedBox(width: 4),
                        Text(
                          provider.maxCount > 0
                              ? provider.maxCount.toString()
                              : 'All',
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
                const SizedBox(width: 8,),
                // Unit Name
                Flexible(
                  child: Text(
                    globalProvider.unitName ?? '',
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 11,
                      fontWeight: FontWeight.w400,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
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
        final int transactionCount = provider.groupedTransactionsData.length;
        final int lineCount = provider.transactionsData.length;

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
              const Icon(Icons.receipt_long, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              Text(
                '${intFormatter.format(transactionCount)} Transactions (${intFormatter.format(lineCount)} Lines)',
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

  Widget _buildGroupedTransactionCard(
    GroupedTransactionModel transaction,
    int index,
  ) {
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
        cardGradient = [Colors.amber[50]!, Colors.amber[100]!];
        break;
      case 3: // Receipt
        cardGradient = [Colors.teal[50]!, Colors.teal[100]!];
        break;
      case 4: // Sales
        cardGradient = [Colors.green[50]!, Colors.green[100]!];
        break;
      case 5: // Purchase
        cardGradient = [Colors.purple[50]!, Colors.purple[100]!];
        break;
      case 6: // Contra
        cardGradient = [Colors.lime[50]!, Colors.lime[100]!];
        break;
      case 7: // Debit note
        cardGradient = [Colors.orange[50]!, Colors.orange[100]!];
        break;
      case 8: // Credit note
        cardGradient = [Colors.teal[50]!, Colors.teal[100]!];
        break;
      case 9: // Sales return
        cardGradient = [Colors.red[50]!, Colors.red[100]!];
        break;
      case 10: // Purchase return
        cardGradient = [Colors.lightBlue[50]!, Colors.lightBlue[100]!];
        break;
      default:
        cardGradient = [Colors.blue[50]!, Colors.blue[100]!];
    }

    return Card(
      elevation: 2,
      shadowColor: Colors.black.withValues(alpha: 0.15),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: cardGradient,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey[500]!, width: 0.5),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // HEADER:Index, Date, RefNo,
              Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  // Index
                  Text(
                    '#${index + 1}',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.green[800],
                    ),
                  ),
                  SizedBox(width: 8),
                  // Date
                  Text(
                    dateFormatter.format(transaction.tranDate),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey[800],
                    ),
                  ),
                  SizedBox(width: 8),
                  // Ref No
                  Text(
                    transaction.autoRefNo,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey[900],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              // WARNING: Only Debits or Only Credits
              if (transaction.debitLines.isEmpty ||
                  transaction.creditLines.isEmpty) ...[
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.orange[50],
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: Colors.orange[300]!, width: 1.5),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        size: 16,
                        color: Colors.orange[800],
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          transaction.debitLines.isEmpty
                              ? 'Warning: Transaction has no debits'
                              : 'Warning: Transaction has no credits',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: Colors.orange[900],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
              ],

              // DEBITS SECTION
              if (transaction.debitLines.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green[300]!, width: .5),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.green.withValues(alpha: 0.1),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.arrow_upward,
                            size: 16,
                            color: Colors.green[800],
                          ),
                          // ),
                          const SizedBox(width: 6),
                          Text(
                            'DEBITS',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.green[800],
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 4,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green[50],
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: Text(
                              '${transaction.debitLines.length}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.green[900],
                              ),
                            ),
                          ),
                          const Spacer(),
                          Text(
                            currencyFormatter.format(transaction.totalDebit),
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.green[800],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ...transaction.debitLines.map(
                        (line) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(width: 4),
                              Padding(
                                padding: const EdgeInsets.only(top: 7),
                                child: Icon(
                                  Icons.circle,
                                  size: 6,
                                  color: Colors.green[600],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  line.accName,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey[800],
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                currencyFormatter.format(line.amount),
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.green[700],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (transaction.debitLines.length > 5) ...[
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.info_outline,
                              size: 12,
                              color: Colors.green[600],
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Multiple entries (${transaction.debitLines.length} accounts)',
                              style: TextStyle(
                                fontSize: 10,
                                fontStyle: FontStyle.italic,
                                color: Colors.green[700],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 10),
              ],

              // CREDITS SECTION
              if (transaction.creditLines.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.red[400]!, width: .5),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.red.withValues(alpha: 0.1),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.arrow_downward,
                            size: 16,
                            color: Colors.red[800],
                          ),
                          // ),
                          const SizedBox(width: 6),
                          Text(
                            'CREDITS',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.red[800],
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(width: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 4,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.red[50],
                              borderRadius: BorderRadius.circular(2),
                            ),
                            child: Text(
                              '${transaction.creditLines.length}',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: Colors.red[900],
                              ),
                            ),
                          ),
                          const Spacer(),
                          Text(
                            currencyFormatter.format(transaction.totalCredit),
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Colors.red[800],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      ...transaction.creditLines.map(
                        (line) => Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(width: 4),
                              Padding(
                                padding: const EdgeInsets.only(top: 7),
                                child: Icon(
                                  Icons.circle,
                                  size: 6,
                                  color: Colors.red[600],
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  line.accName,
                                  style: TextStyle(
                                    fontSize: 13,
                                    color: Colors.grey[800],
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                currencyFormatter.format(line.amount),
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.red[700],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      if (transaction.creditLines.length > 5) ...[
                        const SizedBox(height: 4),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.info_outline,
                              size: 12,
                              color: Colors.red[600],
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Multiple entries (${transaction.creditLines.length} accounts)',
                              style: TextStyle(
                                fontSize: 10,
                                fontStyle: FontStyle.italic,
                                color: Colors.red[700],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 10),
              ],

              // FOOTER: time, Remarks, Tran type
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(
                    timeFormatter.format(transaction.timestamp.toLocal()),
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey[700],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      transaction.remarks ?? '—',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey[700],
                        fontStyle: transaction.remarks != null
                            ? FontStyle.italic
                            : FontStyle.normal,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.teal[700],
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      transaction.tranTypeName,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5
                      ),
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
              content: RadioGroup<int>(
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      selectedCount = value;
                    });
                  }
                },
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    RadioListTile<int>(title: const Text('1000'), value: 1000),
                    RadioListTile<int>(title: const Text('2000'), value: 2000),
                    RadioListTile<int>(title: const Text('3000'), value: 3000),
                    RadioListTile<int>(title: const Text('5000'), value: 5000),
                    RadioListTile<int>(title: const Text('All'), value: 0),
                  ],
                ),
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
