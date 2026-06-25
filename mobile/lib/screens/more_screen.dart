import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'appointments_screen.dart';
import 'medications_screen.dart';
import 'records_screen.dart';
import 'ai_chat_screen.dart';
import 'community_screen.dart';
import 'profile_screen.dart';

class MoreScreen extends StatelessWidget {
  const MoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final items = [
      _MoreItem(Icons.event, l.t('appointments'), AppColors.sky, const AppointmentsScreen()),
      _MoreItem(Icons.medication, l.t('medications'), AppColors.blush, const MedicationsScreen()),
      _MoreItem(Icons.folder_shared, l.t('healthRecords'), AppColors.mint, const RecordsScreen()),
      _MoreItem(Icons.smart_toy, l.t('aiAssistant'), AppColors.lavender, const AiChatScreen()),
      _MoreItem(Icons.forum, l.t('community'), AppColors.peach, const CommunityScreen()),
      _MoreItem(Icons.person, l.t('profile'), AppColors.sky, const ProfileScreen()),
    ];
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('more'))),
      body: GridView.count(
        crossAxisCount: 2,
        padding: const EdgeInsets.all(16),
        mainAxisSpacing: 14,
        crossAxisSpacing: 14,
        childAspectRatio: 1.05,
        children: items
            .map((it) => SoftCard(
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => it.page)),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      CircleAvatar(
                        radius: 28,
                        backgroundColor: it.color.withValues(alpha: 0.22),
                        child: Icon(it.icon, color: it.color, size: 28),
                      ),
                      const SizedBox(height: 12),
                      Text(it.label, textAlign: TextAlign.center,
                          style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.ink)),
                    ],
                  ),
                ))
            .toList(),
      ),
    );
  }
}

class _MoreItem {
  _MoreItem(this.icon, this.label, this.color, this.page);
  final IconData icon;
  final String label;
  final Color color;
  final Widget page;
}
