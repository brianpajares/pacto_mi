# TODO(equipo): lo que falta completar

El sitio compila y se ve bien con todo esto vacío: cada pendiente muestra un estado «próximamente» útil. Prioridad según el
*Informe de enlaces y faltantes* (26 de octubre de 2026).

## Alta (bloquea el lanzamiento oficial)

- [ ] **LinkedIn:** URL de la página PACTO-MI → `content/site.json` (`linkedin`). Poner la URL del sitio en el campo «Sitio web» de la página.
- [ ] **Logos oficiales:** pedir a la GOR el sello de la Embajada y el logo USPA en vectorial. Hoy se usan recortes de la portada del informe (`public/logos/`, `scripts/crop-logos.mjs`).
- [ ] **Descargo de responsabilidad:** confirmar con la GOR el texto exacto (`messages/*.json` → `sponsor.disclaimer`).
- [ ] **Aprobación de Prensa de la Embajada** de la URL de vista previa antes de promover a producción.
- [ ] **Nombre oficial en español:** elegir «Red de Acción Juvenil…» o «Juventud en Acción…» (`content/site.json` → `officialName`).
- [ ] **Equipo:** validar cada bio en ES/EN, fotos con nombre y, si desean, LinkedIn personal (`content/people.json`).
- [ ] **Aliados:** confirmar participación efectiva y permiso de logo (`content/partners.json` → `confirmed`).
- [ ] **Formación:** calendario de los 6 módulos (fechas, modalidad, facilitadores), objetivos y materiales (`content/modules/*.json`); formulario de inscripción (`forms.registration`).
- [ ] **Ponencias:** programación completa del ciclo 2026, grabaciones (`youtubeId`), resúmenes y autorización de cada experto.
- [ ] **Madre de Dios:** fecha, sede, asistentes, organizaciones, panelistas, conclusiones y fotos con consentimiento (`content/events/madre-de-dios.json`).
- [ ] **Recursos:** toolkit digital, infografías, presentaciones de módulos; confirmar licencia (hoy: CC BY-NC 4.0).

## Media

- [ ] Fotos con consentimiento del taller de Cajamarca (galería) y verificar el nombre del panelista de Licare Perú (`content/people.json` → `licare-peru`).
- [ ] Confirmar la cifra de Cajamarca: 220 participantes (oficial) vs. 210 en el gráfico por organización.
- [ ] Formulario del directorio con consentimiento (`forms.directory`) y política de privacidad aprobada.
- [ ] Avance real de los indicadores (`content/indicators.json`).
- [ ] 3 notas de lanzamiento: taller de Cajamarca, taller de Madre de Dios, inicio de los 6 módulos.
- [ ] Decidir si el teléfono de contacto se publica como WhatsApp (`whatsapp`).
- [ ] Formulario de contacto (`forms.contact`).
- [ ] Revisar la curaduría editorial: qué lecturas externas se asocian a cada módulo (`content/resources/*.json` → `modules`).

## Baja

- [ ] Kit de réplica (carpeta de Drive → `replicationKit`) y guía de facilitación.
- [ ] Kit de prensa y vocero(a).
- [ ] Canal de YouTube del proyecto y redes (Facebook, Instagram) si existen.
- [ ] Dominio propio (p. ej. `pactomi.org`) en Vercel → Settings → Domains.
- [ ] Mapa de la red a nivel de provincia con datos reales (el componente ya agrega por provincia).
