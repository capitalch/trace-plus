import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:trace_mobile_plus/core/routes.dart';
import 'package:trace_mobile_plus/providers/sales_provider.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import 'package:trace_mobile_plus/models/sales_card_model.dart';

class SalesPage extends StatelessWidget {
  const SalesPage({super.key});

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
        // automaticallyImplyLeading: false,
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
            return Consumer<SalesProvider>(
              builder: (context, provider, _) {
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Text('Sales'),
                    const SizedBox(width: 10),
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
                                provider.refreshSales(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '(-1) D',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                      context,
                                      listen: false,
                                    );
                                provider.setDaysAgo(1);
                                provider.refreshSales(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '(-2) D',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                      context,
                                      listen: false,
                                    );
                                provider.setDaysAgo(2);
                                provider.refreshSales(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '(-3) D',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                      context,
                                      listen: false,
                                    );
                                provider.setDaysAgo(3);
                                provider.refreshSales(globalProvider);
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
                                provider.refreshSales(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: 'Previous Month',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                      context,
                                      listen: false,
                                    );
                                provider.setPreviousMonth(1);
                                provider.refreshSales(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '(-2) Month',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                      context,
                                      listen: false,
                                    );
                                provider.setPreviousMonth(2);
                                provider.refreshSales(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '(-3) Month',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                      context,
                                      listen: false,
                                    );
                                provider.setPreviousMonth(3);
                                provider.refreshSales(globalProvider);
                              },
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: 'Last 3 Months',
                              onPressed: () {
                                final globalProvider =
                                    Provider.of<GlobalProvider>(
                                      context,
                                      listen: false,
                                    );
                                provider.setLastMonths(3);
                                provider.refreshSales(globalProvider);
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

      // Body with sales data
      body: Consumer<SalesProvider>(
        builder: (context, provider, _) {
          // Trigger initial load if salesFuture is null (first time page loads)
          if (provider.salesFuture == null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              final globalProvider = Provider.of<GlobalProvider>(
                context,
                listen: false,
              );
              provider.refreshSales(globalProvider);
            });
          }

          return FutureBuilder<void>(
            future: provider.salesFuture,
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
                          'Error loading sales data',
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
                            provider.refreshSales(globalProvider);
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
              if (provider.salesData.isEmpty) {
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
                        'No sales data found',
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

              // Show sales data
              return RefreshIndicator(
                onRefresh: () {
                  final globalProvider = Provider.of<GlobalProvider>(
                    context,
                    listen: false,
                  );
                  return provider.fetchSalesData(globalProvider);
                },
                child: ListView(
                  padding: const EdgeInsets.only(top: 16.0, bottom: 64.0),
                  children: [
                    // Summary row at top
                    _buildSummaryRow(context),

                    // Sales cards with separators
                    ...provider.salesData.asMap().entries.expand((entry) {
                      final index = entry.key;
                      final sale = entry.value;
                      return [
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16.0),
                          child: _buildSalesCard(sale, index),
                        ),
                        if (index < provider.salesData.length - 1)
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
      ),
    );
  }

  Widget _buildSecondaryAppBar(BuildContext context) {
    return Consumer2<SalesProvider, GlobalProvider>(
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
                // Period
                Text(
                  provider.selectedPeriod,
                  style: TextStyle(
                    color: Colors.grey[800],
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(width: 8),
                // Start Date
                Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Icon(Icons.event, color: Colors.grey[600], size: 16),
                    const SizedBox(width: 4),
                    Text(
                      formatDate(provider.startDate),
                      style: TextStyle(color: Colors.grey[800], fontSize: 13),
                    ),
                  ],
                ),
                SizedBox(width: 4),
                // Arrow
                Icon(Icons.arrow_forward, color: Colors.grey[600], size: 16),
                SizedBox(width: 4),
                // End Date
                Row(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    Icon(Icons.event, color: Colors.grey[600], size: 16),
                    const SizedBox(width: 4),
                    Text(
                      formatDate(provider.endDate),
                      style: TextStyle(color: Colors.grey[800], fontSize: 13),
                    ),
                  ],
                ),
                // ),
                const SizedBox(width: 8),
                // Unit Name
                Flexible(
                  child: Text(
                    globalProvider.unitName ?? '',
                    style: TextStyle(
                      color: Colors.grey[700],
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
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

  Widget _buildSummaryRow(BuildContext context) {
    return Consumer<SalesProvider>(
      builder: (context, provider, _) {
        // Only show if there's data
        if (provider.salesData.isEmpty) {
          return const SizedBox.shrink();
        }

        final NumberFormat intFormatter = NumberFormat('#,##0');
        final NumberFormat decimalFormatter = NumberFormat('#,##0.00');

        return Container(
          margin: const EdgeInsets.only(
            top: 0,
            bottom: 12,
            left: 16,
            right: 16,
          ),
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [Colors.indigo[500]!, Colors.purple[500]!],
            ),
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.2),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              // Summary values in a row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildSummaryItem(
                    'Rows',
                    intFormatter.format(provider.totalRows),
                    Icons.format_list_numbered,
                  ),
                  _buildSummaryItem(
                    'Qty',
                    intFormatter.format(provider.totalQty.round()),
                    Icons.inventory_2,
                  ),
                  _buildSummaryItem(
                    'GP',
                    intFormatter.format(provider.totalGP),
                    Icons.trending_up,
                  ),
                  _buildSummaryItem(
                    'Sale',
                    decimalFormatter.format(provider.totalSale),
                    Icons.payments,
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSummaryItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            color: Colors.white70,
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
      ],
    );
  }

  Widget _buildSalesCard(SalesCardModel sale, int index) {
    // final DateFormat dateFormatter = DateFormat('dd/MM/yyyy');
    final NumberFormat currencyFormatter = NumberFormat('#,##0.00');
    final NumberFormat intFormatter = NumberFormat('#,##0');

    // Calculate age for color determination
    final int? age = sale.lastPurchaseDate != null
        ? sale.tranDate.difference(sale.lastPurchaseDate!).inDays
        : null;
    final Color cardColor = (age != null && age > 360)
        ? Colors.pink[50]!
        : Colors.white;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      color: cardColor,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Index and Product Name
            Row(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '#${index + 1}',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.green[800],
                  ),
                ),
                SizedBox(width: 4),
                Expanded(
                  child: Text(
                    '${sale.brandName} ${sale.catName} ${sale.label}',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: Colors.black,
                      backgroundColor: Colors.amber[50],
                      // height: 1.3,
                    ),
                    overflow: TextOverflow.ellipsis,
                    maxLines: 2,
                  ),
                ),
              ],
            ),

            const SizedBox(height: 6),
            // Age and GP Row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Age
                if (sale.lastPurchaseDate != null)
                  Text(
                    'AGE: ${sale.tranDate.difference(sale.lastPurchaseDate!).inDays}',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w900,
                      color: Colors.black,
                    ),
                  )
                else
                  const SizedBox.shrink(),
                // GP (Gross Profit)
                Text(
                  'GP: ${intFormatter.format(sale.grossProfit)}',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                    color: sale.grossProfit < 0 ? Colors.red : Colors.black,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            // Product Info: BrandName, catName, label, info, code, and Stock
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Info (if available) - next line, trimmed, no left space
                      if (sale.info != null &&
                          sale.info!.trim().isNotEmpty) ...[
                        const SizedBox(height: 6),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              Icons.info_outline,
                              size: 17,
                              color: Colors.purple[700],
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                sale.info!.trim(),
                                style: TextStyle(
                                  fontSize: 13,
                                  color: Colors.black87,
                                  height: 1.3,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                      // Code, RefNo, and SaleType - next line
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.tag, size: 17, color: Colors.orange[700]),
                          const SizedBox(width: 4),
                          Text(
                            sale.autoRefNo,
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[600],
                              height: 1.3,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Code: ${sale.productCode}',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.grey[600],
                              height: 1.3,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: sale.saleType == 'Sale'
                                  ? Colors.green[100]
                                  : Colors.red[100],
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              sale.saleType,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: sale.saleType == 'Sale'
                                    ? Colors.green[800]
                                    : Colors.red[800],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 16),
                // Stock on right side in a box
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    intFormatter.format(sale.stock),
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),

            // Contact & Accounts (if available)
            if (sale.contact != null && sale.contact!.isNotEmpty) ...[
              const SizedBox(height: 10),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.person_outline, size: 17, color: Colors.teal[700]),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      sale.contact!,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[700],
                        height: 1.3,
                      ),
                    ),
                  ),
                ],
              ),
            ],

            // Time and Accounts row
            const SizedBox(height: 6),
            Row(
              children: [
                Icon(Icons.access_time, size: 17, color: Colors.blue[700]),
                const SizedBox(width: 4),
                Text(
                  DateFormat('hh:mm a').format(sale.timestamp.toLocal()),
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey[600],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                if (sale.accounts != null && sale.accounts!.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  Icon(
                    Icons.account_balance_wallet_outlined,
                    size: 17,
                    color: Colors.green[700],
                  ),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      sale.accounts!,
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[700],
                        height: 1.3,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ],
            ),

            // Line Remarks (if available)
            if (sale.lineRemarks != null &&
                sale.lineRemarks!.isNotEmpty &&
                sale.lineRemarks!.toLowerCase() != 'null') ...[
              const SizedBox(height: 10),

              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(Icons.note_outlined, size: 17, color: Colors.amber[700]),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      sale.lineRemarks!
                          .replaceAll(
                            RegExp(r'\bnull\b', caseSensitive: false),
                            '',
                          )
                          .replaceAll(
                            RegExp(r',\s*,+'),
                            ',',
                          ) // Remove multiple commas
                          .replaceAll(
                            RegExp(r'^,+|,+$'),
                            '',
                          ) // Remove leading/trailing commas
                          .trim(),
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[800],
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ],

            // Sales Details at bottom
            const SizedBox(height: 4),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildDetailItem(
                  'Price',
                  currencyFormatter.format(sale.amount / sale.qty),
                  Colors.black,
                ),
                _buildDetailItem(
                  'Qty',
                  intFormatter.format(sale.qty),
                  Colors.purple[700]!,
                ),
                _buildDetailItem(
                  'Amount',
                  currencyFormatter.format(sale.amount),
                  Colors.black,
                ),
              ],
            ),
            // ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailItem(String label, String value, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.black,
            fontWeight: FontWeight.w600,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          value,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: color,
            // height: 1.2,
          ),
        ),
      ],
    );
  }

  Widget _buildPeriodButton(
    BuildContext context, {
    required String label,
    // required IconData icon,
    required VoidCallback onPressed,
  }) {
    return Consumer<SalesProvider>(
      builder: (context, provider, _) {
        final isActive = provider.selectedPeriod == label;

        return TextButton(
          onPressed: onPressed,
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            // minimumSize: const Size(0, 0),
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
}
