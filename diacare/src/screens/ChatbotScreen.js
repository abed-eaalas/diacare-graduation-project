import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import { useApp } from '../context/AppContext';
import { colors, radius, spacing } from '../utils/theme';

export default function ChatbotScreen() {
  const { chatMessages, sendChatMessage, user } = useApp();
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  const speakLatestBot = () => {
    const bot = [...chatMessages].reverse().find((m) => m.from === 'bot');
    if (bot) {
      Speech.speak(bot.text);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendChatMessage(input.trim());
    setInput('');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return () => clearTimeout(timer);
  }, [chatMessages]);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <SectionTitle
          title="AI Assistant"
          subtitle="Text and voice support"
          right={
            <Text onPress={speakLatestBot} style={styles.voice}>
              Voice Reading
            </Text>
          }
        />

        <FlatList
          ref={listRef}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageRow,
                item.from === 'user' ? styles.userRow : styles.botRow,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  item.from === 'user' ? styles.userBubble : styles.botBubble,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    item.from === 'user' && styles.userBubbleText,
                  ]}
                >
                  {item.text}
                </Text>
              </View>
            </View>
          )}
        />

        <View style={styles.composerWrap}>
          <View style={styles.composer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              placeholderTextColor={colors.muted}
              style={styles.input}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />

            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                pressed && styles.sendButtonPressed,
              ]}
              onPress={handleSend}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  voice: {
    color: colors.primary,
    fontWeight: '700',
  },
  list: {
    flex: 1,
    marginTop: spacing.xs,
  },
  listContent: {
    paddingBottom: spacing.md,
  },
  messageRow: {
    marginBottom: spacing.sm,
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  botRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '84%',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 8,
  },
  botBubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 8,
  },
  bubbleText: {
    color: colors.text,
    lineHeight: 21,
    fontSize: 15,
  },
  userBubbleText: {
    color: '#fff',
  },
  composerWrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  input: {
    flex: 1,
    minHeight: 54,
    maxHeight: 120,
    color: colors.text,
    fontSize: 15,
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 10,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendButtonPressed: {
    opacity: 0.85,
  },
});