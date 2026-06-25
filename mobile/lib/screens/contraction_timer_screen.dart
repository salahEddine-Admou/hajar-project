import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class ContractionTimerScreen extends StatefulWidget {
  const ContractionTimerScreen({super.key});

  @override
  State<ContractionTimerScreen> createState() => _ContractionTimerScreenState();
}

class _ContractionTimerScreenState extends State<ContractionTimerScreen> {
  final _stopwatch = Stopwatch();
  Timer? _ticker;
  bool _running = false;
  DateTime? _currentStart;
  DateTime? _previousStart;
  late Future<List> _history;

  @override
  void initState() {
    super.initState();
    _history = _load();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  Future<List> _load() async {
    final res = await context.read<AppState>().api.get('/tools/contractions');
    return res['contractions'] as List;
  }

  void _start() {
    _currentStart = DateTime.now();
    _stopwatch
      ..reset()
      ..start();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) => setState(() {}));
    setState(() => _running = true);
  }

  Future<void> _stop() async {
    _ticker?.cancel();
    _stopwatch.stop();
    final duration = _stopwatch.elapsed.inSeconds;
    final intervalSec = _previousStart != null && _currentStart != null
        ? _currentStart!.difference(_previousStart!).inSeconds
        : null;
    setState(() => _running = false);
    await context.read<AppState>().api.post('/tools/contractions', {
      'startedAt': _currentStart?.toIso8601String(),
      'durationSec': duration,
      'intervalSec': intervalSec,
    });
    _previousStart = _currentStart;
    setState(() => _history = _load());
  }

  String _fmt(int secs) {
    final m = (secs ~/ 60).toString().padLeft(2, '0');
    final s = (secs % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final elapsed = _stopwatch.elapsed.inSeconds;
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('contractionTimer'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        children: [
          SoftCard(
            color: _running ? AppColors.blush : AppColors.lavender,
            child: Column(
              children: [
                Text(_fmt(elapsed),
                    style: const TextStyle(color: Colors.white, fontSize: 52, fontWeight: FontWeight.bold)),
                Text(l.t('duration'), style: const TextStyle(color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              style: _running ? ElevatedButton.styleFrom(backgroundColor: AppColors.blush) : null,
              onPressed: _running ? _stop : _start,
              icon: Icon(_running ? Icons.stop : Icons.play_arrow),
              label: Text(_running ? l.t('stop') : l.t('start')),
            ),
          ),
          const SizedBox(height: 8),
          SectionTitle(l.t('history'), icon: Icons.history),
          FutureBuilder<List>(
            future: _history,
            builder: (context, snap) {
              if (!snap.hasData) return const Padding(padding: EdgeInsets.all(16), child: LoadingView());
              final items = snap.data!;
              if (items.isEmpty) return EmptyView(message: l.t('empty'));
              return Column(
                children: items.map((c) {
                  final dt = DateTime.tryParse(c['startedAt'] ?? '');
                  final interval = c['intervalSec'];
                  return SoftCard(
                    child: Row(
                      children: [
                        const Icon(Icons.timer, color: AppColors.lavender),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            '${l.t('duration')}: ${_fmt(c['durationSec'] ?? 0)}'
                            '${interval != null ? '  •  ${l.t('interval')}: ${_fmt(interval)}' : ''}',
                          ),
                        ),
                        Text(dt != null ? '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}' : '',
                            style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                      ],
                    ),
                  );
                }).toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}
