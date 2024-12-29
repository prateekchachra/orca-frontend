export type Coordinate = {
  latitude: number;
  longitude: number;
};
export type VesselCoordinate = Coordinate & {
  mmsi: string; // ID of the ship
  heading: number; // Vessel heading
  cog: number; // Course over ground
  sog: number; // Speed over ground
};
