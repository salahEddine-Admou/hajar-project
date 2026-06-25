import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../l10n/app_localizations.dart';
import '../providers/app_state.dart';
import '../theme.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _controller = PageController();
  int _page = 0;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l = AppLocalizations.of(context);
    final slides = [
      _Slide(icon: Icons.pregnant_woman, color: AppColors.lavender, title: l.t('onbTitle1'), body: l.t('onbBody1')),
      _Slide(icon: Icons.child_care, color: AppColors.mint, title: l.t('onbTitle2'), body: l.t('onbBody2')),
      _Slide(icon: Icons.spa, color: AppColors.blush, title: l.t('onbTitle3'), body: l.t('onbBody3')),
    ];
    final isLast = _page == slides.length - 1;

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppColors.lavenderLight, AppColors.surface],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Align(
                alignment: AlignmentDirectional.centerEnd,
                child: TextButton(
                  onPressed: () => context.read<AppState>().completeOnboarding(),
                  child: Text(l.t('skip')),
                ),
              ),
              Expanded(
                child: PageView.builder(
                  controller: _controller,
                  itemCount: slides.length,
                  onPageChanged: (i) => setState(() => _page = i),
                  itemBuilder: (_, i) => slides[i],
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(slides.length, (i) {
                  final active = i == _page;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 250),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: active ? 22 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: active ? AppColors.lavender : AppColors.muted.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  );
                }),
              ),
              Padding(
                padding: const EdgeInsets.all(24),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      if (isLast) {
                        context.read<AppState>().completeOnboarding();
                      } else {
                        _controller.nextPage(
                            duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
                      }
                    },
                    child: Text(isLast ? l.t('getStarted') : l.t('next')),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Slide extends StatelessWidget {
  const _Slide({required this.icon, required this.color, required this.title, required this.body});
  final IconData icon;
  final Color color;
  final String title;
  final String body;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircleAvatar(radius: 70, backgroundColor: color.withValues(alpha: 0.18), child: Icon(icon, size: 70, color: color)),
          const SizedBox(height: 36),
          Text(title, textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.ink)),
          const SizedBox(height: 14),
          Text(body, textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 15, color: AppColors.muted, height: 1.5)),
        ],
      ),
    );
  }
}
