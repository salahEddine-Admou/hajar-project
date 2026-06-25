import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class RecordsScreen extends StatefulWidget {
  const RecordsScreen({super.key});

  @override
  State<RecordsScreen> createState() => _RecordsScreenState();
}

class _RecordsScreenState extends State<RecordsScreen> {
  late Future<List> _future;
  bool _exporting = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List> _load() async {
    final res = await context.read<AppState>().api.get('/records');
    return res['records'] as List;
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _add() async {
    final l = AppLocalizations.of(context);
    final title = TextEditingController();
    final notes = TextEditingController();
    String type = 'document';
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setD) => AlertDialog(
          title: Text(l.t('addRecord')),
          content: Column(mainAxisSize: MainAxisSize.min, children: [
            TextField(controller: title, decoration: InputDecoration(labelText: l.t('title'))),
            const SizedBox(height: 10),
            TextField(controller: notes, maxLines: 2, decoration: const InputDecoration(labelText: 'Notes')),
            const SizedBox(height: 10),
            Wrap(spacing: 8, children: ['document', 'lab', 'prescription', 'ultrasound'].map((t) {
              return ChoiceChip(label: Text(t), selected: type == t, onSelected: (_) => setD(() => type = t));
            }).toList()),
          ]),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(l.t('cancel'))),
            ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l.t('save'))),
          ],
        ),
      ),
    );
    if (ok == true && title.text.trim().isNotEmpty) {
      await context.read<AppState>().api.post('/records', {
        'title': title.text.trim(),
        'type': type,
        'notes': notes.text.trim(),
      });
      _refresh();
    }
  }

  Future<void> _exportPdf() async {
    setState(() => _exporting = true);
    try {
      final bytes = await context.read<AppState>().api.getBytes('/records/export/pdf');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('PDF: ${bytes.length} bytes generated')),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    } finally {
      if (mounted) setState(() => _exporting = false);
    }
  }

  Future<void> _delete(String id) async {
    await context.read<AppState>().api.delete('/records/$id');
    _refresh();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(
        title: Text(l.t('healthRecords')),
        actions: [
          IconButton(
            onPressed: _exporting ? null : _exportPdf,
            icon: _exporting
                ? const SizedBox(height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                : const Icon(Icons.picture_as_pdf),
            tooltip: l.t('exportPdf'),
          ),
        ],
      ),
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
          if (items.isEmpty) return EmptyView(icon: Icons.folder_open, message: l.t('addRecord'));
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
            children: items.map((r) {
              return Dismissible(
                key: ValueKey(r['id']),
                direction: DismissDirection.endToStart,
                background: Container(
                  alignment: Alignment.centerRight,
                  padding: const EdgeInsets.only(right: 24),
                  child: const Icon(Icons.delete, color: Colors.redAccent),
                ),
                onDismissed: (_) => _delete(r['id']),
                child: SoftCard(
                  child: Row(
                    children: [
                      const CircleAvatar(backgroundColor: AppColors.lavenderLight, child: Icon(Icons.description, color: AppColors.lavender)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(r['title'], style: const TextStyle(fontWeight: FontWeight.w600)),
                            Text('${r['type']} • ${r['date']}',
                                style: const TextStyle(color: AppColors.muted, fontSize: 12)),
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
