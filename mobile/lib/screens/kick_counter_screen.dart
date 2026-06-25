import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class KickCounterScreen extends StatefulWidget {
  const KickCounterScreen({super.key});

  @override
  State<KickCounterScreen> createState() => _KickCounterScreenState();
}

class _KickCounterScreenState extends State<KickCounterScreen> {
  final _stopwatch = Stopwatch();
  Timer? _ticker;
  int _count = 0;
  bool _running = false;
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
    final res = await context.read<AppState>().api.get('/tools/kicks');
    return res['sessions'] as List;
  }

  void _start() {
    setState(() {
      _running = true;
      _count = 0;
      _stopwatch
        ..reset()
        ..start();
    });
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) => setState(() {}));
  }

  Future<void> _stop() async {
    _ticker?.cancel();
    _stopwatch.stop();
    final secs = _stopwatch.elapsed.inSeconds;
    setState(() => _running = false);
    if (_count > 0) {
      await context.read<AppState>().api.post('/tools/kicks', {
        'count': _count,
        'durationSec': secs,
      });
      setState(() => _history = _load());
    }
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
      appBar: AppBar(title: Text(l.t('kickCounter'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
        children: [
          SoftCard(
            color: AppColors.lavender,
            child: Column(
              children: [
                Text('$_count', style: const TextStyle(color: Colors.white, fontSize: 56, fontWeight: FontWeight.bold)),
                Text(l.t('kicks'), style: const TextStyle(color: Colors.white70)),
                const SizedBox(height: 8),
                Text(_fmt(elapsed), style: const TextStyle(color: Colors.white, fontSize: 18)),
              ],
            ),
          ),
          const SizedBox(height: 12),
          GestureDetector(
            onTap: _running ? () => setState(() => _count++) : null,
            child: Container(
              height: 160,
              decoration: BoxDecoration(
                color: _running ? AppColors.blush.withValues(alpha: 0.25) : AppColors.lavenderLight,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: AppColors.lavenderLight),
              ),
              child: Center(
                child: Text(
                  _running ? l.t('tapWhenKick') : l.t('start'),
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.ink),
                ),
              ),
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
                children: items.map((s) {
                  final dt = DateTime.tryParse(s['startedAt'] ?? '');
                  return SoftCard(
                    child: Row(
                      children: [
                        const Icon(Icons.child_friendly, color: AppColors.lavender),
                        const SizedBox(width: 12),
                        Expanded(child: Text('${s['count']} ${l.t('kicks')} • ${_fmt(s['durationSec'] ?? 0)}')),
                        Text(dt != null ? '${dt.day}/${dt.month}' : '',
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
