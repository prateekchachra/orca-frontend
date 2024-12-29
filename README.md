# Orca Challenge - Vessel Tracking Application - Frontend

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). This is a real-time vessel tracking application that displays ship positions, course, speed, and heading on an interactive map. The application uses MapLibreGL for rendering maps and WebSockets for receiving real-time vessel data.



https://github.com/user-attachments/assets/2e984ec3-c9b5-423a-b8fe-719863e222c2



## Features
- Real-Time Vessel Data: Displays vessels' position, speed, course, and heading as they move.
- Interactive Map: Users can interact with the map to zoom, pan, and view vessel data.
- WebSocket Integration: Fetches real-time vessel data using WebSocket.
- Dynamic Vessel Markers: Vessels are displayed on the map with custom icons, and their headings are represented by arrows.
- Zoom and Pan: Supports zooming and panning to focus on different regions.

## Tech Stack
- Frontend: React Native with MapLibreGL for interactive maps
- Backend: Node.js with WebSocket server and PostgreSQL database
- Database: PostgreSQL for storing vessel data and locations
- WebSocket: Real-time communication for sending and receiving vessel data

## Get started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- React Native development environment with Expo

### Installation

For installing the backend please follow the instructions given in the  [Orca backend repository](https://github.com/prateekchachra/orca-backend/README.md)
1. Clone the repository:

   ```bash
   git clone https://github.com/prateekchachra/orca-frontend.git
   cd orca-frontend
   ```
2. Install dependencies
   
   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Usage

1. The app will connect to the backend WebSocket server and start receiving real-time vessel data.
2. Vessels will be displayed on the map with their MMSI (ID of the ship), current position (Latitude and Longitude), course over ground (COG), speed over ground (SOG), and heading.
3. You can zoom in and out of the map and move the map around to focus on specific regions.
4. Clicking on a vessel will display additional information, such as its current speed, course, and heading.

## Acknowledgments

- MapLibreGL: For providing the open-source mapping library.
- AIS Stream: For providing real-time vessel data.
