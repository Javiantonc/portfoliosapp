# Relieve

![Relieve](public/logo-relieve.svg)

Tu CV, en relieve.

SaaS para crear tu CV y convertirlo automáticamente en un portfolio web interactivo en 3D, para cualquier profesión.

- **Sectores**: tecnología, creatividad, salud, derecho, educación, hostelería, ingeniería y empresa. Cada uno adapta los textos del formulario, el diseño del CV (lateral, clásico o con cabecera de color) y el escenario 3D (paleta, forma principal y tipografía). Todo se define en `src/lib/sectors.ts`; añadir un sector nuevo es añadir una entrada ahí y un CV de ejemplo en `src/lib/demo-data.ts`.

- **Editor**: perfil y foto, habilidades con nivel, experiencia, formación y proyectos. Se guarda solo (localStorage).
- **CV 2D**: hoja A4 limpia, descargable como PDF desde el diálogo de impresión.
- **Portfolio 3D**: nombre en texto 3D, habilidades en órbita, trayectoria y tarjetas de proyecto que reaccionan al ratón y al scroll.

## Arranque

```bash
npm install
npm run dev            # http://localhost:3000
```

Rutas: `/` landing · `/editor` · `/cv` · `/portfolio`

## Estructura

```
src/
├── app/                      # Rutas Next.js (páginas finas)
├── features/
│   ├── landing/              # Página de inicio
│   ├── cv-editor/            # ENTRADA de datos (react-hook-form + zod)
│   ├── cv-document/          # CV 2D e impresión
│   └── portfolio-3d/         # VISUALIZACIÓN (R3F). Solo recibe `CV` por props
├── lib/
│   ├── schema/cv.ts          # Esquema Zod: fuente de verdad
│   ├── sectors.ts            # Sectores: textos, tema 3D y diseño de CV
│   ├── demo-data.ts          # Un CV de ejemplo por sector
│   ├── store/cv-store.ts     # Zustand + persistencia
│   ├── nav.tsx               # Enlaces agnósticos del framework
│   └── supabase/client.ts    # Opcional: subida de fotos y guardado
├── assets/                   # Fuente tipográfica para Text3D
└── styles/globals.css        # Tokens de diseño (Tailwind v4)
preview/                      # Entrada Vite para la vista previa estática
supabase/migrations/          # Esquema de base de datos
```

## Supabase (opcional)

1. Crea un proyecto y ejecuta `supabase/migrations/0001_init.sql`.
2. Crea `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Sin estas variables la app funciona igual, en modo local.

## Otros comandos

```bash
npm run preview:build                 # build estático en dist-preview/
npm run typeface -- fuente.woff out.json   # convierte una fuente para Text3D
```

## Asistente virtual

Chat de ayuda flotante («¿Dudas?») en todas las páginas. Las reglas y la información del servicio están en `src/lib/assistant/prompt.ts`.

Para activarlo en la app, añade a `.env.local`:

```
ANTHROPIC_API_KEY=...
# opcional, por defecto claude-haiku-5-5
ASSISTANT_MODEL=claude-haiku-5-5
```

La ruta `src/app/api/assistant/route.ts` llama a la API de Anthropic con esas instrucciones y devuelve la respuesta en streaming. Sin clave, el chat muestra que el asistente no está disponible.

## Formulario de contacto del portfolio

Cada portfolio tiene un formulario en la sección final. Se configura en el editor, apartado **Contacto**:
correo de destino (por defecto, el del perfil), forma de envío y textos.

### Cómo llega el mensaje al correo de la persona

**Opción A — «Enviar a mi correo» (recomendada).** El navegador envía el mensaje a `/api/contact` y el servidor
lo reenvía por email con [Resend](https://resend.com). El correo llega con *Responder a* = email del visitante,
así la persona contesta directamente desde su bandeja.

1. Crea una cuenta en Resend y verifica tu dominio (o usa `onboarding@resend.dev` para pruebas).
2. Añade a `.env.local`:

```
RESEND_API_KEY=re_...
CONTACT_FROM="Relieve <portfolio@tudominio.com>"
```

3. En producción, el destinatario **no** lo decide el navegador: el servidor lo busca en Supabase a partir del
   portfolio publicado (`/p/[slug]`), para que nadie pueda usar tu servidor para enviar spam a otras direcciones.
   Para probar en local sin Supabase, añade `CONTACT_ALLOW_CLIENT_RECIPIENT=true` (nunca en producción).

Protección incluida: campo trampa para bots, validación de datos y límite de 5 mensajes cada 10 minutos por IP.
Para varios servidores, cambia el límite en memoria por uno compartido (por ejemplo, Upstash Redis).

**Opción B — «Abrir el correo del visitante».** No necesita servidor: se abre el programa de correo del visitante
(`mailto:`) con el mensaje preparado. Es menos fiable porque depende de que el visitante tenga uno configurado.

## Importar un CV existente

Desde la portada («Ya tengo CV: crear mi portfolio») o el editor («Importar CV»). El navegador extrae el texto del
archivo (PDF con pdf.js, Word con mammoth, TXT; las fotos y los PDF escaneados se envían como imagen) y
`src/app/api/import-cv/route.ts` lo convierte en los datos del editor con la API de Anthropic
(`ANTHROPIC_API_KEY`; modelo configurable con `IMPORT_MODEL`, por defecto `claude-sonnet-5-5`).
Las instrucciones están en `src/lib/import/prompt.ts` y la limpieza de datos en `src/lib/import/normalize.ts`.

El worker de pdf.js se copia a `public/pdf.worker.min.js` al ejecutar `npm install` (script `postinstall`).

## Relieve Premium

- CV: plantillas **Editorial** y **Impacto** (`src/features/cv-document/PremiumLayouts.tsx`).
- Portfolio: plantillas **Cine** y **Cosmos** (`src/features/portfolio-premium/`).
- Escaparate en la portada y diálogo Premium con ejemplos reales (`src/features/premium/`).

Las plantillas Premium se pueden probar gratis en la vista previa. Para descargarlas o publicarlas hay dos compras
de **pago único** (`src/lib/pricing.ts`):

| Producto | Precio | Incluye |
| --- | --- | --- |
| CV + Portfolio Premium (`bundle`) | 1,99 € | CV Editorial e Impacto + portfolios Cine y Cosmos |
| Portfolio Premium (`portfolio`) | 1 € | Solo los portfolios Cine y Cosmos |

### Pagos con Stripe

1. Crea una cuenta en [Stripe](https://dashboard.stripe.com) y copia la clave secreta en `STRIPE_SECRET_KEY`.
2. Opcional: `NEXT_PUBLIC_SITE_URL` (URL pública, para las páginas de vuelta del pago).
3. Webhook: en Stripe, añade el endpoint `https://TU-DOMINIO/api/stripe/webhook` con el evento
   `checkout.session.completed` y guarda el secreto en `STRIPE_WEBHOOK_SECRET`. Con `SUPABASE_SERVICE_ROLE_KEY`
   y la migración `supabase/migrations/0002_purchases.sql`, cada compra queda registrada en la tabla `purchases`.

Flujo: `POST /api/checkout` crea la sesión de Stripe Checkout → el usuario paga → vuelve a
`/editor?checkout=success&session_id=…` → `GET /api/checkout/verify` comprueba el pago y se activa la compra.
Sin `STRIPE_SECRET_KEY` el botón muestra «pagos no configurados»; en la vista previa estática la compra se simula.

> Importante: ahora la compra activada se guarda en el navegador. Antes de lanzar, vincula las compras a la cuenta
> del usuario (Supabase Auth + tabla `purchases`) y comprueba el derecho en el servidor al publicar o descargar.
