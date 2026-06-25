import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';

class LanguageSelectScreen extends StatelessWidget {
  const LanguageSelectScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppColors.lavenderLight, AppColors.surface],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.favorite_rounded, size: 72, color: AppColors.lavender),
                const SizedBox(height: 16),
                Text(l.t('appName'),
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.ink)),
                const SizedBox(height: 40),
                Text(l.t('chooseLanguage'),
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.ink)),
                const SizedBox(height: 24),
                _LangButton(
                  label: 'العربية',
                  flag: '🇲🇦',
                  onTap: () => context.read<AppState>().chooseLocale('ar'),
                ),
                const SizedBox(height: 14),
                _LangButton(
                  label: 'Français',
                  flag: '🇫🇷',
                  onTap: () => context.read<AppState>().chooseLocale('fr'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _LangButton extends StatelessWidget {
  const _LangButton({required this.label, required this.flag, required this.onTap});
  final String label;
  final String flag;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 20),
            child: Row(
              children: [
                Text(flag, style: const TextStyle(fontSize: 26)),
                const SizedBox(width: 16),
                Text(label,
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.ink)),
                const Spacer(),
                const Icon(Icons.arrow_forward_ios, size: 18, color: AppColors.lavender),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
