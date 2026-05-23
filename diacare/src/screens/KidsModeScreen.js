import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useApp } from '../context/AppContext';
import { colors, getTheme, radius, spacing } from '../utils/theme';

export default function KidsModeScreen() {
  const { kidLessons, user } = useApp();
  const theme = getTheme(user);
  const isGirl = theme.kidVariant === 'girl';

  return (
    <ScreenContainer scrollable>
      <SectionTitle
        title="Kid-friendly mode"
        subtitle={
          isGirl
            ? 'Simple, soft, and playful for young girls'
            : 'Simple, fun, and energetic for young boys'
        }
      />

      <View
        style={[
          styles.hero,
          {
            backgroundColor: theme.kidColors.hero,
            borderColor: theme.kidColors.border,
          },
        ]}
      >
        <Text
          style={[
            styles.heroTitle,
            { color: theme.colors.text },
            isGirl && styles.girlHeroTitle,
          ]}
        >
          {isGirl ? 'Hi princess 🌸' : 'Hi champ ⭐'}
        </Text>

        <Text style={[styles.heroText, { color: theme.colors.text }]}>
          {isGirl
            ? 'Learn healthy habits with soft colors, fun lessons, and playful guidance.'
            : 'Learn healthy habits with fun lessons, cool colors, and playful guidance.'}
        </Text>
      </View>

      {kidLessons.map((lesson) => (
        <View
          key={lesson.id}
          style={[
            styles.lesson,
            {
              backgroundColor: lesson.color,
              borderColor: theme.kidColors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.lessonTitle,
              { color: theme.colors.text },
              isGirl && styles.girlLessonTitle,
            ]}
          >
            {lesson.title}
          </Text>
          <Text style={[styles.lessonText, { color: theme.colors.text }]}>
            Tap here to open a mini game, cartoon, or animated lesson.
          </Text>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  girlHeroTitle: {
    letterSpacing: 0.4,
  },
  heroText: {
    lineHeight: 22,
  },
  lesson: {
    borderRadius: radius.xl,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
  },
  lessonTitle: {
    fontWeight: '800',
    marginBottom: 6,
  },
  girlLessonTitle: {
    letterSpacing: 0.3,
  },
  lessonText: {
    lineHeight: 20,
  },
});