import { Image, StyleSheet, Text, View } from "react-native";

export const Legend = () => (
  <View style={styles.legend}>
    <Text style={styles.legendHeading}>Legend</Text>
    <View style={styles.legendRow}>
      <Image
        source={require("../assets/images/ship.png")}
        style={styles.arrowIcon}
      />
      <Text style={styles.legendText}>Ship</Text>
    </View>
    <View style={styles.legendRow}>
      <Image
        source={require("../assets/images/arrow-moving.png")}
        style={styles.arrowIcon}
      />
      <Text style={styles.legendText}>Heading</Text>
    </View>
    <View style={styles.legendRow}>
      <Image
        source={require("../assets/images/arrow-stop.png")}
        style={styles.arrowIcon}
      />
      <Text style={styles.legendText}>COG</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  legend: {
    position: "absolute",
    top: 80,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  legendHeading: {
    fontSize: 18,
    marginBottom: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
    color: "#000",
  },
});
