// NewLoginScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  TextInput,
  ImageBackground,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { LoginSrv } from '../../services/LoginSrv';
import AccountSelectorModal from './SelectUserMode';
import ErrorPopupModal from '../PopUps/MessagePop';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ismServices } from '../../services/ismServices';
import BRAND from '../config';
import { KeyboardAvoidingView, Platform } from 'react-native';

const { width } = Dimensions.get('window');

const backgroundImage = { uri: '' };

const Wave = () => (
  <View style={{ backgroundColor: 'transparent', height: 100 }}>
    <Svg height="100%" width="100%" viewBox={`0 0 ${width} 100`} preserveAspectRatio="none">
      <Path d={`M0,40 C${width * 0.3},120 ${width * 0.6},-20 ${width},60 L${width},100 L0,100 Z`} fill="white" />
    </Svg>
  </View>
);
const NewLoginScreen = () => {
  const [email, setEmail] = useState("sahilmulanioneplus@gmail.com");
  const [password, setPassword] = useState("123456");
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [accounts, setAccounts] = useState([]);

  // Error popup states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('Login Failed');
  const [isLoading, setIsLoading] = useState(false);


  const getUserDetails = async () => {
    try {
      // ✅ Check if user is already logged in
      const userInfo = await AsyncStorage.getItem("userInfo");

      if (!userInfo) {
        return; // Exit early, don't try to fetch
      }

      // ✅ Only fetch if user exists
      await ismServices.getUserDetails();

      // ✅ Double-check the data is valid
      const updatedUserInfo = await AsyncStorage.getItem("userInfo");
      if (updatedUserInfo) {
        await new Promise(resolve => setTimeout(resolve, 500));

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainApp' }],
          })
        );
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    getUserDetails(); // Only checks for existing session
  }, []);

  const handleLogin = async (userid) => {
    setIsLoading(true);

    const payload = {
      identity: email,
      password: password,
      tenant: 0,
      user_id: userid?.user_id || null,
    };

    try {
      const response = await LoginSrv.login(payload);
      if (response.status === 'multipleLogin') {
        setAccounts(response.data);
        setModalVisible(true);
      } else if (response.status === 'error') {
        // Show error popup
        setErrorTitle('Login Failed');
        setErrorMessage(response.message || 'Something went wrong. Please try again.');
        setShowError(true);
      } else if (response.status === 'success') {
        // Handle successful login
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.data))
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainApp' }],
          })
        );
      }
    } catch (error) {
      console.error('Login failed:', error);
      // Show generic error message
      setErrorTitle('Connection Error');
      setErrorMessage('Unable to connect to server. Please check your internet connection and try again.');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountSelect = (selectedUserId) => {
    setModalVisible(false);
    handleLogin(selectedUserId);
  };

  const validateInputs = () => {
    if (!email.trim()) {
      setErrorTitle('Validation Error');
      setErrorMessage('Please enter your email address.');
      setShowError(true);
      return false;
    }

    if (!password.trim()) {
      setErrorTitle('Validation Error');
      setErrorMessage('Please enter your password.');
      setShowError(true);
      return false;
    }



    return true;
  };

  const handleLoginPress = () => {
    if (validateInputs()) {
      handleLogin();
    }
  };

  return (

    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
      />

      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                  <Image source={BRAND.LOGO} style={styles.logo} resizeMode="contain" />     
                           </View>
                <Text style={styles.welcomeMessage}>Welcome Back</Text>
                <Text style={styles.subWelcomeMessage}>Please sign in to continue</Text>
              </View>

              <View style={styles.formContainer}>
                <Wave />
                <View style={styles.formInputsWrapper}>
                  <View style={styles.inputContainer}>
                    <View style={styles.icon}>
                      <Icon name="email" size={20} color="#9e9e9e" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      placeholderTextColor="#9e9e9e"
                      keyboardType="email-address"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      editable={!isLoading}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.icon}>
                      <Icon name="lock" size={20} color="#9e9e9e" />
                    </View>
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      placeholderTextColor="#9e9e9e"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                      editable={!isLoading}
                    />
                  </View>

                  <TouchableOpacity style={styles.forgotPasswordButton}>
                    <Text style={styles.forgotPasswordText}>OTP LOGIN</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleLoginPress}
                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                    disabled={isLoading}
                  >
                    <Text style={styles.loginButtonText}>
                      {isLoading ? 'Signing in...' : 'Sign in'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.signUpContainer}>
                    <Text style={styles.signUpText}>Don't have an account? </Text>
                    <TouchableOpacity>
                      <Text style={styles.signUpLink}>Sign up</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>


        {/* Account Selector Modal */}
        <AccountSelectorModal
          visible={modalVisible}
          accounts={accounts}
          onSelect={handleAccountSelect}
          onClose={() => setModalVisible(false)}
        />

        {/* Error Popup Modal */}
        <ErrorPopupModal
          visible={showError}
          onClose={() => setShowError(false)}
          title={errorTitle}
          message={errorMessage}
          type="error"
          buttonText="Try Again"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
  },

  imageBackground: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor:BRAND.PRIMARY_COLOR
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    borderRadius: 20,
    width: '60%',
    alignSelf: 'center',
    justifyContent: 'center'
  },
  logo: {
    width: 300,
    height: 60,
    justifyContent: 'center',
    alignSelf: 'center'

  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  welcomeMessage: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subWelcomeMessage: {
    fontSize: 16,
    color: '#E8F4FD',
    textAlign: 'center',
    opacity: 0.9,
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  formContainer: {
    // This is now a wrapper for the wave and the form content
  },
  formInputsWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 60,
  },
  icon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    height: 60,
    fontSize: 16,
    color: '#000',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#074B7C',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: BRAND.COLORS.button,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    height: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonDisabled: {
    backgroundColor: '#B0B0B0',
    elevation: 0,
    shadowOpacity: 0,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  signUpText: {
    fontSize: 14,
    color: '#9e9e9e',
  },
  signUpLink: {
    fontSize: 14,
    color: '#074B7C',
    fontWeight: 'bold',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 5,
    letterSpacing: 1,
  },
});

export default NewLoginScreen;