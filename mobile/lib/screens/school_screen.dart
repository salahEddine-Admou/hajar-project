import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';
import '../widgets/common.dart';

class SchoolScreen extends StatefulWidget {
  const SchoolScreen({super.key});

  @override
  State<SchoolScreen> createState() => _SchoolScreenState();
}

class _SchoolScreenState extends State<SchoolScreen> {
  List _students = [];
  Map<String, dynamic>? _selected;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    final res = await context.read<AppState>().api.get('/school/students');
    if (!mounted) return;
    setState(() {
      _students = res['students'] as List;
      _selected = _students.isNotEmpty
          ? (_students.firstWhere(
              (s) => s['id'] == _selected?['id'],
              orElse: () => _students.first,
            ) as Map<String, dynamic>)
          : null;
      _loading = false;
    });
  }

  Future<void> _addStudent() async {
    final added = await showDialog<bool>(
      context: context,
      builder: (_) => const _AddStudentDialog(),
    );
    if (added == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return GradientScaffold(
      appBar: AppBar(
        title: Text(l.t('school')),
        actions: [
          IconButton(onPressed: _addStudent, icon: const Icon(Icons.person_add_alt_1)),
        ],
      ),
      body: _loading
          ? const LoadingView()
          : _students.isEmpty
              ? _EmptyStudents(onAdd: _addStudent)
              : DefaultTabController(
                  length: 5,
                  child: Column(
                    children: [
                      SizedBox(
                        height: 48,
                        child: ListView(
                          scrollDirection: Axis.horizontal,
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          children: _students.map((s) {
                            final sel = s['id'] == _selected?['id'];
                            return Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                label: Text('🎒 ${s['name']}'),
                                selected: sel,
                                onSelected: (_) => setState(() => _selected = s as Map<String, dynamic>),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                      TabBar(
                        isScrollable: true,
                        labelColor: AppColors.lavender,
                        unselectedLabelColor: AppColors.muted,
                        indicatorColor: AppColors.lavender,
                        tabs: [
                          Tab(text: l.t('overview')),
                          Tab(text: l.t('grades')),
                          Tab(text: l.t('assignments')),
                          Tab(text: l.t('attendance')),
                          Tab(text: l.t('timetable')),
                        ],
                      ),
                      Expanded(
                        child: TabBarView(
                          children: [
                            _OverviewTab(student: _selected!),
                            _GradesTab(student: _selected!),
                            _AssignmentsTab(student: _selected!),
                            _AttendanceTab(student: _selected!),
                            _TimetableTab(student: _selected!),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
    );
  }
}

class _EmptyStudents extends StatelessWidget {
  const _EmptyStudents({required this.onAdd});
  final VoidCallback onAdd;
  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.school, size: 56, color: AppColors.lavender),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Text(l.t('noStudents'), textAlign: TextAlign.center, style: const TextStyle(color: AppColors.muted)),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(onPressed: onAdd, icon: const Icon(Icons.add), label: Text(l.t('addStudent'))),
        ],
      ),
    );
  }
}

// ---------------- Overview ----------------
class _OverviewTab extends StatefulWidget {
  const _OverviewTab({required this.student});
  final Map<String, dynamic> student;
  @override
  State<_OverviewTab> createState() => _OverviewTabState();
}

class _OverviewTabState extends State<_OverviewTab> {
  Map<String, dynamic>? _summary;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant _OverviewTab old) {
    super.didUpdateWidget(old);
    if (old.student['id'] != widget.student['id']) _load();
  }

  Future<void> _load() async {
    final res = await context.read<AppState>().api.get('/school/students/${widget.student['id']}/summary');
    if (!mounted) return;
    setState(() => _summary = res as Map<String, dynamic>);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final s = _summary;
    if (s == null) return const LoadingView();
    final att = s['attendance'] as Map<String, dynamic>;
    final asg = s['assignments'] as Map<String, dynamic>;
    final subjects = (s['subjects'] as List);
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        Row(
          children: [
            Expanded(child: _Stat(label: l.t('overall'), value: s['overall'] != null ? '${s['overall']}%' : '—', color: AppColors.lavender, icon: Icons.bar_chart)),
            const SizedBox(width: 10),
            Expanded(child: _Stat(label: l.t('attendanceRate'), value: att['rate'] != null ? '${att['rate']}%' : '—', color: AppColors.mint, icon: Icons.check_circle)),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(child: _Stat(label: l.t('pending'), value: '${asg['pending']}', color: AppColors.peach, icon: Icons.assignment)),
            const SizedBox(width: 10),
            Expanded(child: _Stat(label: l.t('overdue'), value: '${asg['overdue']}', color: AppColors.blush, icon: Icons.warning_amber)),
          ],
        ),
        const SizedBox(height: 8),
        SectionTitle(l.t('subjectAverages'), icon: Icons.subject),
        if (subjects.isEmpty)
          SoftCard(child: Text(l.t('empty'), style: const TextStyle(color: AppColors.muted)))
        else
          ...subjects.map((sub) {
            final avg = (sub['average'] as num).toDouble();
            return SoftCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(sub['subject'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                      Text('${sub['average']}%', style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.lavender)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: (avg / 100).clamp(0, 1),
                      minHeight: 8,
                      backgroundColor: AppColors.lavenderLight,
                      color: avg >= 50 ? AppColors.mint : AppColors.blush,
                    ),
                  ),
                ],
              ),
            );
          }),
      ],
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value, required this.color, required this.icon});
  final String label;
  final String value;
  final Color color;
  final IconData icon;
  @override
  Widget build(BuildContext context) {
    return SoftCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.ink)),
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.muted)),
        ],
      ),
    );
  }
}

// ---------------- Grades ----------------
class _GradesTab extends StatefulWidget {
  const _GradesTab({required this.student});
  final Map<String, dynamic> student;
  @override
  State<_GradesTab> createState() => _GradesTabState();
}

class _GradesTabState extends State<_GradesTab> {
  List _grades = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant _GradesTab old) {
    super.didUpdateWidget(old);
    if (old.student['id'] != widget.student['id']) _load();
  }

  Future<void> _load() async {
    final res = await context.read<AppState>().api.get('/school/grades', query: {'studentId': widget.student['id']});
    if (!mounted) return;
    setState(() {
      _grades = res['grades'] as List;
      _loading = false;
    });
  }

  Future<void> _add() async {
    final added = await showDialog<bool>(
      context: context,
      builder: (_) => _AddGradeDialog(studentId: widget.student['id']),
    );
    if (added == true) _load();
  }

  Future<void> _delete(String id) async {
    await context.read<AppState>().api.delete('/school/grades/$id');
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    if (_loading) return const LoadingView();
    return Stack(
      children: [
        ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
          children: [
            if (_grades.isEmpty) EmptyView(message: l.t('empty')),
            ..._grades.map((g) => SoftCard(
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: AppColors.lavenderLight,
                        child: Text('${g['percent']}', style: const TextStyle(fontSize: 12, color: AppColors.lavender, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(g['subject'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                            Text('${g['score']} / ${g['max']}${(g['term'] ?? '').isNotEmpty ? ' • ${g['term']}' : ''}',
                                style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                          ],
                        ),
                      ),
                      IconButton(icon: const Icon(Icons.delete_outline, color: AppColors.muted), onPressed: () => _delete(g['id'])),
                    ],
                  ),
                )),
          ],
        ),
        Positioned(
          right: 16,
          bottom: 16,
          child: FloatingActionButton.extended(onPressed: _add, icon: const Icon(Icons.add), label: Text(l.t('addGrade'))),
        ),
      ],
    );
  }
}

// ---------------- Assignments ----------------
class _AssignmentsTab extends StatefulWidget {
  const _AssignmentsTab({required this.student});
  final Map<String, dynamic> student;
  @override
  State<_AssignmentsTab> createState() => _AssignmentsTabState();
}

class _AssignmentsTabState extends State<_AssignmentsTab> {
  List _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant _AssignmentsTab old) {
    super.didUpdateWidget(old);
    if (old.student['id'] != widget.student['id']) _load();
  }

  Future<void> _load() async {
    final res = await context.read<AppState>().api.get('/school/assignments', query: {'studentId': widget.student['id']});
    if (!mounted) return;
    setState(() {
      _items = res['assignments'] as List;
      _loading = false;
    });
  }

  Future<void> _toggle(Map a) async {
    await context.read<AppState>().api.patch('/school/assignments/${a['id']}', {'done': !(a['done'] == true)});
    _load();
  }

  Future<void> _delete(String id) async {
    await context.read<AppState>().api.delete('/school/assignments/$id');
    _load();
  }

  Future<void> _add() async {
    final added = await showDialog<bool>(
      context: context,
      builder: (_) => _AddAssignmentDialog(studentId: widget.student['id']),
    );
    if (added == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    if (_loading) return const LoadingView();
    return Stack(
      children: [
        ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
          children: [
            if (_items.isEmpty) EmptyView(message: l.t('empty')),
            ..._items.map((a) {
              final done = a['done'] == true;
              final isExam = a['type'] == 'exam';
              DateTime? due = a['dueDate'] != null ? DateTime.tryParse(a['dueDate']) : null;
              final overdue = !done && due != null && due.isBefore(DateTime.now());
              return SoftCard(
                child: Row(
                  children: [
                    Checkbox(value: done, onChanged: (_) => _toggle(a)),
                    Icon(isExam ? Icons.menu_book : Icons.edit_note, color: AppColors.lavender),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            a['title'] ?? '',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              decoration: done ? TextDecoration.lineThrough : null,
                              color: done ? AppColors.muted : AppColors.ink,
                            ),
                          ),
                          if ((a['subject'] ?? '').isNotEmpty)
                            Text(a['subject'], style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                        ],
                      ),
                    ),
                    if (due != null)
                      Text('${due.day}/${due.month}',
                          style: TextStyle(fontSize: 12, color: overdue ? AppColors.blush : AppColors.muted, fontWeight: FontWeight.w600)),
                    IconButton(icon: const Icon(Icons.delete_outline, color: AppColors.muted), onPressed: () => _delete(a['id'])),
                  ],
                ),
              );
            }),
          ],
        ),
        Positioned(
          right: 16,
          bottom: 16,
          child: FloatingActionButton.extended(onPressed: _add, icon: const Icon(Icons.add), label: Text(l.t('addAssignment'))),
        ),
      ],
    );
  }
}

// ---------------- Attendance ----------------
class _AttendanceTab extends StatefulWidget {
  const _AttendanceTab({required this.student});
  final Map<String, dynamic> student;
  @override
  State<_AttendanceTab> createState() => _AttendanceTabState();
}

class _AttendanceTabState extends State<_AttendanceTab> {
  List _records = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant _AttendanceTab old) {
    super.didUpdateWidget(old);
    if (old.student['id'] != widget.student['id']) _load();
  }

  Future<void> _load() async {
    final res = await context.read<AppState>().api.get('/school/attendance', query: {'studentId': widget.student['id']});
    if (!mounted) return;
    setState(() {
      _records = res['attendance'] as List;
      _loading = false;
    });
  }

  Future<void> _mark(String status) async {
    await context.read<AppState>().api.post('/school/attendance', {
      'studentId': widget.student['id'],
      'status': status,
      'date': DateTime.now().toIso8601String(),
    });
    _load();
  }

  Future<void> _delete(String id) async {
    await context.read<AppState>().api.delete('/school/attendance/$id');
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    if (_loading) return const LoadingView();
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      children: [
        SoftCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(l.t('markAttendance'), style: const TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(child: _AttBtn(color: AppColors.mint, label: l.t('present'), onTap: () => _mark('present'))),
                  const SizedBox(width: 8),
                  Expanded(child: _AttBtn(color: AppColors.peach, label: l.t('late'), onTap: () => _mark('late'))),
                  const SizedBox(width: 8),
                  Expanded(child: _AttBtn(color: AppColors.blush, label: l.t('absent'), onTap: () => _mark('absent'))),
                ],
              ),
            ],
          ),
        ),
        SectionTitle(l.t('history'), icon: Icons.history),
        if (_records.isEmpty) EmptyView(message: l.t('empty')),
        ..._records.map((r) {
          final status = r['status'];
          final color = status == 'present' ? AppColors.mint : status == 'late' ? AppColors.peach : AppColors.blush;
          final dt = DateTime.tryParse(r['date'] ?? '');
          return SoftCard(
            child: Row(
              children: [
                CircleAvatar(radius: 6, backgroundColor: color),
                const SizedBox(width: 12),
                Expanded(child: Text(l.t(status), style: const TextStyle(fontWeight: FontWeight.w600))),
                Text(dt != null ? '${dt.day}/${dt.month}' : '', style: const TextStyle(color: AppColors.muted, fontSize: 12)),
                IconButton(icon: const Icon(Icons.delete_outline, color: AppColors.muted), onPressed: () => _delete(r['id'])),
              ],
            ),
          );
        }),
      ],
    );
  }
}

class _AttBtn extends StatelessWidget {
  const _AttBtn({required this.color, required this.label, required this.onTap});
  final Color color;
  final String label;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) {
    return Material(
      color: color.withValues(alpha: 0.25),
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Center(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, color: AppColors.ink))),
        ),
      ),
    );
  }
}

// ---------------- Timetable ----------------
class _TimetableTab extends StatefulWidget {
  const _TimetableTab({required this.student});
  final Map<String, dynamic> student;
  @override
  State<_TimetableTab> createState() => _TimetableTabState();
}

class _TimetableTabState extends State<_TimetableTab> {
  List _entries = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant _TimetableTab old) {
    super.didUpdateWidget(old);
    if (old.student['id'] != widget.student['id']) _load();
  }

  Future<void> _load() async {
    final res = await context.read<AppState>().api.get('/school/timetable', query: {'studentId': widget.student['id']});
    if (!mounted) return;
    setState(() {
      _entries = res['timetable'] as List;
      _loading = false;
    });
  }

  Future<void> _add() async {
    final added = await showDialog<bool>(
      context: context,
      builder: (_) => _AddClassDialog(studentId: widget.student['id']),
    );
    if (added == true) _load();
  }

  Future<void> _delete(String id) async {
    await context.read<AppState>().api.delete('/school/timetable/$id');
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    if (_loading) return const LoadingView();
    final days = l.t('weekDays').split(',');
    return Stack(
      children: [
        ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 90),
          children: [
            if (_entries.isEmpty) EmptyView(message: l.t('empty')),
            ...List.generate(days.length, (d) {
              final dayEntries = _entries.where((e) => e['day'] == d).toList();
              if (dayEntries.isEmpty) return const SizedBox.shrink();
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SectionTitle(days[d]),
                  ...dayEntries.map((e) => SoftCard(
                        child: Row(
                          children: [
                            const Icon(Icons.book, color: AppColors.lavender),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(e['subject'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600)),
                                  Text(
                                    [
                                      [e['startTime'], e['endTime']].where((x) => (x ?? '').isNotEmpty).join('–'),
                                      e['room'] ?? '',
                                    ].where((x) => x.toString().isNotEmpty).join(' • '),
                                    style: const TextStyle(color: AppColors.muted, fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                            IconButton(icon: const Icon(Icons.delete_outline, color: AppColors.muted), onPressed: () => _delete(e['id'])),
                          ],
                        ),
                      )),
                ],
              );
            }),
          ],
        ),
        Positioned(
          right: 16,
          bottom: 16,
          child: FloatingActionButton.extended(onPressed: _add, icon: const Icon(Icons.add), label: Text(l.t('addClass'))),
        ),
      ],
    );
  }
}

// ---------------- Dialogs ----------------
class _AddStudentDialog extends StatefulWidget {
  const _AddStudentDialog();
  @override
  State<_AddStudentDialog> createState() => _AddStudentDialogState();
}

class _AddStudentDialogState extends State<_AddStudentDialog> {
  final _name = TextEditingController();
  final _school = TextEditingController();
  final _grade = TextEditingController();
  final _teacher = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _name.dispose();
    _school.dispose();
    _grade.dispose();
    _teacher.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_name.text.trim().isEmpty) return;
    setState(() => _saving = true);
    await context.read<AppState>().api.post('/school/students', {
      'name': _name.text.trim(),
      'schoolName': _school.text.trim(),
      'grade': _grade.text.trim(),
      'teacher': _teacher.text.trim(),
    });
    if (mounted) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return AlertDialog(
      title: Text(l.t('addStudent')),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: _name, decoration: InputDecoration(labelText: l.t('students'))),
            const SizedBox(height: 8),
            TextField(controller: _school, decoration: InputDecoration(labelText: l.t('schoolName'))),
            const SizedBox(height: 8),
            TextField(controller: _grade, decoration: InputDecoration(labelText: l.t('grade'))),
            const SizedBox(height: 8),
            TextField(controller: _teacher, decoration: InputDecoration(labelText: l.t('teacher'))),
          ],
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(l.t('cancel'))),
        ElevatedButton(onPressed: _saving ? null : _save, child: Text(l.t('save'))),
      ],
    );
  }
}

class _AddGradeDialog extends StatefulWidget {
  const _AddGradeDialog({required this.studentId});
  final String studentId;
  @override
  State<_AddGradeDialog> createState() => _AddGradeDialogState();
}

class _AddGradeDialogState extends State<_AddGradeDialog> {
  final _subject = TextEditingController();
  final _score = TextEditingController();
  final _max = TextEditingController(text: '20');
  final _term = TextEditingController();

  @override
  void dispose() {
    _subject.dispose();
    _score.dispose();
    _max.dispose();
    _term.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_subject.text.trim().isEmpty || _score.text.trim().isEmpty) return;
    await context.read<AppState>().api.post('/school/grades', {
      'studentId': widget.studentId,
      'subject': _subject.text.trim(),
      'score': double.tryParse(_score.text) ?? 0,
      'max': double.tryParse(_max.text) ?? 20,
      'term': _term.text.trim(),
    });
    if (mounted) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return AlertDialog(
      title: Text(l.t('addGrade')),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(controller: _subject, decoration: InputDecoration(labelText: l.t('subject'))),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: TextField(controller: _score, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: l.t('score')))),
              const SizedBox(width: 8),
              Expanded(child: TextField(controller: _max, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: l.t('outOf')))),
            ],
          ),
          const SizedBox(height: 8),
          TextField(controller: _term, decoration: InputDecoration(labelText: l.t('term'))),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(l.t('cancel'))),
        ElevatedButton(onPressed: _save, child: Text(l.t('save'))),
      ],
    );
  }
}

class _AddAssignmentDialog extends StatefulWidget {
  const _AddAssignmentDialog({required this.studentId});
  final String studentId;
  @override
  State<_AddAssignmentDialog> createState() => _AddAssignmentDialogState();
}

class _AddAssignmentDialogState extends State<_AddAssignmentDialog> {
  final _title = TextEditingController();
  final _subject = TextEditingController();
  String _type = 'homework';
  DateTime? _due;

  @override
  void dispose() {
    _title.dispose();
    _subject.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final d = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 2),
    );
    if (d != null) setState(() => _due = d);
  }

  Future<void> _save() async {
    if (_title.text.trim().isEmpty) return;
    await context.read<AppState>().api.post('/school/assignments', {
      'studentId': widget.studentId,
      'title': _title.text.trim(),
      'subject': _subject.text.trim(),
      'type': _type,
      'dueDate': _due?.toIso8601String(),
    });
    if (mounted) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    return AlertDialog(
      title: Text(l.t('addAssignment')),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(controller: _title, decoration: InputDecoration(labelText: l.t('title'))),
          const SizedBox(height: 8),
          TextField(controller: _subject, decoration: InputDecoration(labelText: l.t('subject'))),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: DropdownButton<String>(
                  value: _type,
                  isExpanded: true,
                  items: [
                    DropdownMenuItem(value: 'homework', child: Text(l.t('homework'))),
                    DropdownMenuItem(value: 'exam', child: Text(l.t('exam'))),
                  ],
                  onChanged: (v) => setState(() => _type = v ?? 'homework'),
                ),
              ),
              const SizedBox(width: 8),
              TextButton.icon(
                onPressed: _pickDate,
                icon: const Icon(Icons.calendar_today, size: 16),
                label: Text(_due != null ? '${_due!.day}/${_due!.month}' : l.t('dueDate')),
              ),
            ],
          ),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(l.t('cancel'))),
        ElevatedButton(onPressed: _save, child: Text(l.t('save'))),
      ],
    );
  }
}

class _AddClassDialog extends StatefulWidget {
  const _AddClassDialog({required this.studentId});
  final String studentId;
  @override
  State<_AddClassDialog> createState() => _AddClassDialogState();
}

class _AddClassDialogState extends State<_AddClassDialog> {
  final _subject = TextEditingController();
  final _room = TextEditingController();
  int _day = 0;
  TimeOfDay? _start;
  TimeOfDay? _end;

  @override
  void dispose() {
    _subject.dispose();
    _room.dispose();
    super.dispose();
  }

  String _fmt(TimeOfDay? t) => t == null ? '--:--' : '${t.hour.toString().padLeft(2, '0')}:${t.minute.toString().padLeft(2, '0')}';

  Future<void> _save() async {
    if (_subject.text.trim().isEmpty) return;
    await context.read<AppState>().api.post('/school/timetable', {
      'studentId': widget.studentId,
      'day': _day,
      'subject': _subject.text.trim(),
      'startTime': _start != null ? _fmt(_start) : '',
      'endTime': _end != null ? _fmt(_end) : '',
      'room': _room.text.trim(),
    });
    if (mounted) Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final days = l.t('weekDays').split(',');
    return AlertDialog(
      title: Text(l.t('addClass')),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Text('${l.t('day')}: ', style: const TextStyle(color: AppColors.muted)),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButton<int>(
                  value: _day,
                  isExpanded: true,
                  items: List.generate(days.length, (i) => DropdownMenuItem(value: i, child: Text(days[i]))),
                  onChanged: (v) => setState(() => _day = v ?? 0),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          TextField(controller: _subject, decoration: InputDecoration(labelText: l.t('subject'))),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: TextButton(
                  onPressed: () async {
                    final t = await showTimePicker(context: context, initialTime: TimeOfDay.now());
                    if (t != null) setState(() => _start = t);
                  },
                  child: Text('${l.t('startTime')}: ${_fmt(_start)}'),
                ),
              ),
              Expanded(
                child: TextButton(
                  onPressed: () async {
                    final t = await showTimePicker(context: context, initialTime: TimeOfDay.now());
                    if (t != null) setState(() => _end = t);
                  },
                  child: Text('${l.t('endTime')}: ${_fmt(_end)}'),
                ),
              ),
            ],
          ),
          TextField(controller: _room, decoration: InputDecoration(labelText: l.t('room'))),
        ],
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(l.t('cancel'))),
        ElevatedButton(onPressed: _save, child: Text(l.t('save'))),
      ],
    );
  }
}
