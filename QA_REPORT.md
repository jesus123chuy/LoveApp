# Informe de QA — 2 de octubre de 2026

## Alcance y resultado

Se verificó el creador de collages en Chromium de escritorio, Chromium con emulación Android y WebKit con emulación iPhone. Las cuatro pruebas automatizadas pasan. La compilación de producción y la comprobación de TypeScript pasan; la versión compilada responde con HTTP 200 y muestra los cuatro ejemplos sin errores de JavaScript.

## Funcionalidad

| Área | Comprobación | Resultado |
| --- | --- | --- |
| Acomodos | Cuatro distribuciones para 5, 5, 7 y 9 fotografías; selección y cambio de protagonista | Correcto |
| Fotos | Selección múltiple y por tandas, cancelación, eliminación, límite de nueve, JPEG/PNG/WebP/HEIC y rechazo de archivos dañados o mayores de 10 MB | Correcto en emulación |
| Marcos y exportación | Cuatro marcos; vista previa coincide con PNG de 2000 × 1400; descarga en Chromium y WebKit; flujo de compartir simulado | Correcto |
| Privacidad | Otra pestaña no ve las fotos; recargar borra las fotos; no hay almacenamiento nuevo ni solicitudes de subida | Correcto |
| Errores | Archivo SVG disfrazado de PNG, nombre de archivo con HTML y fallo de `canvas.toBlob` | Rechazo o aviso visible, sin ejecución de código |

## Diseño y accesibilidad

Se revisaron capturas a 375, 768 y 1440 px, además de los editores Android e iPhone emulados. No se observó desplazamiento horizontal. Los botones de selección y eliminación en móvil tienen 44 px de altura mínima. La auditoría axe-core con reglas WCAG 2 A/AA y 2.1 A/AA no reportó violaciones en galería ni editor, tanto en escritorio como en móvil.

## Correcciones realizadas

- Aviso claro cuando el navegador no puede crear el PNG; la descarga permanece deshabilitada.
- Mejora del contraste de textos secundarios detectados por la auditoría de accesibilidad.
- Aumento de las áreas táctiles de los controles pequeños del editor móvil.
- Cálculo más ligero de la firma de la vista previa, sin copiar imágenes codificadas a una cadena adicional.
- Carga de configuración de Vite mediante `runner` para evitar un error de compilación con archivos de OneDrive.
- Prueba automatizada de archivos engañosos, nombres maliciosos y fallos de exportación.

## Limitaciones de esta ejecución

- No hay acceso a teléfonos físicos. El selector nativo de Fotos y sus avisos del sistema requieren validación manual en Android y iPhone reales.
- Playwright Firefox no pudo iniciar en este entorno (`spawn UNKNOWN`); esto no demuestra un fallo de la web en Firefox.
- Una auditoría de dependencias anterior informó cero vulnerabilidades. El último reintento de `npm audit` no pudo contactar el endpoint del registro, por lo que ese resultado no se pudo actualizar.
- Un servidor de desarrollo **nuevo** dentro de este entorno de OneDrive inicia, pero la optimización de dependencias de esbuild falla al leer archivos con puntos de reanálisis. La sesión de desarrollo ya abierta y `npm run preview` de la compilación funcionan. Conviene ejecutar una instalación limpia en una carpeta local no sincronizada para verificar ese flujo.
- El conversor HEIC se carga solo cuando se elige ese formato; su archivo de producción es grande (aprox. 341 KB comprimidos). Conviene observar memoria y tiempo de conversión con fotos grandes en teléfonos reales.

## Comandos

`npm test` — 4/4 pruebas. `npm run build` — correcto. `npx tsc -b --pretty false` — correcto.
