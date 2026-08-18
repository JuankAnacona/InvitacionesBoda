# Plan inicial de la invitación web

## Objetivo
Crear una landing page para una invitación de boda, con una experiencia elegante, animada y responsive, sin persistencia ni backend.

## Flujo UX propuesto
1. Pantalla inicial: fondo completo con una imagen elegida como base visual.
2. En el centro aparece un pasaporte estilizado con un sello.
3. Al hacer clic en el sello, se activa la animación del pasaporte abriéndose.
4. Luego aparece la pantalla de selección de idioma: español e inglés.
5. Después del idioma, se continúa a la pantalla de bienvenida o detalle de la invitación.

## Stack sugerido
- Vite para levantar el proyecto rápido.
- HTML + CSS + JavaScript vanilla para mantenerlo ligero y fácil de desplegar.
- Animaciones con CSS (transform, rotateY, scale, blur, opacity).
- Deploy simple en Vercel o Netlify, sin servidor ni base de datos.

## Estructura base
- index.html
- src/main.js
- src/styles.css
- public/assets/
- README.md

## Recomendación de despliegue
- Vercel o Netlify por ser gratuitos y muy sencillos para páginas estáticas.
- No se requiere backend ni persistencia.
- Los activos visuales (fondo, pasaporte y animación) se alojan localmente o en un CDN simple.

## Criterios de diseño
- Fondo fijo o full-screen con imagen de fondo.
- Pasaporte central, elegante y con un sello como CTA principal.
- Animación lenta y sofisticada al abrir el pasaporte.
- Traducciones de interfaz en español e inglés.
- Layout responsive para móvil y desktop.

## Siguientes pasos
1. Crear la estructura base del proyecto.
2. Implementar la secuencia de animaciones.
3. Añadir pantallas de idioma y contenido principal.
4. Preparar el deploy en Vercel/Netlify.
5. Integrar las imágenes reales del fondo y pasaporte cuando estén disponibles.
