import React from 'react';
import { SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <WebView
        source={{ uri: 'http://192.168.0.105:3000' }}
        style={{ flex: 1 }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        scalesPageToFit={true}           // <-- ADDED THIS
        setBuiltInZoomControls={false}   // <-- ADDED THIS
        onPermissionRequest={(request) => {
          request.grant(request.resources);
        }}
      />
    </SafeAreaView>
  );
}