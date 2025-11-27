import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { signupStyles as styles } from "../styles/signupStyles";
import api from "../services/api";

interface SignupData {
  email: string;
  password: string;
  medicalCondition: string;
  medicalProof?: any;
  phoneNumber: string;
  otp: string;
  agreedToTerms: boolean;
}

export default function SignupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [signupData, setSignupData] = useState<SignupData>({
    email: "",
    password: "",
    medicalCondition: "",
    medicalProof: null,
    phoneNumber: "",
    otp: "",
    agreedToTerms: false,
  });

  // OTP inputs
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  const handleNext = async () => {
    if (step === 1) {
      // Validate email and password
      if (!signupData.email || !signupData.password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(signupData.email)) {
        Alert.alert("Error", "Please enter a valid email address");
        return;
      }
      
      // Password strength validation
      if (signupData.password.length < 8) {
        Alert.alert("Error", "Password must be at least 8 characters long");
        return;
      }
      
      setStep(2);
    } else if (step === 2) {
      // Upload medical proof if provided
      if (signupData.medicalProof) {
        try {
          setLoading(true);
          // TODO: Implement file upload
          // const uploadResult = await api.uploadFile(signupData.medicalProof);
          setLoading(false);
        } catch (error) {
          setLoading(false);
          Alert.alert("Error", "Failed to upload medical proof");
          return;
        }
      }
      setStep(3);
    } else if (step === 3) {
      // Validate phone number and terms agreement
      if (!signupData.phoneNumber) {
        Alert.alert("Error", "Please enter your phone number");
        return;
      }
      if (!signupData.agreedToTerms) {
        Alert.alert("Error", "Please agree to the Terms of Service and Privacy Policy");
        return;
      }
      
      // Verify OTP and complete signup
      handleSignup();
    }
  };

  const handleSkip = () => {
    if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleDocumentPick = async () => {
    // TODO: Install expo-document-picker and implement file picking
    // For now, just show an alert
    Alert.alert("File Upload", "File upload feature will be available soon");
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    // Update signup data when all OTP digits are entered
    if (newOtp.every((digit) => digit !== "")) {
      setSignupData({ ...signupData, otp: newOtp.join("") });
    }
  };

  const handleResendOtp = async () => {
    try {
      setLoading(true);
      await api.sendOTP(signupData.phoneNumber);
      setLoading(false);
      Alert.alert("Success", "OTP code has been resent");
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Failed to resend OTP");
    }
  };

  const handleSignup = async () => {
    try {
      // Verify OTP first
      const otpCode = otp.join("");
      if (otpCode.length !== 4) {
        Alert.alert("Error", "Please enter the complete OTP code");
        return;
      }

      setLoading(true);

      // Verify OTP
      await api.verifyOTP(signupData.phoneNumber, otpCode);

      // Create account
      const signupResponse = await api.signup({
        email: signupData.email,
        password: signupData.password,
        phoneNumber: signupData.phoneNumber,
        medicalCondition: signupData.medicalCondition || undefined,
        medicalProofUrl: undefined, // TODO: Add uploaded file URL
      });

      setLoading(false);

      Alert.alert("Success", "Account created successfully!", [
        {
          text: "OK",
          onPress: () => router.replace("/home"),
        },
      ]);
    } catch (error: any) {
      setLoading(false);
      Alert.alert(
        "Error",
        error?.message || "Failed to create account. Please try again."
      );
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.subtitle}>Personal Details</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "email" && styles.inputFocused,
          ]}
          placeholder="Reika@pcu.edu.ph"
          placeholderTextColor="#9E9E9E"
          value={signupData.email}
          onChangeText={(text) => setSignupData({ ...signupData, email: text })}
          keyboardType="email-address"
          autoCapitalize="none"
          onFocus={() => setFocusedInput("email")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "password" && styles.inputFocused,
          ]}
          placeholder="••••••••••••••"
          placeholderTextColor="#9E9E9E"
          value={signupData.password}
          onChangeText={(text) =>
            setSignupData({ ...signupData, password: text })
          }
          secureTextEntry
          onFocus={() => setFocusedInput("password")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      {/* Social Login */}
      <Text style={styles.socialText}>Or sign up using</Text>

      <View style={styles.socialButtons}>
        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("../../assets/images/google-icon.png")}
            style={styles.socialIconImage}
          />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Image
            source={require("../../assets/images/facebook-icon.png")}
            style={styles.socialIconImage}
          />
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.subtitle}>Medical Details</Text>

      {/* Medical Condition Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Any medical conditions?</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "medical" && styles.inputFocused,
          ]}
          placeholder="Love Sick"
          placeholderTextColor="#9E9E9E"
          value={signupData.medicalCondition}
          onChangeText={(text) =>
            setSignupData({ ...signupData, medicalCondition: text })
          }
          onFocus={() => setFocusedInput("medical")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      {/* Attach Proof */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Attach Proof</Text>
        <TouchableOpacity
          style={styles.uploadContainer}
          onPress={handleDocumentPick}
        >
          <Image
            source={require("../../assets/images/cloud-upload-icon.png")}
            style={styles.uploadIcon}
          />
          <Text style={styles.uploadText}>
            {signupData.medicalProof
              ? signupData.medicalProof.name
              : "Tap to upload"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.subtitle}>Phone Verification</Text>

      {/* Phone Number Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[
            styles.input,
            focusedInput === "phone" && styles.inputFocused,
          ]}
          placeholder="+63 023 123 2341"
          placeholderTextColor="#9E9E9E"
          value={signupData.phoneNumber}
          onChangeText={(text) =>
            setSignupData({ ...signupData, phoneNumber: text })
          }
          keyboardType="phone-pad"
          onFocus={() => setFocusedInput("phone")}
          onBlur={() => setFocusedInput(null)}
        />
      </View>

      {/* OTP Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Enter your OTP code here</Text>
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={otpRefs[index]}
              style={[
                styles.otpInput,
                focusedInput === `otp-${index}` && styles.otpInputFocused,
                digit !== "" && styles.otpInputFilled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              keyboardType="number-pad"
              maxLength={1}
              onFocus={() => setFocusedInput(`otp-${index}`)}
              onBlur={() => setFocusedInput(null)}
            />
          ))}
        </View>
      </View>

      {/* Resend OTP */}
      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Didn't receive any code?</Text>
        <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
          <Text style={styles.resendButton}>Resend OTP code</Text>
        </TouchableOpacity>
      </View>
    </>
  );



  return (
    <View style={styles.container}>
      <View style={styles.scrollContent}>
        {/* Back Button and Title Section */}
        <View>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Image
              source={require("../../assets/images/back-icon.png")}
              style={styles.backButtonIcon}
            />
          </TouchableOpacity>

          <Text style={styles.title}>
            <Text style={styles.titleGreen}>SIGN</Text>
            <Text style={styles.titleBlack}> UP</Text>
          </Text>
        </View>

        {/* Scrollable Form Content */}
        <ScrollView 
          style={styles.formScrollArea}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {/* Fixed Bottom Section - Next, Skip, Progress */}
        <View style={styles.bottomFixedSection}>
          {/* Terms Checkbox (Step 3 only) */}
          {step === 3 && (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() =>
                setSignupData({
                  ...signupData,
                  agreedToTerms: !signupData.agreedToTerms,
                })
              }
            >
              <View
                style={[
                  styles.checkbox,
                  signupData.agreedToTerms && styles.checkboxChecked,
                ]}
              >
                {signupData.agreedToTerms && (
                  <Text style={{ color: "white", fontWeight: "bold" }}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the{" "}
                <Text style={styles.checkboxLink}>Terms of Service</Text> and{" "}
                <Text style={styles.checkboxLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#3D3D3D" />
            ) : (
              <Text style={styles.nextButtonText}>Next</Text>
            )}
          </TouchableOpacity>

          {(step === 2 || step === 3) && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}

          <View style={styles.progressContainer}>
            {[1, 2, 3].map((dotStep) => (
              <View
                key={dotStep}
                style={[
                  styles.progressDot,
                  step >= dotStep && styles.progressDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
