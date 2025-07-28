import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import BudgetScreen from './src/screens/BudgetScreen';
import ExpenseScreen from './src/screens/ExpenseScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import { BudgetProvider } from './src/context/BudgetContext';

const Tab = createBottomTabNavigator();

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('alreadyLaunched').then(value => {
      if (value === null) {
        AsyncStorage.setItem('alreadyLaunched', 'true');
        setIsFirstLaunch(true);
      } else {
        setIsFirstLaunch(false);
      }
    });
  }, []);

  if (isFirstLaunch === null) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Smart Budget Tracker</Text>
      </View>
    );
  }

  if (isFirstLaunch) {
    return <WelcomeScreen onComplete={() => setIsFirstLaunch(false)} />;
  }

  return (
    <BudgetProvider>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Budget') {
                iconName = focused ? 'wallet' : 'wallet-outline';
              } else if (route.name === 'Expenses') {
                iconName = focused ? 'receipt' : 'receipt-outline';
              } else if (route.name === 'Analytics') {
                iconName = focused ? 'analytics' : 'analytics-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#FF6B35',
            tabBarInactiveTintColor: '#8E8E93',
            headerStyle: {
              backgroundColor: '#FF6B35',
            },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Budget" 
            component={BudgetScreen}
            options={{ title: 'बजेट' }}
          />
          <Tab.Screen 
            name="Expenses" 
            component={ExpenseScreen}
            options={{ title: 'खर्च' }}
          />
          <Tab.Screen 
            name="Analytics" 
            component={AnalyticsScreen}
            options={{ title: 'विश्लेषण' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </BudgetProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
  },
  loadingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
