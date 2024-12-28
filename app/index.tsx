import {StyleSheet, SafeAreaView, View, TouchableOpacity, Text, Image } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { feature, featureCollection } from '@turf/helpers';
import { OnPressEvent } from '@maplibre/maplibre-react-native/lib/typescript/commonjs/src/types/OnPressEvent';
import { useMemo, useRef, useState } from 'react';
import { RegionPayload } from '@maplibre/maplibre-react-native/lib/typescript/commonjs/src/components/MapView';
import { Legend } from '@/components/Legend';
import { VesselCoordinateDisplay } from '@/components/VesselCoordinateDisplay';

MapLibreGL.setAccessToken(null);


export type Coordinate = {
  latitude: number;
  longitude: number;
}
export type VesselCoordinate = Coordinate & {
  heading: number; // Vessel heading
  cog: number; // Course over ground
  sog: number; // Speed over ground
}

const iconStyles = {
  shipIcon: {
    iconImage: require('../assets/images/ship.png'),
    iconAllowOverlap: true,
    iconSize: 0.8,
    iconOffset: [-20, 25]
  },
  arrowHeadingIcon: {
    iconImage: require('../assets/images/arrow-moving.png'),
    iconRotate: ['get', 'heading'],
    iconAllowOverlap: true,
    iconSize: 0.12,
  },
  arrowCogIcon: {
    iconImage: require('../assets/images/arrow-stop.png'),
    iconRotate: ['get', 'cog'],
    iconAllowOverlap: true,
    iconSize: 0.25,
    iconOffset: [-20, 25]
  },
};

const ws = new WebSocket('ws://localhost:5020');
ws.onopen = () => {
  console.log('WebSocket connection established');
};

ws.onerror = (error) => {
  console.error('WebSocket Error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};



export default function HomeScreen() {

  const [zoomLevel, setZoomLevel] = useState(10); 
  const [centerCoordinate, setCenterCoordinate] = useState([10.682710117065172, 59.87794647287211]);
  const [currentShipCoordinate, setCurrentShipCoordinate] = useState<VesselCoordinate | null>(null);
  const [shipCoordinates, setShipCoordinates] = useState<VesselCoordinate[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapLibreGL.MapViewRef | null>(null);

  const featureCollectionShape = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: shipCoordinates.map(coord => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [coord.longitude, coord.latitude],
      },
      properties: {
        heading: coord.heading,
        speed: coord.sog,
        cog: coord.cog,
      },
    })),
  }), [shipCoordinates]);

  ws.onmessage = (event) => {
    const vessels = JSON.parse(event.data);
    setShipCoordinates(vessels.map(({ mmsi, lon, lat, cog, sog, heading }: any) => {
        return {
          latitude: lat,
          longitude: lon,
          cog, 
          sog,
          heading
        }
    }))
  };
  const handleRegionChange = async (region: GeoJSON.Feature<GeoJSON.Point, RegionPayload>) => {
      const [longitude, latitude] = region.geometry.coordinates;
      const bounds = await mapRef.current?.getVisibleBounds();
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
       timeoutRef.current = setTimeout(() =>  {
        setCenterCoordinate([longitude, latitude]);
        ws.send(JSON.stringify({
            bounds: {
                minLatitude: bounds?.[0]?.[0],
                minLongitude: bounds?.[0]?.[1],
                maxLatitude: bounds?.[1]?.[0],
                maxLongitude: bounds?.[1]?.[1],
            },
            zoom: zoomLevel,
        }));
      }, 50);
  };

  const increaseZoom = () => setZoomLevel((prev) => Math.min(prev + 1, 20));
  const decreaseZoom = () => setZoomLevel((prev) => Math.max(prev - 1, 0));

  const onSourceLayerPress = ({ features, coordinates }: OnPressEvent) => {
    setCurrentShipCoordinate({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      sog: features[0].properties?.speed,
      cog: features[0].properties?.cog,
      heading: features[0].properties?.heading,
    });
  }

   const onPress = async (e: GeoJSON.Feature) => {
    const aFeature = feature(e.geometry);
    aFeature.id = `${Date.now()}`;
  
  }
  return (
      <SafeAreaView style={styles.container}>
        <MapLibreGL.MapView
          style={styles.map}
          onPress={onPress}
          ref={mapRef}
          logoEnabled={false}
          regionDidChangeDebounceTime={300}
          styleURL="https://geoserveis.icgc.cat/contextmaps/icgc.json"
          onRegionDidChange={handleRegionChange}
          
        >
          <MapLibreGL.Camera
            zoomLevel={zoomLevel}
            animationMode="easeTo"
            animationDuration={200}
            centerCoordinate={centerCoordinate}
          />
          <MapLibreGL.ShapeSource
            id="symbolLocationSource"
            hitbox={{ width: 15, height: 15  }}
            onPress={onSourceLayerPress}
            shape={featureCollectionShape}
          >
              <MapLibreGL.SymbolLayer
              id="arrowCogIconLayer"
              minZoomLevel={12}
              style={iconStyles.arrowCogIcon}
            />
            <MapLibreGL.SymbolLayer
              id="shipIconLayer"
              minZoomLevel={12}
              style={iconStyles.shipIcon}
            />
          
             <MapLibreGL.SymbolLayer
              id="arrowHeadingIconLayer"
              minZoomLevel={12}
              style={iconStyles.arrowHeadingIcon}
            />
           
          </MapLibreGL.ShapeSource>
        </MapLibreGL.MapView>
        <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={increaseZoom}>
          <Text style={styles.zoomText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={decreaseZoom}>
          <Text style={styles.zoomText}>-</Text>
        </TouchableOpacity>
      </View>
      <Legend />
      {currentShipCoordinate && <VesselCoordinateDisplay currentShipCoordinate={currentShipCoordinate} />}
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  map: {
    flex: 1,
    alignSelf: 'stretch',
  },
  zoomControls: {
    position: 'absolute',
    bottom: 50,
    right: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  zoomButton: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
    elevation: 5, 
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  zoomText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
