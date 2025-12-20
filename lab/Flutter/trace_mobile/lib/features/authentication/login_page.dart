import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../common/classes/global_settings.dart';
import '../../common/classes/routes.dart';
import 'models/login_request.dart';
import 'models/client_item.dart';
import 'services/auth_service.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _authService = AuthService();

  // Controllers
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _clientController = TextEditingController();

  // Selected client
  ClientItem? _selectedClient;

  // Loading state
  bool _isLoading = false;

  // Client suggestions
  List<ClientItem> _clientSuggestions = [];
  bool _isLoadingClients = false;
  bool _showSuggestions = false;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _clientController.dispose();
    super.dispose();
  }

  Future<void> _searchClients(String searchTerm) async {
    if (searchTerm.length < 2) {
      setState(() {
        _clientSuggestions = [];
        _showSuggestions = false;
      });
      return;
    }

    setState(() {
      _isLoadingClients = true;
      _showSuggestions = true;
    });

    try {
      final clients = await _authService.fetchClients(searchTerm);
      if (mounted) {
        setState(() {
          _clientSuggestions = clients;
          _isLoadingClients = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _clientSuggestions = [];
          _isLoadingClients = false;
        });
      }
    }
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (_selectedClient == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a client')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      final request = LoginRequest(
        clientId: _selectedClient!.id.toString(),
        username: _usernameController.text.trim(),
        password: _passwordController.text,
      );

      final response = await _authService.login(request);

      if (!mounted) return;

      // Store login data
      final globalSettings = Provider.of<GlobalSettings>(
        context,
        listen: false,
      );
      await globalSettings.setLoginDataRest(response);

      // Navigate to dashboard
      if (mounted) {
        Navigator.pushReplacementNamed(context, Routes.dashBoard);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(e.toString()),
            backgroundColor: Colors.red,
          ),
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
      appBar: AppBar(
        title: const Text('Login'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Client Selection with Autocomplete
              Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  TextFormField(
                    controller: _clientController,
                    decoration: const InputDecoration(
                      labelText: 'Client Name',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.business),
                      hintText: 'Type to search...',
                    ),
                    onChanged: (value) {
                      _searchClients(value);
                    },
                    onTap: () {
                      if (_clientController.text.length >= 2) {
                        setState(() {
                          _showSuggestions = true;
                        });
                      }
                    },
                  ),
                  if (_showSuggestions)
                    Container(
                      constraints: const BoxConstraints(maxHeight: 200),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: _isLoadingClients
                          ? const Center(
                              child: Padding(
                                padding: EdgeInsets.all(16.0),
                                child: CircularProgressIndicator(),
                              ),
                            )
                          : _clientSuggestions.isEmpty
                              ? const Padding(
                                  padding: EdgeInsets.all(16.0),
                                  child: Text('No clients found'),
                                )
                              : ListView.builder(
                                  shrinkWrap: true,
                                  itemCount: _clientSuggestions.length,
                                  itemBuilder: (context, index) {
                                    final client = _clientSuggestions[index];
                                    return ListTile(
                                      title: Text(client.clientName),
                                      onTap: () {
                                        setState(() {
                                          _selectedClient = client;
                                          _clientController.text =
                                              client.clientName;
                                          _showSuggestions = false;
                                        });
                                      },
                                    );
                                  },
                                ),
                    ),
                ],
              ),

              const SizedBox(height: 16),

              // Username field
              TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(
                  labelText: 'UID / Email',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.person),
                ),
              ),

              const SizedBox(height: 16),

              // Password field
              TextFormField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.lock),
                ),
              ),

              const SizedBox(height: 24),

              // Login button
              ElevatedButton(
                onPressed:  _isLoading ? null :_handleLogin,
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text(
                        'Login',
                        style: TextStyle(fontSize: 16),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
