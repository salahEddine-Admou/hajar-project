import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:provider/provider.dart';

import 'l10n/app_localizations.dart';
import 'providers/app_state.dart';
import 'services/api_client.dart';
import 'theme.dart';
import 'screens/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  initializeDateFormatting();
  final api = ApiClient();
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppState(api)..bootstrap(),
      child: const HajarApp(),
    ),
  );
}

class HajarApp extends StatelessWidget {
  const HajarApp({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    return MaterialApp(
      title: 'Hajar',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      locale: state.locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: !state.bootstrapped
          ? const SplashScreen()
          : state.isLoggedIn
              ? const HomeShell()
              : const LoginScreen(),
    );
  }
}
