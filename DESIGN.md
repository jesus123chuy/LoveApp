---
name: Nosotros
description: Álbum de recuerdos romántico y delicado, con fotografías protagonistas.
colors:
  terracotta: "#742646"
  ink: "#342538"
  paper: "#fff9f1"
  wine: "#4c233d"
  rose: "#8c2f52"
  gold: "#e8b94e"
  card: "#fffdf9"
  lavender: "#e7ddeb"
  editor: "#faf7fb"
typography:
  display:
    fontFamily: '"Cormorant Infant", Georgia, serif'
    fontSize: "clamp(42px, 5vw, 58px)"
    fontWeight: 600
    lineHeight: 1.08
  headline:
    fontFamily: '"Great Vibes", "Brush Script MT", cursive'
    fontSize: "clamp(46px, 4.8vw, 58px)"
    fontWeight: 400
    lineHeight: 1.15
  body:
    fontFamily: '"Cormorant Infant", Georgia, serif'
    fontSize: "17px"
    lineHeight: 1.55
  ui:
    fontFamily: '"Manrope", sans-serif'
    fontSize: "14px"
    lineHeight: 1.5
rounded:
  button: "30px"
  editor-button: "12px"
  card: "17px"
  section: "18px"
  dialog: "28px"
  badge: "20px"
spacing:
  button-gap: "8px"
  gallery-gap: "13px"
  section-gap: "14px"
  section-padding: "20px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta}"
    textColor: "#ffffff"
    rounded: "{rounded.button}"
    padding: "11px 20px"
  button-primary-hover:
    backgroundColor: "#511d3b"
  button-secondary:
    backgroundColor: "#eee5ef"
    textColor: "{colors.wine}"
    rounded: "{rounded.button}"
    padding: "11px 20px"
  gallery-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "10px"
  photo-badge:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.badge}"
---

# Design System: Nosotros

## Overview

**Creative North Star: "Álbum de recuerdos"**

La dirección confirmada es romántica y delicada, con fotografías protagonistas. La galería combina titulares expresivos, superficies claras y tarjetas redondeadas; el editor usa controles más sobrios para completar la tarea.

Las sombras ambientales sugieren capas de papel. Botones y tarjetas mantienen una presencia suave y delicada. Esta documentación recoge la implementación existente; no introduce un rediseño.

**Key Characteristics:**
- Fotografías protagonistas.
- Titulares serif y caligráficos, controles en sans serif.
- Acentos vino, papel crema y lavanda.
- Esquinas redondeadas y sombras suaves.

## Colors

La paleta confirmada combina vino, papel crema y lavanda, con detalles dorados.

### Primary
- **Vino:** `terracotta` conserva el nombre del token existente y se usa en acciones principales; `wine` aporta el tono profundo y `rose` destaca selecciones y detalles.

### Secondary
- **Lavanda:** fondos ambientales y superficies suaves del editor.
- **Dorado:** insignias de cantidad de fotos y detalles de marcos.

### Neutral
- **Papel crema:** fondo principal; `card` distingue las tarjetas.
- **Tinta ciruela:** texto principal y títulos del editor.

Los colores particulares de cada marco viven en `src/collage.ts`; no convierten automáticamente la interfaz global a la paleta del marco seleccionado.

## Typography

Cormorant Infant con alternativa Georgia aporta la voz serif del contenido. Great Vibes con alternativas cursivas se reserva para títulos expresivos y la marca. Manrope sirve a controles, etiquetas y al cuerpo del editor.

La jerarquía efectiva proviene de la cascada completa de `src/styles.css`, incluidas sus reglas finales. En móvil, el título principal usa `clamp(36px, 10vw, 48px)` y el de la galería `clamp(34px, 8vw, 42px)`. Los nombres de acomodo usan 29px en escritorio y 27px en móvil. El título del editor usa Cormorant Infant a 36px, reducido a 30px en móvil; los títulos de sus pasos usan Manrope a 15px y peso 700.

## Layout

Contenedor principal de hasta 1120px, centrado. La galería es un flex que permite varias filas, con separación de 13px y cuatro tarjetas por fila en escritorio; se adapta según los puntos de ruptura existentes. No reemplazar la cascada por supuestos tomados de una regla antigua.

El editor de escritorio mide hasta 760px y ocupa como máximo 92dvh, con cabecera y acciones fuera del cuerpo desplazable. Sus secciones usan 20px de espacio interno y 14px entre secciones. A 767px o menos se convierte en una hoja inferior de 90dvh; a 520px o menos los marcos se muestran en una columna. Respetar los márgenes de área segura del pie móvil.

## Elevation & Depth

Capas de papel con sombras ambientales, confirmadas por el usuario. La cabecera usa `0 2px 10px #34253812`; las tarjetas `0 3px 10px #24162720`, reforzadas al pasar el puntero con `0 10px 22px #1d142226`. El diálogo usa `0 28px 90px #34253838, 0 4px 18px #34253814`, sobre un fondo atenuado y desenfocado. Sus secciones internas son blancas y sin sombra.

## Shapes

Botones generales en cápsula; acciones del editor con esquinas más contenidas. Tarjetas, imágenes y secciones usan radios suaves. El diálogo móvil redondea solo las esquinas superiores. Los collages de corazón son formas de composición fotográfica; no es necesario trasladar ese contorno a todos los controles.

## Components

### Buttons

Acción principal vino con texto blanco, Manrope a 12px y peso 700. El estado hover oscurece el fondo y sube 1px. La variante secundaria usa lavanda clara y texto vino. Las acciones del editor tienen altura mínima de 44px y radio propio; en móvil comparten el ancho disponible. Deshabilitado reduce la opacidad a 0.45.

### Cards

Las tarjetas de ejemplo combinan imagen con proporción del collage, nombre serif, insignia dorada y acción en Manrope. Fondo papel claro, borde tenue, sombra ambiental y elevación breve al pasar el puntero.

### Upload Field

La carga es un selector de archivos dentro de un control amplio con icono y dos líneas de texto. En el editor usa fondo claro, radio de 14px y altura mínima de 96px; el input permanece accesible mediante su etiqueta. No representarlo como un campo de texto libre.

### Navigation

Cabecera centrada con la marca caligráfica y un pequeño corazón. Enlace para saltar al contenido visible al recibir foco. No existe un menú de navegación complejo.

### Chips and Frame Choices

Insignias redondeadas para cantidad de fotos y recomendaciones. Los marcos se eligen mediante opciones con muestra, nombre, explicación y estado seleccionado de fondo rosado claro.

### Dialog

Cabecera, cuerpo con desplazamiento y pie de acciones separados. Secciones de contenido blancas sobre lavanda muy clara. El cierre conserva etiqueta accesible; el diálogo admite Escape y el comportamiento de foco nativo.

## Do's and Don'ts

### Do:
- **Do** mantener las fotografías como contenido protagonista.
- **Do** usar Manrope para controles del editor y reservar la caligrafía para elementos expresivos.
- **Do** conservar el foco visible y el tratamiento de movimiento reducido existentes.
- **Do** consultar las reglas finales de la cascada antes de extraer medidas.

### Don't:
- **Don't** generalizar el color de un marco fotográfico a todo el sistema.
- **Don't** introducir sombras en cada sección del editor: las existentes usan capas tonales.
- **Don't** reemplazar los controles de tarea por tipografía caligráfica como efecto decorativo.
