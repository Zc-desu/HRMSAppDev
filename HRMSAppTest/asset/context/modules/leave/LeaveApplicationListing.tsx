import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp } from '@react-navigation/native'; // Import useNavigation

interface Leave {
    id: number;
    employeeName: string;
    leaveCodeDesc: string;
    approvalStatusDisplay: string;
    totalDays: number;
    dateFrom: string;
    dateTo: string;
    reason: string;
}

// Define a simple navigation type
type NavigationParams = {
    LeaveDetail: { applicationId: number };
};

const LeaveApplicationListing = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [leaveData, setLeaveData] = useState<Leave[]>([]);
    const [baseUrl, setBaseUrl] = useState<string>('');
    const [employeeId, setEmployeeId] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigation = useNavigation<NavigationProp<NavigationParams>>(); // Initialize navigation

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
                const storedEmployeeId = await AsyncStorage.getItem('employeeId');
                if (!storedBaseUrl || !storedEmployeeId) {
                    Alert.alert('Error', 'Base URL or Employee ID is missing');
                    return;
                }
                setBaseUrl(storedBaseUrl);
                setEmployeeId(storedEmployeeId);
                fetchLeaveData(storedBaseUrl, storedEmployeeId, year);
            } catch (error) {
                Alert.alert('Error', 'Failed to fetch stored data.');
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (baseUrl && employeeId) {
            fetchLeaveData(baseUrl, employeeId, year);
        }
    }, [year, baseUrl, employeeId]);

    const fetchLeaveData = async (urlBase: string, empId: string, year: number) => {
        try {
            setIsLoading(true);
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                Alert.alert('Error', 'User token is missing');
                return;
            }
            const url = `${urlBase}/apps/api/v1/employees/${empId}/leaves?Year=${year}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    const applicationIds = data.data.map((leave: Leave) => leave.id);
                    await AsyncStorage.setItem('applicationIds', JSON.stringify(applicationIds));
                    setLeaveData(data.data);
                } else {
                    Alert.alert('Error', 'Failed to fetch leave data.');
                }
            } else {
                Alert.alert('Error', 'Failed to fetch leave data.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch leave data.');
        } finally {
            setIsLoading(false);
        }
    };

    const incrementYear = () => setYear((prevYear) => prevYear + 1);
    const decrementYear = () => setYear((prevYear) => prevYear - 1);

    const handleLeaveClick = (leave: Leave) => {
        navigation.navigate('LeaveDetail', { applicationId: leave.id }); // Navigate to LeaveDetail
    };

    const formatDate = (dateTime: string) => {
        const date = new Date(dateTime);
        return date.toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'green';
            case 'Cancelled':
                return 'red';
            case 'Pending':
                return 'orange';
            case 'PendingCancellation':
                return 'orange';
            default:
                return 'gray';
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Leave Applications</Text>
            <View style={styles.yearSelector}>
                <TouchableOpacity onPress={decrementYear}>
                    <Image source={require('../../../../asset/img/icon/a-d-arrow-left.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
                <Text style={styles.yearText}>{year}</Text>
                <TouchableOpacity onPress={incrementYear}>
                    <Image source={require('../../../../asset/img/icon/a-d-arrow-right.png')} style={styles.arrowIcon} />
                </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.leaveList}>
                {isLoading ? (
                    <Text style={styles.noDataText}>Loading leave data...</Text>
                ) : leaveData.length > 0 ? (
                    leaveData.map((leave: Leave, index) => {
                        const fromDate = formatDate(leave.dateFrom);
                        const toDate = formatDate(leave.dateTo);
                        const displayStatus = leave.approvalStatusDisplay === 'PendingCancellation' ? 'Pending\nCancellation' : leave.approvalStatusDisplay;
                        return (
                            <TouchableOpacity key={index} style={styles.leaveItem} onPress={() => handleLeaveClick(leave)}>
                                <View style={styles.leaveRow}>
                                    <Text style={styles.leaveText}>
                                        <Text style={styles.bold}>{leave.leaveCodeDesc}</Text>
                                    </Text>
                                    <Text style={[styles.leaveStatus, { backgroundColor: getStatusColor(leave.approvalStatusDisplay) }]}>
                                        {displayStatus}
                                    </Text>
                                </View>
                                <Text style={styles.leaveText}>
                                    <Text style={styles.bold}>Date:</Text> {fromDate} - {toDate}
                                </Text>
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <Text style={styles.noDataText}>No leave applications found for {year}.</Text>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    yearSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    yearText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 16,
    },
    arrowIcon: {
        width: 24,
        height: 24,
    },
    leaveList: {
        paddingBottom: 20,
    },
    leaveItem: {
        padding: 15,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    leaveRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    leaveText: {
        fontSize: 16,
    },
    bold: {
        fontWeight: 'bold',
    },
    leaveStatus: {
        fontStyle: 'italic',
        color: '#fff',
        fontSize: 16,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 4,
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
    },
});

export default LeaveApplicationListing;