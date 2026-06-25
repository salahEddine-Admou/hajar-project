import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  late Future<List> _future;
  String? _group;

  static const _groups = ['pregnancy', 'newborn', 'breastfeeding', 'sleep', 'mental-health', 'nutrition', 'expert-qa'];

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<List> _load() async {
    final res = await context.read<AppState>().api.get('/community/posts',
        query: _group != null ? {'group': _group} : null);
    return res['posts'] as List;
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _newPost() async {
    final l = AppLocalizations.of(context);
    final title = TextEditingController();
    final body = TextEditingController();
    String group = _group ?? 'pregnancy';
    final ok = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(ctx).viewInsets.bottom + 20),
        child: StatefulBuilder(
          builder: (ctx, setS) => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SectionTitle(l.t('newPost'), icon: Icons.edit),
              TextField(controller: title, decoration: InputDecoration(labelText: l.t('title'))),
              const SizedBox(height: 10),
              TextField(controller: body, maxLines: 4, decoration: const InputDecoration(labelText: '...')),
              const SizedBox(height: 10),
              Wrap(spacing: 6, children: _groups.map((g) {
                return ChoiceChip(label: Text(g), selected: group == g, onSelected: (_) => setS(() => group = g));
              }).toList()),
              const SizedBox(height: 16),
              SizedBox(width: double.infinity, child: ElevatedButton(onPressed: () => Navigator.pop(ctx, true), child: Text(l.t('save')))),
            ],
          ),
        ),
      ),
    );
    if (ok == true && title.text.trim().isNotEmpty && body.text.trim().isNotEmpty) {
      await context.read<AppState>().api.post('/community/posts', {
        'title': title.text.trim(),
        'body': body.text.trim(),
        'group': group,
      });
      _refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('community'))),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _newPost,
        backgroundColor: AppColors.lavender,
        icon: const Icon(Icons.add, color: Colors.white),
        label: Text(l.t('newPost'), style: const TextStyle(color: Colors.white)),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: ChoiceChip(
                    label: const Text('All'),
                    selected: _group == null,
                    onSelected: (_) => setState(() {
                      _group = null;
                      _future = _load();
                    }),
                  ),
                ),
                ..._groups.map((g) => Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: ChoiceChip(
                        label: Text(g),
                        selected: _group == g,
                        onSelected: (_) => setState(() {
                          _group = g;
                          _future = _load();
                        }),
                      ),
                    )),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<List>(
              future: _future,
              builder: (context, snap) {
                if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
                if (snap.hasError) return ErrorView(onRetry: _refresh, message: snap.error.toString());
                final posts = snap.data!;
                if (posts.isEmpty) return EmptyView(icon: Icons.forum, message: l.t('newPost'));
                return ListView(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 90),
                  children: posts.map((p) => SoftCard(
                        onTap: () async {
                          await Navigator.push(context, MaterialPageRoute(builder: (_) => PostDetailScreen(postId: p['id'])));
                          _refresh();
                        },
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Chip(label: Text(p['group'], style: const TextStyle(fontSize: 11)), visualDensity: VisualDensity.compact),
                                if (p['expert'] == true)
                                  const Padding(
                                    padding: EdgeInsets.only(left: 6),
                                    child: Icon(Icons.verified, size: 16, color: AppColors.lavender),
                                  ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(p['title'], style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                            const SizedBox(height: 4),
                            Text(p['body'], maxLines: 2, overflow: TextOverflow.ellipsis,
                                style: const TextStyle(color: AppColors.muted)),
                            const SizedBox(height: 8),
                            Row(
                              children: [
                                Text(p['authorName'] ?? '', style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                                const Spacer(),
                                const Icon(Icons.favorite, size: 14, color: AppColors.blush),
                                Text(' ${p['likes'] ?? 0}', style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                                const SizedBox(width: 10),
                                const Icon(Icons.chat_bubble_outline, size: 14, color: AppColors.muted),
                                Text(' ${p['replyCount'] ?? 0}', style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                              ],
                            ),
                          ],
                        ),
                      )).toList(),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class PostDetailScreen extends StatefulWidget {
  const PostDetailScreen({super.key, required this.postId});
  final String postId;

  @override
  State<PostDetailScreen> createState() => _PostDetailScreenState();
}

class _PostDetailScreenState extends State<PostDetailScreen> {
  late Future<Map<String, dynamic>> _future;
  final _reply = TextEditingController();

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<Map<String, dynamic>> _load() async {
    final res = await context.read<AppState>().api.get('/community/posts/${widget.postId}');
    return Map<String, dynamic>.from(res);
  }

  void _refresh() => setState(() => _future = _load());

  Future<void> _like() async {
    await context.read<AppState>().api.post('/community/posts/${widget.postId}/like');
    _refresh();
  }

  Future<void> _sendReply() async {
    final text = _reply.text.trim();
    if (text.isEmpty) return;
    _reply.clear();
    await context.read<AppState>().api.post('/community/posts/${widget.postId}/replies', {'body': text});
    _refresh();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(title: Text(l.t('community'))),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snap) {
          if (snap.connectionState == ConnectionState.waiting) return const LoadingView();
          if (snap.hasError) return ErrorView(onRetry: _refresh, message: snap.error.toString());
          final post = snap.data!['post'];
          final replies = (snap.data!['replies'] as List);
          return Column(
            children: [
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  children: [
                    SoftCard(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(post['title'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                          const SizedBox(height: 6),
                          Text(post['body']),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              Text(post['authorName'] ?? '', style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                              const Spacer(),
                              TextButton.icon(
                                onPressed: _like,
                                icon: const Icon(Icons.favorite, color: AppColors.blush, size: 18),
                                label: Text('${post['likes'] ?? 0}'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    SectionTitle('${replies.length} ${l.t('replies')}', icon: Icons.chat),
                    ...replies.map((r) => SoftCard(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(r['authorName'] ?? '', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.lavender)),
                              const SizedBox(height: 4),
                              Text(r['body']),
                            ],
                          ),
                        )),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 12),
                color: Colors.white,
                child: SafeArea(
                  top: false,
                  child: Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _reply,
                          decoration: InputDecoration(hintText: l.t('reply'), fillColor: AppColors.surface),
                          onSubmitted: (_) => _sendReply(),
                        ),
                      ),
                      const SizedBox(width: 8),
                      CircleAvatar(
                        backgroundColor: AppColors.lavender,
                        child: IconButton(icon: const Icon(Icons.send, color: Colors.white), onPressed: _sendReply),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
