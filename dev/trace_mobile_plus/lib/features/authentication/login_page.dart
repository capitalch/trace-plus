import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/routes.dart';
import '../../services/auth_service.dart';
import '../../models/client_model.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _authService = AuthService();
  final _formKey = GlobalKey<FormState>();
  final _clientController = TextEditingController();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  AutovalidateMode _autovalidateMode = AutovalidateMode.disabled;

  // Client selection state
  ClientModel? _selectedClient;
  bool _isLoadingClients = false;

  // Test network connectivity
  Future<void> _testNetworkConnection() async {
    setState(() {
      _isLoading = true;
    });

    try {
      _showInfoMessage('Testing connection to server...');
      await _authService.fetchClients('test');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        _showSuccessMessage('Connection successful! Server is reachable.');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
        _showErrorMessage(
          'Connection failed: ${e.toString().replaceAll('Exception: ', '')}',
        );
      }
    }
  }

  @override
  void dispose() {
    _clientController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    // Enable real-time validation if form is invalid
    if (!_formKey.currentState!.validate()) {
      setState(() {
        _autovalidateMode = AutovalidateMode.onUserInteraction;
      });
      _showErrorMessage('Please fill in all required fields');
      return;
    }

    // Validate that a client has been selected
    if (_selectedClient == null) {
      _showErrorMessage('Please select a client from the list');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Make actual login API call with client ID, username, and password
      await _authService.login(
        clientId: _selectedClient!.id,
        username: _usernameController.text,
        password: _passwordController.text,
      );

      if (!mounted) return;

      // Show success message
      _showSuccessMessage('Login successful!');

      // Small delay to show success message before navigation
      await Future.delayed(const Duration(milliseconds: 500));

      if (!mounted) return;

      setState(() {
        _isLoading = false;
      });

      // Navigate to dashboard
      context.go(Routes.dashboard);
    } catch (e) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
      });

      // Extract meaningful error message
      String errorMessage = 'Login failed';
      if (e.toString().contains('Invalid credentials')) {
        errorMessage = 'Invalid username or password';
      } else if (e.toString().contains('Failed to host lookup')) {
        errorMessage =
            'Cannot connect to server. Please check your connection.';
      } else if (e.toString().contains('Connection refused')) {
        errorMessage = 'Server is not responding. Please try again later.';
      } else {
        errorMessage =
            'Login failed: ${e.toString().replaceAll('Exception: ', '')}';
      }

      _showErrorMessage(errorMessage);
    }
  }

  void _showSuccessMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(message, style: const TextStyle(fontSize: 14)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF00B894),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showErrorMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(message, style: const TextStyle(fontSize: 14)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFFD63031),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showInfoMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.info_outline, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(message, style: const TextStyle(fontSize: 14)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF0984E3),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GestureDetector(
        onTap: () {
          // Dismiss keyboard when tapping outside input fields
          FocusScope.of(context).unfocus();
        },
        child: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF1E3A5F), Color(0xFF2C5F8D)],
            ),
          ),
          child: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior.onDrag,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Logo - Premium Financial Brand Design
                    SizedBox(
                      width: 240,
                      height: 240,
                      child: Stack(
                        children: [
                          // Outer glow effect
                          Container(
                            width: 240,
                            height: 240,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(
                                    0xFF5B7EC4,
                                  ).withValues(alpha: 0.3),
                                  blurRadius: 60,
                                  spreadRadius: 10,
                                ),
                                BoxShadow(
                                  color: const Color(
                                    0xFF00B894,
                                  ).withValues(alpha: 0.2),
                                  blurRadius: 80,
                                  spreadRadius: 5,
                                ),
                              ],
                            ),
                          ),

                          // Main logo container
                          Center(
                            child: Container(
                              width: 220,
                              height: 220,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: const LinearGradient(
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                  colors: [
                                    Color(0xFF667EEA),
                                    Color(0xFF5B7EC4),
                                    Color(0xFF4A6BA8),
                                  ],
                                  stops: [0.0, 0.5, 1.0],
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.4),
                                    blurRadius: 30,
                                    offset: const Offset(0, 15),
                                  ),
                                  BoxShadow(
                                    color: const Color(
                                      0xFF5B7EC4,
                                    ).withValues(alpha: 0.5),
                                    blurRadius: 50,
                                    offset: const Offset(0, 25),
                                  ),
                                ],
                              ),
                              child: Stack(
                                children: [
                                  // Animated rings background
                                  Positioned.fill(
                                    child: CustomPaint(
                                      painter: _ConcentricRingsPainter(),
                                    ),
                                  ),

                                  // Inner circle with glass effect
                                  Center(
                                    child: Container(
                                      width: 180,
                                      height: 180,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: LinearGradient(
                                          begin: Alignment.topLeft,
                                          end: Alignment.bottomRight,
                                          colors: [
                                            Colors.white.withValues(alpha: 0.2),
                                            Colors.white.withValues(
                                              alpha: 0.05,
                                            ),
                                          ],
                                        ),
                                        border: Border.all(
                                          color: Colors.white.withValues(
                                            alpha: 0.3,
                                          ),
                                          width: 2,
                                        ),
                                      ),
                                      child: Stack(
                                        children: [
                                          // Main accounting symbol - Crisp bank/finance icon
                                          Center(
                                            child: Container(
                                              width: 90,
                                              height: 90,
                                              decoration: BoxDecoration(
                                                color: const Color(
                                                  0xFFFFC107,
                                                ).withValues(alpha: 0.2),
                                                shape: BoxShape.circle,
                                              ),
                                              child: const Icon(
                                                Icons.account_balance,
                                                size: 50,
                                                color: Color(0xFFFFC107),
                                              ),
                                            ),
                                          ),

                                          // Orbiting elements
                                          // Top - Growth Arrow
                                          Positioned(
                                            top: 15,
                                            left: 0,
                                            right: 0,
                                            child: Center(
                                              child: Container(
                                                padding: const EdgeInsets.all(
                                                  10,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: const Color(
                                                    0xFF00B894,
                                                  ),
                                                  shape: BoxShape.circle,
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: const Color(
                                                        0xFF00B894,
                                                      ).withValues(alpha: 0.5),
                                                      blurRadius: 15,
                                                      spreadRadius: 2,
                                                    ),
                                                  ],
                                                ),
                                                child: const Icon(
                                                  Icons.trending_up,
                                                  color: Colors.white,
                                                  size: 20,
                                                ),
                                              ),
                                            ),
                                          ),

                                          // Right - Calculator
                                          Positioned(
                                            right: 15,
                                            top: 0,
                                            bottom: 0,
                                            child: Center(
                                              child: Container(
                                                padding: const EdgeInsets.all(
                                                  10,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: const Color(
                                                    0xFFF39C12,
                                                  ),
                                                  shape: BoxShape.circle,
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: const Color(
                                                        0xFFF39C12,
                                                      ).withValues(alpha: 0.5),
                                                      blurRadius: 15,
                                                      spreadRadius: 2,
                                                    ),
                                                  ],
                                                ),
                                                child: const Icon(
                                                  Icons.calculate,
                                                  color: Colors.white,
                                                  size: 20,
                                                ),
                                              ),
                                            ),
                                          ),

                                          // Bottom - Receipt
                                          Positioned(
                                            bottom: 15,
                                            left: 0,
                                            right: 0,
                                            child: Center(
                                              child: Container(
                                                padding: const EdgeInsets.all(
                                                  10,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: const Color(
                                                    0xFF6C5CE7,
                                                  ),
                                                  shape: BoxShape.circle,
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: const Color(
                                                        0xFF6C5CE7,
                                                      ).withValues(alpha: 0.5),
                                                      blurRadius: 15,
                                                      spreadRadius: 2,
                                                    ),
                                                  ],
                                                ),
                                                child: const Icon(
                                                  Icons.receipt_long,
                                                  color: Colors.white,
                                                  size: 20,
                                                ),
                                              ),
                                            ),
                                          ),

                                          // Left - Analytics
                                          Positioned(
                                            left: 15,
                                            top: 0,
                                            bottom: 0,
                                            child: Center(
                                              child: Container(
                                                padding: const EdgeInsets.all(
                                                  10,
                                                ),
                                                decoration: BoxDecoration(
                                                  color: const Color(
                                                    0xFFE74C3C,
                                                  ),
                                                  shape: BoxShape.circle,
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: const Color(
                                                        0xFFE74C3C,
                                                      ).withValues(alpha: 0.5),
                                                      blurRadius: 15,
                                                      spreadRadius: 2,
                                                    ),
                                                  ],
                                                ),
                                                child: const Icon(
                                                  Icons.show_chart,
                                                  color: Colors.white,
                                                  size: 20,
                                                ),
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),

                                  // Highlight effect
                                  Positioned(
                                    top: 30,
                                    left: 30,
                                    child: Container(
                                      width: 60,
                                      height: 60,
                                      decoration: BoxDecoration(
                                        shape: BoxShape.circle,
                                        gradient: RadialGradient(
                                          colors: [
                                            Colors.white.withValues(alpha: 0.4),
                                            Colors.white.withValues(alpha: 0.0),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Welcome - Primary Heading
                    const Text(
                      'Welcome',
                      style: TextStyle(
                        fontSize: 32,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),

                    const SizedBox(height: 8),

                    // Sign in to Trace+ - Secondary Heading
                    const Text(
                      'Sign in to Trace+',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFFE8EEF2),
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'Server: ${AuthService.baseUrl}',
                          style: TextStyle(color: Colors.grey, fontSize: 11),
                        ),
                        TextButton(
                          onPressed: _isLoading ? null : _testNetworkConnection,
                          style: TextButton.styleFrom(
                            foregroundColor: const Color(0xFF00B894),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            minimumSize: Size.zero,
                          ),
                          child: const Text(
                            'Test Connection',
                            style: TextStyle(fontSize: 11),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),

                    // Debug info - Show current baseUrl (remove in production)
                    // Container(
                    //   padding: const EdgeInsets.all(12),
                    //   decoration: BoxDecoration(
                    //     color: Colors.black.withValues(alpha: 0.3),
                    //     borderRadius: BorderRadius.circular(8),
                    //     border: Border.all(
                    //       color: Colors.white.withValues(alpha: 0.2),
                    //     ),
                    //   ),
                    //   child: Column(
                    //     crossAxisAlignment: CrossAxisAlignment.start,
                    //     children: [
                    //       Row(
                    //         mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    //         children: [
                    //           const Text(
                    //             'Debug Info:',
                    //             style: TextStyle(
                    //               color: Color(0xFFFFC107),
                    //               fontSize: 12,
                    //               fontWeight: FontWeight.bold,
                    //             ),
                    //           ),
                    //           TextButton(
                    //             onPressed: _isLoading
                    //                 ? null
                    //                 : _testNetworkConnection,
                    //             style: TextButton.styleFrom(
                    //               foregroundColor: const Color(0xFF00B894),
                    //               padding: const EdgeInsets.symmetric(
                    //                 horizontal: 8,
                    //                 vertical: 4,
                    //               ),
                    //               minimumSize: Size.zero,
                    //             ),
                    //             child: const Text(
                    //               'Test Connection',
                    //               style: TextStyle(fontSize: 11),
                    //             ),
                    //           ),
                    //         ],
                    //       ),
                    //       const SizedBox(height: 4),
                    //       Text(
                    //         'Server: ${AuthService.baseUrl}',
                    //         style: const TextStyle(
                    //           color: Colors.white,
                    //           fontSize: 11,
                    //         ),
                    //       ),
                    //     ],
                    //   ),
                    // ),
                    const SizedBox(height: 20),

                    // Login form
                    Form(
                      key: _formKey,
                      autovalidateMode: _autovalidateMode,
                      child: Column(
                        children: [
                          // Select Client field with Autocomplete
                          Autocomplete<ClientModel>(
                            optionsBuilder: (TextEditingValue textEditingValue) async {
                              // Check if query is long enough
                              if (textEditingValue.text.length < 4) {
                                return const Iterable<ClientModel>.empty();
                              }

                              // Set loading state
                              if (mounted) {
                                setState(() {
                                  _isLoadingClients = true;
                                });
                              }

                              try {
                                // Fetch clients
                                final clients = await _authService.fetchClients(
                                  textEditingValue.text,
                                );
                                if (mounted) {
                                  setState(() {
                                    _isLoadingClients = false;
                                  });
                                }
                                return clients;
                              } catch (e) {
                                if (mounted) {
                                  setState(() {
                                    _isLoadingClients = false;
                                  });

                                  // Show user-friendly error messages
                                  String errorMessage =
                                      'Failed to fetch clients';
                                  String errorStr = e.toString().toLowerCase();

                                  if (errorStr.contains('timeout')) {
                                    errorMessage =
                                        'Connection timeout. Check your internet connection.';
                                  } else if (errorStr.contains('socket') ||
                                      errorStr.contains('network')) {
                                    errorMessage =
                                        'Network error. Cannot reach server.';
                                  } else if (errorStr.contains('host lookup')) {
                                    errorMessage =
                                        'Cannot connect to server. Check your connection.';
                                  } else {
                                    errorMessage =
                                        'Failed to fetch clients: ${e.toString().replaceAll('Exception: ', '')}';
                                  }

                                  _showErrorMessage(errorMessage);
                                }
                                return const Iterable<ClientModel>.empty();
                              }
                            },
                            displayStringForOption: (ClientModel client) =>
                                client.clientName,
                            onSelected: (ClientModel client) {
                              setState(() {
                                _selectedClient = client;
                                _clientController.text = client.clientName;
                              });
                            },
                            fieldViewBuilder:
                                (
                                  context,
                                  controller,
                                  focusNode,
                                  onEditingComplete,
                                ) {
                                  return TextFormField(
                                    controller: controller,
                                    focusNode: focusNode,
                                    onEditingComplete: onEditingComplete,
                                    style: const TextStyle(color: Colors.white),
                                    cursorColor: const Color(0xFFE8EEF2),
                                    cursorWidth: 3.0,
                                    textInputAction: TextInputAction.next,
                                    onChanged: (value) {
                                      // Clear selected client if user modifies text
                                      if (_selectedClient != null &&
                                          value !=
                                              _selectedClient!.clientName) {
                                        setState(() {
                                          _selectedClient = null;
                                        });
                                      }
                                    },
                                    decoration: InputDecoration(
                                      labelText:
                                          'Type first 4 characters of client name',
                                      hintText: 'Enter client name',
                                      hintStyle: TextStyle(
                                        color: const Color(
                                          0xFFB2BEC3,
                                        ).withValues(alpha: 0.5),
                                      ),
                                      labelStyle: const TextStyle(
                                        color: Color(0xFFB2BEC3),
                                      ),
                                      prefixIcon: const Icon(
                                        Icons.business_outlined,
                                        color: Color(0xFF5B7EC4),
                                      ),
                                      suffixIcon: _isLoadingClients
                                          ? const Padding(
                                              padding: EdgeInsets.all(12.0),
                                              child: SizedBox(
                                                width: 20,
                                                height: 20,
                                                child: CircularProgressIndicator(
                                                  strokeWidth: 2,
                                                  valueColor:
                                                      AlwaysStoppedAnimation<
                                                        Color
                                                      >(Color(0xFF5B7EC4)),
                                                ),
                                              ),
                                            )
                                          : _selectedClient != null
                                          ? const Icon(
                                              Icons.check_circle,
                                              color: Color(0xFF00B894),
                                            )
                                          : null,
                                      filled: true,
                                      fillColor: Colors.white.withValues(
                                        alpha: 0.1,
                                      ),
                                      border: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: BorderSide.none,
                                      ),
                                      enabledBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: BorderSide(
                                          color: Colors.white.withValues(
                                            alpha: 0.2,
                                          ),
                                        ),
                                      ),
                                      focusedBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(
                                          color: Color(0xFF5B7EC4),
                                          width: 2,
                                        ),
                                      ),
                                      errorBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(
                                          color: Color(0xFFD63031),
                                          width: 2,
                                        ),
                                      ),
                                      focusedErrorBorder: OutlineInputBorder(
                                        borderRadius: BorderRadius.circular(12),
                                        borderSide: const BorderSide(
                                          color: Color(0xFFD63031),
                                          width: 2,
                                        ),
                                      ),
                                      errorStyle: const TextStyle(
                                        color: Color(0xFFFFCDD2),
                                        fontSize: 12,
                                      ),
                                    ),
                                    validator: (value) {
                                      if (_selectedClient == null) {
                                        return 'Please select a client from the list';
                                      }
                                      return null;
                                    },
                                  );
                                },
                            optionsViewBuilder: (context, onSelected, options) {
                              return Align(
                                alignment: Alignment.topLeft,
                                child: Material(
                                  elevation: 4.0,
                                  borderRadius: BorderRadius.circular(12),
                                  child: Container(
                                    constraints: const BoxConstraints(
                                      maxHeight: 200,
                                    ),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF2C5F8D),
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: const Color(0xFF5B7EC4),
                                        width: 1,
                                      ),
                                    ),
                                    child: ListView.builder(
                                      padding: EdgeInsets.zero,
                                      shrinkWrap: true,
                                      itemCount: options.length,
                                      itemBuilder: (context, index) {
                                        final ClientModel client = options
                                            .elementAt(index);
                                        return InkWell(
                                          onTap: () => onSelected(client),
                                          child: Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 16,
                                              vertical: 12,
                                            ),
                                            decoration: BoxDecoration(
                                              border: Border(
                                                bottom: BorderSide(
                                                  color: Colors.white
                                                      .withValues(alpha: 0.1),
                                                ),
                                              ),
                                            ),
                                            child: Row(
                                              children: [
                                                const Icon(
                                                  Icons.business,
                                                  color: Color(0xFF5B7EC4),
                                                  size: 20,
                                                ),
                                                const SizedBox(width: 12),
                                                Expanded(
                                                  child: Text(
                                                    client.clientName,
                                                    style: const TextStyle(
                                                      color: Colors.white,
                                                      fontSize: 14,
                                                    ),
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),

                          const SizedBox(height: 20),

                          // Username field
                          TextFormField(
                            controller: _usernameController,
                            style: const TextStyle(color: Colors.white),
                            cursorColor: const Color(0xFFE8EEF2),
                            cursorWidth: 3.0,
                            textInputAction: TextInputAction.next,
                            keyboardType: TextInputType.emailAddress,
                            decoration: InputDecoration(
                              labelText: 'Username or Email',
                              hintText: 'Enter your username or email',
                              hintStyle: TextStyle(
                                color: const Color(
                                  0xFFB2BEC3,
                                ).withValues(alpha: 0.5),
                              ),
                              labelStyle: const TextStyle(
                                color: Color(0xFFB2BEC3),
                              ),
                              prefixIcon: const Icon(
                                Icons.person_outline,
                                color: Color(0xFF5B7EC4),
                              ),
                              filled: true,
                              fillColor: Colors.white.withValues(alpha: 0.1),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: Colors.white.withValues(alpha: 0.2),
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(
                                  color: Color(0xFF5B7EC4),
                                  width: 2,
                                ),
                              ),
                              errorBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(
                                  color: Color(0xFFD63031),
                                  width: 2,
                                ),
                              ),
                              focusedErrorBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(
                                  color: Color(0xFFD63031),
                                  width: 2,
                                ),
                              ),
                              errorStyle: const TextStyle(
                                color: Color(0xFFFFCDD2),
                                fontSize: 12,
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Username or email is required';
                              }
                              if (value.length < 3) {
                                return 'Must be at least 3 characters';
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 20),

                          // Password field
                          TextFormField(
                            controller: _passwordController,
                            obscureText: _obscurePassword,
                            style: const TextStyle(color: Colors.white),
                            cursorColor: const Color(0xFFE8EEF2),
                            cursorWidth: 3.0,
                            textInputAction: TextInputAction.done,
                            onFieldSubmitted: (_) => _handleLogin(),
                            decoration: InputDecoration(
                              labelText: 'Password',
                              hintText: 'Enter your password',
                              hintStyle: TextStyle(
                                color: const Color(
                                  0xFFB2BEC3,
                                ).withValues(alpha: 0.5),
                              ),
                              labelStyle: const TextStyle(
                                color: Color(0xFFB2BEC3),
                              ),
                              prefixIcon: const Icon(
                                Icons.lock_outline,
                                color: Color(0xFF5B7EC4),
                              ),
                              suffixIcon: IconButton(
                                icon: Icon(
                                  _obscurePassword
                                      ? Icons.visibility_off_outlined
                                      : Icons.visibility_outlined,
                                  color: const Color(0xFFB2BEC3),
                                ),
                                onPressed: () {
                                  setState(() {
                                    _obscurePassword = !_obscurePassword;
                                  });
                                },
                                tooltip: _obscurePassword
                                    ? 'Show password'
                                    : 'Hide password',
                              ),
                              filled: true,
                              fillColor: Colors.white.withValues(alpha: 0.1),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide.none,
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(
                                  color: Colors.white.withValues(alpha: 0.2),
                                ),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(
                                  color: Color(0xFF5B7EC4),
                                  width: 2,
                                ),
                              ),
                              errorBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(
                                  color: Color(0xFFD63031),
                                  width: 2,
                                ),
                              ),
                              focusedErrorBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(
                                  color: Color(0xFFD63031),
                                  width: 2,
                                ),
                              ),
                              errorStyle: const TextStyle(
                                color: Color(0xFFFFCDD2),
                                fontSize: 12,
                              ),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Password is required';
                              }
                              if (value.length < 6) {
                                return 'Password must be at least 6 characters';
                              }
                              return null;
                            },
                          ),

                          const SizedBox(height: 32),

                          // Login button - Enhanced with animations
                          SizedBox(
                            width: double.infinity,
                            height: 56,
                            child: ElevatedButton(
                              onPressed: _isLoading ? null : _handleLogin,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF5B7EC4),
                                foregroundColor: Colors.white,
                                disabledBackgroundColor: const Color(
                                  0xFF5B7EC4,
                                ).withValues(alpha: 0.6),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                elevation: _isLoading ? 0 : 4,
                                shadowColor: const Color(
                                  0xFF5B7EC4,
                                ).withValues(alpha: 0.5),
                              ),
                              child: AnimatedSwitcher(
                                duration: const Duration(milliseconds: 300),
                                transitionBuilder: (child, animation) {
                                  return FadeTransition(
                                    opacity: animation,
                                    child: ScaleTransition(
                                      scale: animation,
                                      child: child,
                                    ),
                                  );
                                },
                                child: _isLoading
                                    ? const SizedBox(
                                        key: ValueKey('loading'),
                                        width: 24,
                                        height: 24,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2.5,
                                          valueColor:
                                              AlwaysStoppedAnimation<Color>(
                                                Colors.white,
                                              ),
                                        ),
                                      )
                                    : const Row(
                                        key: ValueKey('sign-in'),
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          Text(
                                            'Sign In',
                                            style: TextStyle(
                                              fontSize: 18,
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                          SizedBox(width: 8),
                                          Icon(Icons.arrow_forward, size: 20),
                                        ],
                                      ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 32),

                    // Footer section
                    Column(
                      children: [
                        // Version info
                        const Text(
                          'Version 1.0.0',
                          style: TextStyle(
                            fontSize: 12,
                            color: Color(0xFFB2BEC3),
                            fontWeight: FontWeight.w300,
                          ),
                        ),

                        const SizedBox(height: 12),

                        // Terms & Privacy links
                        Wrap(
                          spacing: 16,
                          alignment: WrapAlignment.center,
                          children: [
                            TextButton(
                              onPressed: () {
                                // TODO: Navigate to Terms of Service
                                _showInfoMessage('Terms of Service');
                              },
                              style: TextButton.styleFrom(
                                foregroundColor: const Color(0xFFB2BEC3),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                              ),
                              child: const Text(
                                'Terms',
                                style: TextStyle(
                                  fontSize: 12,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                            const Text(
                              '•',
                              style: TextStyle(
                                color: Color(0xFFB2BEC3),
                                fontSize: 12,
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                // TODO: Navigate to Privacy Policy
                                _showInfoMessage('Privacy Policy');
                              },
                              style: TextButton.styleFrom(
                                foregroundColor: const Color(0xFFB2BEC3),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8,
                                  vertical: 4,
                                ),
                              ),
                              child: const Text(
                                'Privacy',
                                style: TextStyle(
                                  fontSize: 12,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 8),

                        // Copyright
                        const Text(
                          '© 2025 Trace+ All rights reserved',
                          style: TextStyle(
                            fontSize: 11,
                            color: Color(0xFF636E72),
                            fontWeight: FontWeight.w300,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// Custom painter for concentric rings background
class _ConcentricRingsPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    // Draw concentric circles
    for (double radius = 30; radius < size.width / 2; radius += 25) {
      canvas.drawCircle(center, radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
