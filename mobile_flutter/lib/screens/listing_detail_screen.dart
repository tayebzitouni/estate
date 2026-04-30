import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../theme.dart';

class ListingDetailScreen extends StatefulWidget {
  const ListingDetailScreen({super.key, required this.api, required this.listing});

  final ApiClient api;
  final Map<String, dynamic> listing;

  @override
  State<ListingDetailScreen> createState() => _ListingDetailScreenState();
}

class _ListingDetailScreenState extends State<ListingDetailScreen> {
  bool contactOpen = false;
  bool ticketOpen = false;
  final note = TextEditingController();
  final ticket = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final listing = widget.listing;
    final listingId = listing['id'] as String;

    return Scaffold(
      appBar: AppBar(title: Text(listing['title'] ?? 'Listing')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            height: 210,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(28),
              gradient: const LinearGradient(colors: [brandNavy, Color(0xFF13283D)]),
            ),
            child: const Center(child: Icon(Icons.apartment, color: Colors.white, size: 80)),
          ),
          const SizedBox(height: 18),
          Text(listing['title'] ?? 'Apartment', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800)),
          const SizedBox(height: 8),
          Text('${listing['commune'] ?? ''}, ${listing['wilaya'] ?? ''}'),
          const SizedBox(height: 16),
          Text('${listing['priceDzd'] ?? ''} DZD', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: brandNavy)),
          const SizedBox(height: 18),
          FilledButton.icon(
            onPressed: () => widget.api.requestAppointment(listingId, DateTime.now().add(const Duration(days: 1)), 'Requested from mobile'),
            icon: const Icon(Icons.calendar_month),
            label: const Text('Book a viewing'),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => widget.api.startConversation(listingId),
            icon: const Icon(Icons.chat_bubble_outline),
            label: const Text('Message owner'),
          ),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => setState(() => contactOpen = !contactOpen),
            icon: const Icon(Icons.send_outlined),
            label: const Text('Contact request'),
          ),
          if (contactOpen) _InlineBox(controller: note, hint: 'Ask about availability or documents'),
          const SizedBox(height: 10),
          OutlinedButton.icon(
            onPressed: () => setState(() => ticketOpen = !ticketOpen),
            icon: const Icon(Icons.report_problem_outlined),
            label: const Text('Complaint to admin'),
          ),
          if (ticketOpen)
            _InlineBox(
              controller: ticket,
              hint: 'Explain the problem',
              action: () => widget.api.createTicket(
                listingId: listingId,
                subject: 'Mobile complaint',
                category: 'Complaint',
                description: ticket.text,
              ),
            ),
          const SizedBox(height: 18),
          Text(listing['description'] ?? '', style: const TextStyle(height: 1.5)),
        ],
      ),
    );
  }
}

class _InlineBox extends StatelessWidget {
  const _InlineBox({required this.controller, required this.hint, this.action});

  final TextEditingController controller;
  final String hint;
  final Future<dynamic> Function()? action;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(top: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(22)),
      child: Column(
        children: [
          TextField(controller: controller, minLines: 3, maxLines: 5, decoration: InputDecoration(hintText: hint, filled: true)),
          if (action != null) const SizedBox(height: 10),
          if (action != null) FilledButton(onPressed: action, child: const Text('Send')),
        ],
      ),
    );
  }
}
