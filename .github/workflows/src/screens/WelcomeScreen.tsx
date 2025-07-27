import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function WelcomeScreen() {
  return (
    <LinearGradient
      colors={['#FF6B35', '#F7931E']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Ionicons name="wallet" size={80} color="#FFFFFF" />
          <Text style={styles.title}>स्मार्ट बजेट ट्र्याकर</Text>
          <Text style={styles.subtitle}>आपका व्यक्तिगत वित्त सहायक</Text>
        </View>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>नमस्कार! 🙏</Text>
          <Text style={styles.welcomeMessage}>
            स्मार्ट बजेट ट्र्याकर में आपका स्वागत है। यह ऐप आपको अपने पैसों को बेहतर तरीके से प्रबंधित करने में मदद करेगा।
          </Text>
          
          <View style={styles.attributionSection}>
            <Text style={styles.attributionTitle}>विकसित किया गया:</Text>
            <Text style={styles.attributionText}>KissonFloyd द्वारा</Text>
            <Text style={styles.attributionSubtext}>
              आपके वित्तीय लक्ष्यों को प्राप्त करने के लिए बनाया गया
            </Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>मुख्य विशेषताएं:</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="pie-chart" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>बजेट प्रबंधन और ट्रैकिंग</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="receipt" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>खर्च रिकॉर्डिंग और रसीद अपलोड</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="analytics" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>विस्तृत खर्च विश्लेषण</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="cloud-offline" size={24} color="#FF6B35" />
            <Text style={styles.featureText}>ऑफलाइन काम करता है</Text>
          </View>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>कैसे शुरू करें:</Text>
          <Text style={styles.instructionText}>
            1. "बजेट" टैब में जाकर अपना पहला बजेट बनाएं{'\n'}
            2. "खर्च" टैब में अपने खर्च जोड़ें{'\n'}
            3. "विश्लेषण" टैब में अपनी खर्च की रिपोर्ट देखें
          </Text>
        </View>

        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>शुरू करें</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 5,
    textAlign: 'center',
    opacity: 0.9,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  attributionSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 15,
    alignItems: 'center',
  },
  attributionTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  attributionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 5,
  },
  attributionSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  featuresContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 15,
    flex: 1,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  startButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginTop: 10,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 10,
  },
});
