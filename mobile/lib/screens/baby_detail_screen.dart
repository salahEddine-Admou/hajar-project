import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class BabyDetailScreen extends StatefulWidget {
  const BabyDetailScreen({super.key, required this.baby});
  final Map<String, dynamic> baby;

  @override
  State<BabyDetailScreen> createState() => _BabyDetailScreenState();
}

class _BabyDetailScreenState extends State<BabyDetailScreen> {
  String get _id => widget.baby['id'];

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return DefaultTabController(
      length: 3,
      child: GradientScaffold(
        appBar: AppBar(
          title: Text(widget.baby['name']),
          bottom: TabBar(
            labelColor: AppColors.lavender,
            unselectedLabelColor: AppColors.muted,
            indicatorColor: AppColors.lavender,
            tabs: [
              Tab(text: l.t('growth')),
              Tab(text: l.t('vaccinations')),
              Tab(text: l.t('feeding')),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _GrowthTab(babyId: _id),
            _VaccinationsTab(babyId: _id),
            _LogsTab(babyId: _id),
          ],
        ),
      ),
    );
  }
}

// ----------------- Growth -----------------
class _GrowthTab extends StatefulWidget {
  const _GrowthTab({required this.babyId});
  final String babyId;
  @override
  State<_GrowthTab> createState() => _GrowthTabState();
}

class _GrowthTabState extends State<_GrowthTab> {
  late Future<List> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List> _load() async {
    final res = await context.read<AppState>().api.get('/babies/${widget.babyId}/growth');
    return res['records'] as List;
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _addRecord() async {
    final l = AppLocalizations.of(context);
    final w = TextEditingController();
    final h = TextEditingController();
    final hc = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l.t('addRecord')),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: w, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: l.t('weight'))),
          const SizedBox(height: 10),
          TextField(controller: h, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: l.t('height'))),
          const SizedBox(height: 10),
          TextField(controller: hc, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: l.t('headCirc'))),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l.t('cancel'))),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l.t('save'))),
        ],
      ),
    );
    if (ok == true) {
      await context.read<AppState>().api.post('/babies/${widget.babyId}/growth', {
        'date': DateTime.now().toIso8601String().substring(0, 10),
        'weight': double.tryParse(w.text),
        'height': double.tryParse(h.text),
        'headCircumference': double.tryParse(hc.text),
      });
      _refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Stack(
      children: [
        FutureBuilder<List>(
          future: _future,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
            if (snap.hasError) return ErrorView(onRetry: _refresh, message: snap.error.toString());
            final records = snap.data!;
            if (records.isEmpty) return EmptyView(icon: Icons.monitor_weight, message: l.t('addRecord'));
            return ListView(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 90),
              children: [
                SectionTitle('${l.t('weight')} • ${l.t('height')}', icon: Icons.show_chart),
                SoftCard(child: SizedBox(height: 220, child: _GrowthChart(records: records))),
                const SizedBox(height: 8),
                ...records.reversed.map((r) => SoftCard(
                      child: Row(
                        children: [
                          const Icon(Icons.monitor_weight_outlined, color: AppColors.lavender),
                          const SizedBox(width: 12),
                          Expanded(child: Text(r['date'] ?? '')),
                          Text('${r['weight'] ?? '-'} kg • ${r['height'] ?? '-'} cm',
                              style: const TextStyle(color: AppColors.muted)),
                        ],
                      ),
                    )),
              ],
            );
          },
        ),
        Positioned(
          right: 16, bottom: 16,
          child: FloatingActionButton(
            onPressed: _addRecord,
            backgroundColor: AppColors.lavender,
            child: const Icon(Icons.add, color: Colors.white),
          ),
        ),
      ],
    );
  }
}

class _GrowthChart extends StatelessWidget {
  const _GrowthChart({required this.records});
  final List records;

  @override
  Widget build(BuildContext context) {
    final weightSpots = <FlSpot>[];
    final heightSpots = <FlSpot>[];
    for (var i = 0; i < records.length; i++) {
      final r = records[i];
      if (r['weight'] != null) weightSpots.add(FlSpot(i.toDouble(), (r['weight'] as num).toDouble()));
      if (r['height'] != null) heightSpots.add(FlSpot(i.toDouble(), (r['height'] as num).toDouble() / 10));
    }
    return LineChart(
      LineChartData(
        gridData: const FlGridData(show: true, drawVerticalLine: false),
        titlesData: const FlTitlesData(
          rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        borderData: FlBorderData(show: false),
        lineBarsData: [
          LineChartBarData(
            spots: weightSpots,
            isCurved: true,
            color: AppColors.lavender,
            barWidth: 3,
            dotData: const FlDotData(show: true),
          ),
          LineChartBarData(
            spots: heightSpots,
            isCurved: true,
            color: AppColors.mint,
            barWidth: 3,
            dotData: const FlDotData(show: true),
          ),
        ],
      ),
    );
  }
}

// ----------------- Vaccinations -----------------
class _VaccinationsTab extends StatefulWidget {
  const _VaccinationsTab({required this.babyId});
  final String babyId;
  @override
  State<_VaccinationsTab> createState() => _VaccinationsTabState();
}

class _VaccinationsTabState extends State<_VaccinationsTab> {
  late Future<List> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List> _load() async {
    final state = context.read<AppState>();
    final res = await state.api.get('/babies/${widget.babyId}/vaccinations', query: {'lang': state.lang});
    return res['vaccinations'] as List;
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _toggle(Map v) async {
    if (v['given'] == true) return;
    await context.read<AppState>().api.post('/babies/${widget.babyId}/vaccinations', {'vaccine': v['vaccine']});
    _refresh();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return FutureBuilder<List>(
      future: _future,
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
        if (snap.hasError) return ErrorView(onRetry: _refresh, message: snap.error.toString());
        final list = snap.data!;
        return ListView(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
          children: list.map((v) {
            final given = v['given'] == true;
            return SoftCard(
              onTap: () => _toggle(v),
              child: Row(
                children: [
                  Icon(given ? Icons.verified : Icons.vaccines_outlined,
                      color: given ? AppColors.mint : AppColors.muted),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(v['vaccine'], style: const TextStyle(fontWeight: FontWeight.w600)),
                        Text(v['protectsAgainst'] ?? '',
                            style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                      ],
                    ),
                  ),
                  Text(given ? (v['givenDate'] ?? '') : (v['dueDate'] ?? ''),
                      style: const TextStyle(color: AppColors.muted, fontSize: 11)),
                ],
              ),
            );
          }).toList(),
        );
      },
    );
  }
}

// ----------------- Logs (feeding/sleep/diaper) -----------------
class _LogsTab extends StatefulWidget {
  const _LogsTab({required this.babyId});
  final String babyId;
  @override
  State<_LogsTab> createState() => _LogsTabState();
}

class _LogsTabState extends State<_LogsTab> {
  late Future<List> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List> _load() async {
    final res = await context.read<AppState>().api.get('/babies/${widget.babyId}/logs');
    return res['logs'] as List;
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _add(String type) async {
    await context.read<AppState>().api.post('/babies/${widget.babyId}/logs', {
      'type': type,
      'startTime': DateTime.now().toIso8601String(),
    });
    _refresh();
  }

  IconData _iconFor(String type) {
    switch (type) {
      case 'feeding':
        return Icons.local_drink;
      case 'sleep':
        return Icons.bedtime;
      case 'diaper':
        return Icons.baby_changing_station;
      default:
        return Icons.note;
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _QuickAdd(icon: Icons.local_drink, label: l.t('feeding'), color: AppColors.blush, onTap: () => _add('feeding')),
              _QuickAdd(icon: Icons.bedtime, label: l.t('sleep'), color: AppColors.sky, onTap: () => _add('sleep')),
              _QuickAdd(icon: Icons.baby_changing_station, label: l.t('diaper'), color: AppColors.peach, onTap: () => _add('diaper')),
            ],
          ),
        ),
        Expanded(
          child: FutureBuilder<List>(
            future: _future,
            builder: (context, snap) {
              if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
              if (snap.hasError) return ErrorView(onRetry: _refresh, message: snap.error.toString());
              final logs = snap.data!;
              if (logs.isEmpty) return EmptyView(icon: Icons.list_alt, message: l.t('empty'));
              return ListView(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                children: logs.map((log) {
                  final t = DateTime.tryParse(log['startTime'] ?? '');
                  return SoftCard(
                    child: Row(
                      children: [
                        Icon(_iconFor(log['type']), color: AppColors.lavender),
                        const SizedBox(width: 12),
                        Expanded(child: Text(l.t(log['type']))),
                        Text(t != null ? '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}' : '',
                            style: const TextStyle(color: AppColors.muted)),
                      ],
                    ),
                  );
                }).toList(),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _QuickAdd extends StatelessWidget {
  const _QuickAdd({required this.icon, required this.label, required this.color, required this.onTap});
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(16),
      onTap: onTap,
      child: Column(
        children: [
          CircleAvatar(radius: 26, backgroundColor: color.withValues(alpha: 0.3), child: Icon(icon, color: AppColors.ink)),
          const SizedBox(height: 6),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}
