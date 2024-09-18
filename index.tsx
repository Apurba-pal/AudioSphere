import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Audio } from 'expo-av';
import { Canvas, useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import { createNoise4D } from 'simplex-noise';

// Audio Recording Component
function AudioRecorder({ setPlaybackUri }: { setPlaybackUri: (uri: string) => void }) {
  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [recordings, setRecordings] = useState<Array<{ sound: Audio.Sound, duration: string, file: string }>>([]);

  async function startRecording() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
        setRecording(recording);
      } else {
        console.error('Permission to access microphone was denied.');
      }
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;

    setRecording(undefined);

    try {
      await recording.stopAndUnloadAsync();
      const { sound, status } = await recording.createNewLoadedSoundAsync();
      const uri = recording.getURI() || '';
      let allRecordings = [...recordings];
      allRecordings.push({
        sound: sound,
        duration: getDurationFormatted(status.durationMillis),
        file: uri
      });

      setRecordings(allRecordings);
      setPlaybackUri(uri);
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  }

  function getDurationFormatted(milliseconds: number) {
    const minutes = Math.floor(milliseconds / 1000 / 60);
    const seconds = Math.round((milliseconds / 1000) % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function getRecordingLines() {
    return recordings.map((recordingLine, index) => (
      <View key={index} style={styles.row}>
        <Text style={styles.fill}>
          Recording #{index + 1} | {recordingLine.duration}
        </Text>
        <Button onPress={() => recordingLine.sound.replayAsync()} title="Play" />
      </View>
    ));
  }

  function clearRecordings() {
    setRecordings([]);
  }

  return (
    <View>
      <Button title={recording ? 'Stop Recording' : 'Start Recording'} onPress={recording ? stopRecording : startRecording} />
      {getRecordingLines()}
      {recordings.length > 0 && <Button title="Clear all Recordings" onPress={clearRecordings} />}
    </View>
  );
}

// Basic Torus Visualization Component
function BasicTorus() {
  const torusGeometryRef = useRef<THREE.BufferGeometry[]>([]);
  const materialRef = useRef<THREE.MeshStandardMaterial[]>([]);
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const noise4D = createNoise4D();
  let time = 0;

  if (torusGeometryRef.current.length === 0) {
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.TorusGeometry(8, 2, 40, 150);
      const colors = new Float32Array(geometry.attributes.position.count * 3);
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      torusGeometryRef.current.push(geometry);
      materialRef.current.push(
        new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 2,
          metalness: 0.5,
        })
      );
    }
  }

  useFrame(() => {
    const maxChange = 0.25;
    torusGeometryRef.current.forEach((geometry, index) => {
      const positions = geometry.attributes.position.array;
      const colors = geometry.attributes.color.array;
      const vertex = new THREE.Vector3();
      for (let i = 0; i < positions.length; i += 3) {
        vertex.set(positions[i], positions[i + 1], positions[i + 2]);
        const noiseValue = noise4D(vertex.x, vertex.y, vertex.z, time + index);
        const displacement = maxChange * noiseValue;
        vertex.normalize().multiplyScalar(1 + displacement);
        positions[i] = vertex.x;
        positions[i + 1] = vertex.y;
        positions[i + 2] = vertex.z;

        const baseColor = new THREE.Color('teal');
        const displacedColor = new THREE.Color('aqua');
        const color = baseColor.lerp(displacedColor, Math.abs(displacement) / maxChange);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    });

    time += 0.015;
  });

  return (
    <>
      {torusGeometryRef.current.map((geometry, i) => (
        <mesh
          key={i}
          ref={(el) => (meshRefs.current[i] = el!)}
          geometry={geometry}
          material={materialRef.current[i]}
        />
      ))}
    </>
  );
}

// Main App Component
export default function App() {
  const [playbackUri, setPlaybackUri] = useState<string>('');

  return (
    <View style={styles.container}>
      <AudioRecorder setPlaybackUri={setPlaybackUri} />
      <Canvas style={styles.canvas}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <pointLight position={[12, 0, -2]} color="#2f0000" />
        <pointLight position={[-12, 0, -2]} color="#00002f" />
        <spotLight position={[0, 0, 0]} intensity={1} />
        <BasicTorus />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvas: {
    width: '100%',
    height: '100%',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 40,
  },
  fill: {
    flex: 1,
    margin: 15,
  },
});
