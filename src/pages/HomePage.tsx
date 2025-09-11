// src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

// Types
interface PJP {
  id: string;
  userId: number;
  createdById: number;
  planDate: string;
  areaToBeVisited: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
  timeSlot: string;
  nextLocation?: string;
  transitTime?: string;
  distance?: string;
}

interface Task {
  id: string;
  description: string;
  status: 'Completed' | 'Pending';
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
}

// Mock Store Hook
const useAppStore = () => {
  const [attendanceStatus, setAttendanceStatus] = useState<'in' | 'out'>('out');
  
  const mockUser: User = {
    id: '1',
    firstName: 'Agent',
    lastName: 'rez haa',
    email: 'agent@cement.com',
    companyName: 'Cement Company'
  };

  const mockPJPs: PJP[] = [
    {
      id: '1',
      userId: 1,
      createdById: 1,
      planDate: new Date().toISOString(),
      areaToBeVisited: 'Hari Hardware',
      description: 'Hardware store visit for competitor analysis and product pricing',
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        { id: '1', description: 'Competitor report', status: 'Completed' },
        { id: '2', description: 'Photo required', status: 'Pending' }
      ],
      timeSlot: '9:14 AM',
      nextLocation: 'J.K. Electronics',
      transitTime: '9:28-9:42',
      distance: '7km'
    },
    {
      id: '2',
      userId: 1,
      createdById: 1,
      planDate: new Date().toISOString(),
      areaToBeVisited: 'J.K. Electronics',
      description: 'Electronics store survey and market research',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        { id: '3', description: 'Journey Plan', status: 'Pending' },
        { id: '4', description: 'Daily Tasks', status: 'Pending' }
      ],
      timeSlot: '9:52 AM',
      distance: '7km'
    },
    {
      id: '3',
      userId: 1,
      createdById: 1,
      planDate: new Date().toISOString(),
      areaToBeVisited: 'Metro Market',
      description: 'Market analysis and customer behavior study',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tasks: [
        { id: '5', description: 'Customer survey', status: 'Pending' },
        { id: '6', description: 'Price comparison', status: 'Pending' }
      ],
      timeSlot: '11:20 AM',
      distance: '4km'
    }
  ];

  return {
    user: mockUser,
    attendanceStatus,
    pjps: mockPJPs,
    setAttendanceStatus
  };
};

// Journey Header Component
const JourneyHeader: React.FC<{
  totalTime: string;
  distance: string;
  stops: string;
  forms: string;
  offlineCount: string;
}> = ({ totalTime, distance, stops, forms, offlineCount }) => (
  <LinearGradient
    colors={['#2D3748', '#4A5568']}
    style={styles.headerGradient}
  >
    <StatusBar barStyle="light-content" backgroundColor="#2D3748" />
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.journeyTitle}>Journey</Text>
          <Text style={styles.offlineText}>
            Offline: {offlineCount} items pending sync
          </Text>
        </View>
        <Text style={styles.journeyStats}>
          {totalTime} • {distance} • {stops} stops • {forms} forms
        </Text>
      </View>
    </SafeAreaView>
  </LinearGradient>
);

// Check-in Card Component
const CheckInCard: React.FC<{
  location: string;
  onCheckIn: () => void;
}> = ({ location, onCheckIn }) => (
  <View style={styles.checkInCard}>
    <View style={styles.checkInContent}>
      <View style={styles.checkInIcon}>
        <Icon name="map-marker" size={24} color="#64748b" />
      </View>
      <View style={styles.checkInText}>
        <Text style={styles.checkInTitle}>You're near {location}. Check in?</Text>
      </View>
      <TouchableOpacity style={styles.checkInButton} onPress={onCheckIn}>
        <Text style={styles.checkInButtonText}>Check In</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Task Item Component
const TaskItem: React.FC<{
  task: string;
  isCompleted: boolean;
}> = ({ task, isCompleted }) => (
  <View style={styles.taskItem}>
    <Text style={styles.taskLabel}>Tasks</Text>
    <View style={styles.taskRow}>
      <Text style={[styles.taskText, isCompleted && styles.completedTask]}>
        {task}
      </Text>
      {isCompleted && (
        <Icon name="check" size={16} color="#10b981" style={styles.taskCheck} />
      )}
    </View>
  </View>
);

// Photo Section Component
const PhotoSection: React.FC<{
  photos?: string[];
  onAddNote: () => void;
}> = ({ photos, onAddNote }) => (
  <View style={styles.photoSection}>
    <Text style={styles.photoLabel}>Photo required</Text>
    <View style={styles.photosContainer}>
      {photos?.map((photo, index) => (
        <Image key={index} source={{ uri: photo }} style={styles.photoThumbnail} />
      ))}
    </View>
    <TouchableOpacity onPress={onAddNote}>
      <Text style={styles.addNoteButton}>Add Note</Text>
    </TouchableOpacity>
  </View>
);

// Journey Card Component
const JourneyCard: React.FC<{
  pjp: PJP;
  isLast: boolean;
}> = ({ pjp, isLast }) => {
  const handleCheckIn = () => {
    Alert.alert('Check In', `Checking in at ${pjp.areaToBeVisited}`);
  };

  const handleAddNote = () => {
    Alert.alert('Add Note', 'Add note functionality');
  };

  return (
    <View style={styles.journeyCardContainer}>
      {/* Timeline dot and line */}
      <View style={styles.timelineContainer}>
        <View style={[
          styles.timelineDot, 
          pjp.status === 'in_progress' && styles.activeTimelineDot,
          pjp.status === 'completed' && styles.completedTimelineDot
        ]} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.timeSlot}>{pjp.timeSlot}</Text>
          {pjp.distance && (
            <Text style={styles.distance}>{pjp.distance}</Text>
          )}
        </View>

        <Text style={styles.locationTitle}>{pjp.areaToBeVisited}</Text>

        {/* Tasks */}
        {pjp.tasks?.map((task) => (
          <TaskItem 
            key={task.id} 
            task={task.description} 
            isCompleted={task.status === 'Completed'} 
          />
        ))}

        {/* Photo Section for first card */}
        {pjp.id === '1' && (
          <PhotoSection 
            photos={['https://via.placeholder.com/80x60/8B5CF6/FFFFFF?text=Photo1', 'https://via.placeholder.com/80x60/8B5CF6/FFFFFF?text=Photo2']}
            onAddNote={handleAddNote}
          />
        )}

        {/* Transit info */}
        {pjp.transitTime && (
          <View style={styles.transitInfo}>
            <Text style={styles.transitText}>{pjp.transitTime} Transit</Text>
            <View style={styles.transitLine}>
              <Icon name="map" size={20} color="#3b82f6" />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

// Attendance Section Component
const AttendanceSection: React.FC<{
  attendanceStatus: 'in' | 'out';
  onPunchIn: () => void;
  onPunchOut: () => void;
}> = ({ attendanceStatus, onPunchIn, onPunchOut }) => (
  <View style={styles.attendanceSection}>
    <View style={styles.attendanceContent}>
      <View style={styles.attendanceStatus}>
        <View style={[
          styles.attendanceIndicator,
          attendanceStatus === 'in' ? styles.onDuty : styles.offDuty
        ]} />
        <Text style={styles.attendanceText}>
          {attendanceStatus === 'in' ? 'ON DUTY' : 'OFF DUTY'}
        </Text>
      </View>
      
      <View style={styles.punchButtons}>
        <TouchableOpacity 
          style={[
            styles.punchButton,
            attendanceStatus === 'out' ? styles.punchInActive : styles.punchButtonDisabled
          ]}
          onPress={onPunchIn}
          disabled={attendanceStatus === 'in'}
        >
          <Text style={styles.punchButtonText}>PUNCH IN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.punchButton,
            attendanceStatus === 'in' ? styles.punchOutActive : styles.punchButtonDisabled
          ]}
          onPress={onPunchOut}
          disabled={attendanceStatus === 'out'}
        >
          <Text style={styles.punchButtonText}>PUNCH OUT</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// Main HomePage Component
export default function HomePage(): React.JSX.Element {
  const { user, attendanceStatus, pjps, setAttendanceStatus } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handlePunchIn = () => {
    setAttendanceStatus('in');
    Alert.alert('Punch In', 'Successfully punched in!');
  };

  const handlePunchOut = () => {
    setAttendanceStatus('out');
    Alert.alert('Punch Out', 'Successfully punched out!');
  };

  const handleCheckIn = (location: string) => {
    Alert.alert('Check In', `Checking in at ${location}`);
  };

  return (
    <View style={styles.container}>
      {/* Journey Header */}
      <JourneyHeader 
        totalTime="9h 20m"
        distance="18.3 km"
        stops="11"
        forms="6"
        offlineCount="2"
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Check-in Card */}
        <CheckInCard 
          location="Hari Hardware"
          onCheckIn={() => handleCheckIn('Hari Hardware')}
        />

        {/* Attendance Section */}
        <AttendanceSection 
          attendanceStatus={attendanceStatus}
          onPunchIn={handlePunchIn}
          onPunchOut={handlePunchOut}
        />

        {/* Journey Cards */}
        <View style={styles.journeyContainer}>
          {pjps.map((pjp, index) => (
            <JourneyCard 
              key={pjp.id} 
              pjp={pjp} 
              isLast={index === pjps.length - 1}
            />
          ))}
        </View>

        {/* Add Journey Plan Button */}
        <TouchableOpacity style={styles.addJourneyButton}>
          <View style={styles.addButtonContent}>
            <Icon name="plus" size={24} color="#3b82f6" />
            <Text style={styles.addButtonText}>Journey Plan / Daily Tasks</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Tab Placeholder */}
      <View style={styles.bottomTab}>
        <View style={styles.tabItem}>
          <Icon name="view-dashboard" size={24} color="#3b82f6" />
        </View>
        <View style={styles.tabItem}>
          <Icon name="clipboard-text" size={24} color="#64748b" />
        </View>
        <View style={styles.tabItem}>
          <Icon name="map" size={24} color="#64748b" />
        </View>
        <View style={styles.tabItem}>
          <Icon name="menu" size={24} color="#64748b" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  safeArea: {
    paddingHorizontal: 16,
  },
  headerGradient: {
    paddingBottom: 16,
  },
  header: {
    paddingTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  journeyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  offlineText: {
    fontSize: 14,
    color: '#cbd5e1',
  },
  journeyStats: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  checkInCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  checkInContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkInIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  checkInText: {
    flex: 1,
  },
  checkInTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  checkInButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  checkInButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  attendanceSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  attendanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendanceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  onDuty: {
    backgroundColor: '#10b981',
  },
  offDuty: {
    backgroundColor: '#f59e0b',
  },
  attendanceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  punchButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  punchButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  punchInActive: {
    backgroundColor: '#10b981',
  },
  punchOutActive: {
    backgroundColor: '#ef4444',
  },
  punchButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  punchButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  journeyContainer: {
    paddingHorizontal: 16,
  },
  journeyCardContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#cbd5e1',
    marginBottom: 8,
  },
  activeTimelineDot: {
    backgroundColor: '#3b82f6',
  },
  completedTimelineDot: {
    backgroundColor: '#10b981',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e2e8f0',
  },
  cardContent: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeSlot: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  distance: {
    fontSize: 14,
    color: '#64748b',
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  taskItem: {
    marginBottom: 8,
  },
  taskLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    fontSize: 16,
    color: '#1e293b',
    flex: 1,
  },
  completedTask: {
    color: '#10b981',
  },
  taskCheck: {
    marginLeft: 8,
  },
  photoSection: {
    marginTop: 12,
  },
  photoLabel: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 8,
  },
  photosContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  photoThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 8,
  },
  addNoteButton: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  transitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  transitText: {
    fontSize: 16,
    color: '#64748b',
    marginRight: 12,
  },
  transitLine: {
    flex: 1,
    alignItems: 'flex-end',
  },
  addJourneyButton: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 8,
    fontWeight: '600',
  },
  bottomTab: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: 32,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
});