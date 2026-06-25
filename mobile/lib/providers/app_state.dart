import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../services/api_client.dart';

/// Holds authentication state, the API client and the chosen locale.
class AppState extends ChangeNotifier {
  AppState(this.api);

  final ApiClient api;

  Map<String, dynamic>? _user;
  String? _token;
  Locale _locale = const Locale('en');
  bool _bootstrapped = false;

  Map<String, dynamic>? get user => _user;
  bool get isLoggedIn => _token != null;
  Locale get locale => _locale;
  bool get bootstrapped => _bootstrapped;
  String get lang => _locale.languageCode;

  Future<void> bootstrap() async {
    final prefs = await SharedPreferences.getInstance();
    final savedLocale = prefs.getString('locale');
    if (savedLocale != null) _locale = Locale(savedLocale);
    final token = prefs.getString('token');
    if (token != null) {
      _token = token;
      api.setToken(token);
      try {
        final res = await api.get('/auth/me');
        _user = Map<String, dynamic>.from(res['user']);
      } catch (_) {
        await logout();
      }
    }
    _bootstrapped = true;
    notifyListeners();
  }

  Future<void> setLocale(String code) async {
    _locale = Locale(code);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('locale', code);
    if (isLoggedIn) {
      try {
        await api.patch('/auth/me', {'locale': code});
      } catch (_) {}
    }
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    final res = await api.post('/auth/login', {'email': email, 'password': password});
    await _persistAuth(res);
  }

  Future<void> register(String name, String email, String password) async {
    final res = await api.post('/auth/register', {
      'name': name,
      'email': email,
      'password': password,
      'locale': _locale.languageCode,
    });
    await _persistAuth(res);
  }

  Future<void> _persistAuth(Map<String, dynamic> res) async {
    _token = res['token'];
    _user = Map<String, dynamic>.from(res['user']);
    api.setToken(_token);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', _token!);
    notifyListeners();
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    api.setToken(null);
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    notifyListeners();
  }
}
