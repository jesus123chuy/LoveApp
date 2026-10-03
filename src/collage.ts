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
export type FrameStyle =
  | "corazones"
  | "carta"
  | "rosas"
  | "dorado"
  | "lavanda"
  | "eucalipto"
  | "noche";
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
  {
    id: "lavanda",
    title: "Flores de lavanda",
    description: "Flores suaves y detalles lilas",
  },
  {
    id: "eucalipto",
    title: "Jardín de eucalipto",
    description: "Hojas verdes y tonos naturales",
  },
  {
    id: "noche",
    title: "Bajo las estrellas",
    description: "Un cielo nocturno para dos",
  },
];
export type CollageLayout =
  | "protagonista"
  | "panoramico"
  | "siete"
  | "mosaico"
  | "corazon-carta"
  | "corazon-siete"
  | "corazon-mosaico";
export type PhotoBox = readonly [number, number, number, number];
export const MAX_COLLAGE_UPLOADS = 9;
export const MAX_PHOTO_FILE_SIZE = 100 * 1024 * 1024;
const MAX_PHOTO_SIDE = 2560;
export const collageLayouts: {
  id: CollageLayout;
  title: string;
  photoCount: 5 | 7 | 9;
  featured: boolean;
  exampleFrame: FrameStyle;
  shape?: "heart";
  boxes: readonly PhotoBox[];
}[] = [
  {
    id: "protagonista",
    title: "Recuerdo protagonista",
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
  {
    id: "corazon-carta",
    title: "Carta en forma de corazón",
    photoCount: 5,
    featured: false,
    exampleFrame: "carta",
    shape: "heart",
    boxes: [
      [380, 210, 600, 390],
      [1020, 210, 600, 390],
      [320, 620, 440, 650],
      [780, 620, 440, 650],
      [1240, 620, 440, 650],
    ],
  },
  {
    id: "corazon-siete",
    title: "Siete recuerdos en corazón",
    photoCount: 7,
    featured: false,
    exampleFrame: "rosas",
    shape: "heart",
    boxes: [
      [380, 180, 600, 360],
      [1020, 180, 600, 360],
      [310, 555, 440, 330],
      [780, 555, 440, 330],
      [1250, 555, 440, 330],
      [520, 900, 440, 360],
      [1040, 900, 440, 360],
    ],
  },
  {
    id: "corazon-mosaico",
    title: "Corazón de nueve fotos",
    photoCount: 9,
    featured: false,
    exampleFrame: "dorado",
    shape: "heart",
    boxes: [
      [380, 185, 600, 350],
      [1020, 185, 600, 350],
      [300, 550, 350, 290],
      [665, 550, 350, 290],
      [1030, 550, 350, 290],
      [1395, 550, 305, 290],
      [470, 855, 340, 330],
      [830, 855, 340, 330],
      [1190, 855, 340, 330],
    ],
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
const imagePromises = new Map<string, Promise<HTMLImageElement>>();
export async function fileImage(file: File): Promise<string> {
  if (file.size > MAX_PHOTO_FILE_SIZE)
    throw new Error("La imagen debe pesar como máximo 100 MB.");
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
  let imageBlob: Blob = file;
  if (heic) {
    try {
      const { default: heic2any } = await import("heic2any");
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.9,
      });
      imageBlob = Array.isArray(converted) ? converted[0] : converted;
      if (!imageBlob) throw new Error("Conversión vacía");
    } catch {
      throw new Error(
        "No pudimos convertir esta foto HEIC/HEIF. Prueba exportarla como JPEG.",
      );
    }
  }
  const sourceUrl = URL.createObjectURL(imageBlob);
  try {
    const image = await loadImage(sourceUrl);
    const scale = Math.min(
      1,
      MAX_PHOTO_SIDE / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No pudimos procesar la fotografía.");
    context.fillStyle = "#fffaf3";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    const optimized = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("No pudimos optimizar la fotografía.")),
        "image/jpeg",
        0.9,
      );
    });
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () =>
        reject(new Error("No pudimos leer la fotografía optimizada."));
      reader.readAsDataURL(optimized);
    });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
export function loadImage(src: string): Promise<HTMLImageElement> {
  const shouldCache = src.startsWith("/photos/");
  const cached = shouldCache ? imagePromises.get(src) : undefined;
  if (cached) return cached;
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      if (shouldCache) imagePromises.delete(src);
      reject(
        new Error("No pudimos cargar una fotografía. Prueba con otra imagen."),
      );
    };
    img.src = src;
  });
  if (shouldCache) imagePromises.set(src, promise);
  return promise;
}
function traceHeart(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(1000, 1288);
  ctx.bezierCurveTo(860, 1160, 290, 810, 290, 470);
  ctx.bezierCurveTo(290, 215, 600, 110, 830, 210);
  ctx.bezierCurveTo(915, 250, 978, 340, 1000, 420);
  ctx.bezierCurveTo(1022, 340, 1085, 250, 1170, 210);
  ctx.bezierCurveTo(1400, 110, 1710, 215, 1710, 470);
  ctx.bezierCurveTo(1710, 810, 1140, 1160, 1000, 1288);
  ctx.closePath();
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
      background: "#fff8f2",
      accent: "#8a3154",
      detail: "#f2bdb3",
      title: "HECHOS CON AMOR",
    },
    carta: {
      background: "#fff9e8",
      accent: "#72513d",
      detail: "#d8b770",
      title: "CARTA DE AMOR · NUESTROS RECUERDOS",
    },
    rosas: {
      background: "#fff3f6",
      accent: "#972c5a",
      detail: "#f0a2bd",
      title: "FLORECE NUESTRO AMOR",
    },
    dorado: {
      background: "#fff8e9",
      accent: "#8b5b12",
      detail: "#e3ba55",
      title: "TÚ + YO · POR SIEMPRE",
    },
    lavanda: {
      background: "#fbf6ff",
      accent: "#745593",
      detail: "#d8c4ec",
      title: "AMOR EN FLOR · LAVANDA",
    },
    eucalipto: {
      background: "#f4f8f2",
      accent: "#476b5c",
      detail: "#b1c9ad",
      title: "JUNTOS COMO SIEMPRE",
    },
    noche: {
      background: "#f5f4ff",
      accent: "#44477d",
      detail: "#aeb2dd",
      title: "BAJO EL MISMO CIELO",
    },
  };
  const colors = palettes[frame];
  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, 2000, 1400);
  ctx.save();
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = frame === "carta" ? 6 : 9;
  ctx.setLineDash(frame === "carta" ? [22, 12] : []);
  ctx.beginPath();
  ctx.roundRect(22, 22, 1956, 1356, 44);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = colors.detail;
  ctx.lineWidth = 4;
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
  const leaf = (
    x: number,
    y: number,
    size: number,
    rotation: number,
    color: string,
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.42, size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  if (frame === "corazones") {
    for (let x = 86; x <= 1914; x += 88) {
      if (x < 790 || x > 1210) {
        heart(x, 48, 15, x % 2 ? colors.accent : colors.detail);
        heart(x, 1352, 15, x % 2 ? colors.detail : colors.accent);
      }
    }
    for (let y = 150; y <= 1250; y += 110) {
      heart(49, y, 14, colors.accent);
      heart(1951, y, 14, colors.detail);
    }
  } else if (frame === "carta") {
    for (const x of [67, 1933])
      for (const y of [67, 1333]) {
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.stroke();
        heart(x, y + 2, 15, colors.accent);
      }
  } else if (frame === "rosas") {
    for (const x of [57, 1943]) for (const y of [58, 1342]) rose(x, y, 26);
    for (let x = 280; x <= 1720; x += 200) {
      heart(x, 49, 13, colors.accent);
      heart(x, 1351, 13, colors.detail);
    }
  } else if (frame === "dorado") {
    for (const x of [57, 1943])
      for (const y of [58, 1342]) {
        heart(x, y, 22, colors.accent);
        ctx.fillStyle = colors.detail;
        ctx.font = "30px Georgia, serif";
        ctx.fillText("✦", x + (x < 100 ? 22 : -40), y + 7);
      }
    for (let x = 300; x <= 1700; x += 195) {
      ctx.fillStyle = colors.detail;
      ctx.font = "25px Georgia, serif";
      ctx.fillText("✦", x, 53);
      ctx.fillText("✦", x, 1357);
    }
  } else if (frame === "lavanda") {
    for (const x of [65, 1935]) for (const y of [65, 1335]) rose(x, y, 32);
    for (let x = 250; x <= 1750; x += 185) {
      heart(x, 50, 12, x % 2 ? colors.accent : colors.detail);
      heart(x, 1350, 12, x % 2 ? colors.detail : colors.accent);
      ctx.fillStyle = colors.accent;
      ctx.font = "22px Georgia, serif";
      ctx.fillText("✿", x + 50, 52);
      ctx.fillText("✿", x - 50, 1348);
    }
  } else if (frame === "eucalipto") {
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 5;
    for (const edge of [
      { x: 68, direction: 1 },
      { x: 1932, direction: -1 },
    ]) {
      for (const y of [270, 620, 970]) {
        ctx.beginPath();
        ctx.moveTo(edge.x, y - 110);
        ctx.bezierCurveTo(
          edge.x + edge.direction * 24,
          y - 30,
          edge.x - edge.direction * 24,
          y + 30,
          edge.x,
          y + 110,
        );
        ctx.stroke();
        for (const offset of [-72, -24, 24, 72]) {
          const direction = offset < 0 ? -1 : 1;
          leaf(
            edge.x + edge.direction * direction * 25,
            y + offset,
            14,
            direction * 0.75,
            Math.abs(offset / 24) % 2 ? colors.detail : colors.accent,
          );
        }
      }
    }
    for (let x = 250; x <= 1750; x += 250) {
      leaf(x, 52, 11, -0.8, colors.accent);
      leaf(x, 1348, 11, 0.8, colors.detail);
    }
  } else {
    ctx.fillStyle = colors.accent;
    ctx.font = "34px Georgia, serif";
    ctx.fillText("☾", 70, 100);
    ctx.fillText("☾", 1930, 1300);
    for (let x = 250; x <= 1750; x += 190) {
      ctx.fillStyle = x % 2 ? colors.accent : colors.detail;
      ctx.font = "27px Georgia, serif";
      ctx.fillText(x % 3 ? "✦" : "✧", x, 52);
      ctx.fillText(x % 3 ? "✧" : "✦", x, 1350);
    }
    for (let y = 230; y <= 1170; y += 155) {
      ctx.fillStyle = y % 2 ? colors.detail : colors.accent;
      ctx.font = "25px Georgia, serif";
      ctx.fillText("✦", 66, y);
      ctx.fillText("✧", 1934, y);
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
  if (layout.shape === "heart") {
    ctx.save();
    traceHeart(ctx);
    ctx.shadowColor = colors.accent + "55";
    ctx.shadowBlur = 34;
    ctx.shadowOffsetY = 15;
    ctx.fillStyle = colors.background;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = colors.detail;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(155, 250);
    ctx.bezierCurveTo(215, 470, 105, 830, 160, 1140);
    ctx.moveTo(1845, 250);
    ctx.bezierCurveTo(1785, 470, 1895, 830, 1840, 1140);
    ctx.stroke();
    for (const [x, direction] of [
      [168, 1],
      [1832, -1],
    ] as const) {
      for (const [index, y] of [320, 500, 700, 900, 1080].entries()) {
        heart(
          x + direction * (index % 2 ? 15 : -5),
          y,
          27,
          index % 2 ? colors.accent : colors.detail,
        );
      }
    }
    heart(455, 170, 27, colors.detail);
    heart(1545, 170, 27, colors.accent);
    ctx.fillStyle = colors.accent;
    ctx.font = "36px Georgia, serif";
    ctx.fillText("✦", 520, 182);
    ctx.fillText("✦", 1480, 182);
    ctx.restore();

    ctx.save();
    traceHeart(ctx);
    ctx.clip();
  }
  imgs.forEach((img, i) => {
    const [x, y, w, h] = boxes[i];
    const gap = layout.shape === "heart" ? 16 : 0;
    const tileWidth = w - gap;
    const tileHeight = h - gap;
    const scale = Math.max(tileWidth / img.width, tileHeight / img.height);
    const sw = tileWidth / scale,
      sh = tileHeight / scale;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(
      x + gap / 2,
      y + gap / 2,
      tileWidth,
      tileHeight,
      layout.shape === "heart" ? 18 : 16,
    );
    ctx.clip();
    ctx.drawImage(
      img,
      (img.width - sw) / 2,
      (img.height - sh) / 2,
      sw,
      sh,
      x + gap / 2,
      y + gap / 2,
      tileWidth,
      tileHeight,
    );
    ctx.restore();
  });
  if (layout.shape === "heart") {
    ctx.restore();
    ctx.save();
    traceHeart(ctx);
    ctx.lineWidth = 24;
    ctx.strokeStyle = colors.background;
    ctx.stroke();
    ctx.lineWidth = 10;
    ctx.strokeStyle = colors.accent;
    ctx.stroke();
    ctx.restore();
  }
  return canvas;
}
