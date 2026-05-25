"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import { usePerf } from "../contexts/PerformanceContext";
import { subscribeRedMode, getRedMode } from "../lib/redMode";

if (typeof window !== "undefined") {
  const _warn = console.warn.bind(console);
  console.warn = (...args: unknown[]) => {
    if (typeof args[0] === "string" && args[0].startsWith("THREE.Clock")) return;
    _warn(...args);
  };
}

const vert = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const frag = `
precision highp float;

uniform float uTime;
uniform vec2  uRes;
uniform vec3  uColor;
uniform vec3  uAmbient;

const float PI = 3.14159265358979323;

vec3 rX(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(p.x, c*p.y - s*p.z, s*p.y + c*p.z);
}
vec3 rY(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z);
}
vec3 rZ(vec3 p, float a) {
  float c = cos(a), s = sin(a);
  return vec3(c*p.x - s*p.y, s*p.x + c*p.y, p.z);
}

vec3 orbs(vec2 uv, float t) {
  vec3 col = vec3(0.0);
  for (float k = 0.0; k < 8.0; k++) {
    float phase = k / 8.0 * 2.0 * PI;
    vec3 pos = vec3(cos(t*0.2 + phase)*0.3, sin(t*0.2 + phase)*0.3, 0.0);
    pos = rY(pos, t * 0.5);
    pos = rZ(pos, t * 0.3);
    pos = rX(pos, t * 0.4);
    float str = 1.0 - smoothstep(0.0, 0.07, length(uv - pos.xy));
    col += str * uColor * (0.7 + 0.3 * cos(t - k * 0.5));
  }
  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uRes) - 0.5;
  uv.x *= uRes.x / uRes.y;

  float t = uTime;

  vec3 col  = pow(orbs(uv, t),          vec3(2.5, 1.8, 1.0));
  col      += pow(orbs(uv, t - 0.125),  vec3(2.5, 1.8, 1.0)) * 0.5;
  col      += pow(orbs(uv, t - 0.25),   vec3(2.5, 1.8, 1.0)) * 0.5;
  col      += pow(orbs(uv, t - 0.5),    vec3(2.5, 1.8, 1.0)) * 0.5;
  col      += pow(orbs(uv, t - 0.75),   vec3(2.5, 1.8, 1.0)) * 0.5;

  float d = length(uv);
  col += uAmbient * clamp(1.0 - d * 3.5, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

const BLUE_COLOR   = new THREE.Vector3(0.0, 0.2, 1.0);
const BLUE_AMBIENT = new THREE.Vector3(0.03, 0.05, 0.18);
const RED_COLOR    = new THREE.Vector3(1.0, 0.05, 0.0);
const RED_AMBIENT  = new THREE.Vector3(0.18, 0.03, 0.03);

function ShaderPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const red = useSyncExternalStore(subscribeRedMode, getRedMode, () => false);

  const uniforms = useRef({
    uTime:    { value: 0 },
    uRes:     { value: new THREE.Vector2(1, 1) },
    uColor:   { value: BLUE_COLOR.clone() },
    uAmbient: { value: BLUE_AMBIENT.clone() },
  });

  useEffect(() => {
    if (!matRef.current) return;
    matRef.current.uniforms.uColor.value.copy(red ? RED_COLOR : BLUE_COLOR);
    matRef.current.uniforms.uAmbient.value.copy(red ? RED_AMBIENT : BLUE_AMBIENT);
  }, [red]);

  useFrame(({ clock, gl }) => {
    matRef.current.uniforms.uTime.value = clock.getElapsedTime();
    gl.getDrawingBufferSize(matRef.current.uniforms.uRes.value);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms.current}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export function PS2Background() {
  const { lowEnd } = usePerf();
  const red = useSyncExternalStore(subscribeRedMode, getRedMode, () => false);

  if (lowEnd) {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{ background: red
          ? "radial-gradient(ellipse at 50% 30%, #1f0d0d 0%, #000000 70%)"
          : "radial-gradient(ellipse at 50% 30%, #0d0d1f 0%, #000000 70%)"
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: false, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false }}
        dpr={[1, 1.5]}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}
