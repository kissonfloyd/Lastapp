import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="wallet" size={80} color="#FFFFFF" />
          <Text style={styles.title}>स्मार्ट बजेट ट्र्याकर में आपका स्वागत है</Text>
          <Text style={styles.subtitle}>KissonFloyd द्वारा बनाया गया</Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Ionicons name="camera" size={30} color="#FFFFFF" />
            <Text style={styles.featureText}>रसीदों की तस्वीरें अपलोड करें</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="analytics" size={30} color="#FFFFFF" />
            <Text style={styles.featureText}>अपने खर्च का विश्लेषण देखें</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="phone-portrait" size={30} color="#FFFFFF" />
            <Text style={styles.featureText}>ऑफलाइन काम करता है</Text>
          </View>
          
          <View style={styles.feature}>
            <Ionicons name="shield-checkmark" size={30} color="#FFFFFF" />
            <Text style={styles.featureText}>आपका डेटा सुरक्षित है</Text>
          </View>
        </View>

        <View style={styles.currencyInfo}>
          <Text style={styles.currencyText}>नेपाली रुपैया (रू) में ट्रैकिंग</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>शुरू करें</Text>
          <Ionicons name="arrow-forward" size={20} color="#FF6B35" />
        </TouchableOpacity>

        <Text style={styles.footer}>
          आपके वित्तीय लक्ष्यों को प्राप्त करने में आपकी मदद करने के लिए डिज़ाइन किया गया
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.9,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 15,
    flex: 1,
  },
  currencyInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 30,
  },
  currencyText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FF6B35',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  footer: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
