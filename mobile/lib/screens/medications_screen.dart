import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class MedicationsScreen extends StatefulWidget {
  const MedicationsScreen({super.key});

  @override
  State<MedicationsScreen> createState() => _MedicationsScreenState();
}

class _MedicationsScreenState extends State<MedicationsScreen> {
  late Future<List> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List> _load() async {
    final res = await context.read<AppState>().api.get('/medications');
    return res['medications'] as List;
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _add() async {
    final l = AppLocalizations.of(context);
    final name = TextEditingController();
    final dosage = TextEditingController();
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l.t('medications')),
        content: Column(mainAxisSize: MainAxisSize.min, children: [
          TextField(controller: name, decoration: InputDecoration(labelText: l.t('title'))),
          const SizedBox(height: 10),
          TextField(controller: dosage, decoration: const InputDecoration(labelText: 'Dosage')),
        ]),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l.t('cancel'))),
          ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l.t('save'))),
        ],
      ),
    );
    if (ok == true && name.text.trim().isNotEmpty) {
      await context.read<AppState>().api.post('/medications', {
        'name': name.text.trim(),
        'dosage': dosage.text.trim(),
      });
      _refresh();
    }
  }

  Future<void> _delete(String id) async {
    await context.read<AppState>().api.delete('/medications/$id');
    _refresh();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('medications'))),
      floatingActionButton: FloatingActionButton(
        onPressed: _add,
        backgroundColor: AppColors.lavender,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: FutureBuilder<List>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snap.hasError) return ErrorView(onRetry: _refresh, message: snap.error.toString());
          final items = snap.data!;
          if (items.isEmpty) return EmptyView(icon: Icons.medication_outlined, message: l.t('empty'));
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
            children: items.map((m) {
              return Dismissible(
                key: ValueKey(m['id']),
                direction: DismissDirection.endToStart,
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 24),
                  child: const Icon(Icons.delete, color: Colors.redAccent),
                ),
                onDismissed: (_) => _delete(m['id']),
                child: SoftCard(
                  child: Row(
                    children: [
                      const CircleAvatar(backgroundColor: AppColors.lavenderLight, child: Icon(Icons.medication, color: AppColors.lavender)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(m['name'], style: const TextStyle(fontWeight: FontWeight.w600)),
                            if ((m['dosage'] ?? '').toString().isNotEmpty)
                              Text(m['dosage'], style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          );
        },
      ),
    );
  }
}
