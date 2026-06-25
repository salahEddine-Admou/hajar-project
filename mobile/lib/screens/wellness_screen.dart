import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'screening_screen.dart';

class WellnessScreen extends StatefulWidget {
  const WellnessScreen({super.key});

  @override
  State<WellnessScreen> createState() => _WellnessScreenState();
}

class _WellnessScreenState extends State<WellnessScreen> {
  late Future<Map<String, dynamic>> _future;
  double _mood = 3;
  double _stress = 2;
  double _anxiety = 2;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<Map<String, dynamic>> _load() async {
    final state = context.read<AppState>();
    final results = await Future.wait([
      state.api.get('/wellness/mood'),
      state.api.get('/wellness/recommendations', query: {'lang': state.lang}),
    ]);
    return {'mood': results[0], 'rec': results[1]};
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _logMood() async {
    await context.read<AppState>().api.post('/wellness/mood', {
      'mood': _mood.round(),
      'stress': _stress.round(),
      'anxiety': _anxiety.round(),
    });
    _refresh();
  }

  static const _moodEmojis = ['😢', '😟', '😐', '🙂', '😄'];

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('wellness'))),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snap.hasError) return ErrorView(onRetry: _refresh, message: snap.error.toString());
          final moods = (snap.data!['mood']['moods'] as List);
          final rec = snap.data!['rec'];
          final tips = (rec['tips'] as List?) ?? [];

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            children: [
              SectionTitle(l.t('todaysMood'), icon: Icons.mood),
              SoftCard(
                child: Column(
                  children: [
                    Text(_moodEmojis[(_mood.round() - 1).clamp(0, 4)], style: const TextStyle(fontSize: 48)),
                    _LabeledSlider(label: l.t('mood'), value: _mood, onChanged: (v) => setState(() => _mood = v)),
                    _LabeledSlider(label: l.t('stress'), value: _stress, onChanged: (v) => setState(() => _stress = v), color: AppColors.blush),
                    _LabeledSlider(label: l.t('anxiety'), value: _anxiety, onChanged: (v) => setState(() => _anxiety = v), color: AppColors.peach),
                    const SizedBox(height: 8),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _logMood,
                        icon: const Icon(Icons.add_reaction_outlined),
                        label: Text(l.t('logMood')),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              SectionTitle(l.t('screening'), icon: Icons.psychology),
              SoftCard(
                color: AppColors.lavenderLight,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(l.t('disclaimer'), style: const TextStyle(fontSize: 12, color: AppColors.ink)),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async {
                          await Navigator.push(context,
                              MaterialPageRoute(builder: (_) => const ScreeningScreen()));
                          _refresh();
                        },
                        child: Text(l.t('startScreening')),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              SectionTitle(l.t('recommendations'), icon: Icons.tips_and_updates),
              ...tips.map((t) => SoftCard(
                    child: Row(
                      children: [
                        const Icon(Icons.spa, color: AppColors.mint),
                        const SizedBox(width: 12),
                        Expanded(child: Text(t.toString())),
                      ],
                    ),
                  )),
              const SizedBox(height: 8),
              SectionTitle(l.t('mood'), icon: Icons.history),
              ...moods.take(7).map((m) => SoftCard(
                    child: Row(
                      children: [
                        Text(_moodEmojis[((m['mood'] ?? 3) - 1).clamp(0, 4)], style: const TextStyle(fontSize: 24)),
                        const SizedBox(width: 12),
                        Expanded(child: Text(m['date'] ?? '')),
                        Text('${l.t('stress')}: ${m['stress'] ?? '-'}',
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

class _LabeledSlider extends StatelessWidget {
  const _LabeledSlider({required this.label, required this.value, required this.onChanged, this.color});
  final String label;
  final double value;
  final ValueChanged<double> onChanged;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(width: 70, child: Text(label, style: const TextStyle(color: AppColors.muted))),
        Expanded(
          child: Slider(
            value: value,
            min: 1,
            max: 5,
            divisions: 4,
            label: value.round().toString(),
            activeColor: color ?? AppColors.lavender,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
}
