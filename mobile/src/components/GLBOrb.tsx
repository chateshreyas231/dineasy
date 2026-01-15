import React, { useRef, Suspense, useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Asset } from 'expo-asset';
import SiriOrb from './SiriOrb';

// Only import Three.js and 3D libraries when actually needed
let THREE: any;
let Canvas: any;
let useFrame: any;
let useGLTF: any;

try {
  THREE = require('three');
  const r3f = require('@react-three/fiber/native');
  Canvas = r3f.Canvas;
  useFrame = r3f.useFrame;
  const drei = require('@react-three/drei/native');
  useGLTF = drei.useGLTF;
} catch (e) {
  console.warn('3D libraries not available, using 2D fallback');
}

interface GLBOrbProps {
  size?: number;
  isListening?: boolean;
  isThinking?: boolean;
}

/**
 * Important: EXGL doesn't implement renderbufferStorageMultisample (MSAA).
 * Even with antialias:false, some WebGL2/MSAA code paths may still call it.
 * This patch turns the multisample call into a normal renderbuffer storage call.
 *
 * Also we disable WebGL2RenderingContext globally to reduce WebGL2 paths.
 */
if (Platform.OS !== 'web') {
  // @ts-ignore
  global.WebGL2RenderingContext = undefined;
}

// Keep require() at module scope so Metro can bundle it
const ORB_GLB = require('../../assets/models/color_orb.glb');

// GLB Model Component (only used if 3D is available)
function OrbModel({
  asset,
  isListening,
  isThinking,
}: {
  asset: any;
  isListening: boolean;
  isThinking: boolean;
}) {
  if (!useGLTF || !THREE || !useFrame) return null;
  
  const { scene } = useGLTF(asset) as any;

  // Clone once (NOT every render)
  const model = useMemo(() => scene.clone(true), [scene]);

  const groupRef = useRef<any>(null);
  const scaleRef = useRef(1);

  // Normalize: center + scale to fit camera nicely
  useEffect(() => {
    if (!THREE || !model) return;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Center it
    model.position.sub(center);

    // Fit scale (avoid giant/tiny model)
    const maxAxis = Math.max(size.x, size.y, size.z);
    if (maxAxis > 0) {
      const fit = 1.8 / maxAxis; // tweak if needed
      model.scale.setScalar(fit);
    }
  }, [model]);

  // Animate rotation and scale
  useFrame((_state: any, delta: number) => {
    if (!groupRef.current) return;

    // Continuous rotation
    groupRef.current.rotation.y += delta * 0.6;

    // Pulse animation based on state
    const targetScale = isListening ? 1.15 : isThinking ? 1.1 : 1;
    scaleRef.current += (targetScale - scaleRef.current) * 0.12;
    groupRef.current.scale.setScalar(scaleRef.current);
  });

  // TypeScript doesn't know about R3F JSX elements, so we use any
  const Group = 'group' as any;
  const Primitive = 'primitive' as any;
  
  return (
    <Group ref={groupRef}>
      <Primitive object={model} />
    </Group>
  );
}

export const GLBOrb: React.FC<GLBOrbProps> = ({
  size = 120,
  isListening = false,
  isThinking = false,
}) => {
  const [ready, setReady] = useState(false);
  const [orbMode, setOrbMode] = useState<'3d' | 'siri' | 'simple'>('3d'); // Track which orb to use

  useEffect(() => {
    // Check if 3D is available
    const has3D = !!Canvas && !!useGLTF;
    
    if (!has3D) {
      // No 3D support, use SiriOrb
      setOrbMode('siri');
      setReady(true);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const asset = Asset.fromModule(ORB_GLB);
        await asset.downloadAsync();
        if (!mounted) return;
        setOrbMode('3d');
        setReady(true);
      } catch (e) {
        console.error('Failed to download GLB asset, trying SiriOrb fallback:', e);
        if (!mounted) return;
        setOrbMode('siri');
        setReady(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <ActivityIndicator size="large" color="#6B9FFF" />
      </View>
    );
  }

  // Fallback chain: 3D GLB -> SiriOrb -> Simple 2D gradient
  if (orbMode === 'siri') {
    return (
      <SiriOrb
        size={size}
        isListening={isListening}
        isThinking={isThinking}
        animationDuration={20}
      />
    );
  }

  if (orbMode === 'simple') {
    return <FallbackOrb size={size} isListening={isListening} isThinking={isThinking} />;
  }

  // orbMode === '3d' - render 3D GLB

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: size, height: size }}
        dpr={1}
        {...({ msaaSamples: 0 } as any)}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        onCreated={({ gl }: any) => {
          // ✅ THIS is the EXGL context
          const ctx: any = gl.getContext();

          // ✅ Patch the real crashing function
          if (ctx?.renderbufferStorageMultisample) {
            ctx.renderbufferStorageMultisample = (
              target: any,
              _samples: number,
              internalformat: any,
              width: number,
              height: number
            ) => ctx.renderbufferStorage(target, internalformat, width, height);
          }

          // ✅ Optional: stop Three from taking WebGL2/MSAA paths
          (gl.capabilities as any).isWebGL2 = false;
        }}
      >
        <Suspense fallback={null}>
          {/* @ts-expect-error - R3F JSX elements */}
          <ambientLight intensity={0.8} />
          {/* @ts-expect-error - R3F JSX elements */}
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          {/* @ts-expect-error - R3F JSX elements */}
          <pointLight position={[-10, -10, -5]} intensity={0.6} />
          <OrbModel asset={ORB_GLB} isListening={isListening} isThinking={isThinking} />
        </Suspense>
      </Canvas>
    </View>
  );
};

// Fallback 2D animated orb (gradient version)
function FallbackOrb({
  size,
  isListening,
  isThinking,
}: {
  size: number;
  isListening: boolean;
  isThinking: boolean;
}) {
  const { LinearGradient } = require('expo-linear-gradient');
  const { Animated } = require('react-native');

  const rotateAnim = React.useRef(new Animated.Value(0)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: isListening ? 1.3 : isThinking ? 1.2 : 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    Animated.timing(scaleAnim, {
      toValue: isListening ? 1.15 : isThinking ? 1.1 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => pulse.stop();
  }, [isListening, isThinking]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ rotate }, { scale: Animated.multiply(pulseAnim, scaleAnim) }],
        }}
      >
        <LinearGradient
          colors={['#6B9FFF', '#B66DFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: '100%', height: '100%', borderRadius: size / 2 }}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
});
// Optional preload (safe, only if 3D is available)
try {
  if (useGLTF?.preload) {
    useGLTF.preload(ORB_GLB);
  }
} catch {}

