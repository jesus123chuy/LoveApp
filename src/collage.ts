export type CollagePhoto = {
  id: string;
  image: string;
  title: string;
};
// These photographs are only used for the public inspiration previews.
export const examplePhotos: CollagePhoto[] = [
  { id: "beach", image: "/photos/beach.jpg", title: "La playa" },
  { id: "mountains", image: "/photos/mountains.jpg", title: "Las montañas" },
  { id: "city", image: "/photos/city.jpg", title: "Una escapada" },
  { id: "flowers", image: "/photos/flowers.jpg", title: "Las flores" },
  { id: "sunset", image: "/photos/sunset.jpg", title: "El atardecer" },
];
export type FrameStyle = "corazones" | "carta" | "rosas" | "dorado";
export const collageFrames: {
  id: FrameStyle;
  title: string;
  description: string;
  recommended?: boolean;
}[] = [
  {
    id: "corazones",
    title: "Lluvia de corazones",
    description: "Un marco delicado lleno de amor",
    recommended: true,
  },
  {
    id: "carta",
    title: "Carta de amor",
    description: "Como una carta para guardar",
  },
  {
    id: "rosas",
    title: "Jardín romántico",
    description: "Rosas y tonos rosados",
  },
  {
    id: "dorado",
    title: "Amor dorado",
    description: "Un toque cálido y elegante",
  },
];
export type CollageLayout = "protagonista" | "panoramico" | "siete" | "mosaico";
export type PhotoBox = readonly [number, number, number, number];
export const MAX_COLLAGE_UPLOADS = 9;
export const collageLayouts: {
  id: CollageLayout;
  title: string;
  description: string;
  photoCount: 5 | 7 | 9;
  featured: boolean;
  exampleFrame: FrameStyle;
  boxes: readonly PhotoBox[];
}[] = [
  {
    id: "protagonista",
    title: "Recuerdo protagonista",
    description: "Una foto grande y cuatro momentos a su lado",
    photoCount: 5,
    featured: true,
    exampleFrame: "corazones",
    boxes: [
      [80, 96, 906, 1208],
      [1014, 96, 439, 592],
      [1481, 96, 439, 592],
      [1014, 712, 439, 592],
      [1481, 712, 439, 592],
    ],
  },
  {
    id: "panoramico",
    title: "Historia panorámica",
    description: "Una foto horizontal sobre cuatro recuerdos",
    photoCount: 5,
    featured: true,
    exampleFrame: "carta",
    boxes: [
      [80, 96, 1840, 720],
      [80, 844, 439, 460],
      [547, 844, 439, 460],
      [1014, 844, 439, 460],
      [1481, 844, 439, 460],
    ],
  },
  {
    id: "siete",
    title: "Siete momentos",
    description: "Tu foto central rodeada de seis recuerdos",
    photoCount: 7,
    featured: true,
    exampleFrame: "rosas",
    boxes: [
      [547, 96, 906, 1208],
      [80, 96, 439, 384],
      [80, 508, 439, 384],
      [80, 920, 439, 384],
      [1481, 96, 439, 384],
      [1481, 508, 439, 384],
      [1481, 920, 439, 384],
    ],
  },
  {
    id: "mosaico",
    title: "Mosaico de amor",
    description: "Nueve fotos en una cuadrícula de tres por tres",
    photoCount: 9,
    featured: false,
    exampleFrame: "dorado",
    boxes: Array.from(
      { length: 9 },
      (_, index) =>
        [
          80 + (index % 3) * (1840 / 3 + 28 / 3),
          96 + Math.floor(index / 3) * 412,
          (1840 - 56) / 3,
          384,
        ] as const,
    ),
  },
];
export function getCollageLayout(id: CollageLayout) {
  return collageLayouts.find((layout) => layout.id === id)!;
}
export function clearLegacyPhotos(): Promise<boolean> {
  if (typeof indexedDB === "undefined") return Promise.resolve(true);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (cleared: boolean) => {
      if (settled) return;
      settled = true;
      resolve(cleared);
    };
    try {
      const request = indexedDB.deleteDatabase("nosotros-album");
      request.onsuccess = () => finish(true);
      request.onerror = () => finish(false);
      request.onblocked = () => finish(false);
    } catch {
      finish(false);
    }
  });
}
export function newPhotoId(): string {
  if (crypto.randomUUID) return crypto.randomUUID();
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}
export async function fileImage(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024)
    throw new Error("La imagen debe pesar como máximo 10 MB.");
  const format = file.type.toLowerCase();
  const unknownFormat = !format || format === "application/octet-stream";
  const heic =
    ["image/heic", "image/heif"].includes(format) ||
    (unknownFormat && /\.(heic|heif)$/i.test(file.name));
  const standard =
    ["image/jpeg", "image/png", "image/webp"].includes(format) ||
    (unknownFormat && /\.(jpe?g|png|webp)$/i.test(file.name));
  if (!heic && !standard)
    throw new Error("Elige una imagen JPEG, PNG, WebP, HEIC o HEIF.");
  let image: Blob = file;
  if (heic) {
    try {
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });
      image = Array.isArray(converted) ? converted[0] : converted;
      if (!image) throw new Error("Conversión vacía");
    } catch {
      throw new Error(
        "No pudimos convertir esta foto HEIC/HEIF. Prueba exportarla como JPEG.",
      );
    }
  }
  const data = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("No pudimos leer la fotografía."));
    r.readAsDataURL(image);
  });
  await loadImage(data);
  return data;
}
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () =>
      reject(
        new Error("No pudimos cargar una fotografía. Prueba con otra imagen."),
      );
    img.src = src;
  });
}
export async function renderCollage(
  photos: CollagePhoto[],
  frame: FrameStyle = "corazones",
  layoutId: CollageLayout = "protagonista",
  size: { width: number; height: number } = { width: 2000, height: 1400 },
): Promise<HTMLCanvasElement> {
  const layout = getCollageLayout(layoutId);
  if (photos.length !== layout.photoCount)
    throw new Error(
      "El acomodo necesita exactamente " + layout.photoCount + " fotografías.",
    );
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(size.width / 2000, size.height / 1400);
  const palettes: Record<
    FrameStyle,
    { background: string; accent: string; detail: string; title: string }
  > = {
    corazones: {
      background: "#fff5f1",
      accent: "#c86f75",
      detail: "#f0c4bd",
      title: "HECHOS CON AMOR",
    },
    carta: {
      background: "#fcf7ed",
      accent: "#a87449",
      detail: "#e9d7b8",
      title: "CARTA DE AMOR · NUESTROS RECUERDOS",
    },
    rosas: {
      background: "#fff3f6",
      accent: "#bd5674",
      detail: "#edb9c8",
      title: "FLORECE NUESTRO AMOR",
    },
    dorado: {
      background: "#fff8e9",
      accent: "#a9813d",
      detail: "#e5d3a4",
      title: "TÚ + YO · POR SIEMPRE",
    },
  };
  const colors = palettes[frame];
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, 2000, 1400);
  ctx.save();
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = frame === "carta" ? 3 : 5;
  ctx.setLineDash(frame === "carta" ? [14, 10] : []);
  ctx.beginPath();
  ctx.roundRect(22, 22, 1956, 1356, 44);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = colors.detail;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(35, 35, 1930, 1330, 36);
  ctx.stroke();

  const heart = (x: number, y: number, size: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size * 0.58);
    ctx.bezierCurveTo(
      x - size * 1.2,
      y - size * 0.05,
      x - size * 0.68,
      y - size * 1.15,
      x,
      y - size * 0.48,
    );
    ctx.bezierCurveTo(
      x + size * 0.68,
      y - size * 1.15,
      x + size * 1.2,
      y - size * 0.05,
      x,
      y + size * 0.58,
    );
    ctx.fill();
  };
  const rose = (x: number, y: number, size: number) => {
    for (let i = 0; i < 5; i++) {
      const angle = (Math.PI * 2 * i) / 5;
      ctx.fillStyle = i % 2 ? colors.detail : colors.accent;
      ctx.beginPath();
      ctx.ellipse(
        x + Math.cos(angle) * size * 0.52,
        y + Math.sin(angle) * size * 0.52,
        size * 0.36,
        size * 0.25,
        angle,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    ctx.fillStyle = colors.background;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  };
  if (frame === "corazones") {
    for (let x = 90; x <= 1910; x += 100) {
      if (x < 835 || x > 1165) {
        heart(x, 48, 9, x % 2 ? colors.accent : colors.detail);
        heart(x, 1352, 9, x % 2 ? colors.detail : colors.accent);
      }
    }
    for (let y = 160; y <= 1240; y += 135) {
      heart(49, y, 9, colors.accent);
      heart(1951, y, 9, colors.detail);
    }
  } else if (frame === "carta") {
    for (const x of [67, 1933])
      for (const y of [67, 1333]) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 19, 0, Math.PI * 2);
        ctx.stroke();
        heart(x, y + 2, 10, colors.accent);
      }
  } else if (frame === "rosas") {
    for (const x of [57, 1943]) for (const y of [58, 1342]) rose(x, y, 18);
    for (let x = 280; x <= 1720; x += 240) {
      heart(x, 49, 8, colors.accent);
      heart(x, 1351, 8, colors.detail);
    }
  } else {
    for (const x of [57, 1943])
      for (const y of [58, 1342]) {
        heart(x, y, 16, colors.accent);
        ctx.fillStyle = colors.detail;
        ctx.font = "24px Georgia, serif";
        ctx.fillText("✦", x + (x < 100 ? 22 : -40), y + 7);
      }
    for (let x = 330; x <= 1670; x += 220) {
      ctx.fillStyle = colors.detail;
      ctx.font = "19px Georgia, serif";
      ctx.fillText("✦", x, 53);
      ctx.fillText("✦", x, 1357);
    }
  }
  ctx.fillStyle = colors.accent;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "600 21px Georgia, serif";
  ctx.fillText(colors.title, 1000, 51, 660);
  ctx.font = "italic 17px Georgia, serif";
  ctx.fillText("siempre juntos, siempre nosotros  ♥", 1000, 1350, 680);
  ctx.restore();
  const boxes = layout.boxes;
  const imgs = await Promise.all(photos.map((photo) => loadImage(photo.image)));
  imgs.forEach((img, i) => {
    const [x, y, w, h] = boxes[i];
    const scale = Math.max(w / img.width, h / img.height);
    const sw = w / scale,
      sh = h / scale;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 16);
    ctx.clip();
    ctx.drawImage(
      img,
      (img.width - sw) / 2,
      (img.height - sh) / 2,
      sw,
      sh,
      x,
      y,
      w,
      h,
    );
    ctx.restore();
  });
  return canvas;
}
