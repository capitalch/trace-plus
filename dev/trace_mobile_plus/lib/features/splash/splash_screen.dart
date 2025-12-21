import 'package:flutter/material.dart';
import 'package:animate_do/animate_do.dart';
import 'package:go_router/go_router.dart';
import '../../config/routes.dart';
import '../../services/auth_service.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // Wait for 3 seconds to display splash screen with animations
    await Future.delayed(const Duration(seconds: 3));

    if (!mounted) return;

    // Check if user is authenticated
    final authService = AuthService();
    final isLoggedIn = await authService.checkAuthStatus();

    if (!mounted) return;

    // Navigate based on authentication status
    if (isLoggedIn) {
      // User is logged in -> navigate to Dashboard
      context.go(Routes.dashboard);
    } else {
      // User is not logged in -> navigate to Login
      context.go(Routes.login);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF1E3A5F), // Deep Navy Blue
              Color(0xFF2C5F8D), // Dark Royal Blue
              Color(0xFF1A2332), // Charcoal Blue
            ],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo with fade-in and scale animation
              FadeInDown(
                duration: const Duration(milliseconds: 500),
                child: ZoomIn(
                  duration: const Duration(milliseconds: 600),
                  child: Container(
                    width: 200,
                    height: 200,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.3),
                          blurRadius: 20,
                          offset: const Offset(0, 10),
                        ),
                      ],
                    ),
                    padding: const EdgeInsets.all(20),
                    child: Image.asset(
                      'assets/images/trace_logo.png',
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 40),

              // App title with fade-in animation
              FadeIn(
                duration: const Duration(milliseconds: 800),
                delay: const Duration(milliseconds: 300),
                child: const Text(
                  'Trace+',
                  style: TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 2,
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // Subtitle with fade-in animation
              FadeIn(
                duration: const Duration(milliseconds: 800),
                delay: const Duration(milliseconds: 500),
                child: const Text(
                  'Financial Accounting Mobile App',
                  style: TextStyle(
                    fontSize: 16,
                    color: Color(0xFFB2BEC3), // Silver Medium
                    letterSpacing: 1,
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ),

              const SizedBox(height: 60),

              // Loading indicator with fade-in animation
              FadeIn(
                duration: const Duration(milliseconds: 600),
                delay: const Duration(milliseconds: 800),
                child: const SizedBox(
                  width: 30,
                  height: 30,
                  child: CircularProgressIndicator(
                    strokeWidth: 3,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      Color(0xFF5B7EC4), // Royal Blue accent
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
