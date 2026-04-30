import 'package:flutter/material.dart';

import '../services/api_client.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key, required this.api});

  final ApiClient api;

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final subject = TextEditingController();
  final description = TextEditingController();
  String? notice;

  Future<void> submit() async {
    await widget.api.createTicket(
      subject: subject.text,
      category: 'Support',
      description: description.text,
    );
    setState(() => notice = 'Ticket sent to admin.');
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text('Support tickets', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
        const SizedBox(height: 16),
        TextField(controller: subject, decoration: const InputDecoration(labelText: 'Subject', filled: true)),
        const SizedBox(height: 12),
        TextField(controller: description, minLines: 5, maxLines: 8, decoration: const InputDecoration(labelText: 'Description', filled: true)),
        const SizedBox(height: 14),
        FilledButton(onPressed: submit, child: const Text('Send to admin')),
        if (notice != null) Padding(padding: const EdgeInsets.only(top: 12), child: Text(notice!)),
      ],
    );
  }
}
