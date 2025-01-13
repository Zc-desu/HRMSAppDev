import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DutyData {
  scheduleCode: string | null;
  scheduleDescription: string | null;
  typeOfDay: string;
  scheduleIn: string;
  scheduleOut: string;
  scheduleDate: string;
}

interface Props {
  route: any;
  navigation: any;
}

const ATDutyRoasterSummary: React.FC<Props> = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { employeeId, baseUrl } = route.params;
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dutyData, setDutyData] = useState<{ [key: string]: DutyData }>({});
  const [showModal, setShowModal] = useState(false);
  const [selectedDutyData, setSelectedDutyData] = useState<DutyData | null>(null);
  const [showDetailedView, setShowDetailedView] = useState(false);

  const fetchDutyData = async (year: number, month: number) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/timesheet/${year}/${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        }
      );

      const result = await response.json();
      
      if (result.success) {
        const formattedData: { [key: string]: DutyData } = {};
        result.data.forEach((item: any) => {
          const date = item.scheduleDate.split('T')[0];
          formattedData[date] = {
            scheduleCode: item.scheduleCode,
            scheduleDescription: item.scheduleDescription,
            typeOfDay: item.typeOfDay,
            scheduleIn: item.scheduleIn,
            scheduleOut: item.scheduleOut,
            scheduleDate: date,
          };
        });
        setDutyData(formattedData);
      }
    } catch (error) {
      console.error('Error fetching duty data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    fetchDutyData(year, month);
  }, [selectedDate]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Duty Roaster Calendar',
      headerStyle: {
        backgroundColor: theme.card,
      },
      headerTitleStyle: {
        color: theme.text,
      },
      headerTintColor: theme.text,
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => setShowDetailedView(!showDetailedView)} 
          style={styles.headerButton}
        >
          <Image 
            source={require('../../../../asset/img/icon/a-more.png')} 
            style={[styles.headerIcon, { tintColor: theme.text }]}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme, showDetailedView]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'O': return '#FF3B30'; // Off Day - Red
      case 'R': return '#FFD700'; // Rest Day - Yellow
      case 'P': return '#007AFF'; // Public Holiday - Blue
      case 'W': return '#5AC8FA'; // Working Day - Light Blue
      default: return theme.subText; // Default - Light Gray
    }
  };

  const getTypeFullName = (type: string) => {
    switch (type) {
      case 'W': return 'Working Day';
      case 'R': return 'Rest Day';
      case 'P': return 'Public Holiday';
      case 'O': return 'Off Day';
      default: return '--';
    }
  };

  const getMarkedDates = () => {
    const marked: any = {};
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const data = dutyData[dateString];
      
      if (data?.typeOfDay) {
        marked[dateString] = {
          customStyles: {
            container: {
              backgroundColor: getTypeColor(data.typeOfDay),
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              width: 35,
              height: 35,
            },
            text: {
              color: 'white',
            }
          }
        };
      }
    }
    return marked;
  };

  const handleDayPress = (day: any) => {
    console.log('Day pressed:', day); // For debugging
    const data = dutyData[day.dateString];
    if (data) {
      setSelectedDutyData(data);
      setShowModal(true);
    }
  };

  const renderDetailedDay = (date: any) => {
    const data = dutyData[date.dateString];
    
    return (
      <TouchableOpacity 
        onPress={() => handleDayPress(date)}
        style={styles.detailedDayContainer}
      >
        <View style={[
          styles.colorBar,
          { backgroundColor: data?.typeOfDay ? getTypeColor(data.typeOfDay) : 'transparent' }
        ]} />
        <Text style={[styles.dayNumber, { color: theme.text }]}>{date.day}</Text>
        {data && data.scheduleCode && data.typeOfDay && (
          <Text style={[styles.scheduleText, { color: theme.text }]}>
            {`${data.scheduleCode} - ${data.typeOfDay}`}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderRegularDay = (date: any) => {
    const data = dutyData[date.dateString];
    
    return (
      <TouchableOpacity 
        onPress={() => handleDayPress(date)}
        style={[
          styles.regularDayContainer,
          { backgroundColor: data?.typeOfDay ? getTypeColor(data.typeOfDay) : 'transparent' }
        ]}
      >
        <Text style={[
          styles.regularDayText,
          { color: data?.typeOfDay ? 'white' : theme.text }
        ]}>
          {date.day}
        </Text>
      </TouchableOpacity>
    );
  };

  const getDayName = (dateString: string) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const date = new Date(dateString);
    return days[date.getDay()];
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} />
      ) : (
        <>
          <Calendar
            current={selectedDate.toISOString()}
            onDayPress={handleDayPress}
            onMonthChange={(month) => {
              setSelectedDate(new Date(month.timestamp));
            }}
            monthFormat={'MMMM yyyy'}
            theme={{
              calendarBackground: theme.card,
              textSectionTitleColor: theme.text,
              dayTextColor: theme.text,
              textDisabledColor: theme.subText,
              monthTextColor: theme.text,
              arrowColor: theme.primary,
            }}
            dayComponent={({ date }) => 
              showDetailedView ? renderDetailedDay(date) : renderRegularDay(date)
            }
            enableSwipeMonths={true}
          />

          <Modal
            visible={showModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setShowModal(false)}
            >
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                {selectedDutyData && (
                  <>
                    <Text style={[styles.modalTitle, { color: theme.text }]}>
                      {`${selectedDutyData.scheduleDate} ${getDayName(selectedDutyData.scheduleDate)}`}
                    </Text>
                    <Text style={[styles.modalText, { color: theme.text }]}>
                      Schedule: {selectedDutyData.scheduleCode}
                    </Text>
                    <Text style={[styles.modalText, { color: theme.text }]}>
                      Schedule Description: {selectedDutyData.scheduleDescription}
                    </Text>
                    <Text style={[styles.modalText, { color: theme.text }]}>
                      Type of Day: {
                        selectedDutyData.typeOfDay === 'W' ? 'Working Day' :
                        selectedDutyData.typeOfDay === 'R' ? 'Rest Day' :
                        selectedDutyData.typeOfDay === 'P' ? 'Public Holiday' :
                        selectedDutyData.typeOfDay === 'O' ? 'Off Day' : ''
                      }
                    </Text>
                    <Text style={[styles.modalText, { color: theme.text }]}>
                      Schedule Time: {selectedDutyData.scheduleIn} - {selectedDutyData.scheduleOut}
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Modal>

          <View style={styles.legendContainer}>
            <Text style={[styles.legendTitle, { color: theme.text }]}>Description:</Text>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendCircle, { backgroundColor: getTypeColor('W') }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>Working Day</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendCircle, { backgroundColor: getTypeColor('R') }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>Rest Day</Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendCircle, { backgroundColor: getTypeColor('P') }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>Public Holiday</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendCircle, { backgroundColor: getTypeColor('O') }]} />
                <Text style={[styles.legendText, { color: theme.text }]}>Off Day</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 8,
  },
  legendContainer: {
    padding: 16,
    marginTop: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    flex: 1,
  },
  legendCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 14,
  },
  headerButton: {
    marginRight: 16,
  },
  headerIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  detailedDayContainer: {
    width: 52,
    height: 60,
    borderRadius: 8,
    padding: 2,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  colorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: 3,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  regularDayContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scheduleText: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 2,
    width: '100%',
  },
  regularDayText: {
    fontSize: 14,
  },
});

export default ATDutyRoasterSummary;
