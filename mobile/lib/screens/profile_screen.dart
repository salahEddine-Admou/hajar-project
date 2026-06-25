import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final state = context.watch<AppState>();
    final user = state.user ?? {};
    final languages = {'ar': 'العربية', 'fr': 'Français'};

    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('profile'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        children: [
          SoftCard(
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.lavenderLight,
                  child: Text(
                    (user['name'] ?? '?').toString().characters.first,
                    style: const TextStyle(fontSize: 26, color: AppColors.lavender),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user['name'] ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                      Text(user['email'] ?? '', style: const TextStyle(color: AppColors.muted)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          SectionTitle(l.t('language'), icon: Icons.language),
          SoftCard(
            child: Column(
              children: languages.entries.map((e) {
                final selected = state.locale.languageCode == e.key;
                return RadioListTile<String>(
                  contentPadding: EdgeInsets.zero,
                  value: e.key,
                  groupValue: state.locale.languageCode,
                  activeColor: AppColors.lavender,
                  title: Text(e.value),
                  secondary: selected ? const Icon(Icons.check_circle, color: AppColors.lavender) : null,
                  onChanged: (v) => context.read<AppState>().setLocale(v!),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.redAccent,
                side: const BorderSide(color: Colors.redAccent),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              onPressed: () => context.read<AppState>().logout(),
              icon: const Icon(Icons.logout),
              label: Text(l.t('logout')),
            ),
          ),
        ],
      ),
    );
  }
}
