import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile_plus/core/routes.dart';
import 'package:trace_mobile_plus/providers/business_health_provider.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';

class BusinessHealthPage extends StatelessWidget {
  const BusinessHealthPage({super.key});

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
          title: const Text('Business Health'),
          bottom: PreferredSize(
            preferredSize: const Size.fromHeight(34),
            child: _buildSecondaryAppBar(context),
          ),
        ),
        body: Consumer<BusinessHealthProvider>(
          builder: (context, provider, _) {
            // Trigger initial load if healthFuture is null
            if (provider.healthFuture == null) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                final globalProvider = Provider.of<GlobalProvider>(
                  context,
                  listen: false,
                );
                provider.refreshHealth(globalProvider);
              });
            }

            return FutureBuilder<void>(
              future: provider.healthFuture,
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
                            'Error loading business health data',
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
                              provider.refreshHealth(globalProvider);
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
                if (provider.healthData == null) {
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
                          'No business health data found',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  );
                }

                // Show business health data
                return RefreshIndicator(
                  onRefresh: () {
                    final globalProvider = Provider.of<GlobalProvider>(
                      context,
                      listen: false,
                    );
                    return provider.fetchHealthData(globalProvider);
                  },
                  child: ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      _buildHealthMetric(
                        'Sundry Creditors',
                        provider.healthData!.sundryCreditorsFormatted,
                        provider.healthData!.sundryCreditors,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        'Sundry Debtors',
                        provider.healthData!.sundryDebtorsFormatted,
                        provider.healthData!.sundryDebtors,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        'Bank Accounts',
                        provider.healthData!.bankAccountsFormatted,
                        provider.healthData!.bankAccounts,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        'Cash-in-Hand',
                        provider.healthData!.cashInHandFormatted,
                        provider.healthData!.cashInHand,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        'Purchase Account',
                        provider.healthData!.purchaseAccountFormatted,
                        provider.healthData!.purchaseAccount,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        'Sales Account',
                        provider.healthData!.salesAccountFormatted,
                        provider.healthData!.salesAccount,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        'Opening Stock',
                        provider.healthData!.openingStockFormatted,
                        provider.healthData!.openingStock,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        'Opening Stock (GST)',
                        provider.healthData!.openingStockGstFormatted,
                        provider.healthData!.openingStockGst,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        'Closing Stock',
                        provider.healthData!.closingStockFormatted,
                        provider.healthData!.closingStock,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        'Closing Stock (GST)',
                        provider.healthData!.closingStockGstFormatted,
                        provider.healthData!.closingStockGst,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        '(a) Profit or loss as per balance sheet',
                        provider.healthData!.profitLossFormatted,
                        provider.healthData!.profitLoss,
                        isHighlight: true,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        'Difference in Stock',
                        provider.healthData!.differenceInStockFormatted,
                        provider.healthData!.differenceInStock,
                      ),
                      // const SizedBox(height: 8),
                      _buildHealthMetric(
                        '(b) Difference in stock (GST)',
                        provider.healthData!.differenceInStockGstFormatted,
                        provider.healthData!.differenceInStockGst,
                        isHighlight: true,
                      ),
                      const SizedBox(height: 16),
                      _buildHealthMetric(
                        'Business Index (a + b)',
                        provider.healthData!.businessIndexFormatted,
                        provider.healthData!.businessIndex,
                        isBusinessIndex: true,
                      ),
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
    return Consumer<GlobalProvider>(
      builder: (context, globalProvider, _) {
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
                Icon(Icons.business, color: Colors.grey[600], size: 16),
                const SizedBox(width: 8),
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

  Widget _buildHealthMetric(
    String label,
    String formattedValue,
    double rawValue, {
    bool isHighlight = false,
    bool isBusinessIndex = false,
  }) {
    final bool isNegative = rawValue < 0;

    Color valueColor = Colors.black;
    if (isNegative) {
      valueColor = Colors.red[700]!;
    } else if (rawValue > 0) {
      valueColor = Colors.green[700]!;
    }

    return Card(
      elevation: isBusinessIndex ? 4 : 2,
      color: isBusinessIndex
          ? Colors.teal[50]
          : isHighlight
              ? Colors.amber[50]
              : Colors.white,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: isBusinessIndex ? 16 : 14,
                  fontWeight: isBusinessIndex || isHighlight
                      ? FontWeight.bold
                      : FontWeight.w500,
                  color: Colors.grey[800],
                ),
              ),
            ),
            const SizedBox(width: 16),
            Text(
              formattedValue,
              style: TextStyle(
                fontSize: isBusinessIndex ? 18 : 15,
                fontWeight: FontWeight.bold,
                color: valueColor,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
