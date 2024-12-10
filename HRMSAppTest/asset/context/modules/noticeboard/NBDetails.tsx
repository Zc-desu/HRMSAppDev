import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';

interface Attachment {
  id: number;
  fileName: string;
  mimeType: string;
}

interface NoticeDetail {
  id: number;
  importantNotice: boolean;
  message: string;
  noticeTitle: string;
  effectiveDateFrom: string;
  attachments?: Attachment[];
}

const NBDetails = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const { noticeId, employeeId, companyId } = route.params;

  useEffect(() => {
    fetchNoticeDetails();
  }, []);

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
    });
  }, [navigation, theme]);

  const fetchNoticeDetails = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const userToken = await AsyncStorage.getItem('userToken');

      if (!baseUrl || !userToken || !employeeId || !companyId) {
        throw new Error('Missing required configuration');
      }

      const response = await fetch(`${baseUrl}/apps/api/v1/notice-board/${noticeId}`, {
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
        throw new Error('Failed to fetch notice details');
      }

      const data = await response.json();
      
      if (data.success) {
        setNotice(data.data);
      } else {
        throw new Error(data.errors?.[0] || 'Failed to fetch notice details');
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message === 'Missing required configuration'
          ? 'Please login again to refresh your session.'
          : 'Unable to load notice details. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachmentPress = async (attachment: Attachment) => {
    try {
      navigation.navigate('NBGetFileAttachment', {
        noticeId: notice?.id,
        fileId: attachment.id,
        employeeId,
        companyId,
        mimeType: attachment.mimeType
      });
    } catch (error) {
      Alert.alert(
        'Error',
        'Unable to open the attachment. Please try again later.'
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getFileTypeLabel = (mimeType: string) => {
    switch (mimeType) {
      case 'application/pdf':
        return 'PDF';
      case 'image/jpeg':
        return 'JPG';
      case 'image/png':
        return 'PNG';
      default:
        return 'FILE';
    }
  };

  const renderAttachment = (attachment: Attachment) => (
    <TouchableOpacity
      key={attachment.id}
      style={[styles.attachmentItem, { backgroundColor: theme.buttonBackground }]}
      onPress={() => handleAttachmentPress(attachment)}
    >
      <View style={[styles.fileTypeLabel, { backgroundColor: theme.primary }]}>
        <Text style={styles.fileTypeLabelText}>
          {getFileTypeLabel(attachment.mimeType)}
        </Text>
      </View>
      <Text style={[styles.attachmentFileName, { color: theme.primary }]}>
        {attachment.fileName}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!notice) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.subText }]}>Notice not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[
          styles.headerCard,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
          notice.importantNotice && styles.importantHeaderCard
        ]}>
          <Text style={[styles.noticeTitle, { color: theme.text }]}>
            {notice.noticeTitle}
          </Text>
          <Text style={[styles.noticeDate, { color: theme.subText }]}>
            {formatDate(notice.effectiveDateFrom)}
          </Text>
        </View>

        <View style={[styles.contentCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.messageTitle, { color: theme.text }]}>Notice Content</Text>
          <Text style={[styles.noticeMessage, { color: theme.text }]}>
            {notice.message}
          </Text>
        </View>

        {notice.attachments && notice.attachments.length > 0 && (
          <View style={[styles.contentCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Attachments</Text>
            {isDownloading && (
              <ActivityIndicator style={styles.downloadingIndicator} color={theme.primary} />
            )}
            {notice.attachments.map(renderAttachment)}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  importantHeaderCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 12,
  },
  noticeTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    lineHeight: 28,
  },
  noticeDate: {
    fontSize: 15,
    color: '#666',
  },
  messageTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  noticeMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileTypeLabel: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 12,
  },
  fileTypeLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  attachmentFileName: {
    flex: 1,
    fontSize: 15,
    color: '#007AFF',
  },
  downloadingIndicator: {
    marginVertical: 8,
  },
});

export default NBDetails;
