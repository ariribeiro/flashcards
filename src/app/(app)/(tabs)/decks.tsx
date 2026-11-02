import { router, useLocalSearchParams } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createDeck } from '@/data/decks';
import { useDecks, useDueCounts } from '@/data/hooks';
import { notify } from '@/lib/confirm';
import { maxContentWidth, radius, space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { DeckEditorSheet, DeckStack, EmptyState, Fab, Screen, Text } from '@/ui';

export default function Decks() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ new?: string }>();
  const decks = useDecks();
  const counts = useDueCounts(decks);
  const [creatingState, setCreating] = useState(false);
  const creating = creatingState || params.new === '1';
  const closeEditor = () => {
    setCreating(false);
    if (params.new) router.setParams({ new: undefined });
  };
  const [q, setQ] = useState('');
  const { width } = useWindowDimensions();

  // Grade: 2 colunas no celular, mais na web
  const content = Math.min(width - (width >= 900 ? 220 : 0), maxContentWidth) - space.xl * 2;
  const cols = content > 560 ? 3 : 2;
  const cardW = Math.floor((content - space.xl * (cols - 1)) / cols);

  const filtered = (decks ?? []).filter((d) => d.name.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <View style={{ flex: 1, paddingTop: insets.top, backgroundColor: colors.background }}>
      <Screen fab={decks?.length ? <Fab icon={Plus} label="Novo baralho" onPress={() => setCreating(true)} /> : undefined}>
        <View style={{ gap: space.xs }}>
          <Text variant="hero">Baralhos</Text>
          <Text variant="muted">{decks ? `${decks.length} ${decks.length === 1 ? 'baralho' : 'baralhos'}` : ' '}</Text>
        </View>

        {decks && decks.length > 3 ? (
          <View style={[styles.search, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={18} color={colors.muted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Buscar baralho"
              placeholderTextColor={colors.muted}
              style={{ flex: 1, color: colors.text, fontSize: 16, paddingVertical: 12 }}
            />
          </View>
        ) : null}

        {decks === null ? (
          <ActivityIndicator color={colors.accent} />
        ) : decks.length === 0 ? (
          <EmptyState
            title="Nenhum baralho ainda"
            message="Cada baralho reúne as cartas de um assunto. Crie o primeiro e gere cartas com IA."
            action="Criar baralho"
            actionIcon={Plus}
            onAction={() => setCreating(true)}
          />
        ) : (
          <View style={[styles.grid, { gap: space.xl }]}>
            {filtered.map((d) => (
              <DeckStack key={d.id} deck={d} due={counts[d.id]?.total} width={cardW} onPress={() => router.push(`/deck/${d.id}`)} />
            ))}
          </View>
        )}
      </Screen>

      <DeckEditorSheet
        visible={creating}
        title="Novo baralho"
        submitLabel="Criar baralho"
        onClose={closeEditor}
        onSubmit={async (d) => {
          try {
            const id = await createDeck(d.name, { color: d.color, icon: d.icon });
            closeEditor();
            router.push(`/deck/${id}`);
          } catch (e) {
            notify('Erro ao criar baralho', e instanceof Error ? e.message : String(e));
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: space.sm, borderWidth: 1, borderRadius: radius, paddingHorizontal: space.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: space.sm },
});
