# =============================================================================
# PROGUARD RULES – What is this file for?
# =============================================================================
# On RELEASE build, Android shrinks and obfuscates code (smaller APK, harder to reverse).
# Some code (React Native, Hermes, Firebase, JNI) is used via reflection or native calls.
# If we don’t “keep” those classes/methods, the app can crash at runtime.
# This file tells ProGuard/R8: “do not remove or rename these” for the app to work.
# =============================================================================

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactProp <methods>; }
-keepclassmembers class * { @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>; }

# Hermes
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# So loader
-keep class com.facebook.soloader.** { *; }

# React Native modules (reflection)
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * {
    @com.facebook.proguard.annotations.DoNotStrip *;
    @com.facebook.proguard.annotations.KeepGettersAndSetters *;
}

# Native methods
-keepclassmembers class * {
    native <methods>;
}

# Kotlin
-keep class kotlin.** { *; }
-keep class kotlin.Metadata { *; }
-dontwarn kotlin.**
-keepclassmembers class **$WhenMappings {
    <fields>;
}
-keepclassmembers class kotlin.Metadata {
    public <methods>;
}

# Firebase / Crashlytics
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# Keep generic signature of Call, Response (R8 full mode strips signatures from default methods)
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response

# If you use OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**

# Stripe – push provisioning classes are optional; R8 fails without these
-dontwarn com.stripe.android.pushProvisioning.**
