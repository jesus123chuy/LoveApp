import { test } from "node:test";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";

test(
  "Archivos engañosos y fallos de PNG muestran errores sin ejecutar contenido",
  { timeout: 30000 },
  async () => {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      const requests = [];
      page.on("request", (request) => requests.push(request.url()));
      await page.addInitScript(() => {
        HTMLCanvasElement.prototype.toBlob = function (callback) {
          callback(null);
        };
      });
      await page.goto("http://127.0.0.1:5173/");
      await page
        .getByRole("button", {
          name: "Probar el acomodo Recuerdo protagonista, 5 fotografías",
        })
        .click();
      const input = page.getByLabel("Añadir fotos al collage");
      await input.setInputFiles({
        name: "archivo.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" onload="window.__qaXss=1"><image href="http://127.0.0.1:5173/qa-leak"/></svg>',
        ),
      });
      await page
        .getByRole("alert")
        .filter({ hasText: "No pudimos cargar" })
        .waitFor();
      assert.equal(await page.locator(".pick-card").count(), 0);
      assert.equal(await page.evaluate(() => window.__qaXss), undefined);
      assert.deepEqual(
        requests.filter((url) => url.includes("qa-leak")),
        [],
      );

      const photo = await readFile("public/photos/beach.jpg");
      const dangerousName = '<img src=x onerror="window.__qaXss=1">.jpg';
      await input.setInputFiles(
        Array.from({ length: 5 }, (_, i) => ({
          name: i === 0 ? dangerousName : `segura-${i}.jpg`,
          mimeType: "image/jpeg",
          buffer: photo,
        })),
      );
      await page
        .getByRole("alert")
        .filter({ hasText: "No pudimos preparar el PNG" })
        .waitFor();
      assert.equal(await page.locator(".pick-card").count(), 5);
      assert.equal(
        await page.locator(".pick-title").first().textContent(),
        dangerousName.slice(0, -4),
      );
      assert.equal(await page.evaluate(() => window.__qaXss), undefined);
      assert.equal(
        await page.getByRole("button", { name: "Guardar imagen" }).isDisabled(),
        true,
      );
    } finally {
      await browser.close();
    }
  },
);
