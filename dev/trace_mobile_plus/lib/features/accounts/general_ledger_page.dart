import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile_plus/features/accounts/widgets/account_selection_modal.dart';
import 'package:trace_mobile_plus/features/accounts/widgets/ledger_summary.dart';
import 'package:trace_mobile_plus/features/accounts/widgets/transaction_card.dart';
import 'package:trace_mobile_plus/providers/general_ledger_provider.dart';
import 'package:trace_mobile_plus/providers/global_provider.dart';
import '../../core/routes.dart';

class GeneralLedgerPage extends StatefulWidget {
  const GeneralLedgerPage({super.key});

  @override
  State<GeneralLedgerPage> createState() => _GeneralLedgerPageState();
}

class _GeneralLedgerPageState extends State<GeneralLedgerPage> {
  bool _isModalShown = false;

  @override
  void initState() {
    super.initState();
    // Clear selection to start fresh every time
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_isModalShown) {
        final provider = Provider.of<GeneralLedgerProvider>(context, listen: false);
        provider.clearSelection();
        _isModalShown = true;

        // Auto-open account selection modal
        _openAccountSelectionModal();
      }
    });
  }

  void _openAccountSelectionModal() {
    final provider = Provider.of<GeneralLedgerProvider>(context, listen: false);
    final globalProvider = Provider.of<GlobalProvider>(context, listen: false);

    showDialog(
      context: context,
      builder: (BuildContext dialogContext) {
        return AccountSelectionModal(
          provider: provider,
          globalProvider: globalProvider,
        );
      },
    ).then((_) {
      // Reset flag when modal closes
      setState(() {
        _isModalShown = false;
      });
    });
  }

  void _openFixedAccount(){
    final provider = Provider.of<GeneralLedgerProvider>(context, listen: false);
    final globalProvider = Provider.of<GlobalProvider>(context, listen: false);

    provider.selectFixedAccount(
      globalProvider,
    );
  }

  Future<void> _onRefresh() async {
    final provider = Provider.of<GeneralLedgerProvider>(context, listen: false);
    final globalProvider = Provider.of<GlobalProvider>(context, listen: false);

    if (provider.selectedAccountId != null) {
      await provider.fetchAccountLedger(
        provider.selectedAccountId!,
        globalProvider,
      );
    }
  }

  Widget _buildSecondaryAppBar(BuildContext context) {
    return Consumer2<GeneralLedgerProvider, GlobalProvider>(
      builder: (context, provider, globalProvider, _) {
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
                // Account Name
                Expanded(
                  child: Text(
                    provider.selectedAccountName ?? '',
                    style: TextStyle(
                      color: Colors.grey[800],
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
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

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          context.go(Routes.accountsOptions);
        }
      },
      child: Consumer<GeneralLedgerProvider>(
        builder: (context, provider, child) {
          return Scaffold(
            appBar: AppBar(
              toolbarHeight: 54,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => context.go(Routes.accountsOptions),
              ),
              systemOverlayStyle: const SystemUiOverlayStyle(
                statusBarColor: Color(0xFF6C5CE7),
                statusBarIconBrightness: Brightness.light,
                statusBarBrightness: Brightness.dark,
              ),
              elevation: 0,
              titleSpacing: 0,
              backgroundColor: const Color(0xFF6C5CE7),
              title: const Text(
                'General Ledger',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.account_balance_wallet),
                  onPressed: _openAccountSelectionModal,
                  tooltip: 'Select Account',
                ),

                // To be removed
                IconButton(
                  icon: const Icon(Icons.check_circle_outline),
                  onPressed: _openFixedAccount,
                  tooltip: 'Check',
                ),
              ],
              bottom: provider.selectedAccountName != null
                  ? PreferredSize(
                      preferredSize: const Size.fromHeight(34),
                      child: _buildSecondaryAppBar(context),
                    )
                  : null,
            ),
            body: _buildBody(provider),
          );
        },
      ),
    );
  }

  Widget _buildBody(GeneralLedgerProvider provider) {
    // No account selected
    if (provider.selectedAccountId == null) {
      return _buildEmptyState();
    }

    // Loading transactions
    if (provider.isLoadingTransactions) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    // Error state
    if (provider.errorMessage != null) {
      return _buildErrorState(provider);
    }

    // Ledger content with summary and transactions
    return _buildLedgerContent(provider);
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.account_balance_wallet_outlined,
            size: 64,
            color: Colors.grey[400],
          ),
          const SizedBox(height: 16),
          Text(
            'Select an account to view ledger',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _openAccountSelectionModal,
            icon: const Icon(Icons.account_balance_wallet),
            label: const Text('Select Account'),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(GeneralLedgerProvider provider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 64,
            ),
            const SizedBox(height: 16),
            Text(
              provider.errorMessage!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: Colors.red,
                fontSize: 16,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _onRefresh,
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLedgerContent(GeneralLedgerProvider provider) {
    return RefreshIndicator(
      onRefresh: _onRefresh,
      child: Column(
        children: [
          // Summary widget
          if (provider.summary != null) LedgerSummary(summary: provider.summary!),

          const Divider(height: 1),

          // Transactions list
          Expanded(
            child: provider.transactionsList.isEmpty
                ? Center(
                    child: Text(
                      'No transactions found',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                      ),
                    ),
                  )
                : ListView.builder(
                    itemCount: provider.transactionsList.length,
                    itemBuilder: (context, index) {
                      final transaction = provider.transactionsList[index];
                      return TransactionCard(
                        transaction: transaction,
                        index: index + 1,
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
