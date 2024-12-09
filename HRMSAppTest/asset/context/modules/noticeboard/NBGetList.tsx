import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NoticeBoard {
  id: number;
  importantNotice: boolean;
  noticeTitle: string;
  effectiveDateFrom: string;
}

const NBGetList = ({ route, navigation }: any) => {
  const [notices, setNotices] = useState<NoticeBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { employeeId, companyId, baseUrl: passedBaseUrl } = route.params;

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

  const renderNoticeItem = ({ item }: { item: NoticeBoard }) => (
    <TouchableOpacity
      style={[styles.noticeCard, item.importantNotice && styles.importantNoticeCard]}
      onPress={() => navigation.navigate('NBDetails', { 
        noticeId: item.id,
        employeeId: employeeId,
        companyId: companyId
      })}
    >
      <View style={styles.noticeContent}>
        <Text style={styles.noticeTitle} numberOfLines={2}>
          {item.noticeTitle}
        </Text>
        <Text style={styles.noticeDate}>
          {formatDate(item.effectiveDateFrom)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  listContainer: {
    padding: 16,
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  importantNoticeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 24,
  },
  noticeDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default NBGetList;
