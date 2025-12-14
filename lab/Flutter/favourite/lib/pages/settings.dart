import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/counter_provider.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Settings'),actions: [
        IconButton(
          icon: const Icon(Icons.home),
          onPressed: () {
            context.go('/');
          },
        ),
      ],),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Settings Page',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 16),
            Text('This is the settings page of the app.'),
            SizedBox(height: 16),
            Consumer(builder:   (context,  CounterProvider counterProvider,  _) {
              return Text('Counter value from Consumer ${counterProvider.counter}');
            }),
            Text('Counter value can be changed in Provider Sample Page from watch ${context.watch<CounterProvider>().counter}'),
            SizedBox(height: 16),
            Selector<CounterProvider, int>(
              selector: (context, counterProvider) => counterProvider.counter,
              builder: (context, counter, child) {
                return Text('Counter value from Selector $counter');
              },
            ),
            
            ElevatedButton(
              onPressed: () {
                context.read<CounterProvider>().decrement();
              },
              child: Text('Decrease Counter in Provider'),
            ),
          ],
        ),
      ),
    );
  }
}