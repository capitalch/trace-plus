import 'package:go_router/go_router.dart';
import 'package:favourite/pages/home.dart';
import 'package:favourite/pages/settings.dart';
import 'package:favourite/pages/provider_sample.dart';

final GoRouter router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomePage(),
    ),
    GoRoute(path: '/settings', builder: (context, state) {
      return const SettingsPage();
    }),
    GoRoute(path: '/provider_sample', builder: (context, state) {
      return const ProviderSamplePage();
    }),
  ],
);