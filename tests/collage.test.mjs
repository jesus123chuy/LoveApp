import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { mkdir, readFile } from "node:fs/promises";

test(
  "Collages: archivos, marcos, descarga, compartir y privacidad por visita",
  { timeout: 120000 },
  async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1100 },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await mkdir("test-results", { recursive: true });
      await page.goto("http://127.0.0.1:5173/");
      assert.equal(
        await page
          .locator(".album-view-switch, .carousel, .memory-card")
          .count(),
        0,
      );
      assert.equal(
        await page
          .locator(".management, .days-pill, .summary-card, .header-upload")
          .count(),
        0,
        "Se retiraron la gestión, la subida del encabezado y los días juntos",
      );
      assert.equal(
        await page.getByRole("button", { name: /fecha de inicio/ }).count(),
        0,
      );
      assert.doesNotMatch(
        await page.locator("body").textContent(),
        /carrusel|carrousel|límite de 5/i,
      );
      await page
        .getByRole("button", {
          name: "Probar el acomodo Recuerdo protagonista, 5 fotografías",
          exact: true,
        })
        .click();
      assert.equal(await page.locator(".pick-card").count(), 0);
      assert.equal(
        await page.getByRole("button", { name: "Guardar imagen" }).isDisabled(),
        true,
      );
      const input = page.getByLabel("Añadir fotos al collage");
      assert.equal(await input.getAttribute("accept"), "image/*");
      for (const [file, message] of [
        [
          {
            name: "invalid.svg",
            mimeType: "image/svg+xml",
            buffer: Buffer.from("<svg/>"),
          },
          "Elige una imagen JPEG, PNG, WebP, HEIC o HEIF",
        ],
        [
          {
            name: "large.jpg",
            mimeType: "image/jpeg",
            buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
          },
          "La imagen debe pesar como máximo 10 MB",
        ],
        [
          {
            name: "broken.jpg",
            mimeType: "image/jpeg",
            buffer: Buffer.from("invalid-image"),
          },
          "No pudimos cargar una fotografía",
        ],
      ]) {
        await input.setInputFiles(file);
        await page.getByRole("alert").filter({ hasText: message }).waitFor();
        assert.equal(await page.locator(".pick-card").count(), 0);
      }
      const generatedImages = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 24;
        const context = canvas.getContext("2d");
        context.fillStyle = "#c75164";
        context.fillRect(0, 0, 24, 24);
        return ["image/png", "image/webp"].map((type) => ({
          name: "prueba." + (type === "image/png" ? "png" : "webp"),
          mimeType: type,
          encoded: canvas.toDataURL(type).split(",")[1],
        }));
      });
      const sampleFormats = [
        ...generatedImages.map(({ name, mimeType, encoded }) => ({
          name,
          mimeType,
          buffer: Buffer.from(encoded, "base64"),
        })),
        {
          name: "iphone.HEIC",
          mimeType: "image/heic",
          buffer: await readFile("tests/fixtures/sample.heic"),
        },
        {
          name: "iphone-alternativo.heif",
          mimeType: "application/octet-stream",
          buffer: await readFile("tests/fixtures/sample.heic"),
        },
      ];
      for (const file of sampleFormats) {
        await input.setInputFiles(file);
        await page.waitForFunction(
          () => document.querySelectorAll(".pick-card").length === 1,
        );
        assert.equal(
          await page
            .locator(".pick-image img")
            .evaluate((image) => image.naturalWidth > 0),
          true,
          file.name + " se puede mostrar",
        );
        await page
          .getByRole("button", {
            name: "Eliminar del collage: " + file.name.replace(/\.[^.]+$/, ""),
          })
          .click();
        assert.equal(await page.locator(".pick-card").count(), 0);
      }
      const files = await Promise.all(
        ["beach", "mountains", "city", "flowers", "sunset"].map(
          async (name, index) => ({
            name: "foto-" + (index + 1) + ".jpg",
            mimeType: "image/jpeg",
            buffer: await readFile("public/photos/" + name + ".jpg"),
          }),
        ),
      );
      await input.setInputFiles([
        ...files,
        {
          name: "omitida.svg",
          mimeType: "image/svg+xml",
          buffer: Buffer.from("<svg/>"),
        },
      ]);
      await page.waitForFunction(
        () => document.querySelectorAll(".pick-card").length === 5,
      );
      await page
        .getByRole("alert")
        .filter({ hasText: "omitida.svg" })
        .waitFor();
      assert.match(
        await page.locator(".selection-count").textContent(),
        /5 de 5/,
      );
      await input.setInputFiles([]);
      assert.equal(await page.locator(".pick-card").count(), 5);
      for (const [title, frame] of [
        ["Carta de amor", "carta"],
        ["Jardín romántico", "rosas"],
        ["Amor dorado", "dorado"],
        ["Lluvia de corazones", "corazones"],
      ]) {
        await page
          .getByRole("radio", { name: new RegExp("^" + title) })
          .click();
        await page.waitForFunction((style) => {
          const image = document.querySelector(".collage-preview");
          return (
            image?.dataset.frameStyle === style &&
            image.naturalWidth === 2000 &&
            image.naturalHeight === 1400
          );
        }, frame);
        assert.match(
          await page.locator(".export-note").textContent(),
          new RegExp(title),
        );
      }
      await page.getByRole("radio", { name: /^Carta de amor/ }).click();
      await page.keyboard.press("ArrowRight");
      assert.equal(
        await page
          .getByRole("radio", { name: /^Jardín romántico/ })
          .getAttribute("aria-checked"),
        "true",
      );
      await page
        .getByRole("button", {
          name: "Hacer protagonista: foto-4",
          exact: true,
        })
        .click();
      assert.equal(
        await page
          .locator(".pick-card")
          .filter({ hasText: "foto-4" })
          .locator(".protagonist")
          .textContent(),
        "Protagonista",
      );
      await page.waitForFunction(
        () => document.querySelector(".collage-preview")?.naturalWidth === 2000,
      );
      const preview = await page
        .locator(".collage-preview")
        .getAttribute("src");
      const downloading = page.waitForEvent("download");
      await page.getByRole("button", { name: "Guardar imagen" }).click();
      const download = await downloading;
      assert.equal(download.suggestedFilename(), "nosotros-collage.png");
      await download.saveAs("test-results/collage.png");
      const png = await readFile("test-results/collage.png");
      assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.equal(
        await page.evaluate(
          async ({ encoded, preview }) => {
            const load = (source) =>
              new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = source;
              });
            const exported = await load("data:image/png;base64," + encoded),
              shown = await load(preview);
            const pixels = (image) => {
              const canvas = document.createElement("canvas");
              canvas.width = image.naturalWidth;
              canvas.height = image.naturalHeight;
              const context = canvas.getContext("2d");
              context.drawImage(image, 0, 0);
              return context.getImageData(0, 0, canvas.width, canvas.height)
                .data;
            };
            const actual = pixels(exported),
              expected = pixels(shown);
            return (
              exported.naturalWidth === 2000 &&
              exported.naturalHeight === 1400 &&
              actual.every((value, index) => value === expected[index])
            );
          },
          { encoded: png.toString("base64"), preview },
        ),
        true,
        "El PNG coincide con la vista previa",
      );

      await page.evaluate(() => {
        Object.defineProperty(navigator, "canShare", {
          configurable: true,
          value: ({ files }) => files?.[0]?.type === "image/png",
        });
        Object.defineProperty(navigator, "share", {
          configurable: true,
          value: async ({ files, title }) => {
            window.__sharedImage = {
              name: files[0].name,
              type: files[0].type,
              size: files[0].size,
              title,
            };
          },
        });
      });
      await page.getByRole("radio", { name: /^Carta de amor/ }).click();
      await page.locator(".mobile-save-hint").waitFor();
      await page.getByRole("button", { name: "Guardar imagen" }).click();
      const shared = await page.evaluate(() => window.__sharedImage);
      assert.equal(shared.name, "nosotros-collage.png");
      assert.equal(shared.type, "image/png");
      assert.ok(shared.size > 0);
      assert.equal(shared.title, "Nuestro collage");

      const otherVisitor = await page.context().newPage();
      await otherVisitor.goto("http://127.0.0.1:5173/");
      await otherVisitor
        .getByRole("button", {
          name: "Probar el acomodo Recuerdo protagonista, 5 fotografías",
          exact: true,
        })
        .click();
      assert.equal(
        await otherVisitor.locator(".pick-card").count(),
        0,
        "Otra pestaña no ve las fotos de esta visita",
      );
      await otherVisitor.close();
      await page.keyboard.press("Escape");
      await page.getByRole("dialog").waitFor({ state: "hidden" });
      await page.evaluate(
        () =>
          new Promise((resolve, reject) => {
            const request = indexedDB.open("nosotros-album", 1);
            request.onupgradeneeded = () =>
              request.result.createObjectStore("legacy");
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
              const database = request.result;
              const transaction = database.transaction("legacy", "readwrite");
              transaction.objectStore("legacy").put("foto anterior", "current");
              transaction.oncomplete = () => {
                database.close();
                resolve();
              };
              transaction.onerror = () => reject(transaction.error);
            };
          }),
      );
      await page.reload();
      await page.waitForFunction(
        async () =>
          !(await indexedDB.databases()).some(
            (database) => database.name === "nosotros-album",
          ),
      );
      await page
        .getByRole("button", {
          name: "Probar el acomodo Recuerdo protagonista, 5 fotografías",
          exact: true,
        })
        .click();
      assert.equal(
        await page.locator(".pick-card").count(),
        0,
        "Al recargar se borran todas las fotos propias",
      );
      await page.keyboard.press("Escape");
      assert.equal(
        await page.evaluate(() => localStorage.length + sessionStorage.length),
        0,
      );
      assert.deepEqual(errors, []);
    } finally {
      await browser.close();
    }
  },
);
