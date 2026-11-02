import { Check, X } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DECK_ICONS, deckStyle, type DeckIconName } from '@/theme/deckStyle';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

import { Button } from './Button';
import { DeckIcon } from './DeckIcon';
import { DeckStack } from './DeckStack';
import { IconButton } from './IconButton';
import { Text } from './Text';
import { TextField } from './TextField';

export type DeckDraft = { name: string; color: number; icon: DeckIconName };

/** Modal para criar ou editar um baralho: nome, cor e ícone, com pré-visualização. */
type Props = {
  visible: boolean;
  initial?: { id?: string; name?: string; color?: number; icon?: string; cardCount?: number };
  title: string;
  submitLabel: string;
  onSubmit: (d: DeckDraft) => Promise<void>;
  onClose: () => void;
};

export function DeckEditorSheet(props: Props) {
  return (
    <Modal visible={props.visible} animationType="slide" transparent onRequestClose={props.onClose}>
      {props.visible ? <EditorForm {...props} /> : null}
    </Modal>
  );
}

function EditorForm({ initial, title, submitLabel, onSubmit, onClose }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [start] = useState(() =>
    deckStyle({ id: initial?.id ?? Math.random().toString(36), color: initial?.color, icon: initial?.icon }, colors.decks.length),
  );
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(start.color);
  const [icon, setIcon] = useState<DeckIconName>(start.icon);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ name: name.trim(), color, icon });
    } finally {
      setSaving(false);
    }
  }

  return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Fechar" />
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + space.lg }]}>
          <View style={styles.header}>
            <Text variant="title">{title}</Text>
            <IconButton icon={X} label="Fechar" onPress={onClose} filled />
          </View>
          <ScrollView contentContainerStyle={{ gap: space.xl, paddingBottom: space.lg }} keyboardShouldPersistTaps="handled">
            <View style={{ alignItems: 'center', paddingTop: space.md }}>
              <DeckStack deck={{ id: 'preview', name: name || 'Novo baralho', color, icon, cardCount: initial?.cardCount ?? 3 }} width={140} />
            </View>
            <TextField label="Nome" placeholder="Ex.: Anatomia humana" value={name} onChangeText={setName} autoFocus={!initial?.name} onSubmitEditing={submit} returnKeyType="done" />

            <View style={{ gap: space.sm }}>
              <Text variant="label">Cor</Text>
              <View style={styles.grid}>
                {colors.decks.map((c, i) => (
                  <Pressable
                    key={c}
                    accessibilityLabel={`Cor ${i + 1}`}
                    accessibilityState={{ selected: i === color }}
                    onPress={() => setColor(i)}
                    style={[styles.swatch, { backgroundColor: c, borderColor: i === color ? colors.text : 'transparent' }]}>
                    {i === color ? <Check size={18} color="#fff" strokeWidth={3} /> : null}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ gap: space.sm }}>
              <Text variant="label">Ícone</Text>
              <View style={styles.grid}>
                {DECK_ICONS.map((n) => {
                  const active = n === icon;
                  return (
                    <Pressable
                      key={n}
                      accessibilityLabel={`Ícone ${n}`}
                      accessibilityState={{ selected: active }}
                      onPress={() => setIcon(n)}
                      style={[styles.iconCell, { backgroundColor: active ? colors.decks[color] : colors.surface, borderColor: active ? colors.decks[color] : colors.border }]}>
                      <DeckIcon name={n} size={22} color={active ? '#fff' : colors.text} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>
          <Button label={submitLabel} icon={Check} onPress={submit} loading={saving} disabled={!name.trim()} size="lg" />
        </View>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    maxHeight: '92%',
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    gap: space.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 40, height: 40, borderRadius: 20, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  iconCell: { width: 48, height: 48, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
