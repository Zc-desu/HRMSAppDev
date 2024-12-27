import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import CustomAlert from '../setting/CustomAlert';
import { Calendar } from 'react-native-calendars';
import { launchCamera, CameraOptions } from 'react-native-image-picker';

type Translation = {
  title: string;
  date: string;
  time: string;
  clockType: string;
  clockIn: string;
  clockOut: string;
  reason: string;
  reasonPlaceholder: string;
  submit: string;
  success: string;
  error: string;
  submitting: string;
  selectDate: string;
  selectTime: string;
  reasonRequired: string;
  englishOnly: string;
  applicationSuccess: string;
  instruction: string;
  cancel: string;
  languageError: string;
  ok: string;
  location: string;
  photos: string;
  takeFrontPhoto: string;
  takeBackPhoto: string;
  selectLocation: string;
  locationFetchError: string;
}

const translations: Record<string, Translation> = {
  'en': {
    title: 'Back Date Application',
    date: 'Date',
    time: 'Time',
    clockType: 'Clock Type',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    reason: 'Reason',
    reasonPlaceholder: 'Enter reason (English or Malay)',
    submit: 'Submit',
    success: 'Success',
    error: 'Error',
    submitting: 'Submitting...',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    reasonRequired: 'Reason is required',
    englishOnly: 'Please enter reason in English only',
    applicationSuccess: 'Back date application submitted successfully',
    instruction: 'Please fill in all required fields. For reason, please use English or Malay only.',
    cancel: 'Cancel',
    languageError: 'Please enter reason in English or Malay only',
    ok: 'OK',
    location: 'Location',
    photos: 'Photos (Optional)',
    takeFrontPhoto: 'Take Front Photo',
    takeBackPhoto: 'Take Back Photo',
    selectLocation: 'Select Location',
    locationFetchError: 'Failed to fetch locations',
  },
  'ms': {
    title: 'Permohonan Tarikh Lampau',
    date: 'Tarikh',
    time: 'Masa',
    clockType: 'Jenis Waktu',
    clockIn: 'Daftar Masuk',
    clockOut: 'Daftar Keluar',
    reason: 'Sebab',
    reasonPlaceholder: 'Masukkan sebab (Bahasa Inggeris atau Melayu)',
    submit: 'Hantar',
    success: 'Berjaya',
    error: 'Ralat',
    submitting: 'Menghantar...',
    selectDate: 'Pilih Tarikh',
    selectTime: 'Pilih Masa',
    reasonRequired: 'Sebab diperlukan',
    englishOnly: 'Sila masukkan sebab dalam Bahasa Inggeris sahaja',
    applicationSuccess: 'Permohonan tarikh lampau berjaya dihantar',
    instruction: 'Sila isi semua maklumat yang diperlukan. Untuk sebab, sila gunakan Bahasa Inggeris atau Melayu sahaja.',
    cancel: 'Batal',
    languageError: 'Sila masukkan sebab dalam Bahasa Inggeris atau Melayu sahaja',
    ok: 'OK',
    location: 'Lokasi',
    photos: 'Gambar (Opsional)',
    takeFrontPhoto: 'Ambil Gambar Depan',
    takeBackPhoto: 'Ambil Gambar Belakang',
    selectLocation: 'Pilih Lokasi',
    locationFetchError: 'Gagal mendapatkan lokasi',
  } as Translation,
  'zh-Hans': {
    title: '补打卡申请',
    date: '日期',
    time: '时间',
    clockType: '打卡类型',
    clockIn: '签到',
    clockOut: '签退',
    reason: '原因',
    reasonPlaceholder: '请输入原因（仅限英文）',
    submit: '提交',
    success: '成功',
    error: '错误',
    submitting: '提交中...',
    selectDate: '选择日期',
    selectTime: '选择时间',
    reasonRequired: '必须填写原因',
    englishOnly: '请用英文输入原因',
    applicationSuccess: '补打卡申请提交成功',
    instruction: '请填写所有必填项。注意：原因必须用英文填写。',
    cancel: '取消',
    languageError: '请用英文输入原因',
    ok: '确定',
    location: '位置',
    photos: '照片（可选）',
    takeFrontPhoto: '拍正面照片',
    takeBackPhoto: '拍背面照片',
    selectLocation: '选择位置',
    locationFetchError: '获取位置失败',
  } as Translation,
  'zh-Hant': {
    title: '補打卡申請',
    date: '日期',
    time: '時間',
    clockType: '打卡類型',
    clockIn: '簽到',
    clockOut: '簽退',
    reason: '原因',
    reasonPlaceholder: '請輸入原因（僅限英文）',
    submit: '提交',
    success: '成功',
    error: '錯誤',
    submitting: '提交中...',
    selectDate: '選擇日期',
    selectTime: '選擇時間',
    reasonRequired: '必須填寫原因',
    englishOnly: '請用英文輸入原因',
    applicationSuccess: '補打卡申請提交成功',
    instruction: '請填寫所有必填項。注意：原因必須用英文填寫。',
    cancel: '取消',
    languageError: '請用英文輸入原因',
    ok: '確定',
    location: '位置',
    photos: '照片（可選）',
    takeFrontPhoto: '拍正面照片',
    takeBackPhoto: '拍背面照片',
    selectLocation: '選擇位置',
    locationFetchError: '獲取位置失敗',
  } as Translation,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 8,
  },
  instruction: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  formSection: {
    gap: 16,
  },
  dateTimeButton: {
    padding: 16,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  clockTypeContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
  },
  clockTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  clockTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clockTypeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reasonContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
  },
  reasonInput: {
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    backgroundColor: '#000000',
  },
  submitButton: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  timePickerContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  timePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  timeColumn: {
    alignItems: 'center',
  },
  timeScroller: {
    height: 40,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '600',
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 10,
  },
  arrowButton: {
    padding: 10,
  },
  calendarContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  timeButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  timeTextContainer: {
    marginVertical: 10,
  },
  arrowText: {
    fontSize: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
  },
  picker: {
    marginTop: 8,
  },
  photoContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  photoButton: {
    flex: 1,
    aspectRatio: 16/9,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#000000',
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  locationButton: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  locationItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

type AlertButton = {
  text: string;
  onPress: () => void;
}

interface TimePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (time: Date) => void;
  initialTime: Date;
  theme: any;
  t: Translation;
}

const TimePicker = ({ visible, onClose, onSelect, initialTime, theme, t }: TimePickerProps) => {
  const [hours, setHours] = useState(initialTime.getHours());
  const [minutes, setMinutes] = useState(initialTime.getMinutes());

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View style={[styles.timePickerContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.timePickerTitle, { color: theme.text }]}>
            {t.selectTime}
          </Text>
          
          <View style={styles.timePickerContent}>
            {/* Hours */}
            <View style={styles.timeColumn}>
              <TouchableOpacity 
                style={styles.arrowButton}
                onPress={() => setHours(h => (h + 1) % 24)}
              >
                <Text style={[styles.arrowText, { color: theme.text }]}>▲</Text>
              </TouchableOpacity>
              
              <View style={styles.timeTextContainer}>
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {hours.toString().padStart(2, '0')}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.arrowButton}
                onPress={() => setHours(h => (h - 1 + 24) % 24)}
              >
                <Text style={[styles.arrowText, { color: theme.text }]}>▼</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.timeSeparator, { color: theme.text }]}>:</Text>

            {/* Minutes */}
            <View style={styles.timeColumn}>
              <TouchableOpacity 
                style={styles.arrowButton}
                onPress={() => setMinutes(m => (m + 5) % 60)}
              >
                <Text style={[styles.arrowText, { color: theme.text }]}>▲</Text>
              </TouchableOpacity>
              
              <View style={styles.timeTextContainer}>
                <Text style={[styles.timeText, { color: theme.text }]}>
                  {minutes.toString().padStart(2, '0')}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.arrowButton}
                onPress={() => setMinutes(m => (m - 5 + 60) % 60)}
              >
                <Text style={[styles.arrowText, { color: theme.text }]}>▼</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={() => {
                const newTime = new Date();
                newTime.setHours(hours, minutes);
                onSelect(newTime);
                onClose();
              }}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{t.ok}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.card }]}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>
                {t.cancel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

interface PhotoData {
  uri: string;
  type: string;
  fileName: string;
}

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const ATBackDateTLApplication = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language] || translations.en;
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [clockType, setClockType] = useState<'in' | 'out'>('in');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [{ text: 'OK', onPress: () => {} }],
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [frontPhoto, setFrontPhoto] = useState<PhotoData | null>(null);
  const [backPhoto, setBackPhoto] = useState<PhotoData | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
  }, [navigation, theme, t]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        throw new Error('No authentication token found');
      }

      console.log('Fetching from:', `${route.params.baseUrl}/apps/api/v1/attendance/authorized-zones`);
      
      const response = await fetch(`${route.params.baseUrl}/apps/api/v1/attendance/authorized-zones`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Location API response:', data);

      if (data.success && Array.isArray(data.data)) {
        setLocations(data.data);
        if (data.data.length > 0) {
          setSelectedLocation(data.data[0]);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch locations');
      }
    } catch (error) {
      console.error('Fetch locations error:', error);
      showAlert(t.error, t.locationFetchError);
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async (type: 'front' | 'back') => {
    const options: CameraOptions = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    };

    try {
      const result = await launchCamera(options);
      if (result.assets && result.assets[0]) {
        const photo: PhotoData = {
          uri: result.assets[0].uri!,
          type: 'image/jpeg',
          fileName: result.assets[0].fileName || 'photo.jpg',
        };
        if (type === 'front') {
          setFrontPhoto(photo);
        } else {
          setBackPhoto(photo);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  };

  const showAlert = (title: string, message: string, onPress?: () => void) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: [{
        text: 'OK',
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          onPress?.();
        },
      }],
    });
  };

  const isValidLanguage = (text: string) => {
    // Allow English and Malay characters, numbers, and common punctuation
    return /^[A-Za-z0-9\s.,!?-]*$/.test(text);
  };

  const handleSubmit = async () => {
    if (!reason) {
      showAlert(t.error, t.reasonRequired);
      return;
    }

    if (!isValidLanguage(reason)) {
      showAlert(t.error, t.languageError);
      return;
    }

    setIsSubmitting(true);

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) throw new Error('Missing authentication token');

      const formData = new FormData();
      formData.append('EmployeeId', route.params.employeeId);
      formData.append('CompanyId', route.params.companyId.toString());
      formData.append('TimeEntry', new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        selectedTime.getHours(),
        selectedTime.getMinutes()
      ).toISOString());
      formData.append('Reason', reason);
      formData.append('ClockType', clockType);

      if (selectedLocation) {
        formData.append('LocationId', selectedLocation.id);
        formData.append('Latitude', selectedLocation.latitude.toString());
        formData.append('Longitude', selectedLocation.longitude.toString());
        formData.append('AuthorizeZoneName', selectedLocation.name);
      }

      if (frontPhoto) {
        const photoFile = {
          uri: frontPhoto.uri,
          type: frontPhoto.type,
          name: frontPhoto.fileName,
        } as any;
        formData.append('FrontPhoto', photoFile);
      }

      if (backPhoto) {
        const photoFile = {
          uri: backPhoto.uri,
          type: backPhoto.type,
          name: backPhoto.fileName,
        } as any;
        formData.append('BackPhoto', photoFile);
      }

      const response = await fetch(
        `${route.params.baseUrl}/apps/api/v1/attendance/time-logs/submit-for-approval`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.success) {
        showAlert(t.success, t.applicationSuccess, () => {
          navigation.goBack();
        });
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (error: any) {
      showAlert(t.error, error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={[styles.instruction, { 
          color: theme.text, 
          backgroundColor: theme.card 
        }]}>
          {t.instruction}
        </Text>

        {/* Calendar with theme */}
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
              arrowColor: theme.text,
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 14,
            }}
            minDate={new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            maxDate={new Date().toISOString().split('T')[0]}
          />
        </View>

        {/* Time Button */}
        <TouchableOpacity
          style={[styles.timeButton, { backgroundColor: theme.card }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={[styles.label, { color: theme.text }]}>{t.time}</Text>
          <Text style={[styles.value, { color: theme.text }]}>
            {selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        {/* Clock Type */}
        <View style={[styles.clockTypeContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.text }]}>{t.clockType}</Text>
          <View style={styles.clockTypeButtons}>
            <TouchableOpacity
              style={[
                styles.clockTypeButton,
                { backgroundColor: clockType === 'in' ? theme.primary : theme.background }
              ]}
              onPress={() => setClockType('in')}
            >
              <Text style={[
                styles.clockTypeText,
                { color: clockType === 'in' ? '#FFFFFF' : theme.text }
              ]}>
                {t.clockIn}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.clockTypeButton,
                { backgroundColor: clockType === 'out' ? theme.primary : theme.background }
              ]}
              onPress={() => setClockType('out')}
            >
              <Text style={[
                styles.clockTypeText,
                { color: clockType === 'out' ? '#FFFFFF' : theme.text }
              ]}>
                {t.clockOut}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reason Input */}
        <View style={[styles.reasonContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.text }]}>{t.reason}</Text>
          <TextInput
            style={[styles.reasonInput, { 
              color: theme.text, 
              backgroundColor: theme.background,
              borderColor: theme.border
            }]}
            placeholder={t.reasonPlaceholder}
            placeholderTextColor={theme.subText}
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Location Selection */}
        <View style={[styles.locationContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.text }]}>{t.location}</Text>
          <TouchableOpacity 
            style={[styles.locationButton, { backgroundColor: theme.background }]}
            onPress={() => setShowLocationPicker(true)}
          >
            <Text style={[styles.locationText, { color: theme.text }]}>
              {selectedLocation?.name || t.selectLocation}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Photo Section */}
        <View style={[styles.photoContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.label, { color: theme.text }]}>{t.photos}</Text>
          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={[styles.photoButton, { backgroundColor: theme.background }]}
              onPress={() => takePhoto('front')}
            >
              {frontPhoto ? (
                <Image source={{ uri: frontPhoto.uri }} style={styles.photoPreview} />
              ) : (
                <Text style={[styles.photoButtonText, { color: theme.text }]}>
                  {t.takeFrontPhoto}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoButton, { backgroundColor: theme.background }]}
              onPress={() => takePhoto('back')}
            >
              {backPhoto ? (
                <Image source={{ uri: backPhoto.uri }} style={styles.photoPreview} />
              ) : (
                <Text style={[styles.photoButtonText, { color: theme.text }]}>
                  {t.takeBackPhoto}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { 
            backgroundColor: theme.primary,
            opacity: isSubmitting ? 0.7 : 1
          }]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>{t.submit}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Time Picker Modal */}
      {showTimePicker && (
        <TimePicker
          visible={showTimePicker}
          onClose={() => setShowTimePicker(false)}
          onSelect={(time: Date) => setSelectedTime(time)}
          initialTime={selectedTime}
          theme={theme}
          t={t}
        />
      )}

      {/* Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />

      {/* Location Picker Modal */}
      {showLocationPicker && (
        <Modal
          visible={showLocationPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLocationPicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowLocationPicker(false)}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <ScrollView>
                  {locations.map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      style={styles.locationItem}
                      onPress={() => {
                        setSelectedLocation(location);
                        setShowLocationPicker(false);
                      }}
                    >
                      <Text style={[styles.locationItemText, { color: theme.text }]}>
                        {location.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};


export default ATBackDateTLApplication;
