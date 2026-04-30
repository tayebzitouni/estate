import 'package:flutter/material.dart';

import '../services/api_client.dart';
import 'appointments_screen.dart';
import 'listings_screen.dart';
import 'messages_screen.dart';
import 'support_screen.dart';

class ShellScreen extends StatefulWidget {
  const ShellScreen({super.key, required this.api, required this.onLogout});

  final ApiClient api;
  final VoidCallback onLogout;

  @override
  State<ShellScreen> createState() => _ShellScreenState();
}

class _ShellScreenState extends State<ShellScreen> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      ListingsScreen(api: widget.api),
      MessagesScreen(api: widget.api),
      AppointmentsScreen(api: widget.api),
      SupportScreen(api: widget.api),
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Darak'),
        actions: [IconButton(onPressed: widget.onLogout, icon: const Icon(Icons.logout))],
      ),
      body: pages[index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.apartment), label: 'Offers'),
          NavigationDestination(icon: Icon(Icons.chat_bubble_outline), label: 'Chat'),
          NavigationDestination(icon: Icon(Icons.calendar_month), label: 'Visits'),
          NavigationDestination(icon: Icon(Icons.support_agent), label: 'Support'),
        ],
      ),
    );
  }
}
