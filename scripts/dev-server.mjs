import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const projectId = createHash("sha256").update(root).digest("hex");
const mobile = process.argv.includes("--mobile");
const url = "http://127.0.0.1:5173";
const identityPath = "/__loveapp_dev_server";

async function reuseServer() {
  try {
    const response = await fetch(`${url}${identityPath}`, {
      signal: AbortSignal.timeout(1500),
    });
    const identity = await response.json();
    if (identity.projectId !== projectId) return false;
    if (mobile && !identity.mobile) {
      throw new Error("El servidor actual solo permite acceso local. Deténlo con Ctrl+C y ejecuta npm run dev:mobile.");
    }
    console.log(`El proyecto ya está en ejecución: ${url}/`);
    return true;
  } catch (error) {
    if (error.message?.startsWith("El servidor actual")) throw error;
    return false;
  }
}

try {
  if (!(await reuseServer())) {
    const server = await createServer({
      root,
      configLoader: "runner",
      server: { host: mobile ? "0.0.0.0" : "127.0.0.1", port: 5173, strictPort: true },
      plugins: [{
        name: "loveapp-dev-identity",
        configureServer(server) {
          server.middlewares.use(identityPath, (_request, response) => {
            response.setHeader("Content-Type", "application/json");
            response.setHeader("Cache-Control", "no-store");
            response.end(JSON.stringify({ projectId, mobile }));
          });
        },
      }],
    });
    try {
      await server.listen();
      server.printUrls();
      const stop = async () => { await server.close(); process.exit(0); };
      process.once("SIGINT", stop);
      process.once("SIGTERM", stop);
    } catch (error) {
      await server.close();
      if (!(await reuseServer())) throw error;
    }
  }
} catch (error) {
  console.error(`No se pudo iniciar el proyecto: ${error.message}`);
  process.exitCode = 1;
}
