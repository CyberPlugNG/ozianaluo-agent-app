import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiService } from '../services/api';
import { locationService } from '../services/location';

export const HomeScreen = ({ agent, onLogout }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    checkTracking();
    fetchDelivery();
  }, []);

  const checkTracking = async () => {
    const tracking = await locationService.isTracking();
    setIsTracking(tracking);
  };

  const fetchDelivery = async () => {
    try {
      const delivery = await apiService.getCurrentDelivery();
      setCurrentDelivery(delivery?.data || null);
    } catch (error) {
      console.error('Failed to fetch delivery:', error);
    }
  };

  const handleStartTracking = async () => {
    setLoading(true);
    try {
      if (!currentDelivery) {
        Alert.alert('Error', 'No active delivery found');
        return;
      }

      await locationService.startTracking(currentDelivery.id);
      
      // Get initial location
      const loc = await locationService.getCurrentLocation();
      setLocation(loc);
      setIsTracking(true);
      
      Alert.alert('Success', 'Location tracking started');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to start tracking');
    } finally {
      setLoading(false);
    }
  };

  const handleStopTracking = async () => {
    setLoading(true);
    try {
      await locationService.stopTracking();
      setIsTracking(false);
      Alert.alert('Success', 'Location tracking stopped');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to stop tracking');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Confirm', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            if (isTracking) {
              await locationService.stopTracking();
            }
            await apiService.logout();
            onLogout();
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, {agent?.name || 'Agent'}</Text>
          <Text style={styles.phone}>{agent?.phone}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Tracking Status</Text>
        <View style={styles.statusValue}>
          <View style={[styles.statusDot, isTracking && styles.statusDotActive]} />
          <Text style={styles.statusText}>{isTracking ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>

      {/* Delivery Info */}
      {currentDelivery ? (
        <View style={styles.deliveryCard}>
          <Text style={styles.cardTitle}>Active Delivery</Text>
          <View style={styles.deliveryInfo}>
            <Text style={styles.infoLabel}>Booking ID:</Text>
            <Text style={styles.infoValue}>{currentDelivery.id}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.infoLabel}>Destination:</Text>
            <Text style={styles.infoValue}>{currentDelivery.destination_address}</Text>
          </View>
          <View style={styles.deliveryInfo}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{currentDelivery.status}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.noDeliveryCard}>
          <Text style={styles.noDeliveryText}>No active delivery</Text>
        </View>
      )}

      {/* Location Info */}
      {location && (
        <View style={styles.locationCard}>
          <Text style={styles.cardTitle}>Current Location</Text>
          <View style={styles.locationInfo}>
            <Text style={styles.infoLabel}>Latitude:</Text>
            <Text style={styles.infoValue}>{location.latitude.toFixed(6)}</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.infoLabel}>Longitude:</Text>
            <Text style={styles.infoValue}>{location.longitude.toFixed(6)}</Text>
          </View>
          <View style={styles.locationInfo}>
            <Text style={styles.infoLabel}>Accuracy:</Text>
            <Text style={styles.infoValue}>{location.accuracy.toFixed(1)}m</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {isTracking ? (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStopTracking}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Stop Tracking</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStartTracking}
            disabled={loading || !currentDelivery}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Start Tracking</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.footer}>Ozianaluo Agent v1.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B6B',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  phone: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  statusCard: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  statusValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  statusDotActive: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deliveryCard: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  noDeliveryCard: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
  },
  noDeliveryText: {
    fontSize: 16,
    color: '#999',
  },
  locationCard: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  deliveryInfo: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locationInfo: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    margin: 15,
  },
  button: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginVertical: 20,
  },
});
