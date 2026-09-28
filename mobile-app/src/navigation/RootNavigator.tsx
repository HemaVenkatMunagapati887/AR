import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import SplashScreen from '../screens/SplashScreen';
import LanguageSelectScreen from '../screens/LanguageSelectScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ModuleIntroScreen from '../screens/ModuleIntroScreen';
import LearningContentScreen from '../screens/LearningContentScreen';
import ArExperienceScreen from '../screens/ArExperienceScreen';
import ResultScreen from '../screens/ResultScreen';
import CertificateScreen from '../screens/CertificateScreen';
import CertificateQrScreen from '../screens/CertificateQrScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ModuleIntro" component={ModuleIntroScreen} />
        <Stack.Screen name="LearningContent" component={LearningContentScreen} />
        <Stack.Screen name="ArExperience" component={ArExperienceScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
        <Stack.Screen name="Certificate" component={CertificateScreen} />
        <Stack.Screen name="CertificateQr" component={CertificateQrScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
