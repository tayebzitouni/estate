import 'package:flutter/material.dart';

import '../services/api_client.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key, required this.api, required this.onLoggedIn});

  final ApiClient api;
  final VoidCallback onLoggedIn;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final email = TextEditingController(text: 'owner@darak.dz');
  final password = TextEditingController(text: 'Owner12345');
  bool loading = false;
  String? error;

  Future<void> submit() async {
    setState(() {
      loading = true;
      error = null;
    });
    try {
      await widget.api.login(email.text.trim(), password.text);
      widget.onLoggedIn();
    } catch (exception) {
      setState(() => error = exception.toString());
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Spacer(),
              const Text('Darak', style: TextStyle(fontSize: 42, fontWeight: FontWeight.w800)),
              const SizedBox(height: 8),
              const Text('Real estate access, messages, visits, reviews, and support in one mobile app.'),
              const SizedBox(height: 32),
              TextField(controller: email, decoration: const InputDecoration(labelText: 'Email', filled: true)),
              const SizedBox(height: 14),
              TextField(controller: password, obscureText: true, decoration: const InputDecoration(labelText: 'Password', filled: true)),
              const SizedBox(height: 20),
              if (error != null) Text(error!, style: const TextStyle(color: Colors.red)),
              FilledButton(onPressed: loading ? null : submit, child: Text(loading ? 'Signing in...' : 'Login')),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}
