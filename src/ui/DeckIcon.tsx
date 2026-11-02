import {
  BookOpen,
  Brain,
  Briefcase,
  Calculator,
  Code,
  FlaskConical,
  Globe,
  Heart,
  Landmark,
  Languages,
  Leaf,
  Music,
  Palette,
  Rocket,
  Scale,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react-native';

import type { DeckIconName } from '@/theme/deckStyle';

const ICONS: Record<DeckIconName, LucideIcon> = {
  BookOpen,
  Brain,
  FlaskConical,
  Globe,
  Languages,
  Calculator,
  Scale,
  Music,
  Code,
  Heart,
  Landmark,
  Leaf,
  Palette,
  Stethoscope,
  Rocket,
  Briefcase,
};

export function DeckIcon({ name, size = 24, color }: { name: DeckIconName; size?: number; color: string }) {
  const Icon = ICONS[name];
  return <Icon size={size} color={color} strokeWidth={2} />;
}
