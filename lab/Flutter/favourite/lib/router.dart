import 'package:favourite/pages/http_result.dart';
import 'package:favourite/pages/login_form.dart';
import 'package:go_router/go_router.dart';
import 'pages/home.dart';
import 'pages/settings.dart';
import 'pages/provider_sample.dart';
import 'pages/http_dio_test.dart';

final GoRouter router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const HomePage()),
    GoRoute(
      path: '/settings',
      builder: (context, state) {
        return const SettingsPage();
      },
    ),
    GoRoute(
      path: '/provider_sample',
      builder: (context, state) {
        return const ProviderSamplePage();
      },
    ),
    GoRoute(
      path: '/http_dio_test',
      builder: (context, state) {
        return const HttpDioTest();
      },
    ),
    GoRoute(
      path: '/http_result',
      builder: (context, state) {
        return const HttpResult();
      },
    ),
    GoRoute(
      path: '/login_form',
      builder: (context, state) {
        return const LoginForm();
      },
    ),
  ],
);
