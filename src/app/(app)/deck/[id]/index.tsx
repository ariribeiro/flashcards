import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CalendarCheck, Pencil, Play, Plus, Repeat, Sparkles, Trash2, Wand2 } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { deleteDeck, newRemainingToday, updateDeck } from '@/data/decks';
import { useCards, useDeck, useDueCards } from '@/data/hooks';
import { buildQueue } from '@/data/queue';
import { confirm, notify } from '@/lib/confirm';
import { deckStyle } from '@/theme/deckStyle';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button, Chip, DeckEditorSheet, DeckIcon, EmptyState, Hero, IconButton, PlayingCard, Screen, Text } from '@/ui';

function Action({ icon: Icon, label, onPress, color }: { icon: LucideIcon; label: string; onPress: () => void; color: string }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [styles.action, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={[styles.actionIcon, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
        <Icon size={22} color={color} strokeWidth={2.2} />
      </View>
      <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text, textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

export default function DeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const deck = useDeck(id);
  const cards = useCards(id);
  const due = useDueCards(id);
  const [editing, setEditing] = useState(false);

  if (deck === undefined) return <View style={{ flex: 1, backgroundColor: colors.background }}><ActivityIndicator style={{ marginTop: 80 }} color={colors.accent} /></View>;
  if (deck === null) return <Screen safeTop><EmptyState title="Baralho não encontrado" action="Voltar" onAction={() => router.back()} /></Screen>;

  const style = deckStyle(deck, colors.decks.length);
  const deckColor = colors.decks[style.color];
  const { counts, queue } = due ? buildQueue(due, newRemainingToday(deck)) : { counts: { new: 0, learning: 0, review: 0 }, queue: [] };
  const back = () => (router.canGoBack() ? router.back() : router.replace('/decks'));

  async function remove() {
    if (!deck) return;
    if (!(await confirm('Excluir baralho', `"${deck.name}" e todas as suas cartas serão apagados.`, 'Excluir'))) return;
    try {
      back();
      await deleteDeck(deck.id);
    } catch (e) {
      notify('Erro ao excluir', e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen
        hero={
          <Hero color={deckColor}>
            <View style={styles.heroTop}>
              <IconButton icon={ArrowLeft} label="Voltar" onPress={back} color="#fff" />
              <View style={{ flexDirection: 'row' }}>
                <IconButton icon={Pencil} label="Editar baralho" onPress={() => setEditing(true)} color="#fff" />
                <IconButton icon={Trash2} label="Excluir baralho" onPress={remove} color="#fff" />
              </View>
            </View>
            <View style={styles.heroMain}>
              <View style={styles.deckIcon}>
                <DeckIcon name={style.icon} size={30} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="hero" style={{ color: '#fff' }} numberOfLines={2}>{deck.name}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
                  {deck.cardCount} {deck.cardCount === 1 ? 'carta' : 'cartas'}
                </Text>
              </View>
            </View>
            <View style={styles.chips}>
              <Chip icon={Sparkles} value={counts.new} label="novas" color="#FFFFFF" />
              <Chip icon={Repeat} value={counts.learning} label="aprendendo" color="#FFFFFF" />
              <Chip icon={CalendarCheck} value={counts.review} label="revisar" color="#FFFFFF" />
            </View>
            {queue.length > 0 ? (
              <Button label={`Estudar · ${queue.length} ${queue.length === 1 ? 'carta' : 'cartas'}`} icon={Play} variant="light" size="lg" onPress={() => router.push(`/deck/${id}/study`)} />
            ) : cards && cards.length > 0 ? (
              <View style={styles.done}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>🎉 Tudo em dia por hoje!</Text>
              </View>
            ) : null}
          </Hero>
        }>
        <View style={styles.actions}>
          <Action icon={Wand2} label="Gerar com IA" color={colors.decks[0]} onPress={() => router.push(`/deck/${id}/generate`)} />
          <Action icon={Plus} label="Nova carta" color={colors.decks[4]} onPress={() => router.push(`/deck/${id}/card`)} />
          <Action icon={Pencil} label="Editar baralho" color={colors.decks[2]} onPress={() => setEditing(true)} />
        </View>

        {cards === null ? (
          <ActivityIndicator color={colors.accent} />
        ) : cards.length === 0 ? (
          <EmptyState
            title="Baralho vazio"
            message="Gere cartas com IA a partir de um assunto ou crie manualmente."
            action="Gerar cartas com IA"
            actionIcon={Wand2}
            onAction={() => router.push(`/deck/${id}/generate`)}
          />
        ) : (
          <View style={{ gap: space.md }}>
            <Text variant="label">Cartas do baralho</Text>
            {cards.map((c, i) => (
              <Pressable key={c.id} onPress={() => router.push(`/deck/${id}/card?cardId=${c.id}`)} style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}>
                <PlayingCard compact style={styles.miniCard}>
                  <View style={[styles.num, { backgroundColor: deckColor }]}>
                    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800' }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ color: colors.cardText, fontWeight: '600' }} numberOfLines={2}>{c.front}</Text>
                    <Text style={{ color: colors.cardText, opacity: 0.6, fontSize: 14 }} numberOfLines={1}>{c.back}</Text>
                  </View>
                </PlayingCard>
              </Pressable>
            ))}
          </View>
        )}
      </Screen>

      <DeckEditorSheet
        visible={editing}
        initial={deck}
        title="Editar baralho"
        submitLabel="Salvar"
        onClose={() => setEditing(false)}
        onSubmit={async (d) => {
          await updateDeck(id, { name: d.name, color: d.color, icon: d.icon });
          setEditing(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -space.md, marginHorizontal: -8 },
  heroMain: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  deckIcon: { width: 60, height: 60, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  done: { alignItems: 'center', padding: space.md, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)' },
  actions: { flexDirection: 'row', justifyContent: 'space-around' },
  action: { alignItems: 'center', gap: 6, width: 100 },
  actionIcon: { width: 56, height: 56, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
  miniCard: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingLeft: 40, paddingRight: 36, borderRadius: 14 },
  num: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
});
