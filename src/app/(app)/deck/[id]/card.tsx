import { router, useLocalSearchParams } from 'expo-router';
import { getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { addCards, deleteCard, updateCardText } from '@/data/cards';
import { cardDoc } from '@/data/paths';
import { confirm, notify } from '@/lib/confirm';
import { space } from '@/theme/tokens';
import { Button, Screen, TextField } from '@/ui';

export default function CardEditor() {
  const { id, cardId } = useLocalSearchParams<{ id: string; cardId?: string }>();
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!cardId) return;
    getDoc(cardDoc(id, cardId)).then((d) => {
      setFront(d.data()?.front ?? '');
      setBack(d.data()?.back ?? '');
    });
  }, [id, cardId]);

  async function save() {
    setSaving(true);
    try {
      if (cardId) {
        await updateCardText(id, cardId, front, back);
        router.back();
      } else {
        await addCards(id, [{ front, back }]);
        setFront('');
        setBack('');
      }
    } catch (e) {
      notify('Erro ao salvar', e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!cardId || !(await confirm('Excluir carta', 'A carta e seu progresso serão apagados.', 'Excluir'))) return;
    await deleteCard(id, cardId);
    router.back();
  }

  const valid = front.trim() && back.trim();
  return (
    <Screen
      footer={
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          {cardId ? <Button label="Excluir" variant="danger" onPress={remove} /> : null}
          <Button label={cardId ? 'Salvar' : 'Adicionar'} onPress={save} loading={saving} disabled={!valid} style={{ flex: 1 }} />
        </View>
      }>
      <TextField label="Frente" value={front} onChangeText={setFront} multiline placeholder="Pergunta" autoFocus={!cardId} />
      <TextField label="Verso" value={back} onChangeText={setBack} multiline placeholder="Resposta" />
    </Screen>
  );
}
