import {
  StyleSheet,
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
} from "react-native";
import { feature } from "@turf/helpers";
import MapLibreGL from "@maplibre/maplibre-react-native";
import { OnPressEvent } from "@maplibre/maplibre-react-native/lib/typescript/commonjs/src/types/OnPressEvent";
import { RegionPayload } from "@maplibre/maplibre-react-native/lib/typescript/commonjs/src/components/MapView";
import { useEffect, useMemo, useRef, useState } from "react";
import { Legend } from "@/components/Legend";
import { VesselCoordinateDisplay } from "@/components/VesselCoordinateDisplay";
import { useWebSocket } from "@/hooks/useWebSocket";
import { VesselCoordinate } from "@/shared/types";

MapLibreGL.setAccessToken(null);

const iconStyles = {
  shipIcon: {
    iconImage: require("../assets/images/ship.png"),
    iconAllowOverlap: true,
    iconSize: 0.8,
    iconOffset: [-20, 25],
  },
  arrowHeadingIcon: {
    iconImage: require("../assets/images/arrow-moving.png"),
    iconRotate: ["get", "heading"],
    iconAllowOverlap: true,
    iconSize: 0.12,
  },
  arrowCogIcon: {
    iconImage: require("../assets/images/arrow-stop.png"),
    iconRotate: ["get", "cog"],
    iconAllowOverlap: true,
    iconSize: 0.25,
    iconOffset: [-20, 25],
  },
};

export default function HomeScreen() {
  const [zoomLevel, setZoomLevel] = useState(10);
  const [centerCoordinate, setCenterCoordinate] = useState([
    10.682710117065172, 59.87794647287211,
  ]);
  const [currentShipCoordinate, setCurrentShipCoordinate] =
    useState<VesselCoordinate | null>(null);
  const [shipCoordinates, setShipCoordinates] = useState<VesselCoordinate[]>(
    [],
  );
  const { vesselCoordinateData, sendMessage } = useWebSocket(
    "ws://localhost:5020",
  );
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mapRef = useRef<MapLibreGL.MapViewRef | null>(null);

  const featureCollectionShape = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: shipCoordinates.map((coord) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [coord.longitude, coord.latitude],
        },
        properties: {
          heading: coord.heading,
          speed: coord.sog,
          cog: coord.cog,
          mmsi: coord.mmsi,
        },
      })),
    }),
    [shipCoordinates],
  );

  useEffect(() => {
    const wsInterval = setInterval(async () => {
      const bounds = await mapRef.current?.getVisibleBounds();
      if(bounds){
        sendMessage(
          JSON.stringify({
            bounds: {
              minLatitude: bounds?.[0]?.[0],
              minLongitude: bounds?.[0]?.[1],
              maxLatitude: bounds?.[1]?.[0],
              maxLongitude: bounds?.[1]?.[1],
            },
            zoom: zoomLevel,
          }),
        );
      }
    }, 2000);
    return () => clearInterval(wsInterval);
  }, [])
  useEffect(() => {
    setShipCoordinates(
      vesselCoordinateData.map(({ mmsi, lon, lat, cog, sog, heading }: any) => {
        return {
          mmsi,
          latitude: lat,
          longitude: lon,
          cog,
          sog,
          heading,
        };
      }),
    );
  }, [vesselCoordinateData]);

  const handleRegionChange = async (
    region: GeoJSON.Feature<GeoJSON.Point, RegionPayload>,
  ) => {
    const [longitude, latitude] = region.geometry.coordinates;
    const bounds = await mapRef.current?.getVisibleBounds();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCenterCoordinate([longitude, latitude]);
      sendMessage(
        JSON.stringify({
          bounds: {
            minLatitude: bounds?.[0]?.[0],
            minLongitude: bounds?.[0]?.[1],
            maxLatitude: bounds?.[1]?.[0],
            maxLongitude: bounds?.[1]?.[1],
          },
          zoom: zoomLevel,
        }),
      );
    }, 50);
  };

  const increaseZoom = () => setZoomLevel((prev) => Math.min(prev + 1, 20));
  const decreaseZoom = () => setZoomLevel((prev) => Math.max(prev - 1, 0));

  const onSourceLayerPress = ({ features, coordinates }: OnPressEvent) => {
    setCurrentShipCoordinate({
      mmsi: features[0].properties?.mmsi,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      sog: features[0].properties?.speed,
      cog: features[0].properties?.cog,
      heading: features[0].properties?.heading,
    });
  };

  const onPress = async (e: GeoJSON.Feature) => {
    const aFeature = feature(e.geometry);
    aFeature.id = `${Date.now()}`;
  };
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
          hitbox={{ width: 15, height: 15 }}
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
      {currentShipCoordinate && zoomLevel >= 12 && (
        <VesselCoordinateDisplay
          currentShipCoordinate={currentShipCoordinate}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  map: {
    flex: 1,
    alignSelf: "stretch",
  },
  zoomControls: {
    position: "absolute",
    bottom: 50,
    right: 20,
    flexDirection: "column",
    alignItems: "center",
  },
  zoomButton: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  zoomText: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
