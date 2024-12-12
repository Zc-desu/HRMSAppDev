import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';

interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: CustomAlertButton[];
  onDismiss?: () => void;
  showInput?: boolean;
  inputValue?: string;
  onInputChange?: (text: string) => void;
}

const CustomAlert = ({ visible, title, message, buttons = [], onDismiss }: CustomAlertProps) => {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const getLocalizedText = (text: string) => {
    // Handle "OK" translation specifically
    if (text === 'OK') {
      switch (language) {
        case 'ms':
          return 'OK';
        case 'zh-Hans':
          return '确定';
        case 'zh-Hant':
          return '確定';
        default: // 'en'
          return 'OK';
      }
    }
    return text;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onDismiss}
      >
        <View style={[styles.alertContainer, { backgroundColor: theme.card }]}>
          <View style={styles.contentContainer}>
            <Text style={[styles.title, { color: theme.text }]}>
              {title}
            </Text>
            <Text style={[styles.message, { color: theme.subText }]}>
              {message}
            </Text>
          </View>
          
          <View style={[styles.buttonContainer, { borderTopColor: theme.border }]}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  index > 0 && [styles.buttonBorder, { borderLeftColor: theme.border }],
                  button.style === 'destructive' && styles.destructiveButton,
                  buttons.length === 1 && styles.singleButton,
                  buttons.length === 2 && index === 0 && styles.leftButton,
                  buttons.length === 2 && index === 1 && styles.rightButton,
                ]}
                onPress={() => {
                  button.onPress?.();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: theme.primary },
                    button.style === 'destructive' && styles.destructiveText,
                    button.style === 'cancel' && [styles.cancelText, { color: theme.subText }],
                  ]}
                >
                  {getLocalizedText(button.text)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    borderRadius: 14,
    width: Dimensions.get('window').width * 0.8,
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonContainer: {
    borderTopWidth: 1,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonBorder: {
    borderLeftWidth: 1,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
  },
  destructiveButton: {
    backgroundColor: '#FF3B30',
  },
  destructiveText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cancelText: {
    fontWeight: '500',
  },
  singleButton: {
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  leftButton: {
    borderBottomLeftRadius: 14,
  },
  rightButton: {
    borderBottomRightRadius: 14,
  },
});

export default CustomAlert;
