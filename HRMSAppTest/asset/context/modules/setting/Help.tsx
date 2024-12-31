import React, { useLayoutEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTheme } from './ThemeContext';
import { useLanguage } from './LanguageContext';
import CustomAlert from './CustomAlert';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertConfig {
  title: string;
  message: string;
  buttons: AlertButton[];
}

const Help = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    title: '',
    message: '',
    buttons: []
  });

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          title: 'Bantuan',
          contactUs: 'Hubungi Kami',
          contactMessage: 'Adakah anda pasti untuk menghubungi kami?',
          cancel: 'Batal',
          confirm: 'Ya',
          q1: 'S: Bagaimana cara menukar bahasa aplikasi?',
          a1: 'J: Pergi ke Tetapan > Bahasa dan pilih bahasa pilihan anda.',
          q2: 'S: Bagaimana cara menukar tema aplikasi?',
          a2: 'J: Pergi ke Tetapan > Tema dan pilih tema yang anda mahukan.',
          q3: 'S: Bagaimana cara memohon cuti?',
          a3: 'J: Pergi ke menu Cuti > Cipta Permohonan Cuti dan isi borang yang disediakan.',
          q4: 'S: Bagaimana cara melihat sejarah kehadiran?',
          a4: 'J: Pergi ke menu Kehadiran > Sejarah Kehadiran untuk melihat rekod kehadiran anda.',
          q5: 'S: Bagaimana cara log masuk ke aplikasi HRMS buat kali pertama?',
          a5: 'J: Sila imbas Kod QR sebelum anda log masuk.',
          q6: 'S: Apa yang perlu saya lakukan jika saya terlupa kata laluan atau tidak dapat log masuk?',
          a6: 'J: Sila hubungi Pentadbir HR anda jika terlupa kata laluan atau menghadapi masalah log masuk.',
          q7: 'S: Bagaimana untuk mendapatkan Kod QR untuk log masuk?',
          a7: 'J: Sila hubungi Pentadbir HR anda untuk mendapatkan Kod QR.',
          q8: 'S: Adakah aplikasi ini menyokong kehadiran menggunakan kod QR atau GPS?',
          a8: 'J: Ya, aplikasi kami memerlukan Kod QR dan GPS untuk daftar masuk/keluar.',
          q9: 'S: Siapa yang perlu saya hubungi jika saya menghadapi masalah dengan aplikasi?',
          a9: 'J: Sila hubungi Pentadbir HR anda jika anda menghadapi masalah dengan aplikasi kami.',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          title: '帮助',
          contactUs: '联系我们',
          contactMessage: '确定要联系我们吗？',
          cancel: '取消',
          confirm: '确定',
          q1: '问：如何更改应用语言？',
          a1: '答：进入设置 > 语言，选择您想要的语言。',
          q2: '问：如何更改应用主题？',
          a2: '答：进入设置 > 主题，选择您想要的主题。',
          q3: '问：如何申请休假？',
          a3: '答：进入休假菜单 > 创建休假申请，填写提供的表格。',
          q4: '问：如何查看考勤记录？',
          a4: '答：进入考勤菜单 > 考勤记录，查看您的考勤历史。',
          q5: '问：如何首次登录HRMS应用？',
          a5: '答：登录前请先扫描二维码。',
          q6: '问：如果忘记密码或无法登录该怎么办？',
          a6: '答：如果忘记密码或遇到登录问题，请联系人力资源管理员。',
          q7: '问：如何获取登录二维码？',
          a7: '答：请联系人力资源管理员获取二维码。',
          q8: '问：应用是否支持二维码或GPS考勤？',
          a8: '答：是的，我们的应用需要二维码和GPS来进行签到/签退。',
          q9: '问：如果遇到应用问题应该联系谁？',
          a9: '答：如果遇到应用问题，请联系人力资源管理员。',
        }[key] || key;
      
      case 'zh-Hant':
        return {
          title: '幫助',
          contactUs: '聯絡我們',
          contactMessage: '確定要聯絡我們嗎？',
          cancel: '取消',
          confirm: '確定',
          q1: '問：如何更改應用語言？',
          a1: '答：進入設置 > 語言，選擇您想要的語言。',
          q2: '問：如何更改應用主題？',
          a2: '答：進入設置 > 主題，選擇您想要的主題。',
          q3: '問：如何申請休假？',
          a3: '答：進入休假菜單 > 創建休假申請，填寫提供的表格。',
          q4: '問：如何查看考勤記錄？',
          a4: '答：進入考勤菜單 > 考勤記錄，查看您的考勤歷史。',
          q5: '問：如何首次登入HRMS應用？',
          a5: '答：登入前請先掃描QR碼。',
          q6: '問：如果忘記密碼或無法登入該怎麼辦？',
          a6: '答：如果忘記密碼或遇到登入問題，請聯繫人力資源管理員。',
          q7: '問：如何獲取登入QR碼？',
          a7: '答：請聯繫人力資源管理員獲取QR碼。',
          q8: '問：應用是否支持QR碼或GPS考勤？',
          a8: '答：是的，我們的應用需要QR碼和GPS來進行簽到/簽退。',
          q9: '問：如果遇到應用問題應該聯繫誰？',
          a9: '答：如果遇到應用問題，請聯繫人力資源管理員。',
        }[key] || key;
      
      default: // 'en'
        return {
          title: 'Help',
          contactUs: 'Contact Us',
          contactMessage: 'Are you sure you want to contact us?',
          cancel: 'Cancel',
          confirm: 'Yes',
          q1: 'Q: How do I change the app language?',
          a1: 'A: Go to Settings > Language and select your preferred language.',
          q2: 'Q: How do I change the app theme?',
          a2: 'A: Go to Settings > Theme and select your desired theme.',
          q3: 'Q: How do I apply for leave?',
          a3: 'A: Go to Leave menu > Create Leave Application and fill in the provided form.',
          q4: 'Q: How do I view attendance history?',
          a4: 'A: Go to Attendance menu > Attendance History to view your attendance records.',
          q5: "Q: How do I log in to the HRMS app for the first time?",
          a5: "A: Please scan the QR Code before you log in.",
          q6: "Q: What should I do if I forget my password or can't log in?",
          a6: "A: Please contact with your HR Administrator if you forget password or have issue of log in.",
          q7: "Q: How to get the QR Code for log in?",
          a7: "A: Please contact with your HR Administrator to obtain QR Code.",
          q8: "Q: Does the app support QR code or GPS-based attendance marking?",
          a8: "A: Yes, our app requires QR Code and GPS for clock in / out.",
          q9: "Q: Who should I contact if I encounter an issue with the app?",
          a9: "A: Please contact with your HR Administrator if you encounter issue with our app.",
        }[key] || key;
    }
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
      title: getLocalizedText('title'),
    });
  }, [navigation, theme, language]);

  const handleContactPress = () => {
    setAlertConfig({
      title: getLocalizedText('contactUs'),
      message: getLocalizedText('contactMessage'),
      buttons: [
        {
          text: getLocalizedText('cancel'),
          style: 'cancel',
          onPress: () => setAlertVisible(false)
        },
        {
          text: getLocalizedText('confirm'),
          style: 'default',
          onPress: () => {
            setAlertVisible(false);
            // Add contact action here
          }
        }
      ]
    });
    setAlertVisible(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={[styles.contentCard, { 
          backgroundColor: theme.card,
          borderColor: theme.border 
        }]}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <View key={num} style={styles.faqItem}>
              <Text style={[styles.question, { color: theme.text }]}>
                {getLocalizedText(`q${num}`)}
              </Text>
              <Text style={[styles.answer, { color: theme.subText }]}>
                {getLocalizedText(`a${num}`)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.bottomContainer, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: theme.primary }]}
          onPress={handleContactPress}
        >
          <Image
            source={require('../../../../asset/img/icon/a-service.png')}
            style={[styles.contactIcon, { tintColor: '#FFFFFF' }]}
          />
          <Text style={styles.contactButtonText}>
            {getLocalizedText('contactUs')}
          </Text>
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E5E5EA',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  contactIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  faqItem: {
    marginBottom: 24,
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default Help;
