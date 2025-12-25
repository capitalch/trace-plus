import 'package:flutter/material.dart';

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
                const SizedBox(height: 24),
                // Welcome section
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF1E3A5F),
                        Color(0xFF2C5F8D),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const Icon(
                        Icons.check_circle,
                        color: Color(0xFF00B894),
                        size: 64,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Welcome to Trace+',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Hello, $username!',
                        style: const TextStyle(
                          fontSize: 18,
                          color: Color(0xFFB2BEC3),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 48),

                // Quick action buttons
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  alignment: WrapAlignment.center,
                  children: [
                    _buildActionCard(
                      icon: Icons.account_balance,
                      label: 'Accounts',
                      color: const Color(0xFF5B7EC4),
                    ),
                    _buildActionCard(
                      icon: Icons.inventory,
                      label: 'Products',
                      color: const Color(0xFF00B894),
                    ),
                    _buildActionCard(
                      icon: Icons.point_of_sale,
                      label: 'Sales',
                      color: const Color(0xFFD63031),
                    ),
                    _buildActionCard(
                      icon: Icons.receipt_long,
                      label: 'Transactions',
                      color: const Color(0xFFE17055),
                    ),
                    _buildActionCard(
                      icon: Icons.health_and_safety,
                      label: 'Health',
                      color: const Color(0xFF6C5CE7),
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
    required IconData icon,
    required String label,
    required Color color,
  }) {
    return Container(
      width: 140,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, size: 40, color: color),
          const SizedBox(height: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
