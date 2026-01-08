import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/routes.dart';
import '../../providers/sales_provider.dart';
import '../../providers/transactions_provider.dart';
import '../../providers/global_provider.dart';
import '../../providers/business_health_provider.dart';
import '../../providers/products_provider.dart';

class DashboardContentWidget extends StatelessWidget {
  final String username;

  const DashboardContentWidget({
    super.key,
    required this.username,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: SingleChildScrollView(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                const SizedBox(height: 16),
                // Welcome section
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF1E3A5F),
                        Color(0xFF2C5F8D),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.check_circle,
                        color: Color(0xFF00B894),
                        size: 48,
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Welcome to Trace+',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Hello, $username!',
                        style: const TextStyle(
                          fontSize: 16,
                          color: Color(0xFFB2BEC3),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Quick action buttons
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  alignment: WrapAlignment.center,
                  children: [
                    _buildActionCard(
                      context: context,
                      icon: Icons.account_balance,
                      label: 'Accounts',
                      color: const Color(0xFF5B7EC4),
                      onTap: () {
                        context.go(Routes.accountsOptions);
                      },
                    ),
                    _buildActionCard(
                      context: context,
                      icon: Icons.inventory,
                      label: 'Products',
                      color: const Color(0xFF00B894),
                      onTap: () {
                        // Get providers (without listening to prevent dashboard rebuilds)
                        final productsProvider = Provider.of<ProductsProvider>(context, listen: false);
                        final globalProvider = Provider.of<GlobalProvider>(context, listen: false);

                        // Initialize and start fetching data
                        productsProvider.initialize(globalProvider);

                        // Navigate to products page
                        context.go(Routes.products);
                      },
                    ),
                    _buildActionCard(
                      context: context,
                      icon: Icons.point_of_sale,
                      label: 'Sales',
                      color: const Color(0xFFD63031),
                      onTap: () {
                        // Get providers (without listening to prevent dashboard rebuilds)
                        final salesProvider = Provider.of<SalesProvider>(context, listen: false);
                        final globalProvider = Provider.of<GlobalProvider>(context, listen: false);

                        // Initialize to today and start fetching data
                        salesProvider.initializeToday(globalProvider);

                        // Navigate to sales page
                        context.go(Routes.sales);
                      },
                    ),
                    _buildActionCard(
                      context: context,
                      icon: Icons.receipt_long,
                      label: 'Transactions',
                      color: const Color(0xFFE17055),
                      onTap: () {
                        // Get providers (without listening to prevent dashboard rebuilds)
                        final transactionsProvider = Provider.of<TransactionsProvider>(context, listen: false);
                        final globalProvider = Provider.of<GlobalProvider>(context, listen: false);

                        // Initialize to today and start fetching data
                        transactionsProvider.initializeToday(globalProvider);

                        // Navigate to transactions page
                        context.go(Routes.transactions);
                      },
                    ),
                    _buildActionCard(
                      context: context,
                      icon: Icons.health_and_safety,
                      label: 'Health',
                      color: const Color(0xFF6C5CE7),
                      onTap: () {
                        // Get providers (without listening to prevent dashboard rebuilds)
                        final businessHealthProvider = Provider.of<BusinessHealthProvider>(context, listen: false);
                        final globalProvider = Provider.of<GlobalProvider>(context, listen: false);

                        // Initialize and start fetching data
                        businessHealthProvider.initialize(globalProvider);

                        // Navigate to business health page
                        context.go(Routes.businessHealth);
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionCard({
    required BuildContext context,
    required IconData icon,
    required String label,
    required Color color,
    VoidCallback? onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 120,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.3)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
