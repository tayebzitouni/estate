import 'package:flutter/material.dart';

import '../services/api_client.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key, required this.api});

  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: api.conversations(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final conversations = snapshot.data!;
        if (conversations.isEmpty) return const Center(child: Text('No conversations yet.'));
        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: conversations.length,
          itemBuilder: (context, index) {
            final conversation = conversations[index] as Map<String, dynamic>;
            final listing = conversation['listing'] as Map<String, dynamic>?;
            return Card(
              child: ListTile(
                title: Text(listing?['title'] ?? 'Conversation'),
                subtitle: const Text('Tap to continue in the web-style chat flow.'),
                leading: const CircleAvatar(child: Icon(Icons.person)),
              ),
            );
          },
        );
      },
    );
  }
}
