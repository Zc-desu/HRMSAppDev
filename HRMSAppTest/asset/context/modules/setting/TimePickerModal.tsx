import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (date: Date) => void;
  selectedTime: Date;
  theme: any;
}

const TimePickerModal = ({ visible, onClose, onSelect, selectedTime, theme }: TimePickerModalProps) => {
  const [hours, setHours] = React.useState(selectedTime.getHours());
  const [minutes, setMinutes] = React.useState(selectedTime.getMinutes());
  const hourScrollViewRef = React.useRef<ScrollView>(null);
  const minuteScrollViewRef = React.useRef<ScrollView>(null);
  const itemHeight = 40;

  // Updated to generate hours 00-23
  const hoursArray = Array.from({ length: 24 }, (_, i) => i);
  const minutesArray = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = () => {
    const newDate = new Date(selectedTime);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    onSelect(newDate);
    onClose();
  };

  React.useEffect(() => {
    if (visible) {
      setTimeout(() => {
        hourScrollViewRef.current?.scrollTo({
          y: hours * itemHeight,
          animated: false,
        });
        minuteScrollViewRef.current?.scrollTo({
          y: minutes * itemHeight,
          animated: false,
        });
      }, 100);
    }
  }, [visible]);

  const handleHourScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const selectedHour = Math.round(offsetY / itemHeight);
    if (selectedHour >= 0 && selectedHour <= 23) {
      setHours(selectedHour);
    }
  };

  const handleMinuteScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const selectedMinute = Math.round(offsetY / itemHeight);
    if (selectedMinute >= 0 && selectedMinute <= 59) {
      setMinutes(selectedMinute);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          <Text style={[styles.title, { color: theme.text }]}>Select Time</Text>
          
          <View style={styles.pickerContainer}>
            {/* Hours */}
            <View style={styles.columnContainer}>
              <View style={[styles.selectionHighlight, { backgroundColor: theme.primary + '20' }]} />
              <ScrollView
                ref={hourScrollViewRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                onMomentumScrollEnd={handleHourScroll}
                style={styles.scrollColumn}
              >
                <View style={styles.paddingView} />
                {hoursArray.map((hour) => (
                  <View key={hour} style={[styles.timeItem]}>
                    <Text style={[styles.timeText, { color: theme.text }]}>
                      {hour.toString().padStart(2, '0')}
                    </Text>
                  </View>
                ))}
                <View style={styles.paddingView} />
              </ScrollView>
            </View>

            <Text style={[styles.separator, { color: theme.text }]}>:</Text>

            {/* Minutes */}
            <View style={styles.columnContainer}>
              <View style={[styles.selectionHighlight, { backgroundColor: theme.primary + '20' }]} />
              <ScrollView
                ref={minuteScrollViewRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={itemHeight}
                onMomentumScrollEnd={handleMinuteScroll}
                style={styles.scrollColumn}
              >
                <View style={styles.paddingView} />
                {minutesArray.map((minute) => (
                  <View key={minute} style={[styles.timeItem]}>
                    <Text style={[styles.timeText, { color: theme.text }]}>
                      {minute.toString().padStart(2, '0')}
                    </Text>
                  </View>
                ))}
                <View style={styles.paddingView} />
              </ScrollView>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleConfirm}
            >
              <Text style={styles.buttonText}>OK</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.background }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 200,
  },
  columnContainer: {
    height: 120,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollColumn: {
    height: 120,
  },
  timeItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: '500',
  },
  separator: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 10,
  },
  selectionHighlight: {
    position: 'absolute',
    width: '100%',
    height: 40,
    borderRadius: 8,
  },
  paddingView: {
    height: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TimePickerModal;