import 'package:flutter/material.dart';

import '../services/api_client.dart';

class AppointmentsScreen extends StatelessWidget {
  const AppointmentsScreen({super.key, required this.api});

  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: api.appointments(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Center(child: CircularProgressIndicator());
        final appointments = snapshot.data!;
        if (appointments.isEmpty) return const Center(child: Text('No visits yet.'));
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: appointments.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final item = appointments[index] as Map<String, dynamic>;
            final listing = item['listing'] as Map<String, dynamic>?;
            return Card(
              child: ListTile(
                title: Text(listing?['title'] ?? 'Viewing'),
                subtitle: Text('${item['requestedAt']}'),
                trailing: Chip(label: Text(item['status'] ?? 'REQUESTED')),
              ),
            );
          },
        );
      },
    );
  }
}
