import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/counter_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/riverpod_provider.dart';

// Change counter in bottom level widget and see the changes in top level widget
class ProviderSamplePage extends StatelessWidget {
  const ProviderSamplePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Provider Sample')),
      body: Center(child: TopLevelWidget()),
    );
  }
}

class TopLevelWidget extends ConsumerWidget {
  const TopLevelWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final riverpodCount = ref.watch(counterProvider);

    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Counter Value at top level widget: ${context.watch<CounterProvider>().counter}',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 20),
        Text(
          'Counter Value from Riverpod at top level widget: $riverpodCount',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 20),
        Middle1LevelWidget(firstName: 'John'),
      ],
    );
  }
}

class Middle1LevelWidget extends StatelessWidget {
  final String firstName;
  const Middle1LevelWidget({super.key, required this.firstName});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          'Counter value from Middle 1 Level Widget ${context.watch<CounterProvider>().counter}',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 20),
        Center(child: Middle2LevelWidget(firstName: firstName)),
      ],
    );
  }
}

class Middle2LevelWidget extends StatelessWidget {
  final String firstName;
  const Middle2LevelWidget({super.key, required this.firstName});

  @override
  Widget build(BuildContext context) {
    return BottomLevelWidget(firstName: firstName);
  }
}

class BottomLevelWidget extends ConsumerWidget {
  final String firstName;
  const BottomLevelWidget({super.key, required this.firstName});
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          '$firstName from Bottom Level Widget',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
        SizedBox(height: 20),
        ElevatedButton(
          onPressed: () {
            // Access and modify the counter value using Provider
            context.read<CounterProvider>().increment();
          },
          child: Text('Change Counter'),
        ),
        SizedBox(height: 20),
        ElevatedButton(
          onPressed: () {
            ref.read(counterProvider.notifier).increment();
          },
          child: Text('Increment Riverpod Counter'),
        ),
      ],
    );
  }
}
