// src/components/DailyTasksBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  ScrollView,
  RefreshControl,
  Platform,
  Vibration,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import your global store and constants
import { 
  useAppStore, 
  BASE_URL, 
  LoadingList,
} from '../components/ReusableConstants';

const { width, height } = Dimensions.get('window');

interface DailyTask {
  id: string | number;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  taskDate: string;
  priority?: 'High' | 'Medium' | 'Low';
  visitType?: string;
  relatedDealerId?: string;
  pjpId?: string;
  assignedByUserId?: number;
  userId: number;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  siteName?: string;
  notes?: string;
}

interface DailyTasksBellProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
  onTaskPress?: (task: DailyTask) => void;
  onCreateTask?: () => void;
}

const DailyTasksBell: React.FC<DailyTasksBellProps> = ({
  position = 'top-right',
  size = 'medium',
  onTaskPress,
  onCreateTask,
}) => {
  // Use your global Zustand store
  const { 
    user, 
    dailyTasks, 
    isLoading, 
    isOnline,
    lastSync,
    setLoading,
    setData,
    updateLastSync 
  } = useAppStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Animations
  const bellScale = useRef(new Animated.Value(1)).current;
  const bellRotation = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const modalSlide = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (user?.id) {
      fetchDailyTasks();
    }
  }, [user]);

  useEffect(() => {
    // Animate badge when tasks change
    const pendingCount = getPendingTasksCount();
    if (pendingCount > 0) {
      Animated.spring(badgeScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
      
      // Bell notification animation
      startBellAnimation();
    } else {
      Animated.spring(badgeScale, {
        toValue: 0,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }).start();
    }
  }, [dailyTasks]);

  const fetchDailyTasks = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${BASE_URL}/api/daily-tasks/user/${user.id}?startDate=${today}&endDate=${today}&limit=100`
      );
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setData('dailyTasks', result.data);
        updateLastSync();
      }
    } catch (error) {
      console.error('Failed to fetch daily tasks:', error);
      if (isOnline) {
        Alert.alert('Mission Control Error', 'Unable to sync daily tasks from base');
      }
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskId: string | number) => {
    try {
      const response = await fetch(`${BASE_URL}/api/daily-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Completed', 
          completedAt: new Date().toISOString() 
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        // Haptic feedback
        if (Platform.OS === 'ios') {
          Vibration.vibrate(10);
        } else {
          Vibration.vibrate(50);
        }
        
        await fetchDailyTasks(); // Refresh tasks
        Alert.alert('Mission Complete', 'Task marked as completed');
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const startBellAnimation = () => {
    // Bell shake animation
    Animated.sequence([
      Animated.timing(bellRotation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bellRotation, {
        toValue: -1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bellRotation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleBellPress = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Vibration.vibrate(10);
    } else {
      Vibration.vibrate(50);
    }

    // Scale animation
    Animated.sequence([
      Animated.timing(bellScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bellScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setModalVisible(true);
    
    // Modal slide in animation
    Animated.spring(modalSlide, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleCloseModal = () => {
    Animated.timing(modalSlide, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDailyTasks();
    setRefreshing(false);
  };

  const getPendingTasksCount = () => {
    return dailyTasks?.filter(task => 
      task.status !== 'Completed' && task.status !== 'Cancelled'
    ).length || 0;
  };

  const getFilteredTasks = () => {
    if (!dailyTasks) return [];
    
    switch (selectedFilter) {
      case 'pending':
        return dailyTasks.filter(task => 
          task.status !== 'Completed' && task.status !== 'Cancelled'
        );
      case 'completed':
        return dailyTasks.filter(task => task.status === 'Completed');
      default:
        return dailyTasks;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#10b981';
      case 'In Progress': return '#06b6d4';
      case 'Pending': return '#f59e0b';
      case 'Cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getTaskPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getBellSize = () => {
    switch (size) {
      case 'small': return 20;
      case 'large': return 32;
      default: return 24;
    }
  };

  const getContainerSize = () => {
    switch (size) {
      case 'small': return 40;
      case 'large': return 56;
      default: return 48;
    }
  };

  const getPositionStyle = () => {
    const containerSize = getContainerSize();
    const margin = 16;
    
    switch (position) {
      case 'top-left':
        return { top: margin, left: margin };
      case 'bottom-left':
        return { bottom: margin, left: margin };
      case 'bottom-right':
        return { bottom: margin, right: margin };
      default: // top-right
        return { top: margin, right: margin };
    }
  };

  const pendingCount = getPendingTasksCount();
  const filteredTasks = getFilteredTasks();

  return (
    <>
      {/* Bell Icon Button */}
      <Animated.View
        style={[
          styles.bellContainer,
          {
            width: getContainerSize(),
            height: getContainerSize(),
            transform: [
              { scale: Animated.multiply(bellScale, pulseAnim) },
              { 
                rotate: bellRotation.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-10deg', '10deg'],
                })
              }
            ],
          },
          getPositionStyle(),
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBellPress}
          style={styles.bellButton}
        >
          <LinearGradient
            colors={pendingCount > 0 ? ['#f59e0b', '#d97706'] : ['#374151', '#4b5563']}
            style={styles.bellGradient}
          >
            <Ionicons 
              name="notifications" 
              size={getBellSize()} 
              color="white" 
            />
          </LinearGradient>

          {/* Notification Badge */}
          {pendingCount > 0 && (
            <Animated.View
              style={[
                styles.badge,
                {
                  transform: [{ scale: badgeScale }],
                },
              ]}
            >
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.badgeGradient}
              >
                <Text style={styles.badgeText}>
                  {pendingCount > 99 ? '99+' : pendingCount}
                </Text>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Online Status Indicator */}
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10b981' : '#ef4444' }]} />
        </TouchableOpacity>
      </Animated.View>

      {/* Tasks Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalBackdrop}>
          <BlurView intensity={20} tint="dark" style={styles.blurBackdrop}>
            <TouchableOpacity 
              style={styles.backdropTouch}
              activeOpacity={1}
              onPress={handleCloseModal}
            />
            
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [{ translateY: modalSlide }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(15, 23, 42, 0.95)', 'rgba(30, 41, 59, 0.95)']}
                style={styles.modalGradient}
              >
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="clipboard-list" size={24} color="#06b6d4" />
                    <Text style={styles.modalTitle}>DAILY MISSIONS</Text>
                  </View>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={styles.closeButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close" size={24} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                {/* Connection Status */}
                <View style={styles.connectionBanner}>
                  <View style={[styles.connectionIndicator, { backgroundColor: isOnline ? '#10b981' : '#ef4444' }]} />
                  <Text style={styles.connectionText}>
                    {isOnline ? 'MISSION CONTROL ONLINE' : 'OFFLINE MODE'}
                  </Text>
                  {lastSync && (
                    <Text style={styles.syncText}>
                      • Last sync: {lastSync.toLocaleTimeString()}
                    </Text>
                  )}
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                  {(['all', 'pending', 'completed'] as const).map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      onPress={() => setSelectedFilter(filter)}
                      style={[
                        styles.filterTab,
                        selectedFilter === filter && styles.filterTabActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterTabText,
                        selectedFilter === filter && styles.filterTabTextActive,
                      ]}>
                        {filter.toUpperCase()}
                      </Text>
                      {filter === 'pending' && pendingCount > 0 && (
                        <View style={styles.filterBadge}>
                          <Text style={styles.filterBadgeText}>{pendingCount}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Tasks List */}
                <ScrollView
                  style={styles.tasksList}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      tintColor="#06b6d4"
                      colors={['#06b6d4']}
                    />
                  }
                >
                  {isLoading ? (
                    <LoadingList rows={5} />
                  ) : filteredTasks.length === 0 ? (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="clipboard-check" size={48} color="#374151" />
                      <Text style={styles.emptyTitle}>
                        {selectedFilter === 'pending' ? 'NO PENDING MISSIONS' : 
                         selectedFilter === 'completed' ? 'NO COMPLETED MISSIONS' : 
                         'NO MISSIONS ASSIGNED'}
                      </Text>
                      <Text style={styles.emptySubtitle}>
                        {selectedFilter === 'pending' ? 'All tasks completed, Agent!' : 
                         'Check back later for new assignments'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.tasksContainer}>
                      {filteredTasks.map((task, index) => (
                        <TouchableOpacity
                          key={task.id}
                          onPress={() => onTaskPress?.(task)}
                          style={[
                            styles.taskCard,
                            task.status === 'Completed' && styles.taskCardCompleted,
                          ]}
                          activeOpacity={0.8}
                        >
                          <LinearGradient
                            colors={
                              task.status === 'Completed' 
                                ? ['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)']
                                : ['rgba(30, 41, 59, 0.8)', 'rgba(51, 65, 85, 0.6)']
                            }
                            style={styles.taskCardGradient}
                          >
                            {/* Task Priority Bar */}
                            <View 
                              style={[
                                styles.priorityBar, 
                                { backgroundColor: getTaskPriorityColor(task.priority) }
                              ]} 
                            />

                            <View style={styles.taskHeader}>
                              <View style={styles.taskHeaderLeft}>
                                <Text style={[
                                  styles.taskDescription,
                                  task.status === 'Completed' && styles.taskDescriptionCompleted,
                                ]}>
                                  {task.description}
                                </Text>
                                {task.siteName && (
                                  <View style={styles.siteInfo}>
                                    <Ionicons name="location" size={12} color="#06b6d4" />
                                    <Text style={styles.siteName}>{task.siteName}</Text>
                                  </View>
                                )}
                                {task.visitType && (
                                  <Text style={styles.visitType}>Type: {task.visitType}</Text>
                                )}
                              </View>

                              <View style={styles.taskHeaderRight}>
                                <View style={[
                                  styles.statusBadge,
                                  { backgroundColor: getTaskStatusColor(task.status) + '20' }
                                ]}>
                                  <Text style={[
                                    styles.statusText,
                                    { color: getTaskStatusColor(task.status) }
                                  ]}>
                                    {task.status.toUpperCase()}
                                  </Text>
                                </View>

                                {task.priority && (
                                  <View style={styles.priorityBadge}>
                                    <MaterialCommunityIcons 
                                      name={
                                        task.priority === 'High' ? 'alert' :
                                        task.priority === 'Medium' ? 'alert-outline' :
                                        'information-outline'
                                      }
                                      size={12} 
                                      color={getTaskPriorityColor(task.priority)} 
                                    />
                                    <Text style={[
                                      styles.priorityText,
                                      { color: getTaskPriorityColor(task.priority) }
                                    ]}>
                                      {task.priority}
                                    </Text>
                                  </View>
                                )}
                              </View>
                            </View>

                            {/* Task Actions */}
                            {task.status !== 'Completed' && task.status !== 'Cancelled' && (
                              <View style={styles.taskActions}>
                                <TouchableOpacity
                                  onPress={() => completeTask(task.id)}
                                  style={styles.completeButton}
                                  activeOpacity={0.7}
                                >
                                  <MaterialCommunityIcons name="check" size={16} color="#10b981" />
                                  <Text style={styles.completeButtonText}>COMPLETE</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => onTaskPress?.(task)}
                                  style={styles.detailsButton}
                                  activeOpacity={0.7}
                                >
                                  <MaterialCommunityIcons name="eye" size={16} color="#06b6d4" />
                                  <Text style={styles.detailsButtonText}>DETAILS</Text>
                                </TouchableOpacity>
                              </View>
                            )}

                            {/* Task Timestamp */}
                            <View style={styles.taskFooter}>
                              <Text style={styles.taskDate}>
                                {new Date(task.taskDate).toLocaleDateString()} • {task.createdAt ? new Date(task.createdAt).toLocaleTimeString() : ''}
                              </Text>
                              {task.completedAt && (
                                <Text style={styles.completedDate}>
                                  Completed: {new Date(task.completedAt).toLocaleTimeString()}
                                </Text>
                              )}
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </ScrollView>

                {/* Add Task Button */}
                {onCreateTask && (
                  <TouchableOpacity
                    onPress={onCreateTask}
                    style={styles.addTaskButton}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#06b6d4', '#0891b2']}
                      style={styles.addTaskGradient}
                    >
                      <MaterialCommunityIcons name="plus" size={20} color="white" />
                      <Text style={styles.addTaskText}>CREATE NEW MISSION</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </Animated.View>
          </BlurView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bellContainer: {
    position: 'absolute',
    zIndex: 1000,
  },
  bellButton: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  bellGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  modalBackdrop: {
    flex: 1,
  },
  blurBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    height: height * 0.85,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginLeft: 12,
    letterSpacing: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
  },
  connectionIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  connectionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#06b6d4',
    letterSpacing: 1,
  },
  syncText: {
    fontSize: 9,
    color: '#9ca3af',
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(75, 85, 99, 0.3)',
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  filterTabActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.8,
  },
  filterTabTextActive: {
    color: '#06b6d4',
    fontWeight: '700',
  },
  filterBadge: {
    marginLeft: 6,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: 'white',
  },
  tasksList: {
    flex: 1,
    paddingTop: 8,
  },
  tasksContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  taskCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
  },
  taskCardCompleted: {
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  taskCardGradient: {
    padding: 16,
    position: 'relative',
  },
  priorityBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  taskHeaderRight: {
    alignItems: 'flex-end',
  },
  taskDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  taskDescriptionCompleted: {
    textDecorationLine: 'line-through',
    color: '#9ca3af',
  },
  siteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  siteName: {
    fontSize: 12,
    color: '#cbd5e1',
    marginLeft: 4,
  },
  visitType: {
    fontSize: 11,
    color: '#9ca3af',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 2,
    letterSpacing: 0.5,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(75, 85, 99, 0.2)',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  completeButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  detailsButtonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#06b6d4',
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  taskFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(75, 85, 99, 0.1)',
  },
  taskDate: {
    fontSize: 10,
    color: '#6b7280',
  },
  completedDate: {
    fontSize: 9,
    color: '#10b981',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
  addTaskButton: {
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addTaskGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  addTaskText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 1,
  },
});

export default DailyTasksBell;