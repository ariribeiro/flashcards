import { router } from 'expo-router';
import { ArrowRight, CalendarCheck, Layers, Repeat, Sparkles, Wand2 } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { useAuth } from '@/auth/AuthProvider';
import { useDecks, useDueCounts } from '@/data/hooks';
import { space } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { Avatar, Button, Chip, DeckStack, EmptyState, Hero, LogoMark, Surface, Text } from '@/ui';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

export default function Home() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const decks = useDecks();
  const counts = useDueCounts(decks);
  const firstName = (user?.displayName ?? user?.email ?? '').split(/[\s@]/)[0];

  const totals = Object.values(counts).reduce(
    (a, c) => ({ new: a.new + c.new, learning: a.learning + c.learning, review: a.review + c.review, total: a.total + c.total }),
    { new: 0, learning: 0, review: 0, total: 0 },
  );
  const withDue = (decks ?? []).filter((d) => (counts[d.id]?.total ?? 0) > 0).sort((a, b) => counts[b.id].total - counts[a.id].total);
  const next = withDue[0];

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: space.xxxl }}>
      <Hero>
        <View style={styles.topRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LogoMark size={34} />
            <Text style={{ color: colors.heroText, fontWeight: '800', fontSize: 16 }}>Flashcards</Text>
          </View>
          <Pressable onPress={() => router.push('/profile')} accessibilityLabel="Abrir perfil">
            <Avatar name={user?.displayName} email={user?.email} photoURL={user?.photoURL} size={40} />
          </Pressable>
        </View>
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.heroText, opacity: 0.85, fontSize: 16 }}>{greeting()},</Text>
          <Text variant="hero" style={{ color: colors.heroText }}>{firstName || 'estudante'} 👋</Text>
        </View>

        <Surface style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={{ flex: 1, gap: space.sm }}>
            <Text variant="label" style={{ color: colors.cardText, opacity: 0.6 }}>Para hoje</Text>
            <Text variant="hero" style={{ color: colors.cardText }}>
              {totals.total} {totals.total === 1 ? 'carta' : 'cartas'}
            </Text>
            <View style={styles.chips}>
              <Chip icon={Sparkles} value={totals.new} label="novas" color={colors.decks[5]} />
              <Chip icon={Repeat} value={totals.learning} label="aprendendo" color={colors.decks[2]} />
              <Chip icon={CalendarCheck} value={totals.review} label="revisar" color={colors.decks[4]} />
            </View>
          </View>
        </Surface>
        {next ? (
          <Button
            label={`Continuar: ${next.name}`}
            icon={ArrowRight}
            variant={colors.heroText === '#FFFFFF' || colors.heroText.startsWith('#F') ? 'light' : 'primary'}
            size="lg"
            onPress={() => router.push(`/deck/${next.id}/study`)}
          />
        ) : null}
      </Hero>

      <View style={styles.body}>
        {decks === null ? (
          <ActivityIndicator style={{ marginTop: space.xxl }} color={colors.accent} />
        ) : decks.length === 0 ? (
          <EmptyState
            title="Monte seu primeiro baralho"
            message="Crie um baralho e gere cartas com IA a partir de qualquer assunto."
            action="Criar baralho"
            actionIcon={Layers}
            onAction={() => router.push('/decks?new=1')}
          />
        ) : (
          <>
            <View style={styles.sectionHead}>
              <Text variant="subtitle">{withDue.length ? 'Continuar estudando' : 'Tudo em dia! 🎉'}</Text>
              <Pressable onPress={() => router.push('/decks')}>
                <Text style={{ color: colors.link, fontWeight: '700' }}>Ver todos</Text>
              </Pressable>
            </View>
            {withDue.length === 0 ? (
              <Text variant="muted">Nenhuma carta para revisar agora. Que tal criar cartas novas?</Text>
            ) : null}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carousel}>
              {(withDue.length ? withDue : decks).map((d) => (
                <DeckStack key={d.id} deck={d} due={counts[d.id]?.total} width={150} onPress={() => router.push(`/deck/${d.id}`)} />
              ))}
            </ScrollView>

            <Surface style={styles.ai} onPress={() => router.push('/decks?new=1')}>
              <View style={[styles.aiIcon, { backgroundColor: colors.decks[0] }]}>
                <Wand2 size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="subtitle" style={{ fontSize: 16 }}>Novo baralho com IA</Text>
                <Text variant="small">Diga o assunto e o objetivo; a IA monta as cartas.</Text>
              </View>
              <ArrowRight size={20} color={colors.muted} />
            </Surface>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summary: { flexDirection: 'row', padding: space.xl, borderRadius: 20 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  body: { paddingHorizontal: space.xl, paddingTop: space.xl, gap: space.lg, width: '100%', maxWidth: 720, alignSelf: 'center' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carousel: { gap: space.xl, paddingVertical: space.md, paddingRight: space.xl, paddingLeft: 4 },
  ai: { flexDirection: 'row', alignItems: 'center', gap: space.lg },
  aiIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
