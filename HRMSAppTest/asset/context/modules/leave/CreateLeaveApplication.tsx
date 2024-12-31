import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import CustomAlert from '../setting/CustomAlert';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker, { DocumentPickerResponse, types } from 'react-native-document-picker';

interface LeaveEntitlement {
  leaveCodeId: number;
  leaveCode: string;
  leaveCodeDesc: string;
  balanceDays: number;
  effectiveFrom: string;
  effectiveTo: string;
}

interface LeavePolicy {
  leaveCodeId: number;
  allowBackdate: boolean;
  requireAttachment: boolean;
  requireFamily: boolean;
  isConsecutiveDay: boolean;
  annualLeaveNotificationPolicy: number;
  enableBackupPerson: boolean;
  maxDaysPerApplication: number;
  allowHalfDay: boolean;
  note: string;
}

interface LeaveDate {
  Date: any;
  date: string;
  availableSessions: {
    id: number;
    description: string;
  }[];
  typeOfDay: string | null;
  isWorkingDay: boolean;
  leaveAppList: Array<{
    leaveCode: string;
    session: string;
    approvalStatus: string;
  }>;
  isHoliday: boolean;
  holiday: string | null;
  isConsecutive: boolean;
}

interface LeaveApplicationDate {
  Date: string;
  SessionId: number;
}

const CreateLeaveApplication = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [entitlements, setEntitlements] = useState<LeaveEntitlement[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<LeaveEntitlement | null>(null);
  const [leavePolicy, setLeavePolicy] = useState<LeavePolicy | null>(null);
  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [reason, setReason] = useState('');
  const [sessionType, setSessionType] = useState<number>(2103); // Default full day
  const [userId, setUserId] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [attachments, setAttachments] = useState<DocumentPickerResponse[]>([]);
  const [showLeaveCodePicker, setShowLeaveCodePicker] = useState(false);
  const [firstDaySession, setFirstDaySession] = useState('full');
  const [sessions, setSessions] = useState<{[key: string]: number}>({});
  const [excludedDates, setExcludedDates] = useState<string[]>([]);
  const [leaveDates, setLeaveDates] = useState<LeaveDate[]>([]);
  const [nonWorkingDays, setNonWorkingDays] = useState<string[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [consecutiveDays, setConsecutiveDays] = useState<string[]>([]);

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
      title: getLocalizedText('title'),
    });
  }, [theme, navigation, language]);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('CreateLeaveApplication - Route params:', route.params);
        const routeUserId = route.params?.userId;
        console.log('CreateLeaveApplication - Route userId:', routeUserId);
        
        if (routeUserId) {
          setUserId(routeUserId.toString());
          console.log('CreateLeaveApplication - Set userId from params:', routeUserId);
        } else {
          const storedUserId = await AsyncStorage.getItem('userId');
          console.log('CreateLeaveApplication - Stored userId:', storedUserId);
          setUserId(storedUserId);
        }

        const storedEmployeeId = route.params?.employeeId || await AsyncStorage.getItem('employeeId');
        setEmployeeId(storedEmployeeId);
        
        if (storedEmployeeId) {
          await fetchEntitlements(storedEmployeeId);
        }
      } catch (error) {
        console.error('CreateLeaveApplication - Error:', error);
        setAlertTitle(getLocalizedText('error'));
        setAlertMessage(getLocalizedText('initializationError'));
        setShowAlert(true);
      }
    };

    initialize();
  }, [route.params]);

  const fetchEntitlements = async (employeeId: string) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      if (!userToken || !baseUrl || !employeeId) {
        throw new Error('Missing required data');
      }

      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves/entitlements/year/${currentYear}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setEntitlements(data.data.entitlements);
      } else {
        setAlertMessage(data.message || 'Failed to fetch entitlements');
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage('Error fetching entitlements');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeavePolicy = async (leaveCodeId: number) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      if (!userToken || !baseUrl) {
        throw new Error('Missing required data');
      }

      const response = await fetch(
        `${baseUrl}/apps/api/v1/leaves/settings/${leaveCodeId}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setLeavePolicy(data.data);
      } else {
        setAlertMessage(data.message || 'Failed to fetch leave policy');
        setShowAlert(true);
      }
    } catch (error) {
      setAlertMessage('Error fetching leave policy');
      setShowAlert(true);
    }
  };

  const fetchLeaveDates = async (leaveCodeId: number, startDate: Date, endDate: Date) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      if (!userToken || !baseUrl || !employeeId) {
        throw new Error('Missing required data');
      }

      const dateFrom = startDate.toISOString();
      const dateTo = endDate.toISOString();

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves/leave-dates?LeaveCodeId=${leaveCodeId}&DateFrom=${dateFrom}&DateTo=${dateTo}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        const leaveDatesData: LeaveDate[] = data.data;
        setLeaveDates(leaveDatesData);
        
        // Process different types of dates
        const nonWorkingDates = leaveDatesData
          .filter(date => !date.isWorkingDay)
          .map(date => date.date.split('T')[0]);
        
        const holidayDates = leaveDatesData
          .filter(date => date.isHoliday)
          .map(date => date.date.split('T')[0]);
        
        const consecutiveDates = leaveDatesData
          .filter(date => date.isConsecutive)
          .map(date => date.date.split('T')[0]);

        setNonWorkingDays(nonWorkingDates);
        setHolidays(holidayDates);
        setConsecutiveDays(consecutiveDates);

        // Show warning if necessary
        if (nonWorkingDates.length > 0 || holidayDates.length > 0) {
          setAlertTitle(getLocalizedText('warning'));
          setAlertMessage(getLocalizedText('dateValidationWarning'));
          setShowAlert(true);
        }
      } else {
        setAlertMessage(data.message || 'Failed to fetch leave dates');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error fetching leave dates:', error);
      setAlertMessage('Error fetching leave dates');
      setShowAlert(true);
    }
  };

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          title: 'Buat Permohonan Cuti',
          selectLeaveType: 'Pilih Jenis Cuti',
          selectDates: 'Pilih Tarikh',
          reason: 'Sebab',
          enterReason: 'Masukkan sebab',
          days: 'hari',
          fullDay: 'Sehari Penuh',
          firstHalf: 'Separuh Pertama',
          secondHalf: 'Separuh Kedua',
          sessionType: 'Jenis Sesi',
          submit: 'Hantar',
          selectLeaveTypeFirst: 'Sila pilih jenis cuti',
          enterReasonFirst: 'Sila masukkan sebab',
          leaveSubmitSuccess: 'Permohonan cuti berjaya dihantar',
          leaveSubmitFailed: 'Permohonan cuti gagal',
          leaveSubmitError: 'Ralat semasa menghantar permohonan',
          invalidUserId: 'ID pengguna tidak sah',
          invalidDateRange: 'Julat tarikh tidak sah',
          attachments: 'Lampiran',
          addAttachment: 'Tambah Fail',
          attachmentError: 'Gagal memuat naik fail',
          fileTooLarge: 'Saiz fail melebihi 5MB',
          pdfOnly: 'Hanya fail PDF dibenarkan',
          error: 'Ralat',
          initializationError: 'Ralat semasa memulakan',
          fromDate: 'Dari Tarikh',
          toDate: 'Hingga Tarikh',
          selectLeaveCode: 'Pilih Kod Cuti',
          exclude: 'Kecuali',
          include: 'Masuk',
          session: 'Sesi',
          note: 'Nota',
          policyViolation: 'Pelanggaran Polisi',
          notificationPolicyError: 'Sila mohon cuti {days} hari sebelum tarikh cuti',
          dateValidation: 'Pengesahan Tarikh',
          nonWorkingDays: 'Hari Tidak Bekerja',
          holidays: 'Cuti Umum',
          consecutiveDays: 'Hari Berturutan',
          warning: 'Amaran',
          dateValidationWarning: 'Beberapa tarikh yang dipilih adalah hari cuti atau hari tidak bekerja.',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          title: '创建休假申请',
          selectLeaveType: '选择休假类型',
          selectDates: '选择日期',
          reason: '原因',
          enterReason: '输入原因',
          days: '天',
          fullDay: '全天',
          firstHalf: '上半天',
          secondHalf: '下半天',
          sessionType: '时段类型',
          submit: '提交',
          selectLeaveTypeFirst: '请选择休假类型',
          enterReasonFirst: '请输入原因',
          leaveSubmitSuccess: '休假申请提交成功',
          leaveSubmitFailed: '休假申请提交失败',
          leaveSubmitError: '提交申请时出错',
          invalidUserId: '无效的用户 ID',
          invalidDateRange: '无效的日期范围',
          attachments: '附件',
          addAttachment: '添加文件',
          attachmentError: '上传文件失败',
          fileTooLarge: '文件大小超过5MB',
          pdfOnly: '只允许上传PDF文件',
          error: '错误',
          initializationError: '初始化错误',
          fromDate: '开始日期',
          toDate: '结束日期',
          selectLeaveCode: '选择假期代码',
          exclude: '排除',
          include: '包含',
          session: '时段',
          note: '备注',
          policyViolation: '政策违规',
          notificationPolicyError: '请提前{days}天申请休假',
          dateValidation: '日期验证',
          nonWorkingDays: '非工作日',
          holidays: '公共假期',
          consecutiveDays: '连续日期',
          warning: '警告',
          dateValidationWarning: '所选日期中包含假期或非工作日。',
        }[key] || key;
      
      case 'zh-Hant':
        return {
          title: '創建休假申請',
          selectLeaveType: '選擇休假類型',
          selectDates: '選擇日期',
          reason: '原因',
          enterReason: '輸入原因',
          days: '天',
          fullDay: '全天',
          firstHalf: '上半天',
          secondHalf: '下半天',
          sessionType: '時段類型',
          submit: '提交',
          selectLeaveTypeFirst: '請選擇休假類型',
          enterReasonFirst: '請輸入原因',
          leaveSubmitSuccess: '休假申請提交成功',
          leaveSubmitFailed: '休假申請提交失敗',
          leaveSubmitError: '提交申請時出錯',
          invalidUserId: '無效的用户 ID',
          invalidDateRange: '無效的日期範圍',
          attachments: '附件',
          addAttachment: '添加文件',
          attachmentError: '上傳文件失敗',
          fileTooLarge: '文件大小超過5MB',
          pdfOnly: '只允許上傳PDF文件',
          error: '錯誤',
          initializationError: '初始化錯誤',
          fromDate: '開始日期',
          toDate: '結束日期',
          selectLeaveCode: '選擇假期代碼',
          exclude: '排除',
          include: '包含',
          session: '時段',
          note: '備註',
          policyViolation: '政策違規',
          notificationPolicyError: '請提前{days}天申請休假',
          dateValidation: '日期驗證',
          nonWorkingDays: '非工作日',
          holidays: '公眾假期',
          consecutiveDays: '連續日期',
          warning: '警告',
          dateValidationWarning: '所選日期中包含假期或非工作日。',
        }[key] || key;
      
      default: // 'en'
        return {
          title: 'Create Leave Application',
          selectLeaveType: 'Select Leave Type',
          selectDates: 'Select Dates',
          reason: 'Reason',
          enterReason: 'Enter reason',
          days: 'days',
          fullDay: 'Full Day',
          firstHalf: 'First Half',
          secondHalf: 'Second Half',
          sessionType: 'Session Type',
          submit: 'Submit',
          selectLeaveTypeFirst: 'Please select leave type',
          enterReasonFirst: 'Please enter reason',
          leaveSubmitSuccess: 'Leave application submitted successfully',
          leaveSubmitFailed: 'Failed to submit leave application',
          leaveSubmitError: 'Error submitting application',
          invalidUserId: 'Invalid user ID',
          invalidDateRange: 'Invalid date range',
          attachments: 'Attachments',
          addAttachment: 'Add File',
          attachmentError: 'Failed to upload file',
          fileTooLarge: 'File size exceeds 5MB',
          pdfOnly: 'Only PDF files are allowed',
          error: 'Error',
          initializationError: 'Initialization error',
          fromDate: 'From Date',
          toDate: 'To Date',
          selectLeaveCode: 'Select Leave Code',
          exclude: 'Exclude',
          include: 'Include',
          session: 'Session',
          note: 'Note',
          policyViolation: 'Policy Violation',
          notificationPolicyError: 'Please apply leave {days} days in advance',
          dateValidation: 'Date Validation',
          nonWorkingDays: 'Non-Working Days',
          holidays: 'Public Holidays',
          consecutiveDays: 'Consecutive Days',
          warning: 'Warning',
          dateValidationWarning: 'Some selected dates are holidays or non-working days.',
        }[key] || key;
    }
  };

  const renderDateSelection = () => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>
        {getLocalizedText('selectDates')}
      </Text>
      <View style={styles.dateContainer}>
        <TouchableOpacity 
          style={[styles.dateButton, { backgroundColor: theme.background }]}
          onPress={() => setShowFromDatePicker(true)}
        >
          <Text style={[styles.dateText, { color: theme.subText }]}>From</Text>
          <Text style={[styles.dateValue, { color: theme.text }]}>
            {dateFrom.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.dateButton, { backgroundColor: theme.background }]}
          onPress={() => setShowToDatePicker(true)}
        >
          <Text style={[styles.dateText, { color: theme.subText }]}>To</Text>
          <Text style={[styles.dateValue, { color: theme.text }]}>
            {dateTo.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      </View>
      
      {showFromDatePicker && (
        <DateTimePicker
          value={dateFrom}
          mode="date"
          display="default"
          themeVariant={theme.background === '#000000' ? 'dark' : 'light'}
          onChange={(event, selectedDate) => {
            setShowFromDatePicker(false);
            if (selectedDate) {
              setDateFrom(selectedDate);
            }
          }}
        />
      )}

      {showToDatePicker && (
        <DateTimePicker
          value={dateTo}
          mode="date"
          display="default"
          themeVariant={theme.background === '#000000' ? 'dark' : 'light'}
          onChange={(event, selectedDate) => {
            setShowToDatePicker(false);
            if (selectedDate) {
              setDateTo(selectedDate);
            }
          }}
        />
      )}
    </View>
  );

  const handleSessionChange = (dateKey: string, sessionType: number) => {
    setSessions(prev => ({
      ...prev,
      [dateKey]: sessionType
    }));
    console.log('Session updated:', dateKey, sessionType); // For debugging
  };

  const calculateTotalDays = () => {
    const dayDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24));
    let total = 0;

    for (let i = 0; i <= dayDiff; i++) {
      const currentDate = new Date(dateFrom);
      currentDate.setDate(dateFrom.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      // Skip if date is excluded
      if (excludedDates.includes(dateKey)) continue;

      // Add days based on session type
      const sessionType = sessions[dateKey] || 1; // Default to full day
      if (sessionType === 1) { // Full day
        total += 1;
      } else { // Half day
        total += 0.5;
      }
    }

    return total;
  };

  const toggleDateExclusion = (dateKey: string) => {
    setExcludedDates(prev => 
      prev.includes(dateKey) 
        ? prev.filter(d => d !== dateKey)
        : [...prev, dateKey]
    );
  };

  const renderSessionType = () => {
    const dayDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24));
    const totalDays = calculateTotalDays();
    
    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {getLocalizedText('session')}
          </Text>
          <Text style={[styles.totalDays, { color: theme.primary }]}>
            {`${totalDays} ${getLocalizedText('days')}`}
          </Text>
        </View>
        
        {Array.from({ length: dayDiff + 1 }).map((_, index) => {
          const currentDate = new Date(dateFrom);
          currentDate.setDate(dateFrom.getDate() + index);
          const dateKey = currentDate.toISOString().split('T')[0];
          const currentSession = sessions[dateKey] || 1;
          const isExcluded = excludedDates.includes(dateKey);
          
          return (
            <View key={index} style={styles.daySessionContainer}>
              <View style={styles.dateHeaderContainer}>
                <Text style={[styles.dateLabel, { 
                  color: theme.text,
                  textDecorationLine: isExcluded ? 'line-through' : 'none'
                }]}>
                  {currentDate.toLocaleDateString()}
                </Text>
                <TouchableOpacity 
                  style={[styles.excludeButton, { 
                    backgroundColor: isExcluded ? theme.error : theme.background,
                    borderColor: theme.border
                  }]}
                  onPress={() => toggleDateExclusion(dateKey)}
                >
                  <Text style={[styles.excludeButtonText, { 
                    color: isExcluded ? '#FFFFFF' : theme.text 
                  }]}>
                    {isExcluded ? getLocalizedText('include') : getLocalizedText('exclude')}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {!isExcluded && (
                <View style={styles.sessionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.sessionButton,
                      { 
                        backgroundColor: currentSession === 1 ? theme.primary : theme.background,
                        borderColor: theme.border 
                      }
                    ]}
                    onPress={() => handleSessionChange(dateKey, 1)}
                  >
                    <Text style={[
                      styles.sessionText, 
                      { color: currentSession === 1 ? '#FFFFFF' : theme.text }
                    ]}>
                      Full
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sessionButton,
                      { 
                        backgroundColor: currentSession === 2 ? theme.primary : theme.background,
                        borderColor: theme.border 
                      }
                    ]}
                    onPress={() => handleSessionChange(dateKey, 2)}
                  >
                    <Text style={[
                      styles.sessionText,
                      { color: currentSession === 2 ? '#FFFFFF' : theme.text }
                    ]}>
                      First Half
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.sessionButton,
                      { 
                        backgroundColor: currentSession === 3 ? theme.primary : theme.background,
                        borderColor: theme.border 
                      }
                    ]}
                    onPress={() => handleSessionChange(dateKey, 3)}
                  >
                    <Text style={[
                      styles.sessionText,
                      { color: currentSession === 3 ? '#FFFFFF' : theme.text }
                    ]}>
                      Second Half
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const handleAttachmentPick = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [types.pdf, types.images],
        allowMultiSelection: true,
        copyTo: 'cachesDirectory'
      });

      const validFiles = results.filter(file => {
        if (file.size && file.size > 5 * 1024 * 1024) {
          setAlertMessage(getLocalizedText('fileTooLarge'));
          setShowAlert(true);
          return false;
        }
        return true;
      });

      setAttachments(prev => [...prev, ...validFiles]);
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error('Error picking document:', err);
        setAlertMessage(getLocalizedText('attachmentError'));
        setShowAlert(true);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const submitLeaveApplication = async () => {
    try {
      if (!userId) {
        console.log('Debug: Missing userId');
        setAlertMessage(getLocalizedText('invalidUserId'));
        setShowAlert(true);
        return;
      }

      if (dateTo < dateFrom) {
        console.log('Debug: Invalid date range');
        setAlertMessage(getLocalizedText('invalidDateRange'));
        setShowAlert(true);
        return;
      }

      if (!selectedLeave) {
        console.log('Debug: No leave type selected');
        setAlertMessage(getLocalizedText('selectLeaveTypeFirst'));
        setShowAlert(true);
        return;
      }

      if (!reason.trim()) {
        console.log('Debug: No reason provided');
        setAlertMessage(getLocalizedText('enterReasonFirst'));
        setShowAlert(true);
        return;
      }

      // Check notification policy
      if (leavePolicy?.annualLeaveNotificationPolicy) {
        const today = new Date();
        const diffTime = dateFrom.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < leavePolicy.annualLeaveNotificationPolicy) {
          setAlertTitle(getLocalizedText('policyViolation'));
          setAlertMessage(
            getLocalizedText('notificationPolicyError')
              .replace('{days}', leavePolicy.annualLeaveNotificationPolicy.toString())
          );
          setShowAlert(true);
          return;
        }
      }

      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      console.log('Debug: Initial Data:', {
        userToken: userToken ? 'exists' : 'missing',
        baseUrl,
        employeeId,
        userId,
        selectedLeave,
        dateFrom: dateFrom.toISOString(),
        dateTo: dateTo.toISOString(),
        sessionType,
        reason
      });

      const leaveDates: LeaveApplicationDate[] = [];
      let currentDate = new Date(dateFrom);
      while (currentDate <= dateTo) {
        leaveDates.push({
          Date: currentDate.toISOString(),
          SessionId: sessionType
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('Debug: Leave Dates:', leaveDates);

      const formData = new FormData();
      formData.append('LeaveCodeId', selectedLeave.leaveCodeId.toString());
      formData.append('Year', new Date().getFullYear().toString());
      formData.append('DateFrom', dateFrom.toISOString());
      formData.append('DateTo', dateTo.toISOString());
      formData.append('TotalDays', leaveDates.length.toString());
      formData.append('Reason', reason);
      formData.append('UserId', userId);

      leaveDates.forEach((leaveDate, index) => {
        formData.append(`LeaveDateList[${index}].Date`, leaveDate.Date);
        formData.append(`LeaveDateList[${index}].SessionId`, sessions[leaveDate.Date.split('T')[0]]?.toString() || '1');
      });

      for (const file of attachments) {
        const fileData = {
          uri: file.uri,
          type: file.type || 'application/pdf',
          name: file.name || 'document.pdf',
        } as any;  // Use type assertion to bypass FormData type checking
        
        formData.append('Attachments', fileData);
      }

      console.log('Debug: FormData values:', {
        LeaveCodeId: selectedLeave.leaveCodeId,
        Year: new Date().getFullYear(),
        DateFrom: dateFrom.toISOString(),
        DateTo: dateTo.toISOString(),
        TotalDays: leaveDates.length,
        Reason: reason,
        UserId: userId,
        LeaveDateList: leaveDates
      });

      console.log('Debug: Making API request to:', `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves`);

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'multipart/form-data',
          },
          body: formData
        }
      );

      console.log('Debug: Response status:', response.status);
      const data = await response.json();
      console.log('Debug: Response data:', data);

      if (data.success) {
        console.log('Debug: Submit successful');
        setAlertMessage(getLocalizedText('leaveSubmitSuccess'));
        setShowAlert(true);
        navigation.goBack();
      } else {
        console.log('Debug: Submit failed with message:', data.message);
        setAlertMessage(data.message || getLocalizedText('leaveSubmitFailed'));
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Debug: Submit error:', error);
      setAlertMessage(getLocalizedText('leaveSubmitError'));
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const renderAttachments = () => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>
        {getLocalizedText('attachments')}
      </Text>
      
      {attachments.map((file, index) => (
        <View key={index} style={styles.attachmentItem}>
          <Text style={[styles.fileType, { color: theme.primary }]}>
            {file.type?.includes('pdf') ? 'PDF' : 'IMG'}
          </Text>
          <Text style={[styles.attachmentName, { color: theme.text }]} numberOfLines={1}>
            {file.name}
          </Text>
          <TouchableOpacity onPress={() => removeAttachment(index)}>
            <Image 
              source={require('../../../../asset/img/icon/a-close.png')}
              style={[styles.removeIcon, { tintColor: theme.error }]}
            />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity 
        style={[styles.attachmentButton, { borderColor: theme.border }]}
        onPress={handleAttachmentPick}
      >
        <Image 
          source={require('../../../../asset/img/icon/a-document.png')}
          style={[styles.attachIcon, { tintColor: theme.primary }]}
        />
        <Text style={[styles.attachmentButtonText, { color: theme.primary }]}>
          {getLocalizedText('addAttachment')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderLeaveCodeDropdown = () => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>
        {getLocalizedText('selectLeaveCode')}
      </Text>
      <TouchableOpacity
        style={[styles.dropdownButton, { backgroundColor: theme.background, borderColor: theme.border }]}
        onPress={() => setShowLeaveCodePicker(true)}
      >
        <Text style={[styles.dropdownText, { color: selectedLeave ? theme.text : theme.subText }]}>
          {selectedLeave ? selectedLeave.leaveCodeDesc : getLocalizedText('selectLeaveCode')}
        </Text>
        <Image
          source={require('../../../../asset/img/icon/a-arrow-down.png')}
          style={[styles.dropdownIcon, { tintColor: theme.text }]}
        />
      </TouchableOpacity>
      
      {showLeaveCodePicker && (
        <Modal
          visible={showLeaveCodePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowLeaveCodePicker(false)}
        >
          <TouchableOpacity 
            style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            onPress={() => setShowLeaveCodePicker(false)}
          >
            <View style={[styles.pickerContainer, { 
              backgroundColor: theme.card,
              borderTopColor: theme.border,
              borderLeftColor: theme.border,
              borderRightColor: theme.border,
            }]}>
              <ScrollView>
                {entitlements.map((leave) => (
                  <TouchableOpacity
                    key={leave.leaveCodeId}
                    style={[styles.leaveCodeItem, { borderBottomColor: theme.border }]}
                    onPress={() => {
                      setSelectedLeave(leave);
                      fetchLeavePolicy(leave.leaveCodeId);
                      setShowLeaveCodePicker(false);
                    }}
                  >
                    <Text style={[styles.leaveCodeText, { color: theme.text }]}>
                      {leave.leaveCodeDesc}
                    </Text>
                    <Text style={[styles.balanceText, { color: theme.subText }]}>
                      {`${leave.balanceDays} ${getLocalizedText('days')}`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );

  const renderLeaveNote = () => {
    if (!selectedLeave || !leavePolicy) return null;

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {getLocalizedText('note')}
        </Text>
        <Text style={[styles.noteText, { color: theme.subText }]}>
          {leavePolicy.note || '--'}
        </Text>
      </View>
    );
  };

  const renderReasonInput = () => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Text style={[styles.cardTitle, { color: theme.text }]}>
        {getLocalizedText('reason')}
      </Text>
      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.background,
          color: theme.text,
          borderColor: theme.border,
        }]}
        placeholder={getLocalizedText('enterReason')}
        placeholderTextColor={theme.subText}
        value={reason}
        onChangeText={setReason}
        multiline
      />
    </View>
  );

  const DateValidationInfo = () => {
    if (!selectedLeave) return null;

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {getLocalizedText('dateValidation')}
        </Text>
        
        {nonWorkingDays.length > 0 && (
          <View style={styles.validationItem}>
            <Text style={[styles.validationText, { color: theme.error }]}>
              {getLocalizedText('nonWorkingDays')}:
            </Text>
            <Text style={[styles.dateList, { color: theme.subText }]}>
              {nonWorkingDays.map(date => new Date(date).toLocaleDateString()).join(', ')}
            </Text>
          </View>
        )}
        
        {holidays.length > 0 && (
          <View style={styles.validationItem}>
            <Text style={[styles.validationText, { color: theme.error }]}>
              {getLocalizedText('holidays')}:
            </Text>
            <Text style={[styles.dateList, { color: theme.subText }]}>
              {holidays.map(date => new Date(date).toLocaleDateString()).join(', ')}
            </Text>
          </View>
        )}
        
        {consecutiveDays.length > 0 && (
          <View style={styles.validationItem}>
            <Text style={[styles.validationText, { color: theme.warning }]}>
              {getLocalizedText('consecutiveDays')}:
            </Text>
            <Text style={[styles.dateList, { color: theme.subText }]}>
              {consecutiveDays.map(date => new Date(date).toLocaleDateString()).join(', ')}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
          {renderLeaveCodeDropdown()}
          {renderLeaveNote()}
          {renderDateSelection()}
          {renderSessionType()}
          {renderAttachments()}
          
          {renderReasonInput()}

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: theme.primary }]}
            onPress={submitLeaveApplication}
          >
            <Text style={styles.submitButtonText}>
              {getLocalizedText('submit')}
            </Text>
          </TouchableOpacity>

          <DateValidationInfo />
        </>
      )}

      <CustomAlert
        visible={showAlert}
        title={alertTitle}
        message={alertMessage}
        buttons={[
          {
            text: 'OK',
            onPress: () => setShowAlert(false)
          }
        ]}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  sessionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sessionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  attachmentName: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  removeIcon: {
    width: 20,
    height: 20,
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  attachIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  attachmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileType: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
  },
  dropdownIcon: {
    width: 20,
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    maxHeight: '50%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  leaveCodeItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  leaveCodeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
  },
  balanceText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  daySessionContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  excludeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  excludeButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalDays: {
    fontSize: 16,
    fontWeight: '600',
  },
  noteText: {
    fontSize: 14,
    lineHeight: 20,
  },
  validationItem: {
    marginVertical: 8,
  },
  validationText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateList: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default CreateLeaveApplication;
