import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/routes.dart';
import '../../providers/trial_balance_provider.dart';
import '../../providers/global_provider.dart';
import '../../models/account_model.dart';
import 'widgets/account_card_item.dart';

class TrialBalancePage extends StatefulWidget {
  const TrialBalancePage({super.key});

  @override
  State<TrialBalancePage> createState() => _TrialBalancePageState();
}

class _TrialBalancePageState extends State<TrialBalancePage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    // Refresh trial balance once when page is loaded
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final globalProvider = Provider.of<GlobalProvider>(
        context,
        listen: false,
      );
      final trialBalanceProvider = Provider.of<TrialBalanceProvider>(
        context,
        listen: false,
      );

      // Clear any previous search filter first
      trialBalanceProvider.clearSearch();

      // Then refresh data
      trialBalanceProvider.refreshTrialBalance(globalProvider);
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    // Clear search filter when leaving the page
    Provider.of<TrialBalanceProvider>(context, listen: false).clearSearch();
    super.dispose();
  }

  void _toggleSearch() {
    setState(() {
      _isSearching = !_isSearching;
      if (!_isSearching) {
        _debounceTimer?.cancel();
        _searchController.clear();
        Provider.of<TrialBalanceProvider>(context, listen: false).clearSearch();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          // Clear search before navigating back
          Provider.of<TrialBalanceProvider>(context, listen: false).clearSearch();
          context.go(Routes.accountsOptions);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          toolbarHeight: 54,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              Provider.of<TrialBalanceProvider>(context, listen: false).clearSearch();
              context.go(Routes.accountsOptions);
            },
          ),
          systemOverlayStyle: const SystemUiOverlayStyle(
            statusBarColor: Color(0xFF00B894),
            statusBarIconBrightness: Brightness.light,
            statusBarBrightness: Brightness.dark,
          ),
          elevation: 0,
          titleSpacing: 0,
          backgroundColor: const Color(0xFF00B894),
          title: _isSearching
              ? Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(2),
                  ),
                  child: TextField(
                    controller: _searchController,
                    autofocus: true,
                    style: const TextStyle(color: Colors.black),
                    decoration: const InputDecoration(
                      hintText: 'Search accounts...',
                      hintStyle: TextStyle(color: Colors.black54),
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      disabledBorder: InputBorder.none,
                      filled: false,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                    ),
                    onChanged: (value) {
                      // Cancel previous timer
                      _debounceTimer?.cancel();

                      // Create new timer for debounce
                      _debounceTimer = Timer(const Duration(milliseconds: 1200), () {
                        if (_isSearching) {
                          Provider.of<TrialBalanceProvider>(context, listen: false)
                              .setSearchQuery(value);
                        }
                      });
                    },
                  ),
                )
              : Consumer<GlobalProvider>(
                  builder: (context, globalProvider, _) {
                    final unitname = globalProvider.unitName ?? '';
                    final finYear = globalProvider.selectedFinYear?.finYearId ?? '';
                    final branchCode = globalProvider.selectedBranch?.branchCode ?? '';

                    return Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'Trial Balance',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$unitname | FY: $finYear | Branch: $branchCode',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                          softWrap: true,
                          maxLines: 3,
                          overflow: TextOverflow.visible,
                        ),
                      ],
                    );
                  },
                ),
          actions: [
            IconButton(
              icon: Icon(_isSearching ? Icons.close : Icons.search),
              onPressed: _toggleSearch,
            ),
          ],
        ),
        body: Consumer<TrialBalanceProvider>(
          builder: (context, provider, _) {
            return FutureBuilder<void>(
              future: provider.trialBalanceFuture,
              builder: (context, snapshot) {
                // Loading state
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }

                // Error state
                if (snapshot.hasError || provider.errorMessage != null) {
                  return _buildErrorState(context, provider);
                }

                // Empty state
                if (provider.accountsData.isEmpty) {
                  return _buildEmptyState(context);
                }

                // Success state - show data
                return _buildTrialBalanceContent(provider.accountsData);
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, TrialBalanceProvider provider) {
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
              'Error loading trial balance',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[700],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              provider.errorMessage ?? 'Unknown error occurred',
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
                provider.refreshTrialBalance(globalProvider);
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF00B894),
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
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
            'No trial balance data found',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'No accounts data available',
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }

  Widget _buildTrialBalanceContent(List<AccountModel> accounts) {
    return Column(
      children: [
        // Summary Totals Card
        Consumer<TrialBalanceProvider>(
          builder: (context, provider, _) {
            return _buildSummaryCard(provider);
          },
        ),

        // Divider
        const Divider(height: 1, thickness: 2),

        // Accounts List
        Expanded(
          child: ListView.builder(
            itemCount: accounts.length,
            itemBuilder: (context, index) {
              return AccountCardItem(
                account: accounts[index],
                depth: 0,
                rowIndex: index,
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(TrialBalanceProvider provider) {
    String formatCurrency(double amount) {
      if (amount == 0) return '0.00';
      return amount.toStringAsFixed(2).replaceAllMapped(
            RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
            (Match m) => '${m[1]},',
          );
    }

    // Calculate opening total
    final openingNet = provider.totalOpeningDebit - provider.totalOpeningCredit;
    final openingDc = openingNet >= 0 ? 'D' : 'C';
    final openingAmount = openingNet.abs();

    // Calculate closing total
    final closingNet = provider.totalClosingDebit - provider.totalClosingCredit;
    final closingDc = closingNet >= 0 ? 'D' : 'C';
    final closingAmount = closingNet.abs();

    return Container(
      color: Colors.amber[50],
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Line 1: TOTALS label + Closing total
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'TOTALS',
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
              Text(
                '${formatCurrency(closingAmount)} $closingDc',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
            ],
          ),

          const SizedBox(height: 4),

          // Line 2: Opening, Debit, Credit, Closing totals
          Wrap(
            spacing: 12,
            runSpacing: 4,
            children: [
              Text(
                'Op: ${formatCurrency(openingAmount)} $openingDc',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.grey[700],
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                'Dr: ${formatCurrency(provider.totalDebit)}',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.blue[700],
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                'Cr: ${formatCurrency(provider.totalCredit)}',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.green[700],
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                'Cl: ${formatCurrency(closingAmount)} $closingDc',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.purple[700],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

}
