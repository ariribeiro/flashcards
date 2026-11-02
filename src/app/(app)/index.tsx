import { router, Stack } from 'expo-router';
import { Plus, Settings } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { createDeck, newRemainingToday } from '@/data/decks';
import { useDecks, useDueCards } from '@/data/hooks';
import { buildQueue } from '@/data/queue';
import type { Deck } from '@/data/types';
import { notify } from '@/lib/confirm';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Button, EmptyState, IconButton, Screen, Surface, Text, TextField } from '@/ui';

function DeckRow({ deck }: { deck: Deck }) {
  const { colors } = useTheme();
  const due = useDueCards(deck.id);
  const total = due ? buildQueue(due, newRemainingToday(deck)).queue.length : null;
  return (
    <Surface onPress={() => router.push(`/deck/${deck.id}`)} style={styles.row}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontWeight: '500' }} numberOfLines={1}>{deck.name}</Text>
        <Text variant="small">{deck.cardCount} {deck.cardCount === 1 ? 'cartão' : 'cartões'}</Text>
      </View>
      {total ? <Text style={{ color: colors.accent, fontWeight: '600' }}>{total}</Text> : <Text variant="small">{total === 0 ? 'em dia' : ''}</Text>}
    </Surface>
  );
}

export default function Decks() {
  const decks = useDecks();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  async function create() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const id = await createDeck(name);
      setName('');
      setCreating(false);
      router.push(`/deck/${id}`);
    } catch (e) {
      notify('Erro ao criar baralho', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: space.sm }}>
              <IconButton icon={Plus} label="Novo baralho" onPress={() => setCreating(true)} />
              <IconButton icon={Settings} label="Configurações" onPress={() => router.push('/settings')} />
            </View>
          ),
        }}
      />

      {creating ? (
        <Surface style={{ gap: space.md }}>
          <TextField
            label="Nome do baralho"
            placeholder="Ex.: Direito Constitucional"
            value={name}
            onChangeText={setName}
            autoFocus
            onSubmitEditing={create}
            returnKeyType="done"
          />
          <View style={{ flexDirection: 'row', gap: space.sm, justifyContent: 'flex-end' }}>
            <Button label="Cancelar" variant="ghost" onPress={() => setCreating(false)} />
            <Button label="Criar" onPress={create} loading={saving} disabled={!name.trim()} />
          </View>
        </Surface>
      ) : null}

      {decks === null ? (
        <ActivityIndicator style={{ marginTop: space.xxxl }} />
      ) : decks.length === 0 && !creating ? (
        <EmptyState
          title="Nenhum baralho ainda"
          message="Crie um baralho e gere cartões com IA em segundos."
          action="Criar primeiro baralho"
          onAction={() => setCreating(true)}
        />
      ) : (
        <View style={{ gap: space.sm }}>
          {decks.map((d) => (
            <DeckRow key={d.id} deck={d} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
});
