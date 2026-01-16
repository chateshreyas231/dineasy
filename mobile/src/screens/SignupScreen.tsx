import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
import { colors, typography, spacing, radius } from '../theme';
import { authService } from '../services/authService';
import { useAppStore } from '../store/useAppStore';
import * as Haptics from 'expo-haptics';
// import * as DocumentPicker from 'expo-document-picker'; // Install: npx expo install expo-document-picker

export const SignupScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setUser, role } = useAppStore();
  
  // Basic auth fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Restaurant-specific fields
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [phone, setPhone] = useState('');
  const [managerName, setManagerName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [capacity, setCapacity] = useState('');
  const [numberOfTables, setNumberOfTables] = useState('');
  const [menuFile, setMenuFile] = useState<any | null>(null);
  const [menuFileName, setMenuFileName] = useState('');
  const [employees, setEmployees] = useState<Array<{ name: string; role: string; email: string }>>([]);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('');
  const [newEmployeeEmail, setNewEmployeeEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isRestaurant = role === 'restaurant';

  const handleSignup = async () => {
    // Basic validation
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Restaurant-specific validation
    if (isRestaurant) {
      if (!restaurantName || !address || !phone || !managerName) {
        setError('Please fill in all required restaurant fields');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.registerWithEmail(email, password, name);
      
      if (result.success && result.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // TODO: Save restaurant profile data to backend
        // This would be done after successful registration
        if (isRestaurant) {
          // Store restaurant data in store or send to backend
          console.log('Restaurant data:', {
            restaurantName,
            address,
            city,
            state,
            zipCode,
            phone,
            managerName,
            cuisine,
            capacity,
            numberOfTables,
            employees,
            menuFile,
          });
        }
        
        // Navigation will be handled by RoleSwitcher
        // For restaurants, it will show RestaurantOnboarding screen
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.signInWithGoogle();
      if (result.success && result.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.error || 'Google sign in not configured');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.signInWithApple();
      if (result.success && result.user) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError(result.error || 'Apple sign in not configured');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apple sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePickMenu = async () => {
    // TODO: Install expo-document-picker: npx expo install expo-document-picker
    // For now, using a simple text input for menu URL or file name
    Alert.alert(
      'Menu Upload',
      'Menu upload will be available after installing expo-document-picker. For now, you can add your menu later in settings.',
      [{ text: 'OK' }]
    );
    // Uncomment when expo-document-picker is installed:
    // try {
    //   const result = await DocumentPicker.getDocumentAsync({
    //     type: ['application/pdf', 'image/*'],
    //     copyToCacheDirectory: true,
    //   });
    //   
    //   if (!result.canceled && result.assets && result.assets.length > 0) {
    //     setMenuFile(result);
    //     setMenuFileName(result.assets[0].name);
    //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    //   }
    // } catch (err) {
    //   Alert.alert('Error', 'Failed to pick menu file');
    // }
  };

  const handleAddEmployee = () => {
    if (!newEmployeeName || !newEmployeeRole || !newEmployeeEmail) {
      Alert.alert('Error', 'Please fill in all employee fields');
      return;
    }
    
    setEmployees([
      ...employees,
      {
        name: newEmployeeName,
        role: newEmployeeRole,
        email: newEmployeeEmail,
      },
    ]);
    
    setNewEmployeeName('');
    setNewEmployeeRole('');
    setNewEmployeeEmail('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRemoveEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F9FA', '#FFFFFF', '#F0F2F5']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>
              {isRestaurant ? 'Restaurant Sign Up' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {isRestaurant ? 'Register your restaurant' : 'Sign up to get started'}
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            {/* Basic Account Information */}
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>
                {isRestaurant ? 'Account Information' : 'Account Details'}
              </Text>
              
              <Input
                placeholder={isRestaurant ? 'Manager Name' : 'Full Name'}
                value={name}
                onChangeText={setName}
                leftIcon="person-outline"
              />
              <Input
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
              />
              <Input
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                leftIcon="lock-closed-outline"
              />
              <Input
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                leftIcon="lock-closed-outline"
              />
            </Card>

            {/* Restaurant-Specific Fields */}
            {isRestaurant && (
              <>
                {/* Restaurant Basic Information */}
                <Card style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Restaurant Information</Text>
                  
                  <Input
                    placeholder="Restaurant Name *"
                    value={restaurantName}
                    onChangeText={setRestaurantName}
                    leftIcon="restaurant-outline"
                  />
                  <Input
                    placeholder="Cuisine Type"
                    value={cuisine}
                    onChangeText={setCuisine}
                    leftIcon="fast-food-outline"
                  />
                  <Input
                    placeholder="Phone Number *"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    leftIcon="call-outline"
                  />
                  <Input
                    placeholder="Manager Name *"
                    value={managerName}
                    onChangeText={setManagerName}
                    leftIcon="person-outline"
                  />
                </Card>

                {/* Address Information */}
                <Card style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Address</Text>
                  
                  <Input
                    placeholder="Street Address *"
                    value={address}
                    onChangeText={setAddress}
                    leftIcon="location-outline"
                  />
                  <View style={styles.row}>
                    <View style={styles.halfWidth}>
                      <Input
                        placeholder="City"
                        value={city}
                        onChangeText={setCity}
                        containerStyle={styles.halfInput}
                      />
                    </View>
                    <View style={styles.halfWidth}>
                      <Input
                        placeholder="State"
                        value={state}
                        onChangeText={setState}
                        containerStyle={styles.halfInput}
                      />
                    </View>
                  </View>
                  <Input
                    placeholder="ZIP Code"
                    value={zipCode}
                    onChangeText={setZipCode}
                    keyboardType="numeric"
                    leftIcon="map-outline"
                  />
                </Card>

                {/* Capacity and Tables */}
                <Card style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Capacity & Tables (Optional)</Text>
                  
                  <Input
                    placeholder="Total Capacity"
                    value={capacity}
                    onChangeText={setCapacity}
                    keyboardType="numeric"
                    leftIcon="people-outline"
                  />
                  <Input
                    placeholder="Number of Tables"
                    value={numberOfTables}
                    onChangeText={setNumberOfTables}
                    keyboardType="numeric"
                    leftIcon="grid-outline"
                  />
                  <Text style={styles.helperText}>
                    You can add detailed table information later in settings
                  </Text>
                </Card>

                {/* Menu Upload */}
                <Card style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Menu (Optional)</Text>
                  
                  <Input
                    placeholder="Menu URL or File Name (Optional)"
                    value={menuFileName}
                    onChangeText={setMenuFileName}
                    leftIcon="document-text-outline"
                  />
                  <TouchableOpacity
                    style={styles.filePickerButton}
                    onPress={handlePickMenu}
                  >
                    <Ionicons
                      name="cloud-upload-outline"
                      size={24}
                      color={colors.primary.main}
                    />
                    <Text style={styles.filePickerText}>
                      Upload Menu File (PDF or Image)
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.helperText}>
                    You can upload your menu file or add a menu URL. Full file upload requires expo-document-picker.
                  </Text>
                </Card>

                {/* Employees */}
                <Card style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>Employees (Optional)</Text>
                  
                  <Input
                    placeholder="Employee Name"
                    value={newEmployeeName}
                    onChangeText={setNewEmployeeName}
                    leftIcon="person-add-outline"
                  />
                  <Input
                    placeholder="Role (e.g., Server, Host, Manager)"
                    value={newEmployeeRole}
                    onChangeText={setNewEmployeeRole}
                    leftIcon="briefcase-outline"
                  />
                  <Input
                    placeholder="Email"
                    value={newEmployeeEmail}
                    onChangeText={setNewEmployeeEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail-outline"
                  />
                  <Button
                    title="Add Employee"
                    onPress={handleAddEmployee}
                    variant="secondary"
                    size="sm"
                    style={styles.addButton}
                  />

                  {employees.length > 0 && (
                    <View style={styles.employeesList}>
                      {employees.map((employee, index) => (
                        <View key={index} style={styles.employeeItem}>
                          <View style={styles.employeeInfo}>
                            <Text style={styles.employeeName}>{employee.name}</Text>
                            <Text style={styles.employeeDetails}>
                              {employee.role} • {employee.email}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleRemoveEmployee(index)}
                            style={styles.removeEmployeeButton}
                          >
                            <Ionicons name="close-circle" size={24} color={colors.status.error} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              </>
            )}

            <Button
              title={isRestaurant ? 'Create Restaurant Account' : 'Sign Up'}
              onPress={handleSignup}
              variant="secondary"
              size="lg"
              loading={loading}
              style={styles.signupButton}
            />

            {role !== 'restaurant' && (
              <>
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>OR</Text>
                  <View style={styles.dividerLine} />
                </View>

                <Button
                  title="Continue with Google"
                  onPress={handleGoogleSignIn}
                  variant="secondary"
                  size="lg"
                  style={styles.socialButton}
                />

                {Platform.OS === 'ios' && (
                  <Button
                    title="Continue with Apple"
                    onPress={handleAppleSignIn}
                    variant="secondary"
                    size="lg"
                    style={styles.socialButton}
                  />
                )}
              </>
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Already have an account? <Text style={styles.loginLinkText}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.muted,
  },
  form: {
    width: '100%',
  },
  errorContainer: {
    backgroundColor: colors.status.error + '20',
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.status.error,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfWidth: {
    flex: 1,
  },
  halfInput: {
    marginBottom: spacing.md,
  },
  helperText: {
    ...typography.caption,
    color: colors.text.muted,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  filePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.elegant,
    borderStyle: 'dashed',
  },
  filePickerText: {
    ...typography.body,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  removeFileButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  removeFileText: {
    ...typography.bodySmall,
    color: colors.status.error,
  },
  addButton: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  employeesList: {
    marginTop: spacing.md,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.secondary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  employeeDetails: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  removeEmployeeButton: {
    marginLeft: spacing.sm,
  },
  signupButton: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.medium,
  },
  dividerText: {
    ...typography.bodySmall,
    color: colors.text.muted,
    marginHorizontal: spacing.md,
  },
  socialButton: {
    marginBottom: spacing.md,
  },
  loginLink: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  loginText: {
    ...typography.body,
    color: colors.text.muted,
  },
  loginLinkText: {
    color: colors.primary.main,
    fontWeight: '600',
  },
});
