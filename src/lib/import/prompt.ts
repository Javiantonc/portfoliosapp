import { HEADING_FONTS, SECTOR_IDS } from '@/lib/schema/cv'
import { sectors } from '@/lib/sectors'

const sectorList = SECTOR_IDS.map((id) => `"${id}" (${sectors[id].label})`).join(', ')

/** Instrucciones para convertir un CV (texto o imágenes) en los datos de Relieve. */
export function buildImportPrompt(text: string) {
  return `Eres un extractor de datos de currículums para Relieve. Lee el CV adjunto y devuelve SOLO un objeto JSON, sin texto antes ni después, con esta forma exacta:

{
  "sector": string,            // uno de: ${sectorList}. Elige el que mejor encaje con la profesión.
  "personal": {
    "fullName": string,
    "headline": string,         // puesto o especialidad principal, breve (máx. 70 caracteres)
    "email": string,            // "" si no aparece
    "phone": string,
    "location": string,         // ciudad y país si aparecen
    "summary": string,          // el perfil o extracto del CV; si no hay, redacta 2 frases SOLO con información del CV (máx. 500 caracteres)
    "links": [{ "label": string, "url": string }]   // LinkedIn, GitHub, web personal…
  },
  "skills": [{ "name": string, "level": number }],  // 4-12 habilidades; level 0-100 estimado por años, certificaciones o nivel indicado (idiomas: C2=95, C1=85, B2=70, B1=55, A2=40). Si no hay pistas, 70.
  "experience": [{ "company": string, "role": string, "startDate": string, "endDate": string, "current": boolean, "description": string }],
  "education": [{ "institution": string, "degree": string, "startDate": string, "endDate": string }],
  "projects": [{ "title": string, "description": string, "url": string, "tags": [string] }],  // proyectos, publicaciones, obras, casos, campañas o logros destacados (máx. 6)
  "adaptation": {                // cómo adaptar el CV y el portfolio a ESTA profesión concreta
    "labels": {                  // nombres de los apartados tal y como se dicen en este trabajo (máx. 28 caracteres, sin dos puntos)
      "skills": string,          // p. ej. "Técnicas y especialidades" (fisioterapia), "Stack técnico" (desarrollo), "Áreas de práctica" (derecho)
      "experience": string,      // p. ej. "Trayectoria clínica", "Experiencia docente", "Trayectoria"
      "education": string,       // p. ej. "Formación y colegiación", "Formación académica"
      "projects": string,        // p. ej. "Casos y logros", "Obras", "Proyectos", "Campañas", "Menús y eventos"
      "contact": string          // invitación corta terminada en punto: "Pide tu cita.", "Hablemos.", "¿Trabajamos juntos?"
    },
    "accent": "#RRGGBB",         // color principal que evoque la profesión y su tono: sobrio en perfiles formales, vivo en creativos; debe leerse bien sobre blanco
    "headingFont": string,       // una de: ${HEADING_FONTS.filter((f) => f !== 'auto').join(', ')}. Serifas (fraunces, playfair) para perfiles formales o clásicos; grotescas (space, montserrat, outfit, lexend) para técnicos y de negocio; display (syne, bricolage) para creativos
    "shape": string,             // forma 3D del portfolio que mejor represente el oficio: core (esfera), knot (nudo), helix (hélice ADN: salud, ciencia), columns (columnas: derecho, instituciones), rings (anillos: educación), blocks (bloques: arquitectura, ingeniería), bars (barras: negocio, finanzas)
    "skillsLayout": string,      // orbit, cloud, bars o list
    "cvLayout": string,          // sidebar, classic (formal) o compact (cabecera de color)
    "portfolioTemplate": string, // stage (general), film (comunicación, audiovisual, periodismo, marketing creativo) o cosmos (tecnología, producto digital, innovación)
    "reason": string             // una frase (máx. 140 caracteres) que explique la adaptación al usuario, en su idioma
  }
}

Reglas:
- Usa solo información que aparezca en el CV. No inventes empresas, fechas, títulos ni datos de contacto.
- Mantén el idioma original del CV.
- Fechas en formato "AAAA-MM" (o "AAAA" si solo hay año). Si el puesto sigue activo: "current": true y "endDate": "".
- Ordena experiencia y formación de la más reciente a la más antigua.
- "description" de cada puesto: 1-2 frases con funciones y logros, en tus palabras pero fieles al CV (máx. 280 caracteres).
- Si un campo no aparece, usa "" o [].
- En "adaptation", piensa en el puesto real de la persona (no solo en el sector general): una fisioterapeuta, un abogado laboralista o un chef deben recibir nombres, color, tipografía y forma distintos.
${text.trim() ? `\nTexto extraído del CV:\n"""\n${text.slice(0, 40000)}\n"""` : '\nEl CV está en las imágenes adjuntas.'}`
}
