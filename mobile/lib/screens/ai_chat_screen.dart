import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class AiChatScreen extends StatefulWidget {
  const AiChatScreen({super.key});

  @override
  State<AiChatScreen> createState() => _AiChatScreenState();
}

class _AiChatScreenState extends State<AiChatScreen> {
  final _controller = TextEditingController();
  final _scroll = ScrollController();
  final List<Map<String, String>> _messages = [];
  bool _sending = false;
  bool _loadingHistory = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final res = await context.read<AppState>().api.get('/ai/history');
      final msgs = (res['messages'] as List);
      setState(() {
        _messages.addAll(msgs.map((m) => {'role': '${m['role']}', 'content': '${m['content']}'}));
        _loadingHistory = false;
      });
      _scrollDown();
    } catch (_) {
      setState(() => _loadingHistory = false);
    }
  }

  void _scrollDown() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(_scroll.position.maxScrollExtent,
            duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  Future<void> _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty || _sending) return;
    _controller.clear();
    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _sending = true;
    });
    _scrollDown();
    try {
      final state = context.read<AppState>();
      final res = await state.api.post('/ai/chat', {'message': text, 'lang': state.lang});
      setState(() => _messages.add({'role': 'assistant', 'content': '${res['reply']}'}));
    } catch (e) {
      setState(() => _messages.add({'role': 'assistant', 'content': e.toString()}));
    } finally {
      setState(() => _sending = false);
      _scrollDown();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('aiAssistant'))),
      body: Column(
        children: [
          Expanded(
            child: _loadingHistory
                ? const LoadingView()
                : _messages.isEmpty
                    ? _suggestions(l)
                    : ListView.builder(
                        controller: _scroll,
                        padding: const EdgeInsets.all(16),
                        itemCount: _messages.length,
                        itemBuilder: (context, i) => _bubble(_messages[i]),
                      ),
          ),
          if (_sending)
            const Padding(
              padding: EdgeInsets.only(bottom: 8),
              child: Text('…', style: TextStyle(color: AppColors.muted)),
            ),
          _composer(l),
        ],
      ),
    );
  }

  Widget _suggestions(AppLocalizations l) {
    final ideas = [
      'Tips for breastfeeding latch?',
      'How much should a newborn sleep?',
      'What milestones at 4 months?',
    ];
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const SizedBox(height: 12),
        const Center(child: Icon(Icons.smart_toy, size: 56, color: AppColors.lavender)),
        const SizedBox(height: 8),
        Center(child: Text(l.t('askAnything'), style: const TextStyle(color: AppColors.muted))),
        const SizedBox(height: 16),
        ...ideas.map((s) => SoftCard(
              onTap: () {
                _controller.text = s;
                _send();
              },
              child: Row(
                children: [
                  const Icon(Icons.chat_bubble_outline, color: AppColors.lavender),
                  const SizedBox(width: 12),
                  Expanded(child: Text(s)),
                ],
              ),
            )),
      ],
    );
  }

  Widget _bubble(Map<String, String> m) {
    final isUser = m['role'] == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 5),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.78),
        decoration: BoxDecoration(
          color: isUser ? AppColors.lavender : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isUser ? 16 : 4),
            bottomRight: Radius.circular(isUser ? 4 : 16),
          ),
        ),
        child: Text(m['content'] ?? '',
            style: TextStyle(color: isUser ? Colors.white : AppColors.ink)),
      ),
    );
  }

  Widget _composer(AppLocalizations l) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
      color: Colors.white,
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _send(),
                decoration: InputDecoration(
                  hintText: l.t('askAnything'),
                  fillColor: AppColors.surface,
                ),
              ),
            ),
            const SizedBox(width: 8),
            CircleAvatar(
              backgroundColor: AppColors.lavender,
              child: IconButton(
                icon: const Icon(Icons.send, color: Colors.white),
                onPressed: _send,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
