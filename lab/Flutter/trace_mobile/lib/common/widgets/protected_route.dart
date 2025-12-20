import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../classes/global_settings.dart';
import '../classes/routes.dart';

class ProtectedRoute extends StatelessWidget {
  final Widget child;

  const ProtectedRoute({
    super.key,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<GlobalSettings>(
      builder: (context, globalSettings, _) {
        if (!globalSettings.isLoggedIn) {
          // Redirect to login if not authenticated
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Navigator.pushReplacementNamed(context, Routes.login);
          });
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        return child;
      },
    );
  }
}
