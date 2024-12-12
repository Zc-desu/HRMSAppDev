import React, { useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../modules/setting/ThemeContext';
import { useLanguage } from '../../modules/setting/LanguageContext';
import CustomAlert from '../../modules/setting/CustomAlert';

interface TimeLogDetail {
  id: number;
  employeeId: number;
  employeeNumber: string | null;
  employeeName: string | null;
  entryTime: string;
  address: string | null;
  remarks: string | null;
  approvalStatus: string;
  photos: Array<{
    id: number;
    fileName: string;
    mimeType: string;
  }>;
}

interface RejectionDetail {
  approvalLevel: number;
  approval: string;
  respondDate: string;
  approvalDecision: string;
  reason: string;
}

const translations = {
  'en': {
    timeLogDetails: 'Time Log Details',
    employeeNumber: 'Employee Number',
    employeeName: 'Employee Name',
    entryTime: 'Entry Time',
    address: 'Address',
    remarks: 'Remarks',
    status: 'Status',
    approved: 'Approved',
    pending: 'Pending',
    photos: 'Photos',
    error: 'Error',
    failedFetch: 'Failed to fetch time log details',
    ok: 'OK',
    loading: 'Loading...',
    noData: '--',
    rejected: 'Rejected',
    rejectedBy: 'Rejected By',
    rejectionReason: 'Rejection Reason',
  },
  'ms': {
    timeLogDetails: 'Butiran Log Masa',
    employeeNumber: 'Nombor Pekerja',
    employeeName: 'Nama Pekerja',
    entryTime: 'Masa Masuk',
    address: 'Alamat',
    remarks: 'Catatan',
    status: 'Status',
    approved: 'Diluluskan',
    pending: 'Dalam Proses',
    photos: 'Gambar',
    error: 'Ralat',
    failedFetch: 'Gagal mendapatkan butiran log masa',
    ok: 'OK',
    loading: 'Memuatkan...',
    noData: '--',
    rejected: 'Ditolak',
    rejectedBy: 'Ditolak Oleh',
    rejectionReason: 'Sebab Penolakan',
  },
  'zh-Hans': {
    timeLogDetails: '时间记录详情',
    employeeNumber: '员工编号',
    employeeName: '员工姓名',
    entryTime: '打卡时间',
    address: '地址',
    remarks: '备注',
    status: '状态',
    approved: '已批准',
    pending: '待处理',
    photos: '照片',
    error: '错误',
    failedFetch: '无法获取时间记录详情',
    ok: '确定',
    loading: '加载中...',
    noData: '--',
    rejected: '已拒绝',
    rejectedBy: '拒绝人',
    rejectionReason: '拒绝原因',
  },
  'zh-Hant': {
    timeLogDetails: '時間記錄詳情',
    employeeNumber: '員工編號',
    employeeName: '員工姓名',
    entryTime: '打卡時間',
    address: '地址',
    remarks: '備註',
    status: '狀態',
    approved: '已批准',
    pending: '待處理',
    photos: '照片',
    error: '錯誤',
    failedFetch: '無法獲取時間記錄詳情',
    ok: '確定',
    loading: '加載中...',
    noData: '--',
    rejected: '已拒絕',
    rejectedBy: '拒絕人',
    rejectionReason: '拒絕原因',
  }
};

const ATTimeLogDetails = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [timeLogDetail, setTimeLogDetail] = useState<TimeLogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { timeLogId, employeeId, baseUrl, photos } = route.params;
  const [rejectionDetails, setRejectionDetails] = useState<RejectionDetail[]>([]);

  const getLocalizedText = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations[keyof typeof translations]] || key;
  };

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
      title: getLocalizedText('timeLogDetails'),
    });
  }, [navigation, theme]);

  const fetchTimeLogDetail = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) throw new Error('Authentication token not found');

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/attendance/time-logs/${timeLogId}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setTimeLogDetail(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch time log details');
      }
    } catch (error) {
      console.error('Error fetching time log details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRejectionDetails = async () => {
    if (timeLogDetail?.approvalStatus === 'R') {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) throw new Error('Authentication token not found');

        const response = await fetch(
          `${baseUrl}/apps/api/v1/employees/${employeeId}/attendance/time-logs/${timeLogId}/approval-status?ApprovalAction=A`,
          {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Accept': 'application/json',
            },
          }
        );

        const data = await response.json();
        if (data.success) {
          setRejectionDetails(data.data);
        }
      } catch (error) {
        console.error('Error fetching rejection details:', error);
      }
    }
  };

  useEffect(() => {
    fetchTimeLogDetail();
  }, []);

  useEffect(() => {
    if (timeLogDetail?.approvalStatus === 'R') {
      fetchRejectionDetails();
    }
  }, [timeLogDetail]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-MY', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kuala_Lumpur'
    });
  };

  const renderDetailItem = (label: string, value: string | null) => (
    <View style={styles.detailItem}>
      <Text style={[styles.label, { color: theme.subText }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]}>
        {value || getLocalizedText('noData')}
      </Text>
    </View>
  );

  const renderPhotos = () => (
    <View style={styles.photosSection}>
      <Text style={[styles.label, { color: theme.subText }]}>
        {getLocalizedText('photos')}
      </Text>
      <View style={styles.photosList}>
        {photos.map((photo: { id: number; fileName: string }) => (
          <TouchableOpacity
            key={photo.id}
            style={styles.photoItem}
            onPress={() => navigation.navigate('ATTimeLogPhoto', {
              timeLogId,
              employeeId,
              photoId: photo.id,
              baseUrl
            })}
          >
            <Image
              source={require('../../../../asset/img/icon/a-document.png')}
              style={[styles.docIcon, { tintColor: theme.primary }]}
            />
            <Text 
              style={[styles.fileName, { color: theme.text }]}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {photo.fileName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const getStatusText = (status: string) => {
    switch (status) {
      case 'A': return getLocalizedText('approved');
      case 'R': return getLocalizedText('rejected');
      default: return getLocalizedText('pending');
    }
  };

  const renderRejectionDetails = () => {
    if (timeLogDetail?.approvalStatus === 'R' && rejectionDetails.length > 0) {
      const rejection = rejectionDetails[0];
      return (
        <>
          {renderDetailItem(getLocalizedText('rejectedBy'), rejection.approval)}
          {renderDetailItem(getLocalizedText('rejectionReason'), rejection.reason || getLocalizedText('noData'))}
        </>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.text }]}>
          {getLocalizedText('loading')}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {renderDetailItem(getLocalizedText('employeeNumber'), timeLogDetail?.employeeNumber ?? null)}
        {renderDetailItem(getLocalizedText('employeeName'), timeLogDetail?.employeeName ?? null)}
        {renderDetailItem(getLocalizedText('entryTime'), timeLogDetail?.entryTime ? formatDate(timeLogDetail.entryTime) : null)}
        {renderDetailItem(getLocalizedText('address'), timeLogDetail?.address ?? null)}
        {renderDetailItem(getLocalizedText('remarks'), timeLogDetail?.remarks ?? null)}
        {renderDetailItem(getLocalizedText('status'), getStatusText(timeLogDetail?.approvalStatus || 'P'))}
        {renderRejectionDetails()}
        {photos.length > 0 && renderPhotos()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  photosSection: {
    marginTop: 16,
  },
  photosList: {
    marginTop: 8,
    gap: 12,
  },
  photoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
  },
  docIcon: {
    width: 24,
    height: 24,
  },
  fileName: {
    flex: 1,
    fontSize: 14,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 20,
  }
});

export default ATTimeLogDetails;
