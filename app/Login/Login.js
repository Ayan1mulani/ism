// NewLoginScreen.js
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
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
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Svg, Path } from 'react-native-svg';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { LoginSrv } from '../../services/LoginSrv';
import AccountSelectorModal from './SelectUserMode';
import ErrorPopupModal from '../PopUps/MessagePop';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ismServices } from '../../services/ismServices';

const { width } = Dimensions.get('window');

const backgroundImage = { uri: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2064&auto=format&fit=crop&ixlib=rb-4.0.3' };

const Wave = () => (
  <View style={{ backgroundColor: 'transparent', height: 100 }}>
    <Svg height="100%" width="100%" viewBox={`0 0 ${width} 100`} preserveAspectRatio="none">
      <Path d={`M0,40 C${width * 0.3},120 ${width * 0.6},-20 ${width},60 L${width},100 L0,100 Z`} fill="white" />
    </Svg>
  </View>
);

const NewLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [accounts, setAccounts] = useState([]);
  
  // Error popup states
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorTitle, setErrorTitle] = useState('Login Failed');
  const [isLoading, setIsLoading] = useState(false);

const getUserDetails = async()  =>{
 await  ismServices.getUserDetails()
 const userInfo = await AsyncStorage.getItem('userInfo')
if(userInfo){
  navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [{ name: 'MainApp' }],
  })
); 
}
}

useEffect(()=>{
getUserDetails()

},[])

 
  const handleLogin = async (userid) => {
    console.log(userid, "this to pass");
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
        await AsyncStorage.setItem('userInfo',JSON.stringify(response.data))
navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [{ name: 'MainApp' }],
  })
);      }
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
    console.log('Selected User ID:', selectedUserId);
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
      <StatusBar barStyle="light-content" />
      <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.imageBackground}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.container}>
            <View style={styles.headerContainer}>
              <View style={styles.logoContainer}>
                <Image source={{ uri: 'https://factech.co.in/fronts/images/Final_Logo_grey.png' }} style={styles.logo} resizeMode="contain" />
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
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#074B7C',
  },
  imageBackground: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  headerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 5,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 30,
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
    backgroundColor: '#1996D3',
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
});

export default NewLoginScreen;