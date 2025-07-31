import * as THREE from 'three';
import fragmentShader from './shaders/iframe-fragment.glsl';

// extract "variation" parameter from the url (like main.js does)
const urlParams = new URLSearchParams(window.location.search);
const variation = urlParams.get('var') || "3"; // default to 3 for iframe
const colorHex = urlParams.get('color') || "FFFFFF"; // default to white
console.log('Iframe variation set to:', variation, 'type:', typeof variation);
console.log('Iframe color set to:', colorHex);

// Function to convert hex to RGB
const hexToRgb = (hex) => {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB (0-1 range)
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;
  
  return { r, g, b };
};

// Scene setup
const scene = new THREE.Scene();
const vMouse = new THREE.Vector2();
const vMouseDamp = new THREE.Vector2();
const vResolution = new THREE.Vector2();

// Viewport setup (updated on resize)
let w, h = 1;

// Orthographic camera setup
const aspect = w / h;
const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 1000);

// Renderer with transparency support
const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    premultipliedAlpha: false,
    antialias: true
});
renderer.setClearColor(0x000000, 0); // Transparent background
document.body.appendChild(renderer.domElement);

const onPointerMove = (e) => { 
    vMouse.set(e.clientX, e.clientY);
}
document.addEventListener('mousemove', onPointerMove);
document.addEventListener('pointermove', onPointerMove);
document.body.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

// Plane geometry covering the full viewport
const geo = new THREE.PlaneGeometry(1, 1);

// Shader material creation with transparency
const mat = new THREE.ShaderMaterial({
  vertexShader: /* glsl */`
    varying vec2 v_texcoord;
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        v_texcoord = uv;
    }`,
  fragmentShader,
  uniforms: {
    u_mouse: { value: vMouseDamp },
    u_resolution: { value: vResolution },
    u_pixelRatio: { value: 2 },
    u_color: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
    u_bgColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) }
  },
  defines: {
    VAR: variation
  },
  transparent: true,
  side: THREE.DoubleSide
});

console.log('Material defines:', mat.defines);

// Apply initial color from URL
const initialColor = hexToRgb(colorHex);
mat.uniforms.u_color.value.set(initialColor.r, initialColor.g, initialColor.b);

// Mesh creation
const quad = new THREE.Mesh(geo, mat);
scene.add(quad);

// Camera position and orientation
camera.position.z = 1;

// Animation loop
let time, lastTime = 0;
const update = () => {
  // calculate delta time
  time = performance.now() * 0.001;
  const dt = time - lastTime;
  lastTime = time;

  // ease mouse motion with damping
  for (const k in vMouse) {
    if (k == 'x' || k == 'y') vMouseDamp[k] = THREE.MathUtils.damp(vMouseDamp[k], vMouse[k], 8, dt);
  }

  // render scene
  requestAnimationFrame(update);
  renderer.render(scene, camera);
};
update();

const resize = () => {
  w = window.innerWidth;
  h = window.innerHeight;

  const dpr = Math.min(window.devicePixelRatio, 2);

  renderer.setSize(w, h);
  renderer.setPixelRatio(dpr);

  camera.left = -w / 2;
  camera.right = w / 2;
  camera.top = h / 2;
  camera.bottom = -h / 2;
  camera.updateProjectionMatrix();

  quad.scale.set(w, h, 1);
  vResolution.set(w, h).multiplyScalar(dpr);
  mat.uniforms.u_pixelRatio.value = dpr;
};
resize();

window.addEventListener('resize', resize);

// Expose functions to control from parent window if needed
window.iframeControls = {
  setBackgroundColor: (color) => {
    renderer.setClearColor(color, 1);
  },
  setTransparent: () => {
    renderer.setClearColor(0x000000, 0);
  },
  setColor: (r, g, b) => {
    mat.uniforms.u_color.value.set(r, g, b);
  },
  setColorHex: (hex) => {
    const color = hexToRgb(hex);
    mat.uniforms.u_color.value.set(color.r, color.g, color.b);
  },
  setBackgroundHex: (hex) => {
    const color = hexToRgb(hex);
    mat.uniforms.u_bgColor.value.set(color.r, color.g, color.b);
  }
}; 