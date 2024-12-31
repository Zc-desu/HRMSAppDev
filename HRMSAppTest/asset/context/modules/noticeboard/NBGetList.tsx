import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../setting/LanguageContext';

interface NoticeBoard {
  id: number;
  importantNotice: boolean;
  noticeTitle: string;
  effectiveDateFrom: string;
}

const NBGetList = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [notices, setNotices] = useState<NoticeBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { employeeId, companyId, baseUrl: passedBaseUrl } = route.params;

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
      title: language === 'zh-Hans' ? '公告栏' :
             language === 'zh-Hant' ? '公告欄' :
             language === 'ms' ? 'Papan Notis' :
             'Notice Board',
    });
  }, [navigation, theme, language]);

  const fetchNotices = async () => {
    try {
      const baseUrl = passedBaseUrl || await AsyncStorage.getItem('baseUrl');
      const userToken = await AsyncStorage.getItem('userToken');

      if (!baseUrl || !userToken || !employeeId || !companyId) {
        throw new Error('Missing required configuration');
      }

      const response = await fetch(`${baseUrl}/apps/api/v1/notice-board`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Employee-Id': employeeId.toString(),
          'X-Company-Id': companyId.toString(),
          'X-Requested-With': 'XMLHttpRequest'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notices');
      }

      const data = await response.json();
      
      if (data.success) {
        setNotices(data.data);
      } else {
        throw new Error(data.errors?.[0] || 'Failed to fetch notices');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message === 'Missing required configuration'
          ? 'Please login again to refresh your session.'
          : 'Unable to load notices. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleNoticePress = (notice: NoticeBoard) => {
    navigation.navigate('NBDetails', { 
      noticeId: notice.id,
      employeeId: employeeId,
      companyId: companyId
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const renderNoticeItem = ({ item }: { item: NoticeBoard }) => (
    <TouchableOpacity
      style={[
        styles.noticeCard,
        { 
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
        },
        item.importantNotice && styles.importantNoticeCard
      ]}
      onPress={() => handleNoticePress(item)}
    >
      <View style={styles.noticeContent}>
        <View style={styles.headerRow}>
          {item.importantNotice && (
            <Image
              source={require('../../../../asset/img/icon/a-warning-filled.png')}
              style={[styles.warningIcon, { tintColor: theme.error }]}
            />
          )}
          <Text style={[
            styles.noticeTitle,
            { color: theme.text },
          ]} numberOfLines={2}>
            {item.noticeTitle}
          </Text>
        </View>
        <Text style={[styles.noticeDate, { color: theme.subText }]}>
          {formatDate(item.effectiveDateFrom)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={notices}
        renderItem={renderNoticeItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  noticeCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  importantNoticeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF453A',
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 24,
  },
  noticeDate: {
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
});

export default NBGetList;
