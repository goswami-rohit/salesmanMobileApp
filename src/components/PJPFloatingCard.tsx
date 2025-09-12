// src/components/PJPFloatingCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme, Card, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

interface PJPCardProps {
  pjp: any;
  onCardPress?: (pjp: any) => void;
}

const PJPFloatingCard: React.FC<PJPCardProps> = ({ pjp, onCardPress }) => {
  const theme = useTheme();

  const dealerName = pjp?.dealerName || pjp?.name || 'Unknown Dealer';
  const dealerAddress = pjp?.dealerAddress || pjp?.location || pjp?.address || 'Location TBD';
  const status = pjp?.status || 'planned';

  const getStatusBadgeColor = (pjpStatus: string) => {
    switch (pjpStatus?.toLowerCase()) {
      case 'active': return theme.colors.primary;
      case 'completed': return theme.colors.tertiary;
      case 'planned': return theme.colors.secondary;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.outline;
    }
  };

  const statusColor = getStatusBadgeColor(status);

  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
      <TouchableOpacity onPress={() => onCardPress?.(pjp)}>
        <Card.Content style={styles.cardContent}>
          <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
          <View style={styles.contentWrapper}>
            <View style={styles.header}>
              <Text style={[styles.dealerName, { color: theme.colors.onSurface }]}>{dealerName}</Text>
              <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: statusColor + '20' }]}>
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {status.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.addressSection}>
              <Icon name="map-marker" size={16} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.addressText, { color: theme.colors.onSurfaceVariant }]} numberOfLines={1}>
                {dealerAddress}
              </Text>
            </View>

            <Button mode="text" onPress={() => onCardPress?.(pjp)} style={styles.detailsButton}>
              View Details
            </Button>
          </View>
        </Card.Content>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  statusBar: {
    width: 6,
    height: '100%',
    marginRight: 16,
  },
  contentWrapper: {
    flex: 1,
    paddingVertical: 16,
    paddingRight: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealerName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  addressText: {
    fontSize: 12,
    marginLeft: 8,
    flex: 1,
  },
  detailsButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
});

export default PJPFloatingCard;