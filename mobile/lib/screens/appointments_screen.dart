import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key});

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  late Future<List> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List> _load() async {
    final res = await context.read<AppState>().api.get('/appointments');
    return res['appointments'] as List;
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _add() async {
    final l = AppLocalizations.of(context);
    final title = TextEditingController();
    final doctor = TextEditingController();
    DateTime when = DateTime.now().add(const Duration(days: 1));

    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setD) => AlertDialog(
          title: Text(l.t('addAppointment')),
          content: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: title, decoration: InputDecoration(labelText: l.t('title'))),
            const SizedBox(height: 10),
            TextField(controller: doctor, decoration: InputDecoration(labelText: l.t('doctor'))),
            const SizedBox(height: 10),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(DateFormat.yMMMEd().add_jm().format(when)),
              trailing: const Icon(Icons.calendar_month),
              onTap: () async {
                final d = await showDatePicker(context: ctx, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 400)), initialDate: when);
                if (d == null) return;
                final t = await showTimePicker(context: ctx, initialTime: TimeOfDay.fromDateTime(when));
                setD(() => when = DateTime(d.year, d.month, d.day, t?.hour ?? 9, t?.minute ?? 0));
              },
            ),
          ]),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l.t('cancel'))),
            ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l.t('save'))),
          ],
        ),
      ),
    );
    if (ok == true && title.text.trim().isNotEmpty) {
      await context.read<AppState>().api.post('/appointments', {
        'title': title.text.trim(),
        'doctor': doctor.text.trim(),
        'datetime': when.toIso8601String(),
      });
      _refresh();
    }
  }

  Future<void> _delete(String id) async {
    await context.read<AppState>().api.delete('/appointments/$id');
    _refresh();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('appointments'))),
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
          if (items.isEmpty) return EmptyView(icon: Icons.event_busy, message: l.t('addAppointment'));
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
            children: items.map((a) {
              final dt = DateTime.tryParse(a['datetime'] ?? '');
              return Dismissible(
                key: ValueKey(a['id']),
                direction: DismissDirection.endToStart,
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 24),
                  child: const Icon(Icons.delete, color: Colors.redAccent),
                ),
                onDismissed: (_) => _delete(a['id']),
                child: SoftCard(
                  child: Row(
                    children: [
                      const CircleAvatar(backgroundColor: AppColors.lavenderLight, child: Icon(Icons.event, color: AppColors.lavender)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(a['title'], style: const TextStyle(fontWeight: FontWeight.w600)),
                            if (dt != null)
                              Text(DateFormat.yMMMEd().add_jm().format(dt),
                                  style: const TextStyle(color: AppColors.muted, fontSize: 13)),
                            if ((a['doctor'] ?? '').toString().isNotEmpty)
                              Text(a['doctor'], style: const TextStyle(color: AppColors.muted, fontSize: 12)),
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
