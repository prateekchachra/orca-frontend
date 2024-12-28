import { VesselCoordinate } from "@/app";
import { StyleSheet, Text, View } from "react-native";

type VesselCoordinateDisplayProps = {
    currentShipCoordinate: VesselCoordinate;
}

export const VesselCoordinateDisplay = ({currentShipCoordinate}: VesselCoordinateDisplayProps) => (
     <View style={styles.coordinates}>
        <Text style={styles.coordinatesText}>
            Lat: {currentShipCoordinate.latitude.toFixed(4)} | Lon: {currentShipCoordinate.longitude.toFixed(4)} | Heading: {currentShipCoordinate.heading}
        </Text>
        <Text style={styles.coordinatesText}>
            Speed: {currentShipCoordinate.sog} | COG: {currentShipCoordinate.cog}
        </Text>
        </View>
);

const styles = StyleSheet.create({

  coordinates: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#fff',
  },
})