# PACTO-MI · Plataforma digital de conocimiento y recursos

Sitio bilingüe (español / inglés) de **PACTO-MI — Plataforma de Acción contra la Minería Ilegal**, proyecto ganador del
Alumni Engagement Innovation Fund (AEIF) 2025, con el auspicio de la Embajada de los Estados Unidos en el Perú.

Construido según el *PRD v1.0* (26 de octubre de 2026) y el *Informe de enlaces y faltantes*.

- **Stack:** Next.js 16 (App Router, páginas estáticas) · React 19 · TypeScript estricto · Tailwind CSS v4 · next-intl · Zod.
- **Costo de operación:** $0 (Vercel Hobby + GitHub + Google Drive + YouTube).
- **Contenido:** archivos JSON en [`/content`](content) validados con Zod en cada build; textos de interfaz en [`/messages`](messages).
- **Sin base de datos ni cookies propias.** Analítica con Vercel Web Analytics (sin cookies).

## Comandos

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # lint:content + compilación (falla si el contenido incumple las reglas)
npm run start          # sirve el build
npm run lint:content   # reglas de marca y privacidad (R-00a, R-00c, R-108, R-110)
npm run check:links    # verifica enlaces externos del contenido (R-13)
npm run qa             # pruebas de aceptación AT-01…AT-09 contra un sitio en ejecución (requiere `npx playwright install chromium`)
npm run build:map      # regenera el mapa del Perú en curvas de nivel (content/geo, public/patterns)
```

## Cómo editar el contenido

Lee [`docs/GUIA-DE-EDICION.md`](docs/GUIA-DE-EDICION.md) (1 página). Lo pendiente por completar por el equipo está en
[`docs/TODO-EQUIPO.md`](docs/TODO-EQUIPO.md).

## Reglas innegociables

1. **R-00a** El monto del fondo AEIF nunca aparece en el sitio (el build lo verifica).
2. **R-00b** Toda página muestra el auspicio de la Embajada y el logo de la Red de Becarios (USPA), sobre blanco y con el mismo diámetro.
3. **R-00c** Ningún dato de contacto personal de participantes o líderes se publica. El directorio es opt-in y mediado.

## Publicación con aprobación de la Embajada (R-140)

Cada cambio se publica primero en una URL de vista previa de Vercel (rama o *pull request*); solo después de la aprobación
de la Oficina de Prensa de la Embajada se fusiona a `main`, que despliega a producción.
