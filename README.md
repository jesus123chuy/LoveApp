# Nosotros

Creador de collages responsivo en React, TypeScript, Vite y Tailwind CSS. Incluye cuatro acomodos para 5, 7 y 9 fotos, cuatro marcos románticos y descarga PNG.

## Iniciar

Requiere Node.js 22 o posterior.

```sh
npm install
npm run dev
```

Abre la dirección que muestra Vite. Para comprobar tipos y generar la versión de producción: `npm run build`. Para verla: `npm run preview`.

Para probar desde un teléfono en la misma red Wi-Fi, ejecuta `npm run dev:mobile` y abre en Safari o Chrome la dirección **Network** que imprime Vite, por ejemplo `http://192.168.x.x:5173/`. `127.0.0.1` en el teléfono apunta al propio teléfono. Si la red bloquea la conexión, permite a Node/Vite el acceso en la red local. Para probar la hoja móvil de «Guardar imagen», usa una publicación HTTPS: la Web Share API requiere un contexto seguro.

## Personalizar

- Textos, componentes e interacción: `src/App.tsx`.
- Colores, tipografía y adaptación: `src/styles.css`, con Tailwind CSS 4 y tokens en `@theme`.
- Acomodos, capacidades, marcos y exportador: `src/collage.ts`.
- Fotos de los ejemplos públicos: `examplePhotos`, en `src/collage.ts`, y `public/photos/`.

La galería principal muestra ejemplos ilustrativos. Al pulsar «Crear con este acomodo», el editor se abre con ese diseño y su marco seleccionado. Los ejemplos no se agregan al editor: cada visita empieza sin fotografías propias.

Elige un ejemplo para abrir el creador: Recuerdo protagonista (5 fotos), Historia panorámica (5), Siete momentos (7) o Mosaico de amor (9). También puedes cambiar el acomodo dentro del editor. Selecciona exactamente la cantidad de fotos del diseño. «Destacar» cambia la protagonista; en el mosaico, «Poner primero» cambia la primera foto de la cuadrícula.

Puedes subir hasta nueve fotos con selección múltiple desde escritorio o móvil. Al tocar «Subir fotos para el collage» en Android o iPhone, se abre el selector del sistema para elegir fotos del dispositivo; esa selección concede acceso solo a las fotos elegidas y el navegador decide si muestra algún aviso adicional. No se fuerza la cámara. Se aceptan JPEG, PNG y WebP, además de HEIC/HEIF de iPhone, que se convierten localmente a JPEG. El límite es de 10 MB por archivo original. Las fotos se seleccionan primero y se mantienen al cerrar y reabrir el creador durante la visita. Si falta alguna para completar el acomodo, se indica cuántas necesitas. Quitar fotos libera espacio para otras.

Combina cualquier acomodo con uno de los cuatro marcos: lluvia de corazones, carta de amor, jardín romántico y amor dorado. La composición de la vista previa coincide con el PNG descargado de 2000 × 1400 px; los recortes mantienen las proporciones de cada fotografía. «Guardar imagen» descarga el PNG en escritorio; en móviles compatibles abre la hoja para compartir, donde puedes elegir guardarlo en Fotos.

Las fotos propias viven solo en la memoria de esa pestaña. Al recargar o cerrar la página se borran. No se guardan en el navegador, no se envían a un servidor y no se comparten entre visitantes. La aplicación también intenta borrar las fotos que versiones anteriores guardaban en IndexedDB; si otra pestaña antigua mantiene ese almacenamiento abierto, ciérrala para permitir la limpieza.

## Verificar

Con el servidor de desarrollo en ejecución en `http://127.0.0.1:5173`, ejecuta `npm test`. Las pruebas de navegador comprueban los cuatro acomodos y sus capacidades, carga múltiple, validación de archivos, selección, eliminación, los cuatro marcos, PNG descargado, hoja de compartir y privacidad por visita. Comprueban la posición de cada imagen en los PNG exportados, la coincidencia con la vista previa y la ausencia de desbordamiento a 375, 768 y 1440 px. Usan contextos de navegador aislados y generan capturas en `test-results/`. El selector y los avisos del sistema deben confirmarse en teléfonos reales con Safari y Chrome.

Si Chromium no está instalado para Playwright, ejecuta `npx playwright install chromium`. Para formatear el código: `npx prettier --write src tests`.

Las fotografías ilustrativas proceden de Unsplash y se sirven localmente. Las tipografías usan Google Fonts con alternativas locales. Las fotos que subas no se envían a ningún servicio.

La imagen HEIC de prueba procede del [proyecto heic2any](https://github.com/alexcorvi/heic2any/tree/master/demo), distribuido bajo licencia MIT.

## Publicar en Vercel

Sube este proyecto a un repositorio Git e impórtalo en Vercel. Usa la raíz del proyecto, el preset **Vite**, `npm run build` como comando de compilación y `dist` como directorio de salida. No se necesitan variables de entorno ni servicios adicionales. Antes de publicar, confirma que `npm run build` termina correctamente.

La web publicada usa HTTPS, necesario para que los móviles compatibles ofrezcan la hoja de compartir imágenes. Las fotografías elegidas por cada visitante se procesan en su navegador y desaparecen al recargar.
