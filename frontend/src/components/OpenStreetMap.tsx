/**
 * OPENSTREETMAP COMPONENT
 * Free map using OpenStreetMap tiles via Leaflet in a WebView
 * No API key or billing required!
 */

import React, { useRef, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  color?: string;
}

interface OpenStreetMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Marker[];
  showUserLocation?: boolean;
  onMarkerPress?: (markerId: string) => void;
  onMapPress?: (lat: number, lng: number) => void;
  style?: object;
}

export default function OpenStreetMap({
  latitude,
  longitude,
  zoom = 15,
  markers = [],
  showUserLocation = true,
  onMarkerPress,
  onMapPress,
  style,
}: OpenStreetMapProps) {
  const webViewRef = useRef<WebView>(null);

  // Generate markers JavaScript
  const markersJS = markers
    .map(
      (m) => `
      L.marker([${m.latitude}, ${m.longitude}], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: ${m.color || "#4CAF50"}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      })
      .addTo(map)
      .bindPopup("${m.title || "Pollution Spot"}")
      .on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'markerPress', id: '${m.id}'}));
      });
    `
    )
    .join("\n");

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
    .custom-marker { background: transparent !important; border: none !important; }
    .user-location {
      width: 20px;
      height: 20px;
      background-color: #2196F3;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(33, 150, 243, 0.5);
    }
    .leaflet-control-attribution { font-size: 8px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      zoomControl: true,
      attributionControl: true
    }).setView([${latitude}, ${longitude}], ${zoom});
    
    // OpenStreetMap tiles (FREE!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19
    }).addTo(map);
    
    // User location marker
    ${showUserLocation ? `
    L.marker([${latitude}, ${longitude}], {
      icon: L.divIcon({
        className: 'user-location-marker',
        html: '<div class="user-location"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    }).addTo(map).bindPopup("You are here");
    ` : ""}
    
    // Pollution markers
    ${markersJS}
    
    // Map click handler
    map.on('click', function(e) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'mapPress',
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }));
    });
    
    // Function to update map center (called from React Native)
    function setCenter(lat, lng, z) {
      map.setView([lat, lng], z || map.getZoom());
    }
    
    // Function to add marker (called from React Native)
    function addMarker(id, lat, lng, title, color) {
      L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color: ' + (color || '#4CAF50') + '; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      })
      .addTo(map)
      .bindPopup(title || 'Marker')
      .on('click', function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({type: 'markerPress', id: id}));
      });
    }
  </script>
</body>
</html>
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "markerPress" && onMarkerPress) {
        onMarkerPress(data.id);
      } else if (data.type === "mapPress" && onMapPress) {
        onMapPress(data.lat, data.lng);
      }
    } catch (e) {
      console.error("Error parsing WebView message:", e);
    }
  };

  // Method to update map center from parent
  const setCenter = (lat: number, lng: number, z?: number) => {
    webViewRef.current?.injectJavaScript(`setCenter(${lat}, ${lng}, ${z || "null"}); true;`);
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
});
