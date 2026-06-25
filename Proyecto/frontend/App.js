import React from 'react';
import { StyleSheet, SafeAreaView, View, Text, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

export default function App() {
  // Get host URI from expo config to connect to the computer's local IP address
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.developer?.projectUrl;
  let ip = 'localhost';
  if (hostUri) {
    // hostUri looks like: 192.168.1.X:8081 or exp://192.168.1.X:8081
    const match = hostUri.match(/([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)/);
    if (match) {
      ip = match[1];
    }
  }

  // Vite dev server runs on port 5173
  const webAppUrl = `http://${ip}:5173`;

  console.log(`[AguaSabia Mobile] Cargando WebView en: ${webAppUrl}`);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>AguaSabia Móvil (Expo Go)</Text>
        <Text style={styles.subtext}>Conectado a: {webAppUrl}</Text>
      </View>
      <WebView 
        source={{ uri: webAppUrl }} 
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#d4af37" />
            <Text style={styles.loadingText}>Cargando AguaSabia...</Text>
          </View>
        )}
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1e12', // Verde Bosque
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#0c1e12',
    borderBottomWidth: 1,
    borderBottomColor: '#1b3a24',
    alignItems: 'center',
  },
  headerText: {
    color: '#d4af37', // Oro Champaña
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtext: {
    color: '#a0aec0',
    fontSize: 11,
    marginTop: 2,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0c1e12',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 14,
  },
});
