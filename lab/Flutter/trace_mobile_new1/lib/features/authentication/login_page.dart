import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:trace_mobile/common/classes/global_settings.dart';
import 'package:trace_mobile/common/classes/messages.dart';
import 'package:trace_mobile/common/classes/routes.dart';
import 'package:trace_mobile/common/classes/utils.dart';
import 'package:trace_mobile/models/client.dart';
import 'package:trace_mobile/models/login_request.dart';
import 'package:trace_mobile/services/auth_service.dart';
import 'package:trace_mobile/utils/validators.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final AuthService _authService = AuthService();

  Client? _selectedClient;
  List<Client> _clients = [];
  bool _isLoading = false;
  bool _isSearching = false;
  Timer? _debounceTimer;
  String _lastSearchQuery = '';
  String? _usernameError;
  String? _passwordError;

  @override
  void initState() {
    super.initState();
    // Set default username
    _usernameController.text = 'capital';
    _passwordController.text = r'su$hant123';
    // Don't load clients on init - they will be loaded dynamically when user types
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  // Search clients from server with debouncing
  Future<void> _searchClients(String query) async {
    // Cancel previous timer if exists
    _debounceTimer?.cancel();

    // If less than 2 characters, clear results
    if (query.length < 2) {
      setState(() {
        _clients = [];
        _isSearching = false;
      });
      return;
    }

    // Set debounce timer (500ms)
    _debounceTimer = Timer(const Duration(milliseconds: 500), () async {
      // Only search if query has changed
      if (query == _lastSearchQuery) return;

      setState(() {
        _isSearching = true;
        _lastSearchQuery = query;
      });

      try {
        // Call API with search criteria
        final clients = await _authService.getClients(criteria: query);

        if (mounted) {
          setState(() {
            _clients = clients;
            _isSearching = false;
          });
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isSearching = false;
          });

          // Silent fail for search - don't interrupt user with error dialog
          // Optionally log the error for debugging
        }
      }
    });
  }

  // Handle login button press
  Future<void> _onLoginPressed() async {
    // Validation
    if (_selectedClient == null) {
      Utils.showAlert(
        context: context,
        message: 'Please select a client',
        title: 'Error',
      );
      return;
    }

    final username = _usernameController.text.trim();
    final password = _passwordController.text;

    if (username.isEmpty || password.isEmpty) {
      Utils.showAlert(
        context: context,
        message: Messages.errEmpty,
        title: 'Error',
      );
      return;
    }

    // Show loading indicator
    setState(() {
      _isLoading = true;
    });

    try {
      final globalSettings = Provider.of<GlobalSettings>(context, listen: false);

      // Create login request
      final loginRequest = LoginRequest(
        clientId: _selectedClient!.id,
        username: username,
        password: password,
      );

      // Call login API
      final loginResponse = await _authService.login(loginRequest);

      // Debug: Print login response in JSON format
      if (kDebugMode) {
        print('========== LOGIN RESPONSE DEBUG ==========');
        print(const JsonEncoder.withIndent('  ').convert(loginResponse.toJson()));
        print('==========================================');
      }

      // Save last used client ID
      // await globalSettings.saveLastUsedClientId(_selectedClient!.id);

      // Save comprehensive login data to GlobalSettings
      await globalSettings.setComprehensiveLoginData(loginResponse);

      // Navigate to dashboard
      if (mounted) {
        Navigator.pushReplacementNamed(
          context,
          Routes.dashBoard,
          arguments: Utils.execDataCache(globalSettings),
        );
      }
    } catch (e) {
      if (mounted) {
        Utils.showAlert(
          context: context,
          title: 'Login Failed',
          message: e.toString().replaceFirst('Exception: ', ''),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      body: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: ListView(
              children: <Widget>[
                // App Title
                Container(
                  alignment: Alignment.center,
                  padding: const EdgeInsets.only(top: 40),
                  child: Text(
                    'Trace',
                    style: Theme.of(context).textTheme.displayMedium?.copyWith(
                          color: Colors.indigo,
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                ),

                // Login Header
                Container(
                  alignment: Alignment.center,
                  padding: const EdgeInsets.only(top: 30, bottom: 40),
                  child: Text(
                    'Login',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          color: Colors.indigo,
                        ),
                  ),
                ),

                // Client Selection (Autocomplete) - Dynamic server search
                Container(
                  alignment: Alignment.center,
                  padding: const EdgeInsets.only(bottom: 20),
                  child: Autocomplete<Client>(
                    initialValue: _selectedClient != null
                        ? TextEditingValue(text: _selectedClient!.name)
                        : null,
                    optionsBuilder: (TextEditingValue textEditingValue) {
                      final query = textEditingValue.text.trim();

                      // Trigger server search
                      _searchClients(query);

                      // Return current results from _clients
                      // (will be updated by _searchClients when API responds)
                      if (query.length < 2) {
                        return const Iterable<Client>.empty();
                      }

                      return _clients;
                    },
                    displayStringForOption: (Client client) => client.name,
                    onSelected: (Client client) {
                      setState(() {
                        _selectedClient = client;
                      });
                    },
                    fieldViewBuilder: (
                      BuildContext context,
                      TextEditingController textEditingController,
                      FocusNode focusNode,
                      VoidCallback onFieldSubmitted,
                    ) {
                      return TextField(
                        controller: textEditingController,
                        focusNode: focusNode,
                        decoration: InputDecoration(
                          border: const OutlineInputBorder(),
                          labelText: 'Select Client',
                          hintText: 'Type 2 characters to search...',
                          helperText: _isSearching
                              ? 'Searching...'
                              : 'Enter at least 2 characters to search clients',
                          prefixIcon: const Icon(Icons.business),
                          suffixIcon: _isSearching
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: Padding(
                                    padding: EdgeInsets.all(12.0),
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  ),
                                )
                              : null,
                        ),
                        style: const TextStyle(fontSize: 20),
                      );
                    },
                    optionsViewBuilder: (
                      BuildContext context,
                      AutocompleteOnSelected<Client> onSelected,
                      Iterable<Client> options,
                    ) {
                      return Align(
                        alignment: Alignment.topLeft,
                        child: Material(
                          elevation: 4.0,
                          child: ConstrainedBox(
                            constraints: const BoxConstraints(
                              maxHeight: 200,
                              maxWidth: 300,
                            ),
                            child: ListView.builder(
                              padding: EdgeInsets.zero,
                              shrinkWrap: true,
                              itemCount: options.length,
                              itemBuilder: (BuildContext context, int index) {
                                final Client client = options.elementAt(index);
                                return ListTile(
                                  leading: const Icon(Icons.business),
                                  title: Text(client.name),
                                  subtitle: client.code != null
                                      ? Text('Code: ${client.code}')
                                      : null,
                                  onTap: () {
                                    onSelected(client);
                                  },
                                );
                              },
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),

                // Username Field
                Container(
                  alignment: Alignment.center,
                  padding: const EdgeInsets.only(bottom: 20),
                  child: TextField(
                    autocorrect: false,
                    controller: _usernameController,
                    decoration: InputDecoration(
                      border: const OutlineInputBorder(),
                      labelText: 'UID / Email',
                      hintText: 'accounts@gmail.com',
                      helperText: 'Enter your UID or Email (min 4 characters)',
                      errorText: _usernameError,
                      prefixIcon: const Icon(Icons.person),
                    ),
                    style: const TextStyle(fontSize: 20),
                    
                    onChanged: (value) {
                      setState(() {
                        _usernameError = Validators.validateUserNameOrEmail(value);
                      });
                    },
                  ),
                ),

                // Password Field
                Container(
                  alignment: Alignment.center,
                  padding: const EdgeInsets.only(bottom: 20),
                  child: TextField(
                    obscureText: true,
                    controller: _passwordController,
                    decoration: InputDecoration(
                      border: const OutlineInputBorder(),
                      labelText: 'Password',
                      helperText: 'Minimum 8 characters required',
                      errorText: _passwordError,
                      prefixIcon: const Icon(Icons.lock),
                    ),
                    style: const TextStyle(fontSize: 20),
                    onChanged: (value) {
                      setState(() {
                        _passwordError = Validators.validatePassword(value);
                      });
                    },
                    onSubmitted: (_) => _onLoginPressed(),
                  ),
                ),

                // Login Button
                Container(
                  height: 50,
                  margin: const EdgeInsets.only(top: 30),
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _onLoginPressed,
                    child: const Text(
                      'Login',
                      style: TextStyle(fontSize: 18),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Loading Overlay
          if (_isLoading)
            Container(
              color: Colors.black.withValues(alpha: 0.5),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }
}
