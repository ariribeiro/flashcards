import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { Hourglass, RotateCcw, ThumbsUp, Trophy, X, Zap, type LucideIcon } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { saveReview } from '@/data/cards';
import { loadSettings, useDeck } from '@/data/hooks';
import { cardsCol } from '@/data/paths';
import { buildQueue, dueHorizon, isDue, newRemainingToday } from '@/data/queue';
import type { FlashCard } from '@/data/types';
import { fsrsFromFirestore, fsrsToFirestore } from '@/fsrs/convert';
import { formatInterval, GRADES, makeScheduler, Rating, type Grade } from '@/fsrs/scheduler';
import { deckStyle } from '@/theme/deckStyle';
import { maxContentWidth, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button, DeckIcon, DeckStack, IconButton, PlayingCard, Text } from '@/ui';

/** Cartas em aprendizado que vencem em até 20 min aparecem na mesma sessão. */
const LEARN_AHEAD_MS = 20 * 60 * 1000;

const GRADE_ICONS: Record<number, LucideIcon> = {
  [Rating.Again]: RotateCcw,
  [Rating.Hard]: Hourglass,
  [Rating.Good]: ThumbsUp,
  [Rating.Easy]: Zap,
};

export default function Study() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deck = useDeck(id);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [queue, setQueue] = useState<FlashCard[] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const [scheduler, setScheduler] = useState(() => makeScheduler());
  const loaded = useRef(false);
  const flip = useSharedValue(0);

  useEffect(() => {
    if (!deck || loaded.current) return;
    loaded.current = true;
    loadSettings().then((s) => setScheduler(makeScheduler(s.request_retention))).catch(() => {});
    getDocs(query(cardsCol(id), where('due', '<=', Timestamp.fromDate(dueHorizon())), orderBy('due', 'asc'))).then((snap) => {
      const t = Date.now();
      const due = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FlashCard, 'id'>) })).filter((c) => isDue(c, t));
      setQueue(buildQueue(due, newRemainingToday(deck)).queue);
    });
  }, [deck, id]);

  const current = queue?.[0];
  const now = new Date();
  const preview = useMemo(
    () => (current && revealed ? scheduler.repeat(fsrsFromFirestore(current), new Date()) : null),
    [current, revealed, scheduler],
  );

  const reveal = useCallback(() => {
    if (!current || revealed) return;
    setRevealed(true);
    flip.set(withTiming(180, { duration: 420 }));
    if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
  }, [current, revealed, flip]);

  const grade = useCallback(
    (g: Grade) => {
      if (!current || !deck || !revealed) return;
      const reviewedAt = new Date();
      const { card, log } = scheduler.next(fsrsFromFirestore(current), reviewedAt, g);
      saveReview(deck, current.id, current.state, card, log).catch((e) => console.warn('saveReview', e));
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

      const updated: FlashCard = { ...current, ...fsrsToFirestore(card) };
      setQueue((q) => {
        const rest = (q ?? []).slice(1);
        if (card.due.getTime() - reviewedAt.getTime() <= LEARN_AHEAD_MS) {
          const at = rest.findIndex((c) => c.due.toMillis() > updated.due.toMillis());
          const pos = Math.max(1, at === -1 ? rest.length : at);
          return [...rest.slice(0, pos), updated, ...rest.slice(pos)];
        }
        return rest;
      });
      setDone((n) => n + 1);
      setRevealed(false);
      flip.set(0);
    },
    [current, deck, revealed, scheduler, flip],
  );

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!revealed) reveal();
        else grade(Rating.Good);
      } else if (e.key === 'Escape') router.back();
      else {
        const g = GRADES.find((x) => x.key === e.key);
        if (g) grade(g.grade);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reveal, grade, revealed]);

  const frontStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${flip.value}deg` }],
    opacity: interpolate(flip.value, [0, 89, 90, 180], [1, 1, 0, 0]),
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${flip.value - 180}deg` }],
    opacity: interpolate(flip.value, [0, 90, 91, 180], [0, 0, 1, 1]),
  }));

  const total = done + (queue?.length ?? 0);
  const progress = total ? done / total : 0;
  const style = deck ? deckStyle(deck, colors.decks.length) : null;
  const deckColor = style ? colors.decks[style.color] : colors.accent;
  const corner = style ? <DeckIcon name={style.icon} size={20} color={deckColor} /> : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + space.lg }]}>
      <View style={styles.top}>
        <IconButton icon={X} label="Sair" onPress={() => router.back()} filled />
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <View style={[styles.bar, { backgroundColor: deckColor, width: `${Math.max(progress * 100, 2)}%` }]} />
        </View>
        <View style={[styles.pill, { backgroundColor: deckColor }]}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13 }}>{queue ? queue.length : '–'}</Text>
        </View>
      </View>
      {deck ? (
        <Text variant="small" style={{ textAlign: 'center', marginTop: space.xs }}>{deck.name}</Text>
      ) : null}

      {queue === null ? (
        <ActivityIndicator style={{ flex: 1 }} color={deckColor} />
      ) : !current ? (
        <Animated.View entering={ZoomIn.duration(300)} style={styles.center}>
          {deck ? <DeckStack deck={{ ...deck, cardCount: Math.max(done, 2) }} width={130} /> : null}
          <View style={[styles.trophy, { backgroundColor: colors.highlight }]}>
            <Trophy size={28} color="#1F2937" />
          </View>
          <Text variant="title" style={{ textAlign: 'center' }}>Sessão concluída!</Text>
          <Text variant="muted" style={{ textAlign: 'center' }}>
            {done} {done === 1 ? 'carta revisada' : 'cartas revisadas'}. O baralho está em dia.
          </Text>
          <Button label="Voltar ao baralho" onPress={() => router.back()} style={{ marginTop: space.lg, minWidth: 220 }} />
        </Animated.View>
      ) : (
        <>
          <Pressable style={styles.cardArea} onPress={reveal} accessibilityHint="Toque para virar a carta">
            <View style={styles.cardSlot}>
              <Animated.View style={[styles.face, frontStyle, { backfaceVisibility: 'hidden' }]}>
                <PlayingCard corner={corner} style={styles.card}>
                  <Text variant="label" style={{ color: deckColor, textAlign: 'center' }}>Pergunta</Text>
                  <Text variant="card">{current.front}</Text>
                  <Text variant="small" style={{ textAlign: 'center', color: colors.cardText, opacity: 0.5 }}>Toque para virar</Text>
                </PlayingCard>
              </Animated.View>
              <Animated.View style={[styles.face, backStyle, { backfaceVisibility: 'hidden' }]} pointerEvents={revealed ? 'auto' : 'none'}>
                <PlayingCard corner={corner} style={styles.card}>
                  <Text variant="label" style={{ color: deckColor, textAlign: 'center' }}>Resposta</Text>
                  <Text style={{ color: colors.cardText, opacity: 0.6, textAlign: 'center', fontSize: 15 }} numberOfLines={3}>{current.front}</Text>
                  <View style={[styles.divider, { backgroundColor: deckColor }]} />
                  <Text variant="card">{current.back}</Text>
                </PlayingCard>
              </Animated.View>
            </View>
          </Pressable>

          <View style={styles.bottom}>
            {revealed && preview ? (
              <View style={styles.grades}>
                {GRADES.map(({ grade: g, label }) => {
                  const tone = [colors.again, colors.hard, colors.good, colors.easy][g - 1];
                  const Icon = GRADE_ICONS[g];
                  return (
                    <Pressable
                      key={g}
                      accessibilityLabel={label}
                      onPress={() => grade(g)}
                      style={({ pressed }) => [styles.gradeBtn, { backgroundColor: tone, transform: [{ scale: pressed ? 0.95 : 1 }] }]}>
                      <Icon size={20} color="#fff" strokeWidth={2.4} />
                      <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{label}</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' }}>{formatInterval(now, preview[g].card.due)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <Button label="Virar carta" onPress={reveal} size="lg" />
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: space.xl },
  top: { flexDirection: 'row', alignItems: 'center', gap: space.md, height: 52, width: '100%', maxWidth: maxContentWidth, alignSelf: 'center' },
  track: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
  pill: { minWidth: 36, paddingHorizontal: 10, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.md },
  trophy: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: -space.xl },
  cardArea: { flex: 1, justifyContent: 'center', paddingVertical: space.lg },
  cardSlot: { width: '100%', maxWidth: 440, aspectRatio: 0.72, maxHeight: '100%', alignSelf: 'center' },
  face: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  card: { flex: 1, justifyContent: 'center', gap: space.xl, paddingHorizontal: 36 },
  divider: { height: 3, width: 40, borderRadius: 2, alignSelf: 'center' },
  bottom: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', minHeight: 72, justifyContent: 'flex-end' },
  grades: { flexDirection: 'row', gap: space.sm },
  gradeBtn: { flex: 1, alignItems: 'center', paddingVertical: space.md, borderRadius: 16, gap: 2 },
});
