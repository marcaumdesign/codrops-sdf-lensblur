import './css/base.css';
import * as THREE from 'three';
import fragmentShader from './shaders/fragment.glsl';

// extract "variation" parameter from the url
const urlParams = new URLSearchParams(window.location.search);
const variation = urlParams.get('var') || 0;

// add selected class to link based on variation parameter
document.querySelector(`[data-var="${variation}"]`).classList.add('selected');

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

const renderer = new THREE.WebGLRenderer({ 
    alpha: true,
    premultipliedAlpha: false
});
renderer.setClearColor(0xffffff, 0); // Fundo transparente para mostrar o CSS
document.body.appendChild(renderer.domElement);

const onPointerMove = (e) => { vMouse.set(e.pageX, e.pageY) }
document.addEventListener('mousemove', onPointerMove);
document.addEventListener('pointermove', onPointerMove);
document.body.addEventListener('touchmove', function (e) { e.preventDefault(); }, { passive: false });

// Plane geometry covering the full viewport
const geo = new THREE.PlaneGeometry(1, 1);  // Scaled to cover full viewport

// Shader material creation
const mat = new THREE.ShaderMaterial({
  vertexShader: /* glsl */`
    varying vec2 v_texcoord;
    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        v_texcoord = uv;
    }`,
  fragmentShader, // most of the action happening in the fragment
  uniforms: {
    u_mouse: { value: vMouseDamp },
    u_resolution: { value: vResolution },
    u_pixelRatio: { value: 2 },
    u_color: { value: new THREE.Vector3(1.0, 0.5, 0.2) }, // Cor do objeto (laranja)
    u_bgColor: { value: new THREE.Vector3(1.0, 1.0, 1.0) }, // Cor de fundo (branco)
    u_useTransparent: { value: false }, // false = fundo sólido, true = fundo transparente
    u_blurIntensity: { value: 1.0 }, // Intensidade do blur (1.0 = normal)
    u_blurType: { value: 0 } // Tipo de transição (0=linear, 1=suave, 2=exponencial)
  },
  defines: {
    VAR: variation
  },
  transparent: true
});

// Aplicar cores iniciais
mat.uniforms.u_color.value.set(1.0, 0.5, 0.2); // Laranja
mat.uniforms.u_bgColor.value.set(1.0, 1.0, 1.0); // Branco


// Mesh creation
const quad = new THREE.Mesh(geo, mat);
scene.add(quad);

// Camera position and orientation
camera.position.z = 1;  // Set appropriately for orthographic

// Animation loop to render
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

window.addEventListener('resize', resize)

// Funções para controlar as cores
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

function updateObjectColor(hex) {
  const color = hexToRgb(hex);
  if (color) {
    mat.uniforms.u_color.value.set(color.r, color.g, color.b);
    console.log('Cor do objeto atualizada:', color, 'hex:', hex);
  }
}

function updateBgColor(hex) {
  const color = hexToRgb(hex);
  if (color) {
    mat.uniforms.u_bgColor.value.set(color.r, color.g, color.b);
    console.log('Cor de fundo atualizada:', color, 'hex:', hex);
  }
}

function updateTransparency(useTransparent) {
  mat.uniforms.u_useTransparent.value = useTransparent;
}

function updateBlurIntensity(intensity) {
  mat.uniforms.u_blurIntensity.value = intensity;
}

function updateBlurType(type) {
  mat.uniforms.u_blurType.value = type;
}

function resetColors() {
  updateObjectColor('#ff8a33');
  updateBgColor('#ffffff');
  updateTransparency(false);
  updateBlurIntensity(1.0);
  updateBlurType(0);
  document.getElementById('objectColor').value = '#ff8a33';
  document.getElementById('bgColor').value = '#ffffff';
  document.getElementById('useTransparent').checked = false;
  document.getElementById('blurIntensity').value = 1.0;
  document.getElementById('blurValue').textContent = '1.0';
  document.getElementById('blurType').value = '0';
}

// Event listeners para os controles
document.addEventListener('DOMContentLoaded', () => {
  const objectColorInput = document.getElementById('objectColor');
  const bgColorInput = document.getElementById('bgColor');
  const transparentCheckbox = document.getElementById('useTransparent');
  const blurIntensityInput = document.getElementById('blurIntensity');
  const blurValueSpan = document.getElementById('blurValue');
  const blurTypeSelect = document.getElementById('blurType');
  
  objectColorInput.addEventListener('change', (e) => {
    updateObjectColor(e.target.value);
  });
  
  bgColorInput.addEventListener('change', (e) => {
    updateBgColor(e.target.value);
  });
  
  transparentCheckbox.addEventListener('change', (e) => {
    updateTransparency(e.target.checked);
  });
  
  blurIntensityInput.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    updateBlurIntensity(value);
    blurValueSpan.textContent = value.toFixed(1);
  });
  
  blurTypeSelect.addEventListener('change', (e) => {
    updateBlurType(parseInt(e.target.value));
  });
  
  // Inicializar com as cores padrão
  updateObjectColor('#ff8a33');
  updateBgColor('#ffffff');
  updateBlurIntensity(1.0);
  updateBlurType(0);
});
