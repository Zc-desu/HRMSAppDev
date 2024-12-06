import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

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
}

const CustomAlert = ({ visible, title, message, buttons = [], onDismiss }: CustomAlertProps) => {
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
        <View style={styles.alertContainer}>
          <View style={styles.contentContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
          
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  index > 0 && styles.buttonBorder,
                  button.style === 'destructive' && styles.destructiveButton,
                  buttons.length === 1 && styles.lastButton,
                  buttons.length === 2 && index === 0 && styles.lastButton,
                ]}
                onPress={() => {
                  button.onPress?.();
                }}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'destructive' && styles.destructiveText,
                    button.style === 'cancel' && styles.cancelText,
                  ]}
                >
                  {button.text}
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
    backgroundColor: '#FFFFFF',
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
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
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
    borderLeftColor: '#E5E5EA',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#007AFF',
  },
  destructiveButton: {
    backgroundColor: '#FF3B30',
    borderBottomRightRadius: 14,
  },
  destructiveText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  cancelText: {
    fontWeight: '500',
    color: '#666',
  },
  lastButton: {
    borderBottomLeftRadius: 14,
  },
});

export default CustomAlert;
