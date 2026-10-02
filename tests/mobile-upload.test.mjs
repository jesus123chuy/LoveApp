import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium, devices } from "@playwright/test";
import { readFile } from "node:fs/promises";

test(
  "El selector móvil abre fotos y permite cargarlas sin randomUUID",
  { timeout: 120000 },
  async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const photo = await readFile("public/photos/beach.jpg");
      for (const device of ["iPhone 13", "Pixel 7"]) {
        const context = await browser.newContext({ ...devices[device] });
        await context.addInitScript(() => {
          Object.defineProperty(Crypto.prototype, "randomUUID", {
            configurable: true,
            value: undefined,
          });
        });
        const page = await context.newPage();
        await page.goto("http://127.0.0.1:5173/");
        await page
          .getByRole("button", {
            name: "Probar el acomodo Recuerdo protagonista, 5 fotografías",
          })
          .tap();
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          true,
          device + " no tiene desbordamiento horizontal",
        );
        const upload = page.getByLabel("Añadir fotos al collage");
        assert.equal(await upload.getAttribute("multiple"), "");
        const chooserPromise = page.waitForEvent("filechooser");
        await page.getByText("Subir fotos para el collage").tap();
        const chooser = await chooserPromise;
        await chooser.setFiles({
          name: "movil.jpg",
          mimeType: "image/jpeg",
          buffer: photo,
        });
        await page.waitForFunction(
          () => document.querySelectorAll(".pick-card").length === 1,
        );
        assert.match(
          await page.locator(".selection-count").textContent(),
          /1 de 5/,
        );
        await upload.setInputFiles([]);
        assert.equal(
          await page.locator(".pick-card").count(),
          1,
          device + " conserva fotos al cancelar",
        );
        await upload.setInputFiles({
          name: "segunda.jpg",
          mimeType: "image/jpeg",
          buffer: photo,
        });
        await page.waitForFunction(
          () => document.querySelectorAll(".pick-card").length === 2,
        );
        await page
          .getByRole("button", { name: "Eliminar del collage: movil" })
          .tap();
        assert.equal(await page.locator(".pick-card").count(), 1);
        await context.close();
      }
    } finally {
      await browser.close();
    }
  },
);
