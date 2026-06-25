import 'dart:convert';
import 'package:http/http.dart' as http;

/// Central HTTP client for the Hajar backend.
///
/// Base URL notes:
///  - Android emulator  -> http://10.0.2.2:4100/api
///  - iOS simulator/web -> http://localhost:4100/api
///  - Physical device   -> http://<your-computer-ip>:4100/api
class ApiClient {
  ApiClient({String? baseUrl})
      : baseUrl = baseUrl ?? const String.fromEnvironment(
              'API_BASE_URL',
              defaultValue: 'http://10.0.2.2:4100/api',
            );

  final String baseUrl;
  String? _token;

  void setToken(String? token) => _token = token;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Uri _uri(String path, [Map<String, dynamic>? query]) {
    final base = Uri.parse('$baseUrl$path');
    if (query == null || query.isEmpty) return base;
    return base.replace(queryParameters: {
      ...base.queryParameters,
      ...query.map((k, v) => MapEntry(k, '$v')),
    });
  }

  Future<dynamic> get(String path, {Map<String, dynamic>? query}) async {
    final res = await http.get(_uri(path, query), headers: _headers);
    return _decode(res);
  }

  Future<dynamic> post(String path, [Map<String, dynamic>? body]) async {
    final res = await http.post(_uri(path), headers: _headers, body: jsonEncode(body ?? {}));
    return _decode(res);
  }

  Future<dynamic> patch(String path, [Map<String, dynamic>? body]) async {
    final res = await http.patch(_uri(path), headers: _headers, body: jsonEncode(body ?? {}));
    return _decode(res);
  }

  Future<dynamic> delete(String path) async {
    final res = await http.delete(_uri(path), headers: _headers);
    return _decode(res);
  }

  /// Returns raw bytes (used for PDF export).
  Future<List<int>> getBytes(String path) async {
    final res = await http.get(_uri(path), headers: _headers);
    if (res.statusCode >= 400) {
      throw ApiException(res.statusCode, 'Request failed');
    }
    return res.bodyBytes;
  }

  dynamic _decode(http.Response res) {
    final body = res.body.isEmpty ? {} : jsonDecode(res.body);
    if (res.statusCode >= 400) {
      final msg = body is Map && body['error'] != null ? body['error'] : 'Request failed';
      throw ApiException(res.statusCode, msg.toString());
    }
    return body;
  }
}

class ApiException implements Exception {
  ApiException(this.statusCode, this.message);
  final int statusCode;
  final String message;
  @override
  String toString() => 'ApiException($statusCode): $message';
}
