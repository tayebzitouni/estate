import 'dart:convert';

import 'package:http/http.dart' as http;

class ApiClient {
  static const baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:3000',
  );

  String? _cookie;

  void clearSession() {
    _cookie = null;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_cookie != null) 'Cookie': _cookie!,
      };

  void _captureCookie(http.Response response) {
    final raw = response.headers['set-cookie'];
    if (raw != null) {
      _cookie = raw.split(';').first;
    }
  }

  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/auth/login'),
      headers: _headers,
      body: jsonEncode({'email': email, 'password': password}),
    );
    _captureCookie(response);
    return _decode(response);
  }

  Future<List<dynamic>> listings() async {
    final response = await http.get(Uri.parse('$baseUrl/api/listings'), headers: _headers);
    return _decode(response) as List<dynamic>;
  }

  Future<List<dynamic>> conversations() async {
    final response = await http.get(Uri.parse('$baseUrl/api/messages/conversations'), headers: _headers);
    return _decode(response) as List<dynamic>;
  }

  Future<Map<String, dynamic>> startConversation(String listingId) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/messages/conversations'),
      headers: _headers,
      body: jsonEncode({'listingId': listingId}),
    );
    return _decode(response);
  }

  Future<Map<String, dynamic>> requestAppointment(String listingId, DateTime requestedAt, String note) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/appointments'),
      headers: _headers,
      body: jsonEncode({
        'listingId': listingId,
        'requestedAt': requestedAt.toUtc().toIso8601String(),
        'note': note,
      }),
    );
    return _decode(response);
  }

  Future<List<dynamic>> appointments() async {
    final response = await http.get(Uri.parse('$baseUrl/api/appointments'), headers: _headers);
    return _decode(response) as List<dynamic>;
  }

  Future<Map<String, dynamic>> createTicket({
    String? listingId,
    String? targetUserId,
    required String subject,
    required String category,
    required String description,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/api/tickets'),
      headers: _headers,
      body: jsonEncode({
        'listingId': listingId,
        'targetUserId': targetUserId,
        'subject': subject,
        'category': category,
        'description': description,
        'priority': 'NORMAL',
      }),
    );
    return _decode(response);
  }

  dynamic _decode(http.Response response) {
    final body = response.body.isEmpty ? '{}' : response.body;
    final decoded = jsonDecode(body);
    if (response.statusCode >= 400) {
      throw Exception(decoded is Map ? decoded['error'] ?? 'Request failed' : 'Request failed');
    }
    return decoded;
  }
}
