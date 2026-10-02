import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";

const designs = [
  {
    id: "protagonista",
    title: "Recuerdo protagonista",
    count: 5,
    centers: [
      [533, 700],
      [1233, 392],
      [1700, 392],
      [1233, 1008],
      [1700, 1008],
    ],
  },
  {
    id: "panoramico",
    title: "Historia panorámica",
    count: 5,
    centers: [
      [1000, 456],
      [299, 1074],
      [766, 1074],
      [1233, 1074],
      [1700, 1074],
    ],
  },
  {
    id: "siete",
    title: "Siete momentos",
    count: 7,
    centers: [
      [1000, 700],
      [299, 288],
      [299, 700],
      [299, 1112],
      [1700, 288],
      [1700, 700],
      [1700, 1112],
    ],
  },
  {
    id: "mosaico",
    title: "Mosaico de amor",
    count: 9,
    centers: [
      [377, 288],
      [1000, 288],
      [1623, 288],
      [377, 700],
      [1000, 700],
      [1623, 700],
      [377, 1112],
      [1000, 1112],
      [1623, 1112],
    ],
  },
];
const colors = [
  [221, 48, 78],
  [48, 158, 104],
  [48, 96, 202],
  [236, 182, 56],
  [163, 69, 186],
  [45, 177, 187],
  [238, 119, 65],
  [126, 138, 65],
  [181, 84, 132],
];

test(
  "Collage: cuatro acomodos, 5/7/9 fotos, carga propia y exportación",
  { timeout: 120000 },
  async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1100 },
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await mkdir("test-results", { recursive: true });
      await page.goto("http://127.0.0.1:5173/");
      await page.waitForFunction(
        () =>
          document.querySelectorAll(".collage-example img").length === 4 &&
          [...document.querySelectorAll(".collage-example img")].every(
            (image) => image.naturalWidth === 640,
          ),
      );
      assert.deepEqual(await page.locator(".example-badge").allTextContents(), [
        "5 fotos",
        "5 fotos",
        "7 fotos",
        "9 fotos",
      ]);
      for (const width of [1440, 768, 375]) {
        await page.setViewportSize({ width, height: 1100 });
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          true,
        );
        await page.screenshot({
          path: "test-results/collage-gallery-" + width + ".png",
          fullPage: true,
        });
      }
      await page.setViewportSize({ width: 1440, height: 1100 });
      await page
        .getByRole("button", {
          name: "Probar el acomodo Siete momentos, 7 fotografías",
        })
        .click();
      await page
        .getByRole("heading", { name: "Siete momentos, una historia" })
        .waitFor();
      assert.match(
        await page.locator(".selection-count").textContent(),
        /0 de 7/,
      );
      assert.match(
        await page.locator(".collage-needed").textContent(),
        /7 fotografías más/,
      );
      assert.equal(
        await page.getByRole("button", { name: "Guardar imagen" }).isDisabled(),
        true,
      );

      // Nine uniquely colored photos let us check the position of every exported photo.
      const pngs = await page.evaluate(
        (palette) =>
          palette.map((rgb) => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 100;
            const context = canvas.getContext("2d");
            context.fillStyle = "rgb(" + rgb.join(",") + ")";
            context.fillRect(0, 0, 100, 100);
            return canvas.toDataURL("image/png").split(",")[1];
          }),
        colors,
      );
      const files = pngs.map((png, i) => ({
        name: "propia-" + (i + 1) + ".png",
        mimeType: "image/png",
        buffer: Buffer.from(png, "base64"),
      }));
      await page.getByLabel("Añadir fotos al collage").setInputFiles(files);
      await page.waitForFunction(
        () => document.querySelectorAll(".pick-remove").length === 9,
      );
      assert.match(
        await page.locator(".selection-count").textContent(),
        /7 de 7/,
      );
      assert.equal(
        await page.getByLabel("Añadir fotos al collage").isDisabled(),
        true,
      );
      assert.equal(await page.locator(".pick-card").count(), 9);

      for (const width of [375, 768, 1440]) {
        await page.setViewportSize({ width, height: 1100 });
        assert.equal(
          await page
            .locator(".dialog")
            .evaluate((dialog) => dialog.scrollWidth <= dialog.clientWidth),
          true,
          "El editor cabe a " + width + "px",
        );
      }
      for (const design of designs) {
        await page
          .getByRole("radio", { name: new RegExp("^" + design.title) })
          .click();
        await page.waitForFunction((id) => {
          const image = document.querySelector(".collage-preview");
          return image?.dataset.layout === id && image.naturalWidth === 2000;
        }, design.id);
        assert.match(
          await page.locator(".selection-count").textContent(),
          new RegExp(design.count + " de " + design.count),
        );
        assert.equal(await page.locator(".picked").count(), design.count);
        const downloading = page.waitForEvent("download");
        await page.getByRole("button", { name: "Guardar imagen" }).click();
        const download = await downloading;
        const path = "test-results/collage-layout-" + design.id + ".png";
        await download.saveAs(path);
        const png = await readFile(path);
        assert.equal(png.readUInt32BE(16), 2000);
        assert.equal(png.readUInt32BE(20), 1400);
        const pixels = await page.evaluate(
          async ({ png, centers }) => {
            const image = new Image();
            const loaded = new Promise((resolve, reject) => {
              image.onload = resolve;
              image.onerror = reject;
            });
            image.src = "data:image/png;base64," + png;
            await loaded;
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext("2d");
            context.drawImage(image, 0, 0);
            return centers.map(([x, y]) =>
              Array.from(context.getImageData(x, y, 1, 1).data).slice(0, 3),
            );
          },
          { png: png.toString("base64"), centers: design.centers },
        );
        assert.deepEqual(
          pixels,
          colors.slice(0, design.count),
          "Cada foto ocupa su lugar en el PNG de " + design.title,
        );
      }

      // Reducing capacity updates the selection; keyboard arrows also change layouts.
      const firstLayout = page.getByRole("radio", {
        name: /^Recuerdo protagonista/,
      });
      await firstLayout.focus();
      await page.keyboard.press("ArrowRight");
      assert.equal(
        await page
          .getByRole("radio", { name: /^Historia panorámica/ })
          .getAttribute("aria-checked"),
        "true",
      );
      assert.equal(await page.locator(".picked").count(), 5);
      assert.equal(
        await page
          .getByRole("button", { name: "Seleccionar propia-6", exact: true })
          .isDisabled(),
        true,
      );
      await page
        .getByRole("button", { name: "Deseleccionar propia-1", exact: true })
        .click();
      assert.equal(
        await page.getByRole("button", { name: "Guardar imagen" }).isDisabled(),
        true,
      );
      await page
        .getByRole("button", { name: "Seleccionar propia-6", exact: true })
        .click();
      await page
        .getByRole("button", {
          name: "Eliminar del collage: propia-6",
          exact: true,
        })
        .click();
      assert.equal(await page.locator(".picked").count(), 4);
      assert.equal(
        await page.getByLabel("Añadir fotos al collage").isDisabled(),
        false,
      );
      await page
        .getByLabel("Añadir fotos al collage")
        .setInputFiles(files.slice(0, 2));
      await page
        .getByRole("alert")
        .filter({ hasText: "Puedes subir hasta 9" })
        .waitFor();
      assert.equal(await page.locator(".pick-remove").count(), 8);
      await page
        .getByLabel("Añadir fotos al collage")
        .setInputFiles(files.slice(5, 6));
      await page.waitForFunction(
        () => document.querySelectorAll(".pick-remove").length === 9,
      );
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      assert.equal(
        await page.getByRole("button", { name: "Ver carrusel" }).count(),
        0,
        "La navegación del módulo anterior se ha eliminado",
      );
      assert.equal(
        await page.locator(".memory-card, .dots, .carousel").count(),
        0,
      );
      await page
        .getByRole("button", {
          name: "Probar el acomodo Recuerdo protagonista, 5 fotografías",
          exact: true,
        })
        .click();
      assert.equal(
        await page.locator(".pick-remove").count(),
        9,
        "Las fotos siguen disponibles al reabrir durante la visita",
      );
      await page.reload();
      await page
        .getByRole("button", {
          name: "Probar el acomodo Mosaico de amor, 9 fotografías",
        })
        .click();
      assert.equal(await page.locator(".pick-remove").count(), 0);
      assert.equal(await page.locator(".pick-card").count(), 0);
      assert.match(
        await page.locator(".collage-needed").textContent(),
        /9 fotografías más/,
      );
      assert.equal(
        await page.getByRole("button", { name: "Guardar imagen" }).isDisabled(),
        true,
      );
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);
