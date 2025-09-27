import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../../components/ui/Text';
export default function TermsPrivacy() {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = () => {
    if (isAccepting) return; // prevent double taps

    if (acceptTerms && acceptPrivacy) {
      setIsAccepting(true);
      // navigate and leave spinner on; router.replace/ push will change screen
      router.push('/auth/sign-in');
    } else {
      Alert.alert('Error', 'You must accept both Terms & Conditions and Privacy Policy to proceed.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.mainTitle}>Terms & Privacy Policy</Text>

        {/* Terms & Conditions Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setTermsExpanded(!termsExpanded)}
        >
          <Text style={styles.sectionTitle}>Terms & Conditions</Text>
          <Ionicons
            name={termsExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#3898B3"
          />
        </TouchableOpacity>
        {termsExpanded && (
          <View style={styles.sectionContent}>
            <Text style={styles.text}>
              {`Effective Date: February 10, 2025
Last Updated: August 30th

1. Introduction

These Terms & Conditions govern the use of the Only Click platform, which connects Service Seekers with verified Task Masters. By using our platform, you agree to these terms.

2. Definitions
• "Only Click" refers to the digital home services marketplace.
• "Service Seeker" refers to customers booking services through the platform.
• "Task Master" refers to service providers registered on the platform.
• "Platform" refers to the Only Click website and future mobile applications.

3. User Obligations
• Service Seekers must provide accurate information and agree to Only Click's pricing structure.
• Task Masters must provide services professionally and follow platform guidelines.
• Users must not misuse the platform for fraudulent activities.

4. Service Booking & Payments
• Service bookings are confirmed only upon payment.
• Cancellation policies and refund eligibility will be communicated when booking.
• Payments will be securely processed through the platform.

5. Service Quality & Dispute Resolution
• Task Masters are responsible for service quality; Only Click is an intermediary.
• If a dispute arises, Only Click will mediate between the Service Seeker and Task Master.
• Refunds or compensation will be considered on a case-by-case basis.

6. Liability & Disclaimer
• Only Click is not liable for any direct or indirect damages caused by Task Masters.
• Only Click does not guarantee service availability at all times.
• Task masters listed on Only Click are independent contractors, not employees. Only Click is not responsible for wages, benefits, or employment-related disputes.

7. Privacy & Data Security
• Only Click will store user data securely and will not share it with third parties without consent.
• Users must report any suspected data breaches.

8. Termination & Account Suspension
• Only Click reserves the right to suspend or terminate accounts that violate these terms.
• Service Seekers engaging in fraudulent activities may be banned from the platform and taken into consideration legally.
• Task Masters with repeated customer complaints may be removed.

9. Modifications to Terms

Only Click reserves the right to update these Terms & Conditions. Users will be notified of any significant changes.`}
            </Text>
          </View>
        )}

        {/* Privacy Policy Section */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setPrivacyExpanded(!privacyExpanded)}
        >
          <Text style={styles.sectionTitle}>Privacy Policy</Text>
          <Ionicons
            name={privacyExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color="#3898B3"
          />
        </TouchableOpacity>
        {privacyExpanded && (
          <View style={styles.sectionContent}>
            <Text style={styles.text}>
              {`Effective Date: March 10, 2025
Last Updated: July 03, 2025

Only Click ("Company," "we," "our," or "us") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard the limited data we require to operate our services. By using our platform, you agree to this Privacy Policy.

1. Information We Collect

We collect only the minimum information necessary to provide and improve our services.

1.1 Personal Information

Phone Number – collected for OTP-based account verification and login.

Name – collected for account personalization and communication.

Location – precise location is collected only to connect you with nearby Task Masters.

1.2 Usage Information

We may collect limited technical details such as:

Device and IP information (for security, fraud prevention, and platform optimization).

Service booking history (for customer support and order management).

1.3 Payment Information

Payments are made directly between Service Seekers and Task Masters.

Only Click does not store or process your financial details (like debit/credit card numbers, UPI, or net banking credentials).

1.4 Cookies & Tracking

We use cookies and similar technologies only for:

Improving platform performance.

Personalizing the user experience.

Limited marketing campaigns (you may opt out anytime).

2. How We Use Your Information

We use collected information strictly for:

Service Fulfillment – enabling booking and communication between Service Seekers and Task Masters.

Account Verification – OTP authentication via phone number.

Location Services – ensuring Task Masters can reach your exact location.

Customer Support – helping resolve issues and service requests.

Security – fraud detection, prevention of misuse, and legal compliance.

3. How We Share Your Information

We do not sell or rent your personal data. Sharing is limited to:

Task Masters – Only your name, contact, and service location are shared after booking confirmation.

Third-Party Service Providers – For essential services like SMS OTP delivery, analytics, or marketing.

Legal Authorities – If required by law or regulatory request.

4. Data Security & Retention

We follow industry-standard security practices (encryption, firewalls, secure servers).

Your phone number, name, and location are only stored as long as your account is active.

Sensitive details like financial data are never stored.

In case of a data breach, we will notify affected users within 72 hours.

5. Your Rights & Choices

Access & Correction – You can update your details in your profile.

Opt-Out & Deletion – You may request deletion of your account and data (some minimal records may be retained for legal compliance).

Marketing Preferences – You can unsubscribe from promotional SMS or emails at any time.

6. Children's Privacy

Our platform is not designed for individuals under 18. We do not knowingly collect data from minors.

7. Updates to This Policy

We may update this Privacy Policy occasionally. Any major updates will be shared via in-app notifications or email.

8. Contact Us

If you have questions regarding this Privacy Policy:

📍 Only Click Office, Vijayawada, Andhra Pradesh, India
📧 Email: onlyclick.connect@gmail.com

📞 Customer Support: +91 9121377419`}
            </Text>
          </View>
        )}

        <View style={styles.checkboxContainer}>
          <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)} style={styles.checkboxRow}>
            <Ionicons
              name={acceptTerms ? 'checkbox' : 'square-outline'}
              size={24}
              color="#3898B3"
            />
            <Text style={styles.checkboxText}>I accept the Terms & Conditions</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAcceptPrivacy(!acceptPrivacy)} style={styles.checkboxRow}>
            <Ionicons
              name={acceptPrivacy ? 'checkbox' : 'square-outline'}
              size={24}
              color="#3898B3"
            />
            <Text style={styles.checkboxText}>I accept the Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.acceptButton, !(acceptTerms && acceptPrivacy) && styles.disabledButton]}
          onPress={handleAccept}
          disabled={!(acceptTerms && acceptPrivacy) || isAccepting}
        >
          {isAccepting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.acceptButtonText}>I Accept</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3898B3',
  },
  sectionContent: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  checkboxContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  acceptButton: {
    backgroundColor: '#3898B3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
