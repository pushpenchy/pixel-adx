/**
 * Coarse continent outlines (lon, lat) used to rasterize an abstract
 * dot-matrix world map. Intentionally low fidelity — it is decorative.
 */
type Poly = [number, number][];

const continents: Poly[] = [
  // North America
  [[-168, 66], [-140, 70], [-95, 76], [-70, 62], [-55, 50], [-65, 44], [-75, 35], [-81, 25], [-97, 26], [-105, 20], [-90, 14], [-83, 8], [-95, 16], [-118, 30], [-125, 40], [-125, 50], [-150, 60]],
  // Greenland
  [[-55, 60], [-45, 60], [-20, 70], [-25, 83], [-60, 82], [-70, 76]],
  // South America
  [[-80, 10], [-62, 10], [-50, 0], [-35, -6], [-38, -14], [-48, -26], [-57, -38], [-65, -50], [-70, -55], [-75, -45], [-71, -18], [-80, -5]],
  // Europe
  [[-10, 36], [0, 44], [-5, 48], [3, 52], [8, 55], [5, 58], [10, 60], [20, 70], [32, 70], [40, 60], [50, 52], [40, 45], [28, 42], [22, 38], [15, 38], [10, 44]],
  // UK / Ireland
  [[-10, 51], [2, 51], [-1, 58], [-7, 58]],
  // Africa
  [[-17, 15], [-17, 22], [-10, 33], [0, 36], [10, 37], [20, 32], [32, 31], [35, 25], [43, 12], [51, 12], [50, 2], [40, -10], [35, -25], [30, -34], [18, -34], [12, -18], [9, -2], [9, 5], [-5, 5]],
  // Madagascar
  [[44, -12], [50, -15], [49, -25], [44, -25]],
  // Asia
  [[30, 42], [45, 42], [50, 52], [60, 70], [75, 74], [100, 78], [130, 72], [160, 70], [180, 68], [180, 62], [160, 60], [155, 52], [140, 48], [135, 40], [125, 35], [122, 25], [108, 18], [105, 10], [100, 4], [98, 10], [90, 22], [80, 8], [75, 20], [60, 25], [55, 25], [48, 30], [35, 35]],
  // Japan
  [[130, 32], [140, 36], [142, 44], [140, 45], [137, 38]],
  // Indonesia / SE islands
  [[95, 5], [105, -5], [120, -9], [135, -5], [140, -8], [130, -2], [115, 0], [100, 2]],
  // Australia
  [[114, -22], [115, -34], [130, -32], [138, -36], [148, -38], [153, -28], [147, -19], [142, -11], [136, -12], [130, -12], [125, -14]],
  // New Zealand
  [[167, -45], [174, -41], [178, -38], [175, -36], [170, -46]],
];

function inside(poly: Poly, x: number, y: number) {
  let ok = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ok = !ok;
  }
  return ok;
}

/** Equirectangular projection to an SVG box. */
export function project(lon: number, lat: number, w: number, h: number) {
  return { x: ((lon + 180) / 360) * w, y: ((90 - lat) / 180) * h };
}

/** Returns dot positions (SVG coords) for a w×h box at `step` degrees. */
export function worldDots(w: number, h: number, step = 3) {
  const dots: { x: number; y: number }[] = [];
  for (let lat = 84; lat >= -58; lat -= step) {
    for (let lon = -180; lon <= 180; lon += step) {
      if (continents.some((p) => inside(p, lon, lat))) dots.push(project(lon, lat, w, h));
    }
  }
  return dots;
}

/** Land sample points as lon/lat (degrees) — for the 3D globe. */
export function landLonLat(step = 3) {
  const out: { lon: number; lat: number }[] = [];
  for (let lat = 84; lat >= -58; lat -= step) {
    for (let lon = -180; lon <= 180; lon += step) {
      if (continents.some((p) => inside(p, lon, lat))) out.push({ lon, lat });
    }
  }
  return out;
}
