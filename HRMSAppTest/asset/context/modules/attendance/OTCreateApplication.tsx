import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import CustomAlert from '../setting/CustomAlert';
import { Calendar } from 'react-native-calendars';
import CustomTimePickerModal from '../setting/TimePickerModal';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface ReasonOption {
  id: number;
  reason: string;
}

const translations = {
  'en': {
    title: 'Create Overtime',
    date: 'Date',
    selectDate: 'Select Date',
    time: 'Time',
    selectTime: 'Select Time',
    fromTime: 'From Time',
    toTime: 'To Time',
    reason: 'Reason',
    submit: 'Submit',
    cancel: 'Cancel',
    reasonPlaceholder: 'Enter reason for overtime (Please use English or Malay language only)',
    success: 'Success',
    error: 'Error',
    submitSuccess: 'Overtime application submitted successfully',
    submitError: 'Failed to submit overtime application',
    reasonRequired: 'Reason is required',
    selectReason: 'Select Reason',
    customReason: 'Custom Reason',
    orEnterReason: 'Or enter your reason here',
    instruction: 'Please use English or Malay language only',
  },
  'ms': {
    title: 'Buat Kerja Lebih Masa',
    date: 'Tarikh',
    selectDate: 'Pilih Tarikh',
    time: 'Masa',
    selectTime: 'Pilih Masa',
    fromTime: 'Dari Masa',
    toTime: 'Hingga Masa',
    reason: 'Sebab',
    submit: 'Hantar',
    cancel: 'Batal',
    reasonPlaceholder: 'Masukkan sebab kerja lebih masa (Sila gunakan Bahasa Inggeris atau Bahasa Melayu sahaja)',
    success: 'Berjaya',
    error: 'Ralat',
    submitSuccess: 'Permohonan kerja lebih masa berjaya dihantar',
    submitError: 'Gagal menghantar permohonan kerja lebih masa',
    reasonRequired: 'Sebab diperlukan',
    selectReason: 'Pilih Sebab',
    customReason: 'Sebab Lain',
    orEnterReason: 'Atau masukkan sebab anda di sini',
    instruction: 'Sila gunakan Bahasa Inggeris atau Bahasa Melayu sahaja',
  },
  'zh-Hans': {
    title: '创建加班申请',
    date: '日期',
    selectDate: '选择日期',
    time: '时间',
    selectTime: '选择时间',
    fromTime: '开始时间',
    toTime: '结束时间',
    reason: '原因',
    submit: '提交',
    cancel: '取消',
    reasonPlaceholder: '输入加班原因（请仅使用英文或马来文）',
    success: '成功',
    error: '错误',
    submitSuccess: '加班申请提交成功',
    submitError: '提交加班申请失败',
    reasonRequired: '必须填写原因',
    selectReason: '选择原因',
    customReason: '其他原因',
    orEnterReason: '或在此输入您的原因',
    instruction: '请仅使用英文或马来文',
  },
  'zh-Hant': {
    title: '創建加班申請',
    date: '日期',
    selectDate: '選擇日期', 
    time: '時間',
    selectTime: '選擇時間',
    fromTime: '開始時間',
    toTime: '結束時間',
    reason: '原因',
    submit: '提交',
    cancel: '取消',
    reasonPlaceholder: '輸入加班原因（請僅使用英文或馬來文）',
    success: '成功',
    error: '錯誤',
    submitSuccess: '加班申請提交成功',
    submitError: '提交加班申請失敗',
    reasonRequired: '必須填寫原因',
    selectReason: '選擇原因',
    customReason: '其他原因',
    orEnterReason: '或在此輸入您的原因',
    instruction: '請僅使用英文或馬來文',
  }
};

const OTCreateApplication = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fromTime, setFromTime] = useState(new Date());
  const [toTime, setToTime] = useState(new Date());
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as AlertButton[]
  });
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);
  const [reasonOptions, setReasonOptions] = useState<ReasonOption[]>([]);
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [showReasonPicker, setShowReasonPicker] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: theme.headerText,
      headerTitleStyle: {
        color: theme.headerText,
        fontSize: 17,
        fontWeight: '600',
      },
      headerShadowVisible: false,
      title: t.title,
    });
  }, [navigation, theme, language]);

  useEffect(() => {
    const fetchReasonOptions = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const response = await fetch('http://training.mcsb-pg.com/apps/api/v1/overtime/reasons', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const result = await response.json();
        if (result.success) {
          setReasonOptions(result.data);
        }
      } catch (error) {
        console.error('Error fetching reason options:', error);
      }
    };

    fetchReasonOptions();
  }, []);

  const handleReasonSelect = (reasonId: number) => {
    setSelectedReasonId(reasonId);
    const selectedOption = reasonOptions.find(opt => opt.id === reasonId);
    if (selectedOption) {
      setReason(selectedOption.reason);
    }
    setShowReasonPicker(false);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setAlertConfig({
        visible: true,
        title: t.error,
        message: t.reasonRequired,
        buttons: [{
          text: 'OK',
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        }]
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const employeeId = await AsyncStorage.getItem('employeeId');
      
      const requestBody = {
        employeeId: Number(employeeId),
        attendanceDate: selectedDate.toISOString(),
        overtimeDate: selectedDate.toISOString(),
        fromTime: fromTime.toTimeString().split(' ')[0].substring(0, 8),
        toTime: toTime.toTimeString().split(' ')[0].substring(0, 8),
        reasonById: selectedReasonId,
        reason: reason.trim()
      };

      console.log('Request body:', requestBody);

      const response = await fetch(`http://training.mcsb-pg.com/apps/api/v1/employees/${employeeId}/overtime`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        setAlertConfig({
          visible: true,
          title: t.success,
          message: t.submitSuccess,
          buttons: [{
            text: 'OK',
            onPress: () => {
              setAlertConfig(prev => ({ ...prev, visible: false }));
              navigation.goBack();
            }
          }]
        });
      } else if (result.errors) {
        const errorMessages = Object.values(result.errors).flat().join('\n');
        throw new Error(errorMessages);
      } else {
        throw new Error(result.message || t.submitError);
      }
    } catch (error: any) {
      console.error('Submit Error:', error);
      console.error('Error Message:', error.message);
      
      setAlertConfig({
        visible: true,
        title: t.error,
        message: error.message || t.submitError,
        buttons: [{
          text: 'OK',
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        }]
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {/* Calendar */}
        <View style={[styles.calendarContainer, { backgroundColor: theme.card }]}>
          <Calendar
            onDayPress={(day: { timestamp: number }) => {
              const selected = new Date(day.timestamp);
              setSelectedDate(selected);
            }}
            markedDates={{
              [selectedDate.toISOString().split('T')[0]]: {
                selected: true,
                selectedColor: theme.primary,
              },
            }}
            theme={{
              calendarBackground: theme.card,
              textSectionTitleColor: theme.text,
              selectedDayBackgroundColor: theme.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.primary,
              dayTextColor: theme.text,
              textDisabledColor: theme.subText,
              monthTextColor: theme.text,
            }}
          />
        </View>

        {/* Time Selection */}
        <TouchableOpacity
          style={[styles.timeButton, { backgroundColor: theme.card }]}
          onPress={() => setShowFromTimePicker(true)}
        >
          <Text style={[styles.label, { color: theme.text }]}>{t.fromTime}</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {fromTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeButton, { backgroundColor: theme.card }]}
          onPress={() => setShowToTimePicker(true)}
        >
          <Text style={[styles.label, { color: theme.text }]}>{t.toTime}</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {toTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        {/* Reason Selection */}
        <TouchableOpacity
          style={[styles.reasonButton, { backgroundColor: theme.card }]}
          onPress={() => setShowReasonPicker(true)}
        >
          <Text style={[styles.label, { color: theme.text }]}>
            {t.selectReason}
          </Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {selectedReasonId ? reasonOptions.find(opt => opt.id === selectedReasonId)?.reason : t.customReason}
          </Text>
        </TouchableOpacity>

        {/* Custom Reason Input */}
        <View style={[styles.reasonContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.text }]}>{t.orEnterReason}</Text>
          <TextInput
            style={[styles.reasonInput, { 
              color: theme.text, 
              backgroundColor: theme.background 
            }]}
            placeholder={t.reasonPlaceholder}
            placeholderTextColor={theme.subText}
            value={reason}
            onChangeText={(text) => {
              setReason(text);
              if (selectedReasonId) setSelectedReasonId(null);
            }}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>{t.submit}</Text>
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />

      <CustomTimePickerModal 
        visible={showFromTimePicker}
        onClose={() => setShowFromTimePicker(false)}
        onSelect={setFromTime}
        selectedTime={fromTime}
        theme={theme}
      />

      <CustomTimePickerModal 
        visible={showToTimePicker}
        onClose={() => setShowToTimePicker(false)}
        onSelect={setToTime}
        selectedTime={toTime}
        theme={theme}
      />

      {/* Reason Picker Modal */}
      <Modal
        visible={showReasonPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReasonPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: theme.card,
          }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {t.selectReason}
              </Text>
            </View>
            <ScrollView>
              <TouchableOpacity
                style={[styles.reasonOption, { borderBottomColor: theme.border }]}
                onPress={() => {
                  setSelectedReasonId(null);
                  setShowReasonPicker(false);
                }}
              >
                <Text style={[styles.reasonOptionText, { color: theme.text }]}>
                  {t.customReason}
                </Text>
              </TouchableOpacity>
              {reasonOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[styles.reasonOption, { borderBottomColor: theme.border }]}
                  onPress={() => handleReasonSelect(option.id)}
                >
                  <Text style={[styles.reasonOptionText, { color: theme.text }]}>
                    {option.reason}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShowReasonPicker(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.primary }]}>
                {t.cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  timeButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  reasonContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
  },
  reasonInput: {
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  reasonOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  reasonOptionText: {
    fontSize: 16,
    fontWeight: '400',
  },
  modalHeader: {
    paddingBottom: 16,
    marginBottom: 8,
    borderBottomWidth: 0.5,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  reasonButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  instruction: {
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
});

export default OTCreateApplication;
