import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';
import 'baby_detail_screen.dart';

class BabyScreen extends StatefulWidget {
  const BabyScreen({super.key});

  @override
  State<BabyScreen> createState() => _BabyScreenState();
}

class _BabyScreenState extends State<BabyScreen> {
  late Future<List> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List> _load() async {
    final res = await context.read<AppState>().api.get('/babies');
    return res['babies'] as List;
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _addBaby() async {
    final l = AppLocalizations.of(context);
    final name = TextEditingController();
    DateTime birth = DateTime.now();
    String delivery = 'vaginal';
    final weight = TextEditingController();
    final height = TextEditingController();

    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: StatefulBuilder(
          builder: (ctx, setSheet) => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionTitle(l.t('addBaby'), icon: Icons.child_care),
              TextField(controller: name, decoration: InputDecoration(labelText: l.t('name'))),
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                title: Text('${l.t('birthDate')}: ${birth.toIso8601String().substring(0, 10)}'),
                trailing: const Icon(Icons.calendar_month),
                onTap: () async {
                  final p = await showDatePicker(
                    context: ctx,
                    firstDate: DateTime.now().subtract(const Duration(days: 365 * 6)),
                    lastDate: DateTime.now(),
                    initialDate: birth,
                  );
                  if (p != null) setSheet(() => birth = p);
                },
              ),
              Row(children: [
                Expanded(child: TextField(controller: weight, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: l.t('weight')))),
                const SizedBox(width: 12),
                Expanded(child: TextField(controller: height, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: l.t('height')))),
              ]),
              const SizedBox(height: 12),
              Wrap(spacing: 8, children: ['vaginal', 'cesarean'].map((d) {
                return ChoiceChip(
                  label: Text(d),
                  selected: delivery == d,
                  onSelected: (_) => setSheet(() => delivery = d),
                );
              }).toList()),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l.t('save'))),
              ),
            ],
          ),
        ),
      ),
    );

    if (ok == true && name.text.trim().isNotEmpty) {
      await context.read<AppState>().api.post('/babies', {
        'name': name.text.trim(),
        'birthDate': birth.toIso8601String().substring(0, 10),
        'deliveryType': delivery,
        'birthWeight': double.tryParse(weight.text),
        'birthHeight': double.tryParse(height.text),
      });
      _refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('baby'))),
      floatingActionButton: FloatingActionButton(
        onPressed: _addBaby,
        backgroundColor: AppColors.lavender,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: FutureBuilder<List>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snap.hasError) return ErrorView(onRetry: _refresh, message: snap.error.toString());
          final babies = snap.data!;
          if (babies.isEmpty) return EmptyView(icon: Icons.child_care, message: l.t('addBaby'));
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
            children: babies.map((b) {
              final age = b['ageMonths'];
              return SoftCard(
                onTap: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => BabyDetailScreen(baby: Map<String, dynamic>.from(b)))),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 26,
                      backgroundColor: AppColors.mint.withValues(alpha: 0.25),
                      child: Text((b['name'] as String).characters.first,
                          style: const TextStyle(fontSize: 22, color: AppColors.ink)),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(b['name'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                          Text(age != null ? '$age ${l.t('monthsOld')}' : (b['birthDate'] ?? ''),
                              style: const TextStyle(color: AppColors.muted)),
                        ],
                      ),
                    ),
                    const Icon(Icons.chevron_right, color: AppColors.muted),
                  ],
                ),
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
