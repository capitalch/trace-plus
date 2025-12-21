import 'package:flutter/material.dart';
import 'app_theme.dart';

/// This file demonstrates how to use the app theme throughout your application.
/// You can delete this file once you're familiar with the theme usage.

class ThemeUsageExample extends StatelessWidget {
  const ThemeUsageExample({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Theme Usage Example'),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Typography Examples
            Text(
              'Display Large',
              style: Theme.of(context).textTheme.displayLarge,
            ),
            Text(
              'Headline Large',
              style: Theme.of(context).textTheme.headlineLarge,
            ),
            Text(
              'Title Large',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            Text(
              'Body Large - Regular text content',
              style: Theme.of(context).textTheme.bodyLarge,
            ),
            Text(
              'Body Medium - Secondary content',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            Text(
              'Body Small - Tertiary content',
              style: Theme.of(context).textTheme.bodySmall,
            ),

            const SizedBox(height: 32),

            // Direct Color Usage
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primaryIndigo,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text(
                'Using AppTheme.primaryIndigo directly',
                style: TextStyle(color: Colors.white),
              ),
            ),

            const SizedBox(height: 16),

            // Theme Color Usage
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                'Using Theme.of(context).colorScheme.primary',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onPrimary,
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Button Examples
            const Text('Button Examples:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),

            ElevatedButton(
              onPressed: () {},
              child: const Text('Elevated Button'),
            ),

            const SizedBox(height: 8),

            OutlinedButton(
              onPressed: () {},
              child: const Text('Outlined Button'),
            ),

            const SizedBox(height: 8),

            TextButton(
              onPressed: () {},
              child: const Text('Text Button'),
            ),

            const SizedBox(height: 32),

            // Card Example
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Card Title',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Card content goes here. Cards use the theme automatically.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Input Field Example
            const Text('Input Example:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),

            const TextField(
              decoration: InputDecoration(
                labelText: 'Label Text',
                hintText: 'Enter some text...',
                prefixIcon: Icon(Icons.person),
              ),
            ),

            const SizedBox(height: 32),

            // Status Colors
            const Text('Status Colors:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),

            Row(
              children: [
                _buildStatusChip('Success', AppTheme.success),
                const SizedBox(width: 8),
                _buildStatusChip('Warning', AppTheme.warning),
                const SizedBox(width: 8),
                _buildStatusChip('Error', AppTheme.error),
                const SizedBox(width: 8),
                _buildStatusChip('Info', AppTheme.info),
              ],
            ),

            const SizedBox(height: 32),

            // Icon Examples
            const Text('Icon Examples:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),

            Row(
              children: [
                Icon(Icons.home, color: Theme.of(context).iconTheme.color),
                const SizedBox(width: 16),
                Icon(Icons.favorite, color: AppTheme.error),
                const SizedBox(width: 16),
                Icon(Icons.check_circle, color: AppTheme.success),
                const SizedBox(width: 16),
                Icon(Icons.info, color: AppTheme.info),
              ],
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildStatusChip(String label, Color color) {
    return Chip(
      label: Text(label),
      backgroundColor: color.withValues(alpha: 0.2),
      labelStyle: TextStyle(color: color, fontWeight: FontWeight.w600),
    );
  }
}
