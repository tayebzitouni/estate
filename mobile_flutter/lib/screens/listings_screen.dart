import 'package:flutter/material.dart';

import '../services/api_client.dart';
import '../theme.dart';
import 'listing_detail_screen.dart';

class ListingsScreen extends StatelessWidget {
  const ListingsScreen({super.key, required this.api});

  final ApiClient api;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: api.listings(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        final listings = snapshot.data!;
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: listings.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final listing = listings[index] as Map<String, dynamic>;
            return Card(
              child: ListTile(
                contentPadding: const EdgeInsets.all(18),
                title: Text(listing['title'] ?? 'Apartment', style: const TextStyle(fontWeight: FontWeight.w700)),
                subtitle: Text('${listing['commune'] ?? ''}, ${listing['wilaya'] ?? ''}'),
                trailing: const Icon(Icons.arrow_forward_ios, color: brandEmerald),
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => ListingDetailScreen(api: api, listing: listing)),
                ),
              ),
            );
          },
        );
      },
    );
  }
}
