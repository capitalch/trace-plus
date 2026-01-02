import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/splash/splash_screen.dart';
import '../features/authentication/login_page.dart';
import '../features/dashboard/dashboard_page.dart';
import '../features/sales/sales_page.dart';
import '../features/transactions/transactions_page.dart';
import '../features/business_health/business_health_page.dart';
import '../services/auth_service.dart';

/// Route paths as constants for type safety
class Routes {
  static const String splash = '/';
  static const String login = '/login';
  static const String dashboard = '/dashboard';

  // Additional routes can be added here
  static const String accounts = '/accounts';
  static const String products = '/products';
  static const String sales = '/sales';
  static const String transactions = '/transactions';
  static const String businessHealth = '/business-health';
}

/// Create and configure the GoRouter instance
GoRouter createRouter() {
  return GoRouter(
    initialLocation: Routes.splash,
    debugLogDiagnostics: true,

    // Redirect logic for authentication
    redirect: (BuildContext context, GoRouterState state) {
      final authService = AuthService();
      final isLoggedIn = authService.isLoggedIn;

      final isGoingToLogin = state.matchedLocation == Routes.login;
      final isGoingToSplash = state.matchedLocation == Routes.splash;

      // Allow splash screen always
      if (isGoingToSplash) {
        return null;
      }

      // If not logged in and trying to access protected route
      if (!isLoggedIn && !isGoingToLogin) {
        return Routes.login;
      }

      // If logged in and trying to access login page
      if (isLoggedIn && isGoingToLogin) {
        return Routes.dashboard;
      }

      // No redirect needed
      return null;
    },

    // Route definitions with custom transitions
    routes: [
      GoRoute(
        path: Routes.splash,
        name: 'splash',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const SplashScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
        ),
      ),

      GoRoute(
        path: Routes.login,
        name: 'login',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const LoginPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            // Fade + Slide transition from bottom
            const begin = Offset(0.0, 0.3);
            const end = Offset.zero;
            const curve = Curves.easeOutCubic;

            var tween = Tween(begin: begin, end: end).chain(
              CurveTween(curve: curve),
            );
            var offsetAnimation = animation.drive(tween);

            return FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: offsetAnimation,
                child: child,
              ),
            );
          },
        ),
      ),

      GoRoute(
        path: Routes.dashboard,
        name: 'dashboard',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const DashboardPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            // Fade + Scale transition
            const curve = Curves.easeInOutCubic;

            var fadeAnimation = CurvedAnimation(
              parent: animation,
              curve: curve,
            );

            var scaleAnimation = Tween<double>(
              begin: 0.92,
              end: 1.0,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: curve,
            ));

            return FadeTransition(
              opacity: fadeAnimation,
              child: ScaleTransition(
                scale: scaleAnimation,
                child: child,
              ),
            );
          },
        ),
      ),

      // Sales page route
      GoRoute(
        path: Routes.sales,
        name: 'sales',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const SalesPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
        ),
      ),

      // Transactions page route
      GoRoute(
        path: Routes.transactions,
        name: 'transactions',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const TransactionsPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
        ),
      ),

      // Business Health page route
      GoRoute(
        path: Routes.businessHealth,
        name: 'businessHealth',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const BusinessHealthPage(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: animation,
              child: child,
            );
          },
        ),
      ),

      // Additional routes will be added here as features are implemented
      // Example:
      // GoRoute(
      //   path: Routes.accounts,
      //   name: 'accounts',
      //   builder: (context, state) => const AccountsPage(),
      // ),
    ],

    // Error handling
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              'Page not found: ${state.matchedLocation}',
              style: const TextStyle(fontSize: 18),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(Routes.splash),
              child: const Text('Go to Home'),
            ),
          ],
        ),
      ),
    ),
  );
}
