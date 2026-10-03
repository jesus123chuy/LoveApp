import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  Heart,
  ImagePlus,
  Share2,
  Sparkles,
  Trash2,
  X,
  LoaderCircle,
} from "lucide-react";
import {
  type FrameStyle,
  type CollageLayout,
  type CollagePhoto,
  MAX_COLLAGE_UPLOADS,
  examplePhotos,
  collageFrames,
  collageLayouts,
  getCollageLayout,
  clearLegacyPhotos,
  newPhotoId,
  fileImage,
  renderCollage,
} from "./collage";

type Modal = "collage" | null;
type FileShareNavigator = {
  canShare?: (data: ShareData) => boolean;
  share?: (data: ShareData) => Promise<void>;
};
const examplePhotoOrders: Record<CollageLayout, number[]> = {
  protagonista: [0, 1, 2, 3, 4],
  panoramico: [4, 2, 0, 3, 1],
  siete: [1, 3, 0, 4, 2, 3, 1],
  mosaico: [3, 4, 1, 0, 2, 4, 3, 1, 0],
  "corazon-carta": [2, 4, 1, 3, 0],
  "corazon-siete": [0, 2, 4, 1, 3, 2, 0],
  "corazon-mosaico": [3, 1, 4, 0, 2, 1, 3, 4, 2],
};
function LayoutThumbnail({ layout }: { layout: CollageLayout }) {
  const model = getCollageLayout(layout);
  const clipId = "thumbnail-" + layout;
  return (
    <svg
      className="layout-thumbnail"
      viewBox="0 0 2000 1400"
      aria-hidden="true"
    >
      {model.shape === "heart" && (
        <defs>
          <clipPath id={clipId}>
            <path d="M1000 1288 C860 1160 290 810 290 470 C290 215 600 110 830 210 C915 250 978 340 1000 420 C1022 340 1085 250 1170 210 C1400 110 1710 215 1710 470 C1710 810 1140 1160 1000 1288Z" />
          </clipPath>
        </defs>
      )}
      <g clipPath={model.shape === "heart" ? `url(#${clipId})` : undefined}>
        {model.boxes.map(([x, y, width, height], index) => (
          <rect
            key={index}
            x={x}
            y={y}
            width={width}
            height={height}
            rx={model.shape === "heart" ? 16 : 50}
          />
        ))}
      </g>
    </svg>
  );
}
function CollageShowcase({
  previews,
  onChoose,
  error,
}: {
  previews: Partial<Record<CollageLayout, string>>;
  onChoose: (layout: CollageLayout) => void;
  error: boolean;
}) {
  return (
    <div className="collage-showcase-content">
      <div className="collage-showcase-heading">
        <h2>Así pueden verse nuestros recuerdos</h2>
      </div>
      <div className="collage-example-grid">
        {collageLayouts.map((layout) => (
          <button
            className={"collage-example collage-example-" + layout.id}
            key={layout.id}
            onClick={() => onChoose(layout.id)}
            aria-label={
              "Usar el acomodo " +
              layout.title +
              ", " +
              layout.photoCount +
              " fotografías"
            }
          >
            <span className="collage-example-art">
              {previews[layout.id] ? (
                <img src={previews[layout.id]} alt="" aria-hidden="true" />
              ) : (
                <span className="collage-example-placeholder">
                  {error
                    ? "No pudimos preparar el ejemplo"
                    : "Preparando ejemplo…"}
                </span>
              )}
            </span>
            <span className="collage-example-copy">
              <strong>{layout.title}</strong>
              <span className="example-badge">{layout.photoCount} fotos</span>
              <span className="collage-example-action">
                Usar este acomodo <ArrowRight size={14} />
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="dialog"
    >
      <div className="dialog-head">
        <div>
          <span className="eyebrow">NOSOTROS</span>
          <h2>{title}</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Cerrar">
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function App() {
  const [photos, setPhotos] = useState<CollagePhoto[]>([]),
    [modal, setModal] = useState<Modal>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [layoutId, setLayoutId] = useState<CollageLayout>("protagonista"),
    [collageUploadBusy, setCollageUploadBusy] = useState(false),
    [frameStyle, setFrameStyle] = useState<FrameStyle>("corazones"),
    [preview, setPreview] = useState(""),
    [previewSignature, setPreviewSignature] = useState(""),
    [previewBlob, setPreviewBlob] = useState<Blob | null>(null),
    [previewBlobSignature, setPreviewBlobSignature] = useState(""),
    [previewError, setPreviewError] = useState(""),
    [canShareImage, setCanShareImage] = useState(false),
    [collageExamples, setCollageExamples] = useState<
      Partial<Record<CollageLayout, string>>
    >({}),
    [collageExamplesError, setCollageExamplesError] = useState(false);
  const uploadVersion = useRef(0);
  const layout = getCollageLayout(layoutId);
  const collageSignature = JSON.stringify([layoutId, frameStyle, ...selected]);
  const previewReady = Boolean(
    preview && previewSignature === collageSignature,
  );
  const exportReady = Boolean(
    previewReady && previewBlob && previewBlobSignature === collageSignature,
  );
  useEffect(() => {
    let active = true;
    clearLegacyPhotos().then((cleared) => {
      if (active && !cleared)
        setNotice(
          "Cierra otras pestañas antiguas para borrar las fotos que habían quedado guardadas.",
        );
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    async function prepareExamples() {
      let failures = 0;
      for (const example of collageLayouts) {
        try {
          const photos = examplePhotoOrders[example.id].map(
            (index) => examplePhotos[index],
          );
          const canvas = await renderCollage(
            photos,
            example.exampleFrame,
            example.id,
            {
              width: 640,
              height: 448,
            },
          );
          const image = canvas.toDataURL("image/jpeg", 0.88);
          if (active)
            setCollageExamples((current) => ({
              ...current,
              [example.id]: image,
            }));
        } catch {
          failures++;
        }
        if (active && failures) setCollageExamplesError(true);
        // Let the browser paint each finished card before building the next one.
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => resolve()),
        );
        if (!active) return;
      }
    }
    void prepareExamples();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    setPreview("");
    setPreviewBlob(null);
    setPreviewBlobSignature("");
    setPreviewError("");
    setCanShareImage(false);
    if (modal !== "collage" || selected.length !== layout.photoCount) return;
    let active = true;
    const list = selected.map((id) => photos.find((m) => m.id === id)!);
    const signature = collageSignature;
    renderCollage(list, frameStyle, layoutId)
      .then((c) => {
        if (active) {
          setPreview(c.toDataURL("image/png"));
          setPreviewSignature(signature);
          c.toBlob((blob) => {
            if (!active) return;
            if (!blob) {
              setPreviewError(
                "No pudimos preparar el PNG. Prueba otro acomodo o menos fotos de gran tamaño.",
              );
              return;
            }
            setPreviewBlob(blob);
            setPreviewBlobSignature(signature);
            const file = new File([blob], "nosotros-collage.png", {
              type: "image/png",
            });
            const fileShare = navigator as unknown as FileShareNavigator;
            setCanShareImage(
              Boolean(
                fileShare.share && fileShare.canShare?.({ files: [file] }),
              ),
            );
          }, "image/png");
        }
      })
      .catch((e) => {
        if (active) setPreviewError(e.message);
      });
    return () => {
      active = false;
    };
  }, [
    selected,
    modal,
    photos,
    frameStyle,
    layoutId,
    layout.photoCount,
    collageSignature,
  ]);
  function close() {
    uploadVersion.current++;
    setCollageUploadBusy(false);
    setModal(null);
    setError("");
  }
  function openCollage(chosenLayout: CollageLayout = layoutId) {
    setError("");
    setLayoutId(chosenLayout);
    setSelected(
      photos
        .slice(0, getCollageLayout(chosenLayout).photoCount)
        .map((photo) => photo.id),
    );
    setModal("collage");
  }
  async function uploadCollage(files: FileList | null) {
    if (!files?.length || collageUploadBusy) return;
    const chosenFiles = Array.from(files);
    if (chosenFiles.length + photos.length > MAX_COLLAGE_UPLOADS) {
      setError(
        "Puedes subir hasta 9 fotos propias para el collage. Quita alguna o elige menos archivos.",
      );
      return;
    }
    const version = ++uploadVersion.current;
    setCollageUploadBusy(true);
    setError("");
    const added: CollagePhoto[] = [];
    const failures: string[] = [];
    // Process one at a time so several large HEIC files do not exhaust mobile memory.
    for (const file of chosenFiles) {
      try {
        const image = await fileImage(file);
        if (version !== uploadVersion.current) return;
        added.push({
          id: newPhotoId(),
          title: file.name.replace(/\.[^.]+$/, "") || "Mi fotografía",
          image,
        });
      } catch (cause) {
        if (version !== uploadVersion.current) return;
        failures.push(file.name + ": " + (cause as Error).message);
      }
    }
    if (added.length) {
      setPhotos((photos) => [...added, ...photos]);
      setSelected((chosen) =>
        [...added.map((photo) => photo.id), ...chosen].slice(
          0,
          layout.photoCount,
        ),
      );
    }
    setError(failures.join(" "));
    setCollageUploadBusy(false);
  }
  function removeCollagePhoto(id: string) {
    setPhotos((photos) => photos.filter((photo) => photo.id !== id));
    setSelected((chosen) => chosen.filter((photoId) => photoId !== id));
    setError("");
  }
  async function saveCollage() {
    if (
      !previewBlob ||
      !exportReady ||
      collageUploadBusy ||
      selected.length !== layout.photoCount
    )
      return;
    const file = new File([previewBlob], "nosotros-collage.png", {
      type: "image/png",
    });
    const fileShare = navigator as unknown as FileShareNavigator;
    if (canShareImage && fileShare.share) {
      try {
        await fileShare.share.call(navigator, {
          files: [file],
          title: "Nuestro collage",
          text: "Un recuerdo hecho con amor.",
        });
        setNotice("El collage se compartió correctamente.");
        return;
      } catch (cause) {
        if ((cause as DOMException).name === "AbortError") return;
      }
    }
    const url = URL.createObjectURL(previewBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "nosotros-collage.png";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Tu collage PNG está listo para guardar en el dispositivo.");
  }
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#" aria-label="Nosotros, inicio">
            <span className="brand-mark" aria-hidden="true">
              <Heart size={18} fill="currentColor" />
            </span>
            <span className="brand-copy">
              <strong>Nosotros</strong>
              <small>COLLAGES DE RECUERDOS</small>
            </span>
            <span className="brand-mark" aria-hidden="true">
              <Heart size={18} fill="currentColor" />
            </span>
          </a>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="intro">
          <div>
            <h1>Nuestra historia de amor en fotografías</h1>
          </div>
        </section>
        <section
          id="collage-showcase"
          className="collage-showcase"
          aria-label="Ejemplos de collage"
        >
          <span className="tape">DISTINTAS FORMAS DE COLLAGE</span>
          <CollageShowcase
            previews={collageExamples}
            error={collageExamplesError}
            onChoose={(chosenLayout) => {
              setFrameStyle(getCollageLayout(chosenLayout).exampleFrame);
              openCollage(chosenLayout);
            }}
          />
        </section>
      </main>
      <footer className="site-footer">
        © 2026 · Todos los derechos reservados
      </footer>
      {notice && (
        <div role="status" className="toast">
          <Check size={18} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Cerrar aviso">
            <X size={15} />
          </button>
        </div>
      )}
      {modal === "collage" && (
        <Dialog
          title={
            { 5: "Cinco", 7: "Siete", 9: "Nueve" }[layout.photoCount] +
            " momentos, una historia"
          }
          onClose={close}
        >
          <fieldset className="layout-fieldset">
            <legend>
              <span className="step-number" aria-hidden="true">
                1
              </span>
              Elige el acomodo
            </legend>
            <div className="layout-current">
              <LayoutThumbnail layout={layoutId} />
              <div className="layout-current-copy">
                <strong>{layout.title}</strong>
                <span>{layout.photoCount} fotos</span>
              </div>
            </div>
          </fieldset>
          <h3 className="editor-step-title">
            <span className="step-number" aria-hidden="true">
              2
            </span>
            Selecciona tus fotos
          </h3>
          <p className="dialog-description">
            Selecciona {layout.photoCount} fotografías.
            {layout.featured
              ? " La primera será la protagonista; toca la estrella de otra foto para cambiarla."
              : " Se colocan de izquierda a derecha y de arriba abajo. Puedes elegir qué foto va primero."}
          </p>
          <div className="collage-upload">
            <label
              className={
                "collage-upload-control " +
                (collageUploadBusy || photos.length === MAX_COLLAGE_UPLOADS
                  ? "collage-upload-disabled"
                  : "")
              }
            >
              {collageUploadBusy ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <ImagePlus size={17} />
              )}
              {collageUploadBusy
                ? "Preparando fotos…"
                : "Subir fotos para el collage"}
              <input
                type="file"
                accept="image/*"
                multiple
                aria-label="Añadir fotos al collage"
                disabled={
                  collageUploadBusy || photos.length === MAX_COLLAGE_UPLOADS
                }
                onChange={(event) => {
                  void uploadCollage(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          <div className="collage-picker">
            {photos.map((m) => {
              const pos = selected.indexOf(m.id);
              return (
                <div
                  className={`pick-card ${pos >= 0 ? "picked" : ""}`}
                  key={m.id}
                >
                  <button
                    className="pick-image"
                    aria-label={`${pos >= 0 ? "Deseleccionar" : "Seleccionar"} ${m.title}`}
                    aria-pressed={pos >= 0}
                    disabled={
                      collageUploadBusy ||
                      (pos < 0 && selected.length === layout.photoCount)
                    }
                    onClick={() =>
                      setSelected((s) =>
                        pos >= 0 ? s.filter((id) => id !== m.id) : [...s, m.id],
                      )
                    }
                  >
                    <img src={m.image} alt={m.title} />
                    {pos >= 0 && <span className="pick-number">{pos + 1}</span>}
                  </button>
                  <span className="pick-title">{m.title}</span>
                  {pos >= 0 && (
                    <button
                      className="protagonist"
                      aria-label={
                        (layout.featured
                          ? "Hacer protagonista: "
                          : "Poner primero: ") + m.title
                      }
                      disabled={collageUploadBusy}
                      onClick={() =>
                        setSelected((s) => [
                          m.id,
                          ...s.filter((id) => id !== m.id),
                        ])
                      }
                    >
                      <Sparkles size={12} />
                      {layout.featured
                        ? pos === 0
                          ? "Protagonista"
                          : "Destacar"
                        : pos === 0
                          ? "Primera foto"
                          : "Poner primero"}
                    </button>
                  )}
                  <button
                    className="pick-remove"
                    aria-label={"Eliminar del collage: " + m.title}
                    disabled={collageUploadBusy}
                    onClick={() => removeCollagePhoto(m.id)}
                  >
                    <Trash2 size={12} /> Quitar
                  </button>
                </div>
              );
            })}
          </div>
          <p className="selection-count" aria-live="polite">
            {selected.length} de {layout.photoCount} fotografías seleccionadas
          </p>
          <h3 className="editor-step-title">
            <span className="step-number" aria-hidden="true">
              3
            </span>
            Personaliza y guarda
          </h3>
          <fieldset className="frame-fieldset">
            <legend>Elige un marco romántico</legend>
            <p className="frame-hint">
              El marco aparecerá en la vista previa y en tu collage descargado.
            </p>
            <div
              className="frame-options"
              role="radiogroup"
              aria-label="Marcos románticos"
            >
              {collageFrames.map((frame) => (
                <button
                  key={frame.id}
                  type="button"
                  role="radio"
                  aria-checked={frameStyle === frame.id}
                  aria-label={`${frame.title}. ${frame.description}${frame.recommended ? ". Recomendado" : ""}`}
                  data-frame-style={frame.id}
                  tabIndex={frameStyle === frame.id ? 0 : -1}
                  className={`frame-option ${frameStyle === frame.id ? "frame-option-selected" : ""}`}
                  onKeyDown={(event) => {
                    if (
                      ![
                        "ArrowRight",
                        "ArrowDown",
                        "ArrowLeft",
                        "ArrowUp",
                      ].includes(event.key)
                    )
                      return;
                    event.preventDefault();
                    const direction =
                      event.key === "ArrowRight" || event.key === "ArrowDown"
                        ? 1
                        : -1;
                    const currentFrame = collageFrames.findIndex(
                      (item) => item.id === frameStyle,
                    );
                    const nextFrame =
                      collageFrames[
                        (currentFrame + direction + collageFrames.length) %
                          collageFrames.length
                      ];
                    setFrameStyle(nextFrame.id);
                    requestAnimationFrame(() =>
                      document
                        .querySelector<HTMLButtonElement>(
                          `[data-frame-style="${nextFrame.id}"]`,
                        )
                        ?.focus(),
                    );
                  }}
                  onClick={() => setFrameStyle(frame.id)}
                >
                  <span
                    className={`frame-swatch frame-swatch-${frame.id}`}
                    aria-hidden="true"
                  >
                    {
                      {
                        corazones: "♥  ♥  ♥",
                        carta: "♡  ✉  ♡",
                        rosas: "❀  ♥  ❀",
                        dorado: "✦  ♥  ✦",
                        lavanda: "✿  ♥  ✿",
                        eucalipto: "❧  ♥  ❧",
                        noche: "☾  ✦  ✦",
                      }[frame.id]
                    }
                  </span>
                  <span className="frame-option-copy">
                    <strong>{frame.title}</strong>
                    <small>{frame.description}</small>
                  </span>
                  {frame.recommended && (
                    <span className="frame-recommendation">Recomendado</span>
                  )}
                </button>
              ))}
            </div>
          </fieldset>
          {previewReady && (
            <img
              className="collage-preview"
              data-frame-style={frameStyle}
              data-layout={layoutId}
              src={preview}
              alt={`Vista previa de ${layout.title}: ${layout.photoCount} fotografías con marco ${collageFrames.find((frame) => frame.id === frameStyle)?.title}`}
            />
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {previewError && (
            <p className="error" role="alert">
              {previewError}
            </p>
          )}
          <div className="dialog-actions">
            <button className="button secondary" onClick={close}>
              Volver
            </button>
            <button
              className="button"
              disabled={
                !exportReady ||
                collageUploadBusy ||
                selected.length !== layout.photoCount
              }
              onClick={saveCollage}
            >
              {canShareImage ? <Share2 size={16} /> : <Download size={16} />}
              Guardar imagen
            </button>
          </div>
          {canShareImage && (
            <p className="mobile-save-hint">
              En iPhone, toca «Guardar imagen» y elige «Guardar en Fotos».
            </p>
          )}
          <p className="export-note">
            2000 × 1400 px · {layout.title} · {layout.photoCount} fotos ·{" "}
            {collageFrames.find((frame) => frame.id === frameStyle)?.title}
          </p>
        </Dialog>
      )}
    </div>
  );
}
