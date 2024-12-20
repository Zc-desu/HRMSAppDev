import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../modules/setting/ThemeContext';
import { useLanguage } from '../../modules/setting/LanguageContext';
import CustomAlert from '../../modules/setting/CustomAlert';

type PayslipNavigationProp = {
  navigate: (screen: string, params?: {
    baseUrl: string;
    employeeId: string;
    payrollType: string;
    payrollDate: string;
  }) => void;
};

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

interface LocalizedTexts {
  yearlyPayslip: string;
  view: string;
  error: string;
  ok: string;
  sessionExpired: string;
  loginAgain: string;
  missingData: string;
  failedFetch: string;
  noPayslips: string;
  months: string[];
  payslip: string;
}

type TranslationLanguage = 'ms' | 'zh-Hans' | 'zh-Hant' | 'en';

interface Translation {
  yearlyPayslip: string;
  view: string;
  error: string;
  ok: string;
  sessionExpired: string;
  loginAgain: string;
  missingData: string;
  failedFetch: string;
  noPayslips: string;
  months: string[];
  payslip: string;
}

type Translations = Record<TranslationLanguage, Translation>;

const Payslip = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { baseUrl, employeeId } = route?.params || {};
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const getLocalizedText = (key: keyof Translation): string | string[] => {
    const translations: Translations = {
      ms: {
        payslip: 'Slip Gaji',
        yearlyPayslip: 'Slip Gaji Tahunan',
        view: 'Lihat',
        error: 'Ralat',
        ok: 'OK',
        sessionExpired: 'Sesi Tamat',
        loginAgain: 'Sesi log masuk tamat! Sila log masuk semula.',
        missingData: 'URL asas atau ID pekerja tiada.',
        failedFetch: 'Gagal mendapatkan slip gaji',
        noPayslips: 'Tiada slip gaji untuk tahun {year}',
        months: [
          'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
          'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
        ],
      },
      'zh-Hans': {
        payslip: '工资单',
        yearlyPayslip: '年度工资单',
        view: '查看',
        error: '错误',
        ok: '确定',
        sessionExpired: '会话过期',
        loginAgain: '登录会话已过期！请重新登录。',
        missingData: '基本URL或员工ID缺失。',
        failedFetch: '获取工资单失败',
        noPayslips: '没有{year}年的工资单记录',
        months: [
          '一月', '二月', '三月', '四月', '五月', '六月',
          '七月', '八月', '九月', '十月', '十一月', '十二月'
        ],
      },
      'zh-Hant': {
        payslip: '工資單',
        yearlyPayslip: '年度工資單',
        view: '查看',
        error: '錯誤',
        ok: '確定',
        sessionExpired: '會話過期',
        loginAgain: '登錄會話已過期！請重新登錄。',
        missingData: '基本URL或員工ID缺失。',
        failedFetch: '獲取工資單失敗',
        noPayslips: '沒有{year}年的工資單記錄',
        months: [
          '一月', '二月', '三月', '四月', '五月', '六月',
          '七月', '八月', '九月', '十月', '十一月', '十二月'
        ],
      },
      en: {
        payslip: 'Payslip',
        yearlyPayslip: 'Yearly Payslip',
        view: 'View',
        error: 'Error',
        ok: 'OK',
        sessionExpired: 'Session Expired',
        loginAgain: 'Login session expired! Please login again.',
        missingData: 'Base URL or Employee ID is missing.',
        failedFetch: 'Failed to fetch payslips',
        noPayslips: 'No payslips available for {year}.',
        months: [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ],
      },
    };

    const text = translations[language as TranslationLanguage][key];
    if (typeof text === 'string' && key === 'noPayslips') {
      return text.replace('{year}', year.toString());
    }
    return text;
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: getLocalizedText('payslip') as string,
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

  useEffect(() => {
    if (!baseUrl || !employeeId) {
      showAlert(getLocalizedText('error') as string, getLocalizedText('missingData') as string);
      setError(getLocalizedText('missingData') as string);
      setLoading(false);
    } else {
      fetchPayslips();
    }
  }, [baseUrl, employeeId, year]);

  const fetchPayslips = async () => {
    setLoading(true);
    const userToken = await AsyncStorage.getItem('userToken');

    if (!userToken) {
      setError('User token is missing.');
      setLoading(false);
      return;
    }

    const url = `${baseUrl}/apps/api/v1/employees/${employeeId}/payslips/${year}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setPayslips(result.data);
      } else {
        setError(result.message || 'Failed to fetch payslips');
        setPayslips([]);
      }
    } catch (err) {
      console.error('Error fetching payslips:', err);

      // Check if the error is due to session expiration or invalid JSON
      if (err instanceof SyntaxError) {
        handleSessionExpired();
      } else {
        setError('Error fetching payslips');
      }

      setPayslips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = async (payrollType: string, payrollDate: string) => {
    const formattedDate = payrollDate.substring(0, 10);

    try {
      navigation.navigate('ViewPayslip', {
        baseUrl,
        employeeId,
        payrollType,
        payrollDate: formattedDate,
      });
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    const month = formattedDate.getMonth() + 1;
    const year = formattedDate.getFullYear();

    switch (language) {
      case 'zh-Hans':
      case 'zh-Hant':
        return `${year}年${month}月`;
      default:
        const months = getLocalizedText('months') as string[];
        return `${months[formattedDate.getMonth()]} ${year}`;
    }
  };

  const showAlert = (title: string, message: string, buttons: CustomAlertButton[] = []) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.length > 0 ? buttons : [
        { text: getLocalizedText('ok') as string, onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }
      ],
    });
  };

  const handleSessionExpired = () => {
    showAlert(
      getLocalizedText('sessionExpired') as string,
      getLocalizedText('loginAgain') as string,
      [{
        text: getLocalizedText('ok') as string,
        onPress: async () => {
          await AsyncStorage.removeItem('userToken');
          navigation.navigate('Login');
        }
      }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerText, { color: theme.text }]}>
          {getLocalizedText('yearlyPayslip')}
        </Text>
        <View style={styles.yearNavigation}>
          <TouchableOpacity
            onPress={() => setYear((prev) => prev - 1)}
            style={styles.yearButton}
          >
            <Image
              source={require('../../../../asset/img/icon/a-d-arrow-left.png')}
              style={[styles.arrowIcon, { tintColor: theme.primary }]}
            />
          </TouchableOpacity>
          <Text style={[styles.yearText, { color: theme.text }]}>{year}</Text>
          <TouchableOpacity
            onPress={() => setYear((prev) => prev + 1)}
            style={styles.yearButton}
          >
            <Image
              source={require('../../../../asset/img/icon/a-d-arrow-right.png')}
              style={[styles.arrowIcon, { tintColor: theme.primary }]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={payslips}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.payslipCard, { backgroundColor: theme.card }]}
                onPress={() => handleViewPayslip(item.payrollType, item.payrollDate)}
              >
                <View style={styles.payslipContent}>
                  <View style={styles.textContainer}>
                    <Text style={[styles.payrollDateText, { color: theme.text }]}>
                      {formatDate(item.payrollDate)}
                    </Text>
                    <Text style={[styles.descriptionText, { color: theme.subText }]}>
                      {item.payrollTypeDescription || 'N/A'}
                    </Text>
                  </View>
                  <View style={[styles.viewButtonContainer, { backgroundColor: theme.primary }]}>
                    <Image
                      source={require('../../../../asset/img/icon/sousuo.png')}
                      style={[styles.icon, { tintColor: theme.card }]}
                    />
                    <Text style={[styles.viewButtonText, { color: theme.card }]}>
                      {getLocalizedText('view')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.payrollDate}
            ListEmptyComponent={
              !error ? (
                <Text style={[styles.messageText, { color: theme.subText }]}>
                  {getLocalizedText('noPayslips')}
                </Text>
              ) : (
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              )
            }
          />
        </View>
      )}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  yearNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButton: {
    padding: 12,
    borderRadius: 8,
  },
  yearText: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 32,
  },
  arrowIcon: {
    width: 28,
    height: 28,
  },
  listContainer: {
    paddingBottom: 16,
  },
  payslipCard: {
    borderRadius: 12,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payslipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  payrollDateText: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
  },
  viewButtonContainer: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
  },
  icon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  viewButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    padding: 24,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
});

export default Payslip;
