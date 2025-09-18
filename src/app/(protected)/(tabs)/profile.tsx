import { useAuthStore } from '@/stores/useAuthStore';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const onLogoutPressed = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.email.charAt(0).toUpperCase()}</Text>
        </View>

        <View>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPressed}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 40
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: '#000',
    fontSize: 40,
    fontWeight: 'bold'
  },
  userInfo: {
    alignItems: 'center',
    gap: 20
  },
  username: {
    fontSize: 25,
    color: '#fff',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: "#999"
  },
  logoutButton: {
    backgroundColor: "#FF4444",
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },
  logoutText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600'
  }
});