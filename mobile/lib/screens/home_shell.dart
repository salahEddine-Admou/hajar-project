import 'package:flutter/material.dart';

import '../l10n/app_localizations.dart';
import 'dashboard_screen.dart';
import 'pregnancy_screen.dart';
import 'baby_screen.dart';
import 'wellness_screen.dart';
import 'more_screen.dart';

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  final _pages = const [
    DashboardScreen(),
    PregnancyScreen(),
    BabyScreen(),
    WellnessScreen(),
    MoreScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Scaffold(
      body: IndexedStack(index: _index, children: _pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        destinations: [
          NavigationDestination(icon: const Icon(Icons.home_outlined), selectedIcon: const Icon(Icons.home_rounded), label: l.t('home')),
          NavigationDestination(icon: const Icon(Icons.pregnant_woman_outlined), selectedIcon: const Icon(Icons.pregnant_woman), label: l.t('pregnancy')),
          NavigationDestination(icon: const Icon(Icons.child_care_outlined), selectedIcon: const Icon(Icons.child_care), label: l.t('baby')),
          NavigationDestination(icon: const Icon(Icons.spa_outlined), selectedIcon: const Icon(Icons.spa), label: l.t('wellness')),
          NavigationDestination(icon: const Icon(Icons.grid_view_outlined), selectedIcon: const Icon(Icons.grid_view_rounded), label: l.t('more')),
        ],
      ),
    );
  }
}
