import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class PregnancyScreen extends StatefulWidget {
  const PregnancyScreen({super.key});

  @override
  State<PregnancyScreen> createState() => _PregnancyScreenState();
}

class _PregnancyScreenState extends State<PregnancyScreen> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<Map<String, dynamic>> _load() async {
    final state = context.read<AppState>();
    final active = await state.api.get('/pregnancy/active', query: {'lang': state.lang});
    if (active['pregnancy'] == null) return {'active': active};
    final milestones = await state.api.get('/pregnancy/milestones', query: {'lang': state.lang});
    return {'active': active, 'milestones': milestones};
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _setupPregnancy() async {
    final picked = await showDatePicker(
      context: context,
      firstDate: DateTime.now().subtract(const Duration(days: 300)),
      lastDate: DateTime.now(),
      initialDate: DateTime.now().subtract(const Duration(days: 56)),
    );
    if (picked == null) return;
    final state = context.read<AppState>();
    await state.api.post('/pregnancy', {'lmp': picked.toIso8601String().substring(0, 10)});
    _refresh();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('pregnancy'))),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snap.hasError) return ErrorView(onRetry: _refresh, message: snap.error.toString());
          final active = snap.data!['active'];
          if (active['pregnancy'] == null) {
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.pregnant_woman, size: 64, color: AppColors.lavender),
                    const SizedBox(height: 16),
                    Text(l.t('startPregnancy'), textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 20),
                    ElevatedButton.icon(
                      onPressed: _setupPregnancy,
                      icon: const Icon(Icons.calendar_month),
                      label: Text(l.t('lastPeriod')),
                    ),
                  ],
                ),
              ),
            );
          }

          final progress = active['progress'];
          final week = active['week'];
          final milestones = (snap.data!['milestones']?['milestones'] as List?) ?? [];

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            children: [
              SoftCard(
                color: AppColors.lavender,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('${l.t('week')} ${progress['currentWeek']}',
                        style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 6),
                    LinearProgressIndicator(
                      value: ((progress['progressPercent'] ?? 0) / 100.0).clamp(0, 1).toDouble(),
                      backgroundColor: Colors.white24,
                      color: Colors.white,
                    ),
                    const SizedBox(height: 10),
                    Text('${progress['daysRemaining']} ${l.t('daysToGo')}',
                        style: const TextStyle(color: Colors.white70)),
                    Text('${l.t('dueDate')}: ${progress['dueDate']}',
                        style: const TextStyle(color: Colors.white70)),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              SectionTitle(l.t('weeklyInfo'), icon: Icons.eco),
              SoftCard(
                child: Row(
                  children: [
                    const Text('🍼', style: TextStyle(fontSize: 36)),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (week != null)
                            Text('${l.t('babySize')} ${week['size']}',
                                style: const TextStyle(fontWeight: FontWeight.w700)),
                          const SizedBox(height: 4),
                          if (week != null)
                            Text(week['highlight'], style: const TextStyle(color: AppColors.muted)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              SectionTitle(l.t('milestones'), icon: Icons.flag),
              ...milestones.map((m) => SoftCard(
                    child: Row(
                      children: [
                        Icon(m['done'] == true ? Icons.check_circle : Icons.radio_button_unchecked,
                            color: m['done'] == true ? AppColors.mint : AppColors.muted),
                        const SizedBox(width: 12),
                        Expanded(child: Text(m['title'])),
                        Text('${l.t('week')} ${m['week']}',
                            style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                      ],
                    ),
                  )),
            ],
          );
        },
      ),
    );
  }
}
