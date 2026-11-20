import com.google.gms.googleservices.GoogleServicesPlugin.MissingGoogleServicesStrategy

plugins {
  alias(libs.plugins.android.application)
  alias(libs.plugins.kotlin.compose)
  alias(libs.plugins.google.devtools.ksp)
  alias(libs.plugins.secrets)
  alias(libs.plugins.google.services)
}

val offlineFlavors = listOf("cscPart1")
val cloudFlavors = listOf("full", "cissp", "pmp", "awsSaa")

android {
  namespace = "com.example"
  compileSdk { version = release(36) { minorApiLevel = 1 } }

  defaultConfig {
    applicationId = "com.aistudio.examprep.kmwqxr"
    minSdk = 24
    targetSdk = 36
    versionCode = 1
    versionName = "1.0"

    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    buildConfigField("String", "TARGET_EXAM_ID", "\"all\"")
    buildConfigField("int", "FREE_ASSESSMENT_LIMIT", "50")
  }

  // Commercial App Distribution: Separate standalone apps per certification track,
  // each offering the 50-question free assessment funnel and complete exam upgrade path.
  flavorDimensions += "exam"

  productFlavors {
    create("full") {
      dimension = "exam"
      applicationId = "com.aistudio.examprep.kmwqxr"
      buildConfigField("String", "TARGET_EXAM_ID", "\"all\"")
      buildConfigField("int", "FREE_ASSESSMENT_LIMIT", "50")
    }
    create("cscPart1") {
      dimension = "exam"
      applicationId = "com.certmaster.cscpart1"
      versionCode = 5
      versionName = "1.0.4"
      buildConfigField("String", "TARGET_EXAM_ID", "\"csc-part-1\"")
      buildConfigField("int", "FREE_ASSESSMENT_LIMIT", "50")
    }
    create("cissp") {
      dimension = "exam"
      applicationId = "com.certmaster.cissp"
      buildConfigField("String", "TARGET_EXAM_ID", "\"cissp\"")
      buildConfigField("int", "FREE_ASSESSMENT_LIMIT", "50")
    }
    create("pmp") {
      dimension = "exam"
      applicationId = "com.certmaster.pmp"
      buildConfigField("String", "TARGET_EXAM_ID", "\"pmp\"")
      buildConfigField("int", "FREE_ASSESSMENT_LIMIT", "50")
    }
    create("awsSaa") {
      dimension = "exam"
      applicationId = "com.certmaster.awssaa"
      buildConfigField("String", "TARGET_EXAM_ID", "\"aws-saa\"")
      buildConfigField("int", "FREE_ASSESSMENT_LIMIT", "50")
    }
  }

  sourceSets {
    offlineFlavors.forEach { flavor ->
      getByName(flavor).apply {
        java.directories.add("src/offline/java")
        manifest.srcFile("src/offline/AndroidManifest.xml")
      }
    }
    cloudFlavors.forEach { flavor ->
      val capitalizedFlavor = flavor.replaceFirstChar { it.uppercaseChar() }
      getByName(flavor).java.directories.add("src/cloud/java")
      getByName(flavor).res.directories.add("src/cloud/res")
      getByName("test$capitalizedFlavor").java.directories.add("src/testCloud/java")
    }
  }

  // Do not remove or modify these signingConfigs. They are necessary for building, installing,
  // and updating Android apps in AI Studio.
  signingConfigs {
    create("release") {
      val keystorePath = System.getenv("KEYSTORE_PATH") ?: "${rootDir}/my-upload-key.jks"
      storeFile = file(keystorePath)
      storePassword = System.getenv("STORE_PASSWORD")
      keyAlias = "upload"
      keyPassword = System.getenv("KEY_PASSWORD")
    }
    create("debugConfig") {
      storeFile = file("${rootDir}/debug.keystore")
      storePassword = "android"
      keyAlias = "androiddebugkey"
      keyPassword = "android"
    }
  }

  buildTypes {
    release {
      isCrunchPngs = false
      isMinifyEnabled = false
      proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
      // Do not remove or modify this signingConfig assignment. It is necessary for Android apps in
      // AI Studio.
      signingConfig = signingConfigs.getByName("release")
    }
    debug {
      // Do not remove or modify this signingConfig assignment. It is necessary for Android apps in
      // AI Studio.
      signingConfig = signingConfigs.getByName("debugConfig")
    }
  }
  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
  }
  buildFeatures {
    compose = true
    buildConfig = true
  }
  testOptions {
    unitTests {
      isIncludeAndroidResources = true
      all {
        if (System.getProperty("os.name").lowercase().contains("win")) {
          it.systemProperty("javax.net.ssl.trustStoreType", "WINDOWS-ROOT")
        }
      }
    }
  }
  dependenciesInfo {
    includeInApk = false
    includeInBundle = true
  }
}

// Configure the Secrets Gradle Plugin to use .env and .env.example files
// to match the convention used in Web projects.
secrets {
  propertiesFileName = ".env"
  defaultPropertiesFileName = ".env.example"
  ignoreList.add("FIREBASE_APPCHECK_DEBUG_TOKEN")
}

googleServices { missingGoogleServicesStrategy = MissingGoogleServicesStrategy.WARN }

tasks.configureEach {
  if (name.contains("GoogleServices", ignoreCase = true) &&
    offlineFlavors.any { name.contains(it, ignoreCase = true) }) {
    enabled = false
  }
}

// Some unused dependencies are commented out below instead of being removed.
// This makes it easy to add them back in the future if needed.
dependencies {
  fun DependencyHandlerScope.cloudImplementation(dependencyNotation: Any) {
    cloudFlavors.forEach { flavor ->
      add("${flavor}Implementation", dependencyNotation)
    }
  }

  implementation(platform(libs.androidx.compose.bom))
  cloudImplementation(platform(libs.firebase.bom))
  // implementation(libs.accompanist.permissions)
  implementation(libs.androidx.activity.compose)
  // implementation(libs.androidx.camera.camera2)
  // implementation(libs.androidx.camera.core)
  // implementation(libs.androidx.camera.lifecycle)
  // implementation(libs.androidx.camera.view)
  implementation(libs.androidx.compose.material.icons.core)
  implementation(libs.androidx.compose.material.icons.extended)
  implementation(libs.androidx.compose.material3)
  implementation(libs.androidx.compose.ui)
  implementation(libs.androidx.compose.ui.graphics)
  implementation(libs.androidx.compose.ui.tooling.preview)
  implementation(libs.androidx.core.ktx)
  // implementation(libs.androidx.datastore.preferences)
  implementation(libs.androidx.lifecycle.runtime.compose)
  implementation(libs.androidx.lifecycle.runtime.ktx)
  implementation(libs.androidx.lifecycle.viewmodel.compose)
  // implementation(libs.androidx.navigation.compose)
  implementation(libs.androidx.room.ktx)
  implementation(libs.androidx.room.runtime)
  // implementation(libs.coil.compose)
  cloudImplementation(libs.converter.moshi)
  cloudImplementation(libs.firebase.ai)
  cloudImplementation(libs.firebase.firestore)
  cloudImplementation(libs.firebase.auth)
  cloudImplementation(libs.androidx.credentials)
  cloudImplementation(libs.androidx.credentials.play.services)
  cloudImplementation(libs.googleid)
  cloudImplementation(libs.firebase.appcheck.recaptcha)
  cloudImplementation(libs.firebase.appcheck.debug)
  implementation(libs.kotlinx.coroutines.android)
  implementation(libs.kotlinx.coroutines.core)
  cloudImplementation(libs.logging.interceptor)
  cloudImplementation(libs.moshi.kotlin)
  cloudImplementation(libs.okhttp)
  // implementation(libs.play.services.location)
  cloudImplementation(libs.retrofit)
  testImplementation(libs.androidx.compose.ui.test.junit4)
  testImplementation(libs.androidx.core)
  testImplementation(libs.androidx.junit)
  testImplementation(libs.junit)
  testImplementation(libs.kotlinx.coroutines.test)
  testImplementation(libs.robolectric)
  androidTestImplementation(platform(libs.androidx.compose.bom))
  androidTestImplementation(libs.androidx.compose.ui.test.junit4)
  androidTestImplementation(libs.androidx.espresso.core)
  androidTestImplementation(libs.androidx.junit)
  androidTestImplementation(libs.androidx.runner)
  debugImplementation(libs.androidx.compose.ui.test.manifest)
  debugImplementation(libs.androidx.compose.ui.tooling)
  "ksp"(libs.androidx.room.compiler)
  "ksp"(libs.moshi.kotlin.codegen)
}
