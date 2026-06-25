import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<Map<String, dynamic>> _load() async {
    final state = context.read<AppState>();
    final api = state.api;
    final results = await Future.wait([
      api.get('/pregnancy/active', query: {'lang': state.lang}),
      api.get('/appointments'),
      api.get('/wellness/mood'),
      api.get('/babies'),
      api.get('/tools/tips/daily', query: {'lang': state.lang, 'context': 'pregnancy'}),
    ]);
    return {
      'pregnancy': results[0],
      'appointments': results[1],
      'mood': results[2],
      'babies': results[3],
      'tip': results[4],
    };
  }

  void _refresh() => setState(() => _future = _load());

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final state = context.watch<AppState>();
    final name = state.user?['name'] ?? '';
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('dashboard'))),
      body: RefreshIndicator(
        onRefresh: () async => _refresh(),
        child: FutureBuilder<Map<String, dynamic>>(
          future: _future,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
            if (snap.hasError) return ErrorView(onRetry: _refresh, message: snap.error.toString());
            final data = snap.data!;
            final pregnancy = data['pregnancy'] as Map<String, dynamic>;
            final progress = pregnancy['progress'];
            final week = pregnancy['week'];
            final appts = (data['appointments']['appointments'] as List);
            final moods = (data['mood']['moods'] as List);
            final babies = (data['babies']['babies'] as List);

            return ListView(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              children: [
                Text('${l.t('welcome')}, $name 👋',
                    style: const TextStyle(fontSize: 16, color: AppColors.muted)),
                const SizedBox(height: 12),
                if (progress != null) _PregnancyCard(progress: progress, week: week),
                if (progress == null)
                  SoftCard(
                    color: AppColors.lavender,
                    child: Row(
                      children: [
                        const Icon(Icons.pregnant_woman, color: Colors.white, size: 36),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(l.t('startPregnancy'),
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 16),
                SoftCard(
                  color: AppColors.mint.withValues(alpha: 0.25),
                  child: Row(
                    children: [
                      const Text('💡', style: TextStyle(fontSize: 28)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(l.t('dailyTip'),
                                style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.ink)),
                            const SizedBox(height: 2),
                            Text('${data['tip']?['tip'] ?? ''}',
                                style: const TextStyle(color: AppColors.ink, fontSize: 13)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _StatTile(icon: Icons.event, label: l.t('appointments'), value: '${appts.length}', color: AppColors.sky)),
                    const SizedBox(width: 12),
                    Expanded(child: _StatTile(icon: Icons.child_care, label: l.t('baby'), value: '${babies.length}', color: AppColors.mint)),
                    const SizedBox(width: 12),
                    Expanded(child: _StatTile(icon: Icons.mood, label: l.t('mood'), value: '${moods.length}', color: AppColors.blush)),
                  ],
                ),
                const SizedBox(height: 16),
                SectionTitle(l.t('upcomingAppt'), icon: Icons.event_available),
                if (appts.isEmpty)
                  SoftCard(child: Text(l.t('empty'), style: const TextStyle(color: AppColors.muted)))
                else
                  SoftCard(
                    child: Row(
                      children: [
                        const CircleAvatar(backgroundColor: AppColors.lavenderLight, child: Icon(Icons.local_hospital, color: AppColors.lavender)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(appts.first['title'], style: const TextStyle(fontWeight: FontWeight.w600)),
                              Text(
                                DateFormat.yMMMEd(state.lang).add_jm().format(DateTime.parse(appts.first['datetime'])),
                                style: const TextStyle(color: AppColors.muted, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                const SizedBox(height: 16),
                SoftCard(
                  color: AppColors.peach.withValues(alpha: 0.4),
                  child: Row(
                    children: [
                      const Icon(Icons.info_outline, color: AppColors.ink),
                      const SizedBox(width: 10),
                      Expanded(child: Text(l.t('disclaimer'), style: const TextStyle(fontSize: 12, color: AppColors.ink))),
                    ],
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _PregnancyCard extends StatelessWidget {
  const _PregnancyCard({required this.progress, this.week});
  final Map progress;
  final dynamic week;

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final pct = (progress['progressPercent'] ?? 0) / 100.0;
    return SoftCard(
      color: AppColors.lavender,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('${l.t('week')} ${progress['currentWeek']}',
                  style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(20)),
                child: Text('${l.t('trimester')} ${progress['trimester']}',
                    style: const TextStyle(color: Colors.white, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: pct.clamp(0, 1).toDouble(),
              minHeight: 10,
              backgroundColor: Colors.white24,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 12),
          if (week != null)
            Text('${l.t('babySize')} ${week['size']}',
                style: const TextStyle(color: Colors.white)),
          const SizedBox(height: 4),
          Text('${progress['daysRemaining']} ${l.t('daysToGo')} • ${l.t('dueDate')}: ${progress['dueDate']}',
              style: const TextStyle(color: Colors.white70, fontSize: 13)),
        ],
      ),
    );
  }
}

class _StatTile extends StatelessWidget {
  const _StatTile({required this.icon, required this.label, required this.value, required this.color});
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return SoftCard(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 8),
      child: Column(
        children: [
          CircleAvatar(radius: 18, backgroundColor: color.withValues(alpha: 0.25), child: Icon(icon, color: color, size: 20)),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.ink)),
          Text(label, style: const TextStyle(fontSize: 11, color: AppColors.muted), textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
