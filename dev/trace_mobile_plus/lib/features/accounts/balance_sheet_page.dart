import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/routes.dart';
import '../../providers/balance_sheet_provider.dart';
import '../../providers/global_provider.dart';
import 'widgets/balance_sheet_account_item.dart';

class BalanceSheetPage extends StatefulWidget {
  const BalanceSheetPage({super.key});

  @override
  State<BalanceSheetPage> createState() => _BalanceSheetPageState();
}

class _BalanceSheetPageState extends State<BalanceSheetPage> {
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    // Refresh balance sheet once when page is loaded
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final globalProvider = Provider.of<GlobalProvider>(
        context,
        listen: false,
      );
      final balanceSheetProvider = Provider.of<BalanceSheetProvider>(
        context,
        listen: false,
      );

      // Clear any previous search filter first
      balanceSheetProvider.clearSearch();

      // Then refresh data
      balanceSheetProvider.refreshBalanceSheet(globalProvider);
    });
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    // Clear search filter when leaving the page
    Provider.of<BalanceSheetProvider>(context, listen: false).clearSearch();
    super.dispose();
  }

  void _toggleSearch() {
    setState(() {
      _isSearching = !_isSearching;
      if (!_isSearching) {
        _debounceTimer?.cancel();
        _searchController.clear();
        Provider.of<BalanceSheetProvider>(context, listen: false).clearSearch();
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
          Provider.of<BalanceSheetProvider>(context, listen: false).clearSearch();
          context.go(Routes.accountsOptions);
        }
      },
      child: Scaffold(
        appBar: AppBar(
          toolbarHeight: 54,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () {
              Provider.of<BalanceSheetProvider>(context, listen: false).clearSearch();
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
                          Provider.of<BalanceSheetProvider>(context, listen: false)
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
                          'Balance Sheet',
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
        body: Consumer<BalanceSheetProvider>(
          builder: (context, provider, _) {
            return FutureBuilder<void>(
              future: provider.balanceSheetFuture,
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
                if (provider.assetsData.isEmpty && provider.liabilitiesData.isEmpty) {
                  return _buildEmptyState(context);
                }

                // Success state - show data
                return _buildBalanceSheetContent(provider);
              },
            );
          },
        ),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, BalanceSheetProvider provider) {
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
              'Error loading balance sheet',
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
                provider.refreshBalanceSheet(globalProvider);
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
            'No balance sheet data found',
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

  Widget _buildBalanceSheetContent(BalanceSheetProvider provider) {
    return Column(
      children: [
        // Scrollable content with Liabilities and Assets
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Liabilities Section
                if (provider.liabilitiesData.isNotEmpty) ...[
                  _buildSectionHeader('LIABILITIES', provider.totalLiabilities),
                  ...provider.liabilitiesData.asMap().entries.map((entry) {
                    return BalanceSheetAccountItem(
                      account: entry.value,
                      depth: 0,
                      rowIndex: entry.key,
                    );
                  }),
                ],

                // Divider between sections
                if (provider.liabilitiesData.isNotEmpty && provider.assetsData.isNotEmpty)
                  const Divider(height: 1, thickness: 2),

                // Assets Section
                if (provider.assetsData.isNotEmpty) ...[
                  _buildSectionHeader('ASSETS', provider.totalAssets),
                  ...provider.assetsData.asMap().entries.map((entry) {
                    return BalanceSheetAccountItem(
                      account: entry.value,
                      depth: 0,
                      rowIndex: entry.key,
                    );
                  }),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSectionHeader(String title, double total, {double? debit, double? credit}) {
    String formatCurrency(double amount) {
      if (amount == 0) return '0.00';
      return amount.toStringAsFixed(2).replaceAllMapped(
            RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
            (Match m) => '${m[1]},',
          );
    }

    return Container(
      color: Colors.blue[50],
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Main title and total
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: Colors.black87,
                ),
              ),
              Text(
                formatCurrency(total),
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          // Debit and Credit breakdown
          if (debit != null && credit != null) ...[
            const SizedBox(height: 4),
            Wrap(
              spacing: 12,
              children: [
                Text(
                  'Dr: ${formatCurrency(debit)}',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.blue[700],
                    fontWeight: FontWeight.w500,
                  ),
                ),
                Text(
                  'Cr: ${formatCurrency(credit)}',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.green[700],
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
