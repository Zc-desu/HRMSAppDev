import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../modules/setting/ThemeContext';
import { useLanguage } from '../modules/setting/LanguageContext';

interface SwipeAnimationProps {
  onDismiss: (neverShowAgain: boolean) => void;
}

const SwipeLeftRightAnimation: React.FC<SwipeAnimationProps> = ({ onDismiss }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    console.log('Animation component mounted');
    const timer = setTimeout(() => {
      if (animationRef.current) {
        console.log('Playing animation...');
        animationRef.current.reset();
        animationRef.current.play();
      } else {
        console.log('Animation ref is null');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Test if animation file can be loaded
  try {
    const animationSource = require('../../animation/swipeLeftRight.json');
    console.log('Animation source loaded:', animationSource !== null);
  } catch (error) {
    console.error('Failed to load animation:', error);
  }

  const translations = {
    'en': {
      dontRemindToday: "Don't remind me today",
      dontRemindAgain: "Don't remind again",
      swipeInstruction: "Swipe left or right to navigate"
    },
    'ms': {
      dontRemindToday: "Jangan ingatkan saya hari ini",
      dontRemindAgain: "Jangan ingatkan lagi",
      swipeInstruction: "Leret ke kiri atau kanan untuk navigasi"
    },
    'zh-Hans': {
      dontRemindToday: "今天不再提醒",
      dontRemindAgain: "不再提醒",
      swipeInstruction: "左右滑动以导航"
    },
    'zh-Hant': {
      dontRemindToday: "今天不再提醒",
      dontRemindAgain: "不再提醒",
      swipeInstruction: "左右滑動以導航"
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={[styles.contentContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.instructionText, { color: theme.text }]}>
          {translations[language]?.swipeInstruction}
        </Text>
        
        <View style={[styles.animationContainer, { backgroundColor: '#FFFFFF' }]}>
          <LottieView
            ref={animationRef}
            source={require('../../animation/swipeLeftRight.json')}
            autoPlay
            loop
            style={styles.animation}
            speed={0.8}
            colorFilters={[
              {
                keypath: "**",
                color: theme.primary
              }
            ]}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => onDismiss(false)}
          >
            <Text style={styles.buttonText}>
              {translations[language]?.dontRemindToday}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={() => onDismiss(true)}
          >
            <Text style={styles.buttonText}>
              {translations[language]?.dontRemindAgain}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 5,
    padding: 16,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
  },
  animationContainer: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderRadius: 12,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SwipeLeftRightAnimation;
