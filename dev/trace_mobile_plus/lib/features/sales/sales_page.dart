import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile_plus/core/routes.dart';
import 'package:trace_mobile_plus/providers/sales_provider.dart';

class SalesPage extends StatelessWidget {
  const SalesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // AppBar Section
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go(Routes.dashboard),
        ),
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Color.fromARGB(255, 90, 105, 128), // Darker blue for status bar
          statusBarIconBrightness: Brightness.light,
          statusBarBrightness: Brightness.dark,
        ),
        elevation: 4  ,
        titleSpacing: 0,
        backgroundColor: Colors.teal[500],
        actions: const [SizedBox(width: 16)],
        title: LayoutBuilder(
          builder: (context, constraints) {
            return Consumer<SalesProvider>(
              builder: (context, provider, _) {
                return Row(
                  children: [
                    const Text('Sales'),
                    const SizedBox(width: 10),
                    SizedBox(
                      width: constraints.maxWidth - 60, // Reserve space for "Sales" text
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: [
                            _buildPeriodButton(
                              context,
                              label: 'Today',
                              // icon: Icons.today,
                              onPressed: () => provider.setToday(),
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '(-1) Day',
                              // icon: Icons.calendar_today,
                              onPressed: () => provider.setDaysAgo(1),
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '(-2) Day',
                              // icon: Icons.calendar_today,
                              onPressed: () => provider.setDaysAgo(2),
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '(-3) Day',
                              // icon: Icons.calendar_today,
                              onPressed: () => provider.setDaysAgo(3),
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: 'This Month',
                              // icon: Icons.calendar_month,
                              onPressed: () => provider.setThisMonth(),
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: 'Previous Month',
                              // icon: Icons.date_range,
                              onPressed: () => provider.setPreviousMonth(1),
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '(-2) Month',
                              // icon: Icons.date_range,
                              onPressed: () => provider.setPreviousMonth(2),
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: '(-3) Month',
                              // icon: Icons.date_range,
                              onPressed: () => provider.setPreviousMonth(3),
                            ),
                            const SizedBox(width: 8),
                            _buildPeriodButton(
                              context,
                              label: 'Last 3 Months',
                              // icon: Icons.date_range,
                              onPressed: () => provider.setLastMonths(3),
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
      ),

      // Body with Content and Summary sections
      body: Consumer<SalesProvider>(
        builder: (context, provider, _) {
          return SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Date Display Section
                  _buildDateDisplaySection(provider),

                  const SizedBox(height: 16),

                  // Content Section
                  _buildContentSection(context),

                  const SizedBox(height: 24),

                  // Summary Section
                  _buildSummarySection(context),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDateDisplaySection(SalesProvider provider) {
    // Format dates for display
    String formatDate(DateTime date) {
      return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF00B894),
            Color(0xFF00CEC9),
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.date_range,
                color: Colors.white,
                size: 24,
              ),
              SizedBox(width: 12),
              Text(
                'Selected Date Range',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(color: Colors.white54),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Start Date',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      formatDate(provider.startDate),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.arrow_forward,
                color: Colors.white70,
                size: 20,
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text(
                      'End Date',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      formatDate(provider.endDate),
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildContentSection(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFD63031).withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
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
                Icons.point_of_sale,
                color: const Color(0xFFD63031),
                size: 28,
              ),
              const SizedBox(width: 12),
              const Text(
                'Sales Content',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2D3436),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 16),

          // Dummy content items
          _buildDummyContentItem(
            icon: Icons.shopping_cart,
            title: 'Recent Sales',
            subtitle: 'View your recent sales transactions',
          ),
          const SizedBox(height: 12),
          _buildDummyContentItem(
            icon: Icons.trending_up,
            title: 'Sales Trends',
            subtitle: 'Analyze sales performance over time',
          ),
          const SizedBox(height: 12),
          _buildDummyContentItem(
            icon: Icons.inventory_2,
            title: 'Top Products',
            subtitle: 'View best selling products',
          ),
        ],
      ),
    );
  }

  Widget _buildSummarySection(BuildContext context) {
    return Container(
      width: double.infinity,
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
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(
                Icons.summarize,
                color: Colors.white,
                size: 24,
              ),
              SizedBox(width: 12),
              Text(
                'Summary',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Summary cards in a row
          Row(
            children: [
              Expanded(
                child: _buildSummaryCard(
                  label: 'Total Sales',
                  value: '0',
                  icon: Icons.attach_money,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildSummaryCard(
                  label: 'Transactions',
                  value: '0',
                  icon: Icons.receipt,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildSummaryCard(
                  label: 'Avg. Order',
                  value: '0',
                  icon: Icons.analytics,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildSummaryCard(
                  label: 'Items Sold',
                  value: '0',
                  icon: Icons.shopping_bag,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDummyContentItem({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF5F5F5),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFD63031).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: const Color(0xFFD63031),
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF2D3436),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF636E72),
                  ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.arrow_forward_ios,
            size: 16,
            color: Color(0xFFB2BEC3),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard({
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            color: const Color(0xFF00B894),
            size: 20,
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Color(0xFFB2BEC3),
            ),
          ),
        ],
      ),
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
            // padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
            backgroundColor: isActive
                ? Colors.lightBlue[300]
                : Colors.white.withValues(alpha: 0.9),
            foregroundColor: isActive
                ? Colors.white
                : Colors.teal[700],
            // shape: RoundedRectangleBorder(
            //   borderRadius: BorderRadius.circular(8),
            // ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        );
      },
    );
  }
}
