import 'package:flutter/material.dart';

import 'screens/login_screen.dart';
import 'screens/shell_screen.dart';
import 'services/api_client.dart';
import 'theme.dart';

void main() {
  runApp(const DarakMobileApp());
}

class DarakMobileApp extends StatefulWidget {
  const DarakMobileApp({super.key});

  @override
  State<DarakMobileApp> createState() => _DarakMobileAppState();
}

class _DarakMobileAppState extends State<DarakMobileApp> {
  final api = ApiClient();
  bool loggedIn = false;

  void handleLoggedIn() {
    setState(() => loggedIn = true);
  }

  void handleLoggedOut() {
    api.clearSession();
    setState(() => loggedIn = false);
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Darak',
      theme: darakTheme,
      home: loggedIn
          ? ShellScreen(api: api, onLogout: handleLoggedOut)
          : LoginScreen(api: api, onLoggedIn: handleLoggedIn),
    );
  }
}
