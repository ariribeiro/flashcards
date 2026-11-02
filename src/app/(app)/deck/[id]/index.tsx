import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Plus, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { deleteDeck, newRemainingToday, updateDeck } from '@/data/decks';
import { useCards, useDeck, useDueCards } from '@/data/hooks';
import { buildQueue } from '@/data/queue';
import { confirm, notify } from '@/lib/confirm';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button, EmptyState, IconButton, Screen, Surface, Text, TextField } from '@/ui';

function Stat({ value, label, color }: { value: number; label: string; color?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={{ fontSize: 24, fontWeight: '600', color }}>{value}</Text>
      <Text variant="small">{label}</Text>
    </View>
  );
}

export default function DeckScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const deck = useDeck(id);
  const cards = useCards(id);
  const due = useDueCards(id);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState('');

  if (deck === undefined) return <ActivityIndicator style={{ marginTop: space.xxxl }} />;
  if (deck === null) return <Screen><EmptyState title="Baralho não encontrado" action="Voltar" onAction={() => router.back()} /></Screen>;

  const { counts, queue } = due ? buildQueue(due, newRemainingToday(deck)) : { counts: { new: 0, learning: 0, review: 0 }, queue: [] };

  async function remove() {
    if (!deck) return;
    if (!(await confirm('Excluir baralho', `"${deck.name}" e todos os seus cartões serão apagados.`, 'Excluir'))) return;
    try {
      router.back();
      await deleteDeck(deck.id);
    } catch (e) {
      notify('Erro ao excluir', e instanceof Error ? e.message : String(e));
    }
  }

  async function saveName() {
    if (!name.trim()) return;
    await updateDeck(id, { name });
    setRenaming(false);
  }

  return (
    <Screen
      footer={
        queue.length > 0 ? (
          <Button label="Estudar agora" onPress={() => router.push(`/deck/${id}/study`)} />
        ) : cards && cards.length > 0 ? (
          <Text variant="muted" style={{ textAlign: 'center', paddingVertical: space.md }}>Tudo em dia por hoje.</Text>
        ) : undefined
      }>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <IconButton icon={Sparkles} label="Gerar com IA" onPress={() => router.push(`/deck/${id}/generate`)} />
              <IconButton icon={Plus} label="Novo cartão" onPress={() => router.push(`/deck/${id}/card`)} />
            </View>
          ),
        }}
      />

      {renaming ? (
        <View style={{ gap: space.md }}>
          <TextField value={name} onChangeText={setName} autoFocus onSubmitEditing={saveName} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: space.sm }}>
            <Button label="Cancelar" variant="ghost" onPress={() => setRenaming(false)} />
            <Button label="Salvar" onPress={saveName} />
          </View>
        </View>
      ) : (
        <Text variant="title" style={{ fontSize: 28 }} onLongPress={() => { setName(deck.name); setRenaming(true); }}>
          {deck.name}
        </Text>
      )}

      <Surface style={styles.stats}>
        <Stat value={counts.new} label="Novos" color={colors.easy} />
        <Stat value={counts.learning} label="Aprendendo" color={colors.again} />
        <Stat value={counts.review} label="Revisar" color={colors.good} />
      </Surface>

      {cards === null ? (
        <ActivityIndicator />
      ) : cards.length === 0 ? (
        <EmptyState
          title="Baralho vazio"
          message="Gere cartões com IA a partir de um assunto ou crie manualmente."
          action="Gerar cartões com IA"
          onAction={() => router.push(`/deck/${id}/generate`)}
        />
      ) : (
        <View style={{ gap: space.sm }}>
          <Text variant="small" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {cards.length} {cards.length === 1 ? 'cartão' : 'cartões'}
          </Text>
          {cards.map((c) => (
            <Surface key={c.id} onPress={() => router.push(`/deck/${id}/card?cardId=${c.id}`)}>
              <Text numberOfLines={2}>{c.front}</Text>
            </Surface>
          ))}
        </View>
      )}

      <View style={styles.manage}>
        <Button label="Renomear" variant="ghost" onPress={() => { setName(deck.name); setRenaming(true); }} />
        <Button label="Excluir baralho" variant="danger" onPress={remove} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: space.xl },
  stat: { alignItems: 'center', gap: 2 },
  manage: { flexDirection: 'row', justifyContent: 'center', gap: space.sm, marginTop: space.xl },
});
