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
  leaveCodeDesc: string;
  balanceDays: number;
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

interface DateInfo {
  date: string;
  availableSessions: Array<{
    id: number;
    description: string;
  }>;
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

// Add interface for leave validation
interface LeaveValidation {
  unavailableDates: string[];
  duplicateLeaves: Array<{
    date: string;
    leaveCode: string;
    session: string;
    approvalStatus: string;
  }>;
}

interface LeaveSettings {
  allowBackdate: boolean;
  requireAttachment: boolean;
  isConsecutiveDay: boolean;
  maxDaysPerApplication: number;
  allowHalfDay: boolean;
}

interface LeaveSession {
  id: number;
  description: string;
}

interface LeaveApplication {
  leaveCode: string;
  session: string;
  approvalStatus: string;
}

interface LeaveDate {
  date: string;
  availableSessions: LeaveSession[];
  typeOfDay: string | null;
  isWorkingDay: boolean;
  leaveAppList: LeaveApplication[];
  isHoliday: boolean;
  holiday: string | null;
  isConsecutive: boolean;
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
  const [initialExclusionsApplied, setInitialExclusionsApplied] = useState(false);
  const [leaveDates, setLeaveDates] = useState<LeaveDate[]>([]);
  const [nonWorkingDays, setNonWorkingDays] = useState<string[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [consecutiveDays, setConsecutiveDays] = useState<string[]>([]);
  const [leaveValidation, setLeaveValidation] = useState<LeaveValidation>({
    unavailableDates: [],
    duplicateLeaves: []
  });
  const [showSessionPopup, setShowSessionPopup] = useState<string | null>(null); // stores dateKey of active popup
  const [leaveSettings, setLeaveSettings] = useState<LeaveSettings | null>(null);

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
        const routeUserId = route.params?.userId;
        
        if (routeUserId) {
          setUserId(routeUserId.toString());
        } else {
          const storedUserId = await AsyncStorage.getItem('userId');
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

  const fetchLeaveSettings = async (leaveCodeId: number) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      console.log('Fetching leave settings for leaveCodeId:', leaveCodeId);
      
      const response = await fetch(
        `${baseUrl}/apps/api/v1/leaves/settings/${leaveCodeId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const settings = {
          allowBackdate: data.data.allowBackdate,
          requireAttachment: data.data.requireAttachment,
          isConsecutiveDay: data.data.isConsecutiveDay,
          maxDaysPerApplication: data.data.maxDaysPerApplication,
          allowHalfDay: data.data.allowHalfDay
        };
        
        setLeaveSettings(settings);
        
        // Handle consecutive days
        if (data.data.isConsecutiveDay) {
          console.log('Consecutive day is enabled, auto-selecting dates');
          
          // Only exclude dates that have existing leaves
          const newExcludedDates = leaveDates
            .filter(date => {    
              // For consecutive days, ONLY exclude if there's an existing leave
              const shouldExclude = date.leaveAppList.length > 0;
              console.log('Should Exclude:', shouldExclude);
              
              return shouldExclude;
            })
            .map(date => new Date(date.date).toISOString().split('T')[0]);
          setExcludedDates(newExcludedDates);
        } else {
          // For non-consecutive leaves, exclude special days as well
          const newExcludedDates = leaveDates
            .filter(date => 
              date.leaveAppList.length > 0 || 
              (date.typeOfDay && date.typeOfDay !== 'Working') ||
              date.availableSessions.length === 1 && date.availableSessions[0].id === 0
            )
            .map(date => new Date(date.date).toISOString().split('T')[0]);
          
          setExcludedDates(newExcludedDates);
        }
      }
    } catch (error) {
      console.error('Error fetching leave settings:', error);
    }
  };

  const fetchLeaveDates = async (leaveCodeId: number, startDate: Date, endDate: Date) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      const formatDate = (date: Date) => {
        return date.toISOString().split('T')[0] + 'T00:00:00Z';
      };
      
      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves/leave-dates?LeaveCodeId=${leaveCodeId}&DateFrom=${formatDate(startDate)}&DateTo=${formatDate(endDate)}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log('Leave dates response:', data.data);
        setLeaveDates(data.data);
        
        if (leaveSettings) {
          console.log('Checking dates with settings:', leaveSettings);
          
          const excludedDatesArray: string[] = [];
          
          data.data.forEach((date: LeaveDate) => {
            const dateStr = new Date(date.date).toISOString().split('T')[0];
            console.log('\nProcessing date:', dateStr);
            console.log('Type of Day:', date.typeOfDay);
            console.log('Has Leave:', date.leaveAppList.length > 0);
            console.log('Is Consecutive:', date.isConsecutive);
            
            let shouldExclude = false;
            
            if (date.isConsecutive) {
              // For consecutive leaves:
              // Only exclude if there's an existing leave
              shouldExclude = date.leaveAppList.length > 0;
              console.log('Consecutive Day - Should Exclude (has leave):', shouldExclude);
            } else {
              // For non-consecutive leaves:
              // 1. Exclude if has existing leave
              const hasLeave = date.leaveAppList.length > 0;
              
              // 2. Exclude if special day (Public Holiday, Rest Day, Off Day)
              const isSpecialDay = date.typeOfDay === 'Public Holiday' || 
                                 date.typeOfDay === 'Rest Day' || 
                                 date.typeOfDay === 'Off Day';
              
              // 3. Include if Working Day or no type specified
              const isWorkingDay = date.typeOfDay === 'Working' || 
                                 date.typeOfDay === null || 
                                 date.isWorkingDay;
              
              shouldExclude = hasLeave || isSpecialDay || !isWorkingDay;
              
              console.log('Non-consecutive Day - Details:', {
                hasLeave,
                isSpecialDay,
                isWorkingDay,
                shouldExclude
              });
            }
            
            if (shouldExclude) {
              excludedDatesArray.push(dateStr);
            }
          });
          
          console.log('Final excluded dates:', excludedDatesArray);
          setExcludedDates(excludedDatesArray);
        } else {
          console.log('Leave settings not available yet');
        }
      }
    } catch (error) {
      console.error('Error fetching leave dates:', error);
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
          none: 'Tiada',
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
          leaveValidationError: 'Pengesahan Cuti',
          duplicateLeaveMessage: 'Cuti telah dipohon untuk tarikh berikut:',
          existingLeave: 'Cuti Sedia Ada',
          remark: 'Catatan',
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
          none: '无',
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
          leaveValidationError: '休假验证',
          duplicateLeaveMessage: '以下日期已申请休假：',
          existingLeave: '现有休假',
          remark: '备注',
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
          none: '無',
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
          leaveValidationError: '休假验证',
          duplicateLeaveMessage: '以下日期已申请休假：',
          existingLeave: '现有休假',
          remark: '備註',
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
          none: 'None',
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
          leaveValidationError: 'Leave Validation',
          duplicateLeaveMessage: 'Leave already applied for the following dates:',
          existingLeave: 'Existing Leave',
          remark: 'Remark',
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
  };

  const calculateTotalDays = () => {
    const dayDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24)) + 1;
    let total = 0;

    for (let i = 0; i < dayDiff; i++) {
      const currentDate = new Date(dateFrom);
      currentDate.setDate(dateFrom.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      // Skip if date is excluded or unavailable
      if (excludedDates.includes(dateKey) || isDateUnavailable(dateKey)) continue;

      // Add days based on session type
      const sessionType = sessions[dateKey] || 1;
      if (sessionType === 1) {
        total += 1;
      } else {
        total += 0.5;
      }
    }

    return total;
  };

  const isDateUnavailable = (dateKey: string) => {
    const dateData = leaveDates.find(d => new Date(d.date).toISOString().split('T')[0] === dateKey);
    
    // If we can't find the date data, don't mark it as unavailable yet
    if (!dateData) return false;

    // Check if date has existing leave application
    if (dateData.leaveAppList && dateData.leaveAppList.length > 0) {
      return true;
    }

    // Check if only "None" session is available
    if (dateData.availableSessions.length === 1 && dateData.availableSessions[0].id === 0) {
      return true;
    }

    // Date is available if it has valid sessions
    return false;
  };

  const toggleDateExclusion = (dateKey: string) => {
    setExcludedDates(prev => {
      const isCurrentlyExcluded = prev.includes(dateKey);
      if (isCurrentlyExcluded) {
        return prev.filter(d => d !== dateKey);
      } else {
        return [...prev, dateKey];
      }
    });
  };

  const renderSessionType = () => {
    // Calculate the date difference including the end date
    const dayDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 3600 * 24)) + 1;

    // Calculate total days excluding special days and holidays
    const workingDays = Array.from({ length: dayDiff }).reduce((count: number, _, index) => {
      const currentDate = new Date(dateFrom);
      currentDate.setDate(dateFrom.getDate() + index);
      const dateKey = currentDate.toISOString().split('T')[0];
      const dateData = leaveDates.find(d => new Date(d.date).toISOString().split('T')[0] === dateKey);
      
      // Skip if date is excluded
      if (excludedDates.includes(dateKey)) {
        return count;
      }

      // Skip if no date data
      if (!dateData) {
        return count;
      }

      // Skip if it's a special day (unless manually included)
      const isSpecialDay = ['Public Holiday', 'Rest Day', 'Off Day'].includes(dateData.typeOfDay || '');
      if (isSpecialDay && excludedDates.includes(dateKey)) {
        return count;
      }

      // Get session type (default to full day if not set)
      const sessionType = sessions[dateKey];
      if (!sessionType) {
        return count + 1; // Default to full day
      }

      // Calculate based on session type
      switch (sessionType) {
        case 2104: // First Half
        case 2105: // Second Half
          return count + 0.5;
        case 2103: // Full Day
          return count + 1;
        default:
          return count;
      }
    }, 0);

    return (
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {getLocalizedText('session')}
          </Text>
          <Text style={[styles.totalDays, { color: theme.primary }]}>
            {`${workingDays} ${getLocalizedText('days')}`}
          </Text>
        </View>
        
        {Array.from({ length: dayDiff }).map((_, index) => {
          const currentDate = new Date(dateFrom);
          currentDate.setDate(dateFrom.getDate() + index);
          const dateKey = currentDate.toISOString().split('T')[0];
          const dateData = leaveDates.find(d => new Date(d.date).toISOString().split('T')[0] === dateKey);
          
          if (!dateData) return null;

          const hasLeaveApplication = dateData.leaveAppList?.length > 0;
          const isExcluded = excludedDates.includes(dateKey);
          const typeOfDay = dateData.typeOfDay || '';
          const leaveStatus = hasLeaveApplication 
            ? `${dateData.leaveAppList[0].leaveCode} - ${dateData.leaveAppList[0].session}`
            : '';

          // Determine status color and background
          const getStatusStyle = () => {
            if (hasLeaveApplication) {
              return {
                color: theme.error,
                backgroundColor: 'rgba(255,59,48,0.1)'
              };
            }
            switch (typeOfDay) {
              case 'Public Holiday':
                return {
                  color: '#FFB800',
                  backgroundColor: 'rgba(255,184,0,0.1)'
                };
              case 'Rest Day':
                return {
                  color: '#FF9500',
                  backgroundColor: 'rgba(255,149,0,0.1)'
                };
              case 'Off Day':
                return {
                  color: '#FF6B00',
                  backgroundColor: 'rgba(255,107,0,0.1)'
                };
              case 'Working':
                return {
                  color: theme.success,
                  backgroundColor: 'rgba(52,199,89,0.1)'
                };
              default:
                return {
                  color: theme.text,
                  backgroundColor: 'transparent'
                };
            }
          };

          const statusStyle = getStatusStyle();

          return (
            <View key={index} style={styles.daySessionContainer}>
              <View style={styles.dateHeaderContainer}>
                <TouchableOpacity 
                  style={[styles.checkbox, { 
                    borderColor: theme.border,
                    backgroundColor: 'transparent'
                  }]}
                  onPress={() => toggleDateExclusion(dateKey)}
                >
                  {!isExcluded && (
                    <Image 
                      source={require('../../../../asset/img/icon/a-check.png')}
                      style={[styles.checkIcon, { tintColor: theme.primary }]}
                    />
                  )}
                </TouchableOpacity>

                <Text style={[styles.dateLabel, { color: theme.text }]}>
                  {currentDate.toLocaleDateString()}
                </Text>

                <TouchableOpacity 
                  style={[styles.sessionButton, { borderColor: theme.border }]}
                  onPress={() => setShowSessionPopup(showSessionPopup === dateKey ? null : dateKey)}
                >
                  <Text style={[styles.sessionText, { color: theme.text }]}>
                    {isExcluded ? getLocalizedText('none') : 
                      sessions[dateKey] === 2103 ? getLocalizedText('fullDay') : 
                      sessions[dateKey] === 2104 ? getLocalizedText('firstHalf') : 
                      sessions[dateKey] === 2105 ? getLocalizedText('secondHalf') : getLocalizedText('fullDay')}
                  </Text>
                  <Image 
                    source={require('../../../../asset/img/icon/a-arrow-down.png')}
                    style={[styles.arrowIcon, { 
                      tintColor: theme.text,
                      transform: [{ rotate: showSessionPopup === dateKey ? '180deg' : '0deg' }]
                    }]}
                  />
                </TouchableOpacity>
              </View>
              
              {/* Remark row - always show */}
              <View style={styles.remarkContainer}>
                <Text style={[styles.remarkLabel, { color: theme.subText }]}>
                  {getLocalizedText('remark')}: {
                    (() => {
                      const dateData = leaveDates.find(d => 
                        new Date(d.date).toISOString().split('T')[0] === dateKey
                      );
                      
                      if (!dateData) return getLocalizedText('none');
                      
                      // Show leave application if exists
                      if (dateData.leaveAppList && dateData.leaveAppList.length > 0) {
                        const leave = dateData.leaveAppList[0];
                        return `${leave.leaveCode} - ${leave.session}`;
                      }
                      
                      // Show type of day if it's a special day
                      if (dateData.typeOfDay && dateData.typeOfDay !== 'Working') {
                        return dateData.typeOfDay;
                      }
                      
                      return getLocalizedText('none');
                    })()
                  }
                </Text>
              </View>

              {/* Session Popup */}
              {showSessionPopup === dateKey && (
                <Modal
                  visible={true}
                  transparent={true}
                  animationType="fade"
                  onRequestClose={() => setShowSessionPopup(null)}
                >
                  <TouchableOpacity 
                    style={styles.modalOverlay}
                    onPress={() => setShowSessionPopup(null)}
                  >
                    <View style={[styles.pickerContainer, { backgroundColor: theme.card }]}>
                      {[
                        { id: 2103, description: getLocalizedText('fullDay') },
                        { id: 2104, description: getLocalizedText('firstHalf') },
                        { id: 2105, description: getLocalizedText('secondHalf') }
                      ].map((session) => (
                        <TouchableOpacity
                          key={session.id}
                          style={styles.leaveCodeItem}
                          onPress={() => {
                            handleSessionChange(dateKey, session.id);
                            setShowSessionPopup(null);
                          }}
                        >
                          <Text style={[styles.leaveCodeText, { color: theme.text }]}>
                            {session.description}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // Helper function to get status message
  const getStatusMessage = (dateData: DateInfo) => {
    if (dateData.leaveAppList && dateData.leaveAppList.length > 0) {
      const leave = dateData.leaveAppList[0];
      return `${leave.leaveCode} - ${leave.session}`;
    }
    
    if (dateData.typeOfDay === 'Public Holiday') {
      return `Public Holiday${dateData.holiday ? ` - ${dateData.holiday}` : ''}`;
    }
    
    if (dateData.typeOfDay === 'Rest Day') {
      return 'Rest Day';
    }
    
    if (dateData.typeOfDay === 'Off Day') {
      return 'Off Day';
    }
    
    return '';
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

  const checkLeaveAvailability = async (leaveCodeId: number, startDate: Date, endDate: Date) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      if (!userToken || !baseUrl || !employeeId) {
        throw new Error('Missing required data');
      }

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves/leave-dates?LeaveCodeId=${leaveCodeId}&DateFrom=${startDate.toISOString()}&DateTo=${endDate.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const unavailableDates: string[] = [];
        const duplicateLeaves: Array<any> = [];

        data.data.forEach((dateInfo: any) => {
          const date = new Date(dateInfo.date).toLocaleDateString();
          
          // Check if date has only "None" available or has existing leave application
          if (
            (dateInfo.availableSessions.length === 1 && dateInfo.availableSessions[0].id === 0) ||
            dateInfo.leaveAppList.length > 0
          ) {
            unavailableDates.push(date);
            
            if (dateInfo.leaveAppList.length > 0) {
              duplicateLeaves.push({
                date,
                ...dateInfo.leaveAppList[0]
              });
            }
          }
        });

        setLeaveValidation({ unavailableDates, duplicateLeaves });

        // Return false if there are any unavailable dates
        if (unavailableDates.length > 0) {
          const duplicateMessage = duplicateLeaves.map(leave => 
            `${leave.date}: ${leave.leaveCode} (${leave.session})`
          ).join('\n');

          setAlertTitle(getLocalizedText('leaveValidationError'));
          setAlertMessage(
            `${getLocalizedText('duplicateLeaveMessage')}\n\n${duplicateMessage}`
          );
          setShowAlert(true);
          return false;
        }

        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking leave availability:', error);
      return false;
    }
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

      // Check leave availability before submitting
      const isAvailable = await checkLeaveAvailability(
        selectedLeave?.leaveCodeId || 0,
        dateFrom,
        dateTo
      );

      if (!isAvailable) {
        return;
      }

      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');

      const leaveDates: LeaveApplicationDate[] = [];
      let currentDate = new Date(dateFrom);
      while (currentDate <= dateTo) {
        leaveDates.push({
          Date: currentDate.toISOString(),
          SessionId: sessionType
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

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

      const data = await response.json();

      if (data.success) {
        setAlertMessage(getLocalizedText('leaveSubmitSuccess'));
        setShowAlert(true);
        navigation.goBack();
      } else {
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
                      handleLeaveCodeSelect(leave);
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

  // Add useEffect to fetch leave dates when dates or leave code changes
  useEffect(() => {
    if (selectedLeave && dateFrom && dateTo) {
      setInitialExclusionsApplied(false);
      setExcludedDates([]); // Reset exclusions
      fetchLeaveDates(selectedLeave.leaveCodeId, dateFrom, dateTo);
    }
  }, [selectedLeave, dateFrom, dateTo]);

  // Update useEffect to properly handle all exclusion cases
  useEffect(() => {
    if (leaveDates.length > 0 && !initialExclusionsApplied) {
      const autoExcludedDates = leaveDates
        .filter(date => {
          const dateKey = new Date(date.date).toISOString().split('T')[0];
          const isSpecialDay = date.typeOfDay === 'Public Holiday' || 
                             date.typeOfDay === 'Rest Day' || 
                             date.typeOfDay === 'Off Day';
          const hasLeave = date.leaveAppList?.length > 0;
          const shouldExclude = isSpecialDay || hasLeave || date.isHoliday;      
          
          return shouldExclude;
        })
        .map(date => new Date(date.date).toISOString().split('T')[0]);
      
      setExcludedDates(prev => {
        const newExclusions = [...new Set([...prev, ...autoExcludedDates])];
        return newExclusions;
      });
      setInitialExclusionsApplied(true);
    }
  }, [leaveDates]);

  // Reset exclusions when date range changes
  useEffect(() => {
    setInitialExclusionsApplied(false);
    setExcludedDates([]);
  }, [dateFrom, dateTo]);


  // Add a debug useEffect to monitor state changes
  useEffect(() => {
  }, [excludedDates]);

  // Update the leave code selection handler
  const handleLeaveCodeSelect = async (entitlement: LeaveEntitlement) => {
    try {
      console.log('Selected new leave code:', entitlement.leaveCodeDesc);
      
      // Clear existing data first
      setSessions({});
      setExcludedDates([]);
      setLeaveDates([]);
      
      // Set the new selected leave
      setSelectedLeave(entitlement);
      setShowLeaveCodePicker(false);

      // Fetch leave settings first
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      const settingsResponse = await fetch(
        `${baseUrl}/apps/api/v1/leaves/settings/${entitlement.leaveCodeId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const settingsData = await settingsResponse.json();
      if (settingsData.success) {
        const settings = {
          allowBackdate: settingsData.data.allowBackdate,
          requireAttachment: settingsData.data.requireAttachment,
          isConsecutiveDay: settingsData.data.isConsecutiveDay,
          maxDaysPerApplication: settingsData.data.maxDaysPerApplication,
          allowHalfDay: settingsData.data.allowHalfDay
        };
        
        setLeaveSettings(settings);
        
        // If we have dates, immediately fetch leave dates with new settings
        if (dateFrom && dateTo) {
          await fetchLeaveDates(entitlement.leaveCodeId, dateFrom, dateTo);
        }
      }
    } catch (error) {
      console.error('Error handling leave code selection:', error);
    }
  };

  // Remove the selectedLeave useEffect since we're handling it in handleLeaveCodeSelect
  // Keep the date change useEffect
  useEffect(() => {
    if (selectedLeave?.leaveCodeId && dateFrom && dateTo) {
      console.log('Dates changed, fetching new leave dates');
      fetchLeaveDates(selectedLeave.leaveCodeId, dateFrom, dateTo);
    }
  }, [dateFrom, dateTo]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        {renderLeaveCodeDropdown()}
        {renderDateSelection()}
        {selectedLeave && leaveDates.length > 0 && renderSessionType()}
        {renderAttachments()}
        {renderReasonInput()}
        
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
          onPress={submitLeaveApplication}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>
              {getLocalizedText('submit')}
            </Text>
          )}
        </TouchableOpacity>
      </View>

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
  content: {
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
    width: 120,
    justifyContent: 'space-between',
  },
  sessionText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
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
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
  },
  dateLabel: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 14,
  },
  dateHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  excludeButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 40,
  },
  excludeButtonText: {
    fontSize: 13,
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
  unavailableText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  statusContainer: {
    padding: 6,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 13,
    letterSpacing: 0.1,
    fontWeight: '600',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    width: 16,
    height: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  remarkContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  remarkLabel: {
    fontSize: 14,
  },
});

export default CreateLeaveApplication;
