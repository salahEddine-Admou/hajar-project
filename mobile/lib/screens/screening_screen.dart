import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class ScreeningScreen extends StatefulWidget {
  const ScreeningScreen({super.key});

  @override
  State<ScreeningScreen> createState() => _ScreeningScreenState();
}

class _ScreeningScreenState extends State<ScreeningScreen> {
  late Future<Map<String, dynamic>> _future;
  final Map<int, int> _answers = {};
  Map<String, dynamic>? _result;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<Map<String, dynamic>> _load() async {
    final state = context.read<AppState>();
    final res = await state.api.get('/wellness/screening/epds', query: {'lang': state.lang});
    return Map<String, dynamic>.from(res);
  }

  Future<void> _submit(List questions) async {
    setState(() => _submitting = true);
    final state = context.read<AppState>();
    final answers = questions
        .map((q) => {'id': q['id'], 'value': _answers[q['id']] ?? 0})
        .toList();
    final res = await state.api.post('/wellness/screening/epds?lang=${state.lang}', {'answers': answers});
    setState(() {
      _result = Map<String, dynamic>.from(res);
      _submitting = false;
    });
  }

  Color _riskColor(String risk) {
    switch (risk) {
      case 'high':
        return Colors.redAccent;
      case 'moderate':
        return AppColors.peach;
      default:
        return AppColors.mint;
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('screening'))),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snap.hasError) return ErrorView(onRetry: () => setState(() => _future = _load()), message: snap.error.toString());
          final questions = (snap.data!['questions'] as List);

          if (_result != null) return _buildResult(l);

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            children: [
              SoftCard(
                color: AppColors.lavenderLight,
                child: Text(l.t('disclaimer'), style: const TextStyle(fontSize: 12, color: AppColors.ink)),
              ),
              const SizedBox(height: 8),
              ...questions.asMap().entries.map((e) {
                final idx = e.key;
                final q = e.value;
                final id = q['id'] as int;
                return SoftCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${idx + 1}. ${q['text']}', style: const TextStyle(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Wrap(
                        spacing: 8,
                        children: List.generate(4, (v) {
                          final selected = _answers[id] == v;
                          return ChoiceChip(
                            label: Text('$v'),
                            selected: selected,
                            selectedColor: AppColors.lavender,
                            labelStyle: TextStyle(color: selected ? Colors.white : AppColors.ink),
                            onSelected: (_) => setState(() => _answers[id] = v),
                          );
                        }),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _submitting ? null : () => _submit(questions),
                  child: _submitting
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text(l.t('save')),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildResult(AppLocalizations l) {
    final result = _result!['result'];
    final tips = (_result!['tips'] as List?) ?? [];
    final risk = result['risk'] as String;
    final riskLabel = {
      'low': l.t('riskLow'),
      'moderate': l.t('riskModerate'),
      'high': l.t('riskHigh'),
    }[risk]!;
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      children: [
        SoftCard(
          color: _riskColor(risk),
          child: Column(
            children: [
              Text('${l.t('yourScore')}: ${result['total']} / 30',
                  style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text(riskLabel, style: const TextStyle(color: Colors.white, fontSize: 16)),
            ],
          ),
        ),
        if (result['flagSelfHarm'] == true)
          SoftCard(
            color: Colors.red.shade50,
            child: Row(
              children: [
                const Icon(Icons.warning_amber_rounded, color: Colors.redAccent),
                const SizedBox(width: 10),
                Expanded(child: Text(l.t('riskHigh'), style: const TextStyle(color: Colors.redAccent))),
              ],
            ),
          ),
        const SizedBox(height: 8),
        SectionTitle(l.t('recommendations'), icon: Icons.tips_and_updates),
        ...tips.map((t) => SoftCard(
              child: Row(
                children: [
                  const Icon(Icons.favorite, color: AppColors.blush),
                  const SizedBox(width: 12),
                  Expanded(child: Text(t.toString())),
                ],
              ),
            )),
        const SizedBox(height: 12),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l.t('cancel')),
          ),
        ),
      ],
    );
  }
}
