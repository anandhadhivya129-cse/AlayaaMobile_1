import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

function buildHtml({ latitude, longitude, zoom, hasMarker, interactive }) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; background: #eee; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      var interactive = ${interactive ? 'true' : 'false'};

      var map = L.map('map', {
        zoomControl: interactive,
        dragging: interactive,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: interactive,
      }).setView([${latitude}, ${longitude}], ${zoom});

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      var marker = null;

      function notifyRN(lat, lng) {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
        }
      }

      // Exposed so the RN side can move the pin programmatically (e.g. the
      // "use current location" button) via webviewRef.injectJavaScript.
      function setMarker(lat, lng, recenter) {
        if (!marker) {
          marker = L.marker([lat, lng], { draggable: interactive }).addTo(map);
          if (interactive) {
            marker.on('dragend', function () {
              var pos = marker.getLatLng();
              notifyRN(pos.lat, pos.lng);
            });
          }
        } else {
          marker.setLatLng([lat, lng]);
        }
        if (recenter) { map.setView([lat, lng], map.getZoom()); }
      }

      ${hasMarker ? `setMarker(${latitude}, ${longitude}, false);` : ''}

      ${interactive ? `
      map.on('click', function (e) {
        setMarker(e.latlng.lat, e.latlng.lng, false);
        notifyRN(e.latlng.lat, e.latlng.lng);
      });
      ` : ''}
    </script>
  </body>
</html>`;
}

/**
 * Leaflet + OpenStreetMap map rendered inside a WebView — no Google Maps API
 * key, Cloud project, or billing account required.
 *
 * Two modes:
 * - Read-only (interactive=false): fixed marker, no gestures. Used on the
 *   property detail screen.
 * - Interactive (interactive=true): tap or drag to move the marker; fires
 *   onLocationChange({ latitude, longitude }). Used by LocationPicker.
 *
 * To move the marker programmatically (e.g. "use current location"), call
 * `ref.current.setMarker(lat, lng)`.
 */
const LeafletMap = forwardRef(function LeafletMap(
  { latitude, longitude, zoom = 15, hasMarker = true, interactive = false, onLocationChange, style },
  ref
) {
  const webviewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setMarker: (lat, lng) => {
      webviewRef.current?.injectJavaScript(`setMarker(${lat}, ${lng}, true); true;`);
    },
  }));

  // Built once on mount (not on every lat/lng change) so panning/zooming the
  // user has already done isn't reset by a parent re-render. Interactive
  // updates happen inside the page itself or via the ref above.
  const html = useMemo(
    () => buildHtml({ latitude, longitude, zoom, hasMarker, interactive }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interactive]
  );

  return (
    <View style={[{ flex: 1 }, style]}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(event) => {
          if (!onLocationChange) return;
          try {
            const data = JSON.parse(event.nativeEvent.data);
            onLocationChange(data);
          } catch (err) {
            // ignore malformed messages
          }
        }}
      />
    </View>
  );
});

export default LeafletMap;