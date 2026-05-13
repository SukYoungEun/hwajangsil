import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Toilet } from '../types';

interface Props {
  lat: number;
  lng: number;
  toilets?: Toilet[];
  onMarkerPress?: (toilet: Toilet) => void;
  style?: object;
  zoom?: number;
}

const KAKAO_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_KEY ?? '';

const TYPE_COLOR: Record<string, string> = {
  open: '#08A7BF',
  cafe: '#B96530',
  station: '#1A6AAF',
};

function buildHtml(lat: number, lng: number, toilets: Toilet[], zoom: number): string {
  const markers = toilets.map(t => ({
    id: t.id,
    lat: t.lat,
    lng: t.lng,
    name: t.name,
    type: t.type,
    distance_m: t.distance_m,
    color: TYPE_COLOR[t.type] ?? '#08A7BF',
  }));

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #map { width: 100%; height: 100%; }
</style>
</head>
<body>
<div id="map"></div>
<script type="text/javascript"
  src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}">
</script>
<script>
var map = new kakao.maps.Map(document.getElementById('map'), {
  center: new kakao.maps.LatLng(${lat}, ${lng}),
  level: ${zoom}
});

// 현재 위치 마커
var myMarker = new kakao.maps.CustomOverlay({
  position: new kakao.maps.LatLng(${lat}, ${lng}),
  content: '<div style="width:14px;height:14px;border-radius:50%;background:#08A7BF;border:3px solid #fff;box-shadow:0 0 0 3px rgba(8,167,191,0.35)"></div>',
  zIndex: 10
});
myMarker.setMap(map);

// 화장실 마커
var markers = ${JSON.stringify(markers)};
markers.forEach(function(t) {
  var glyph = t.type === 'open' ? '화' : t.type === 'cafe' ? '카' : '역';
  var content = '<div onclick="tap(\'' + t.id + '\')" style="'
    + 'display:flex;align-items:center;justify-content:center;'
    + 'width:32px;height:32px;border-radius:10px;'
    + 'background:' + t.color + ';'
    + 'box-shadow:0 2px 8px rgba(0,0,0,0.25);'
    + 'font-size:13px;font-weight:800;color:#fff;cursor:pointer;'
    + '">' + glyph + '</div>';
  new kakao.maps.CustomOverlay({
    position: new kakao.maps.LatLng(t.lat, t.lng),
    content: content,
    zIndex: 5
  }).setMap(map);
});

function tap(id) {
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'marker', id: id }));
}
</script>
</body>
</html>`;
}

export default function KakaoMap({ lat, lng, toilets = [], onMarkerPress, style, zoom = 4 }: Props) {
  const webViewRef = useRef<WebView>(null);

  const handleMessage = (e: WebViewMessageEvent) => {
    if (!onMarkerPress) return;
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'marker') {
        const toilet = toilets.find(t => t.id === data.id);
        if (toilet) onMarkerPress(toilet);
      }
    } catch {}
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: buildHtml(lat, lng, toilets, zoom) }}
        originWhitelist={['*']}
        javaScriptEnabled
        onMessage={handleMessage}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', borderRadius: 16 },
  webview: { flex: 1, backgroundColor: 'transparent' },
});
