import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/routes.dart';
import '../../providers/global_provider.dart';

class AccountsOptionsPage extends StatelessWidget {
  const AccountsOptionsPage({super.key});

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
            statusBarColor: Color(0xFF5B7EC4),
            statusBarIconBrightness: Brightness.light,
            statusBarBrightness: Brightness.dark,
          ),
          elevation: 0,
          titleSpacing: 0,
          backgroundColor: const Color(0xFF5B7EC4),
          title: Consumer<GlobalProvider>(
            builder: (context, globalProvider, _) {
              final unitname = globalProvider.unitName ?? '';
              final finYear = globalProvider.selectedFinYear?.finYearId ?? '';
              final branchCode = globalProvider.selectedBranch?.branchCode ?? '';

              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Accounts',
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
        ),
        body: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text(
                'Select an accounting report',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2D3436),
                ),
              ),
              const SizedBox(height: 24),
              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  children: [
                    _buildOptionCard(
                      context: context,
                      icon: Icons.balance,
                      title: 'Trial Balance',
                      color: const Color(0xFF00B894),
                      onTap: () => context.go(Routes.trialBalance),
                    ),
                    _buildOptionCard(
                      context: context,
                      icon: Icons.account_balance_wallet,
                      title: 'Balance Sheet',
                      color: const Color(0xFF0984E3),
                      onTap: () => context.go(Routes.balanceSheet),
                    ),
                    _buildOptionCard(
                      context: context,
                      icon: Icons.trending_up,
                      title: 'Profit & Loss',
                      color: const Color(0xFFD63031),
                      onTap: () => context.go(Routes.profitLoss),
                    ),
                    _buildOptionCard(
                      context: context,
                      icon: Icons.book,
                      title: 'General Ledger',
                      color: const Color(0xFF6C5CE7),
                      onTap: () => context.go(Routes.generalLedger),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOptionCard({
    required BuildContext context,
    required IconData icon,
    required String title,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                color,
                color.withValues(alpha: 0.7),
              ],
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                size: 48,
                color: Colors.white,
              ),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
