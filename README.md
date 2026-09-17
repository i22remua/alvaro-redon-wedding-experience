# Álvaro Redon · Cuestionario musical de boda

Web pública y responsive para que cada pareja complete el cuestionario antes de la boda. Las respuestas se guardan en Supabase y se consultan desde un panel privado en `/admin`.

## Qué incluye

- Formulario público basado en el cuestionario de Álvaro Redon.
- Diseño blanco / negro / dorado, adaptado a móvil.
- Datos de boda, coordinación, perfil de invitados, imprescindibles/prohibidas, matriz de estilos, preferencias y detalles.
- Guardado en Supabase.
- Panel privado `/admin` con inicio de sesión.
- Buscador de parejas.
- Vista completa de cada respuesta.
- Exportación de todas las respuestas a CSV.
- RLS: un visitante puede enviar, pero no leer respuestas.

## 1. Crear Supabase

1. Entra en https://supabase.com y crea un proyecto gratuito.
2. Abre `SQL Editor`.
3. Crea una consulta nueva, pega el contenido de `supabase/schema.sql` y pulsa `Run`.
4. Ve a `Authentication > Providers > Email` y asegúrate de que email/password está habilitado.
5. IMPORTANTE: desactiva los registros públicos de nuevos usuarios si aparece la opción de permitir signups.
6. Ve a `Authentication > Users > Add user` y crea tu usuario administrador (tu correo + una contraseña fuerte).

## 2. Obtener las claves públicas de Supabase

En Supabase ve a `Project Settings > API` (o `Settings > API`) y copia:

- Project URL
- anon / publishable key

La clave `anon` es pública por diseño. NO pongas nunca la `service_role` en esta web.

## 3. Configurar el proyecto

Copia `.env.example` como `.env`:

```bash
cp .env.example .env
```

Y completa:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_CLAVE_ANON_PUBLICA
```

## 4. Probar en local

Necesitas Node.js 20 o superior.

```bash
npm install
npm run dev
```

- Formulario: http://localhost:5173/
- Panel privado: http://localhost:5173/admin

## 5. Publicar gratis en Vercel

### Opción recomendada: GitHub + Vercel

1. Crea un repositorio en GitHub y sube este proyecto.
2. Entra en https://vercel.com y pulsa `Add New > Project`.
3. Importa el repositorio.
4. Vercel detectará Vite automáticamente.
5. En `Environment Variables`, crea:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Pulsa `Deploy`.
7. Obtendrás una URL pública tipo `https://tu-proyecto.vercel.app`.

Tu enlace para los novios será esa URL. Tu panel será:

`https://tu-proyecto.vercel.app/admin`

## 6. Cómo ver lo que ha rellenado cada pareja

1. Entra en `/admin`.
2. Inicia sesión con el usuario que creaste manualmente en Supabase.
3. Verás todas las bodas ordenadas por fecha.
4. Pulsa una tarjeta para ver el cuestionario completo.
5. Usa `Exportar CSV` para guardar una copia en Excel/Numbers.

También puedes ver los datos directamente en Supabase desde `Table Editor > wedding_responses`.

## Seguridad

- El navegador solo usa la clave pública `anon` de Supabase.
- RLS impide que visitantes anónimos lean las respuestas.
- El panel requiere un usuario autenticado.
- No se incluye ninguna clave `service_role` en el frontend.
- No hay políticas para editar o borrar respuestas desde la web.

Para un uso normal de bodas este planteamiento es sencillo y suficiente. Si el enlace llegase a recibir spam, el siguiente paso sería añadir Cloudflare Turnstile al envío.

## Personalización rápida

- Colores y estilos: `src/styles.css`.
- Textos/campos del formulario: `src/pages/FormPage.tsx`.
- Lista de estilos musicales: `src/lib/types.ts`.
- Panel privado: `src/pages/AdminPage.tsx`.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```
