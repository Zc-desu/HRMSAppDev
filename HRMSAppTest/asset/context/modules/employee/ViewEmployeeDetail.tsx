import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../modules/setting/ThemeContext';
import { useLanguage } from '../../modules/setting/LanguageContext';
import CustomAlert from '../../modules/setting/CustomAlert';

// Add interfaces for alert config
interface CustomAlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  buttons: CustomAlertButton[];
}

const ViewEmployeeDetail = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [userToken, setUserToken] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          employeeDetails: 'Butiran Pekerja',
          error: 'Ralat',
          ok: 'OK',
          noToken: 'Tiada token pengguna atau URL asas. Sila log masuk semula.',
          unableToFetch: 'Tidak dapat mengambil token pengguna atau URL asas.',
          employeeIdNotFound: 'ID pekerja tidak dijumpai.',
          fetchError: 'Gagal mengambil butiran pekerja.',
          noDetails: 'Tiada butiran pekerja.',
          employeeNumber: 'Nombor Pekerja',
          name: 'Nama',
          title: 'Jawatan',
          nationality: 'Kewarganegaraan',
          nric: 'No. KP',
          dateOfBirth: 'Tarikh Lahir',
          age: 'Umur',
          gender: 'Jantina',
          residentStatus: 'Status Pemastautin',
          maritalStatus: 'Status Perkahwinan',
          religion: 'Agama',
          ethnic: 'Etnik',
          smoker: 'Perokok',
          yes: 'Ya',
          no: 'Tidak',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          employeeDetails: '员工详情',
          error: '错误',
          ok: '确定',
          noToken: '未找到用户令牌或基本URL。请重新登录。',
          unableToFetch: '无法获取用户令牌或基本URL。',
          employeeIdNotFound: '未找到员工ID。',
          fetchError: '获取员工详情失败。',
          noDetails: '没有员工详情。',
          employeeNumber: '员工编号',
          name: '姓名',
          title: '职位',
          nationality: '国籍',
          nric: '身份证号',
          dateOfBirth: '出生日期',
          age: '年龄',
          gender: '性别',
          residentStatus: '居民状态',
          maritalStatus: '婚姻状况',
          religion: '宗教',
          ethnic: '种族',
          smoker: '吸烟者',
          yes: '是',
          no: '否',
        }[key] || key;
      
      default: // 'en'
        return {
          employeeDetails: 'Employee Details',
          error: 'Error',
          ok: 'OK',
          noToken: 'No user token or base URL found. Please log in again.',
          unableToFetch: 'Unable to fetch user token or base URL.',
          employeeIdNotFound: 'Employee ID not found.',
          fetchError: 'Failed to fetch employee details.',
          noDetails: 'No employee details available.',
          employeeNumber: 'Employee Number',
          name: 'Name',
          title: 'Title',
          nationality: 'Nationality',
          nric: 'NRIC',
          dateOfBirth: 'Date of Birth',
          age: 'Age',
          gender: 'Gender',
          residentStatus: 'Resident Status',
          maritalStatus: 'Marital Status',
          religion: 'Religion',
          ethnic: 'Ethnic',
          smoker: 'Smoker',
          yes: 'Yes',
          no: 'No',
        }[key] || key;
    }
  };

  // Update header title
  useLayoutEffect(() => {
    navigation.setOptions({
      title: getLocalizedText('employeeDetails'),
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: theme.text,
      headerTitleStyle: {
        color: theme.text,
      },
      headerShadowVisible: false,
    });
  }, [navigation, theme, language]);

  // Update alert calls
  const showAlert = (title: string, message: string, buttons: CustomAlertButton[] = []) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.length > 0 ? buttons : [
        { text: getLocalizedText('ok'), onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }
      ],
    });
  };

  // Update alerts in useEffect
  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const storedBaseUrl = await AsyncStorage.getItem('scannedData');
        
        if (token && storedBaseUrl) {
          setUserToken(token);
          const extractedBaseUrl = storedBaseUrl.split('/apps/api')[0];
          setBaseUrl(extractedBaseUrl);
        } else {
          showAlert(getLocalizedText('error'), getLocalizedText('noToken'), [
            { text: getLocalizedText('ok'), onPress: () => navigation.navigate('Login') }
          ]);
        }
      } catch (error) {
        console.error('Error retrieving user token or base URL:', error);
        showAlert(getLocalizedText('error'), getLocalizedText('unableToFetch'), [
          { text: getLocalizedText('ok'), onPress: () => navigation.goBack() }
        ]);
      }
    };

    fetchAuthData();
  }, [navigation]);

  useEffect(() => {
    if (userToken && baseUrl) {
      const fetchEmployeeDetails = async () => {
        try {
          // Get the employeeId from AsyncStorage (already stored in ProfileSwitch)
          const employeeId = await AsyncStorage.getItem('employeeId');
          if (!employeeId) {
            Alert.alert('Error', 'Employee ID not found.');
            return;
          }

          const response = await fetch(`${baseUrl}/apps/api/v1/employees/${employeeId}/profile`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          });

          const data = await response.json();
          if (data.success) {
            setEmployeeDetails(data.data);
          } else {
            Alert.alert('Error', 'Failed to fetch employee details.');
          }
        } catch (error) {
          console.error('Error fetching employee details:', error);
          Alert.alert('Error', 'Unable to fetch employee details.');
        } finally {
          setLoading(false);
        }
      };

      fetchEmployeeDetails();
    }
  }, [userToken, baseUrl]);

  // Helper function to format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!employeeDetails) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.subText }]}>
          No employee details available.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.contentContainer}>
        <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.headerText, { color: theme.text }]}>
            {getLocalizedText('employeeDetails')}
          </Text>
        </View>

        <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
          <DetailItem 
            label={getLocalizedText('employeeNumber')}
            value={employeeDetails?.employeeNumber}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('name')}
            value={employeeDetails?.name}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('title')}
            value={employeeDetails?.title}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('nationality')}
            value={employeeDetails?.nationality}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('nric')}
            value={employeeDetails?.nric}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('dateOfBirth')}
            value={formatDate(employeeDetails?.dateOfBirth)}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('age')}
            value={employeeDetails?.age?.toString()}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('gender')}
            value={employeeDetails?.gender}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('residentStatus')}
            value={employeeDetails?.resident}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('maritalStatus')}
            value={employeeDetails?.maritalStatus}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('religion')}
            value={employeeDetails?.religion}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('ethnic')}
            value={employeeDetails?.ethnic}
            theme={theme}
          />
          <DetailItem 
            label={getLocalizedText('smoker')}
            value={employeeDetails?.smoker ? getLocalizedText('yes') : getLocalizedText('no')}
            theme={theme}
          />
        </View>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
};

// Update DetailItem to accept theme
const DetailItem = ({ 
  label, 
  value, 
  theme 
}: { 
  label: string; 
  value: string | undefined;
  theme: any;
}) => (
  <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
    <Text style={[styles.labelText, { color: theme.subText }]}>{label}</Text>
    <Text style={[styles.valueText, { color: theme.text }]}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  headerCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  detailsCard: {
    borderRadius: 12,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  labelText: {
    fontSize: 16,
    flex: 1,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ViewEmployeeDetail;
