Audio Recorder & 3D Visualization App

This project is a React Native application using Expo and Three.js to provide two main functionalities:
Audio Recording and Playback: Users can record and play back audio recordings, with an option to clear all recordings.
3D Visualization: A dynamic 3D visualization of a torus that changes its geometry and color over time, utilizing simplex-noise for the effect.

Features

Audio Recording
Record Audio: Start recording high-quality audio using the device's microphone.
Playback Audio: Play back any recorded audio files within the app.
Clear Recordings: Delete all recorded audio files from the app's memory.

3D Visualization
Animated Torus: Displays a 3D torus that dynamically morphs and changes color over time.
Noise-driven Animation: The torus geometry is animated using 4D simplex noise, giving it a fluid and organic appearance.

Technologies Used
React Native: Framework for building the mobile app.
Expo AV: Provides audio recording and playback functionalities.
Three.js (via react-three-fiber): Renders the 3D scene, including lights and a dynamically animated torus.
Simplex Noise: Generates 4D noise for the torus animation.

Dependencies
expo-av: Provides audio recording and playback functionality.
react-three-fiber: A React renderer for Three.js.
simplex-noise: Generates 4D noise for procedural animation.
three: A JavaScript library for creating 3D graphics.
