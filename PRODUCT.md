# Nosotros

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Parejas que quieren conservar o compartir sus recuerdos mediante collages de fotografías personales. Público y uso confirmados por el usuario durante la inicialización.

## Product Purpose

Convertir fotos propias en un collage romántico que pueda guardarse como imagen. El usuario completa su tarea cuando obtiene un PNG con el acomodo, las fotos y el marco que eligió.

## Positioning

Crear collages con acomodos y marcos preparados, procesando las fotografías en el dispositivo. La privacidad local y el flujo sin cuentas son condiciones confirmadas; no se ha establecido una afirmación de exclusividad frente a otros productos.

## Operating Context

Uso en navegador de escritorio o móvil, con fotografías del dispositivo. Flujo confirmado: elegir un acomodo, subir fotos, elegir un marco y guardar el PNG. Los ejemplos públicos permiten explorar los acomodos antes de abrir el creador.

## Capabilities and Constraints

Funcionamiento confirmado y detalles verificados en el código actual:

- Siete acomodos para exactamente 5, 7 o 9 fotos, incluidos tres con forma de corazón; siete marcos.
- Hasta nueve fotos por visita; carga múltiple, selección, eliminación y elección de foto protagonista o primera foto.
- JPEG, PNG y WebP; conversión local de HEIC/HEIF. El límite actual del código es 100 MB por archivo original.
- Exportación PNG de 2000 × 1400 px, con vista previa de la composición.
- Descarga en escritorio; compartir archivos en móviles cuando el navegador lo permite. Compartir depende de compatibilidad y contexto seguro.
- Sin cuentas ni almacenamiento de fotos en servidor. Las fotos propias viven en la memoria de la pestaña y desaparecen al recargar o cerrar; cerrar y reabrir el creador durante la misma visita conserva la selección.
- Los ejemplos públicos no se incorporan automáticamente a las fotos del usuario.
- Implementación existente: React, TypeScript, Vite y Tailwind CSS. Desarrollo con `npm run dev`; acceso desde la red local con `npm run dev:mobile`.

## Brand Commitments

Nombre existente: Nosotros. Interfaz en español y propósito romántico, centrado en recuerdos de pareja. La inicialización no establece nuevas decisiones de estética.

## Evidence on Hand

- `src/App.tsx`: interfaz y flujo del creador.
- `src/collage.ts`: acomodos, marcos, importación y exportación de imágenes.
- `public/photos/`: fotografías ilustrativas usadas en los ejemplos.
- `tests/`: pruebas existentes del producto.
- `README.md`: documentación de uso. Algunas cifras están desactualizadas respecto al código: menciona cuatro acomodos, cuatro marcos y 10 MB; el código actual contiene siete, siete y 100 MB. Esta inicialización registra la diferencia sin modificar ese documento.

No se han aportado testimonios, métricas de uso ni resultados comerciales.

## Product Principles

- Mantener las fotografías personales en el dispositivo y evitar exigir cuentas.
- Guiar un flujo breve desde un ejemplo hasta un collage guardado.
- Representar en la vista previa la composición que se exporta.
- Facilitar el uso con fotos propias tanto en escritorio como en móvil.

## Open Decisions

No se han definido monetización, métricas de negocio, expansión a otros públicos ni requisitos de accesibilidad específicos del producto.
