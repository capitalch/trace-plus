import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class NavigationService {
  static final NavigationService _instance = NavigationService._internal();
  factory NavigationService() => _instance;
  NavigationService._internal();

  final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  GoRouter? _router;

  void setRouter(GoRouter router) {
    _router = router;
  }

  void navigateToLogin() {
    _router?.go('/login');
  }

  BuildContext? get currentContext => navigatorKey.currentContext;
}
