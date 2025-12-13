import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Home Page'), actions: [
        IconButton(
          icon: const Icon(Icons.settings),
          onPressed: () {
            context.push('/settings');
          },
        ),
        IconButton(
          icon: const Icon(Icons.account_circle),
          onPressed: () {
            context.push('/provider_sample');
          },
        ),
      ],),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Hello, World!',
              style: TextStyle(color: Colors.redAccent),
            ),
            const SizedBox(height: 16),
            const Text('Welcome to the Startup Project.'),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.all(8),
              child: ElevatedButton.icon(
                onPressed: onPressed,
                icon: const Icon(Icons.thumb_up_alt, size: 24),
                label: const Text('Press Me'),
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 8,
                  ),
                ),
              ),
            ),
            const CounterWidget(),
            const SizeWidget(),
            const StatelessCounter(count: 5),
          ],
        ),
      ),
    );
  }

  static void onPressed() {
    print('Button Pressed');
  }
}

class CounterWidget extends StatefulWidget {
  const CounterWidget({super.key});

  @override
  State<CounterWidget> createState() => _CounterWidgetState();
}

class _CounterWidgetState extends State<CounterWidget> {
  int _counter = 0;
  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Counter: $_counter'),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: _incrementCounter,
          child: const Text('Increment Counter'),
        ),
      ],
    );
  }
}

class SizeWidget extends StatelessWidget {
  const SizeWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return const Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Expanded(child: BorderedImage()),
        Expanded(child: BorderedImage()),
        Expanded(child: BorderedImage()),
        Expanded(child: BorderedImage()),
        // BorderedImage(),
        // BorderedImage(),
      ],
    );
  }
}

class BorderedImage extends StatelessWidget {
  final double? width;
  final double? height;

  const BorderedImage({super.key, this.width, this.height});

  @override
  Widget build(BuildContext context) {
    return Image(
      image: const AssetImage('assets/sample1.png'),
      width: width,
      height: height,
    );
  }
}

class StatelessCounter extends StatelessWidget {
  final int count;
  const StatelessCounter({super.key, required this.count});

  @override
  Widget build(BuildContext context) {
    return Text('Count: $count');
  }
}