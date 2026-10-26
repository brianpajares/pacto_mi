# Guía de edición (1 página)

Todo el contenido vive en la carpeta `content/`. Cada archivo se valida al compilar: si algo falta o está mal escrito,
el build falla y el mensaje indica **archivo y campo**. Los textos visibles son bilingües: `{ "es": "…", "en": "…" }`.
Si falta `en`, el sitio muestra el español con la etiqueta «Available in Spanish only» (nunca traducción automática).

## Antes de publicar cualquier cambio

1. Crea una rama y abre un *pull request* en GitHub → Vercel genera una **URL de vista previa**.
2. Envía esa URL a la GOR para la aprobación de la Oficina de Prensa de la Embajada.
3. Con el visto bueno, fusiona a `main` (producción). Agrega una línea en `content/changelog.json`.

## Qué editar para…

| Quiero… | Edito |
| --- | --- |
| Poner el enlace de LinkedIn, formularios o el kit de réplica | `content/site.json` (`linkedin`, `forms.*`, `replicationKit`) |
| Publicar un recurso (PDF, infografía, presentación) | Crear `content/resources/<slug>.json` (copia uno existente). En Drive: `"source": { "kind": "drive", "fileId": "…" }`; el peso va en `sizeMB` |
| Agregar una grabación | Completar `youtubeId` en `content/videos/<slug>.json` y escribir `summary` (5–8 viñetas) |
| Agregar una sesión o un taller | Crear `content/events/<slug>.json` |
| Completar un módulo | `content/modules/modulo-N.json`: `objectives`, `sessions` (fecha ISO, facilitadores), `evaluationUrl`, `status` |
| Confirmar un aliado | `content/partners.json` → `"confirmed": true` (solo con permiso de uso del logo) |
| Actualizar un indicador | `content/indicators.json` → `actual` y `asOf` |
| Publicar un líder del directorio | Solo desde la hoja privada, **después de revisar el consentimiento**: agregar a `content/leaders.json` (con `consentDate`) |
| Agregar una nota | Crear `content/news/<fecha>-<tema>.json` |

## Reglas que el build comprueba

- Nunca el monto del fondo ni el número de award. Nunca teléfonos de participantes.
- «los Estados Unidos» (no «Estados Unidos» a secas), «estadounidense» (no «americano»/«norteamericano»).
- Todas las claves de `messages/es.json` existen en `messages/en.json`, y viceversa.
- Las fotos de personas solo entran con `"consent": true` (si no, no compila).
- Fotos: WebP de máximo 1600 px en `public/images/eventos/<slug>/`.

## Nombres de archivos en Drive

`PACTO-MI_M{n}_{tipo}_{tema-corto}_{AAAA-MM}_{idioma}.pdf` — por ejemplo `PACTO-MI_M3_presentacion_impactos-ambientales_2026-10_es.pdf`.
