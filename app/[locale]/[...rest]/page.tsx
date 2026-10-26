import { notFound } from "next/navigation";

// Captura cualquier ruta no definida dentro de /es o /en para mostrar not-found.tsx con el diseño del sitio.
export default function CatchAll() {
  notFound();
}
