import React from 'react';
import { StyleSheet, SafeAreaView, View, Text, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

  // Se utilizará la URL de producción o la que venga en la variable de entorno
export default function App() {
  const webAppUrl = process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://aguasabia.cl';

  console.log(`[AguaSabia Mobile] Cargando WebView en: ${webAppUrl}`);

  const handleMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'download_excel') {
        const fileUri = `${FileSystem.documentDirectory}${data.filename}`;
        await FileSystem.writeAsStringAsync(fileUri, data.data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Exportar Reporte AguaSabia'
          });
        } else {
          Alert.alert("Compartir no disponible", "No se puede guardar el archivo en este dispositivo.");
        }
      }
    } catch (error) {
      console.error("Error al procesar mensaje del webview:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Reducimos el header al mínimo o lo eliminamos para dar espacio al mapa */}
      <WebView 
        source={{ uri: webAppUrl }} 
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onMessage={handleMessage}
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
