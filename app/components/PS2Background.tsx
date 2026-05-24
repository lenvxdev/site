"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { usePerf } from "../contexts/PerformanceContext";

const vert = /* glsl */`
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const frag = /* glsl */`
precision highp float;

uniform float uTime;
uniform vec2  uRes;

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
    col += str * vec3(0.0, 0.2, 1.0) * (0.7 + 0.3 * cos(t - k * 0.5));
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
  col += vec3(0.03, 0.05, 0.18) * clamp(1.0 - d * 3.5, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

function ShaderPlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const uniforms = useRef({
    uTime: { value: 0 },
    uRes:  { value: new THREE.Vector2(1, 1) },
  });

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
        uniforms={uniforms.current} // eslint-disable-line react-hooks/refs
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
}

export function PS2Background() {
  const { lowEnd } = usePerf();

  if (lowEnd) {
    return (
      <div
        className="fixed inset-0 -z-10"
        style={{ background: "radial-gradient(ellipse at 50% 30%, #0d0d1f 0%, #000000 70%)" }}
      />
    );
  }

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1] }}
        gl={{ antialias: false }}
        dpr={[1, 1.5]}
      >
        <ShaderPlane />
      </Canvas>
    </div>
  );
}
