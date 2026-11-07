# VideoHub

Plataforma web para publicar, explorar y reproducir contenido audiovisual, inspirada en servicios como YouTube, Vimeo y Dailymotion. Proyecto de **Tecnologías de Desarrollo en el Servidor (ESI3944N)** – ITESO, otoño 2026.

Documento del proyecto (versión 2): [`documentacion.docx`](./documentacion.docx)

## Descripción del proyecto

VideoHub ofrece a comunidades pequeñas (grupos académicos, aficionados, proyectos internos) un espacio propio, simple y sin publicidad para compartir video, sin depender de las grandes plataformas comerciales.

Los usuarios pueden:

- **Crear una cuenta y administrar su perfil**, y consultar los perfiles públicos y los videos de otros usuarios.
- **Publicar videos** con título, descripción, categoría y dirección del contenido, además de editarlos y eliminarlos. Cada video registra sus reproducciones.
- **Explorar el catálogo**: buscar por título, filtrar por categoría y ordenar por fecha o por reproducciones.
- **Interactuar**: comentar videos (y editar o borrar sus propios comentarios) y dar o quitar "me gusta".
- **Organizar el contenido en categorías**, administradas por usuarios autorizados.

El proyecto es un **monorepo**: en un mismo repositorio viven la **API REST** (`/api`, responde JSON), que contiene la lógica de negocio y la persistencia, y las **vistas** (HTML generado en el servidor con Handlebars), que consumen los mismos datos de la base de datos. La información se guarda en **MongoDB**, una base NoSQL que se ajusta bien a entidades semiestructuradas como videos con metadatos, comentarios y reacciones.

## Herramientas utilizadas

| Herramienta | Para qué se usa |
|---|---|
| **Node.js + TypeScript** | Plataforma y lenguaje del servidor, con tipado estático. |
| **Express 5** | Define las rutas, los middlewares y los controladores de la API y de las vistas. |
| **MongoDB** | Base de datos NoSQL principal. |
| **Mongoose** | ODM: esquemas, validaciones, índices únicos y relaciones entre colecciones. |
| **Zod** | Validación de `body`, `params` y `query` antes de llegar al controlador. |
| **Handlebars** (`express-handlebars`) | Motor de plantillas para las vistas HTML. |
| **bcrypt** | Hash de contraseñas (nunca se guardan en texto plano). |
| **dotenv** | Variables de entorno desde el archivo `.env`. |
| **cors** | Control de acceso entre orígenes. |
| **Docker / Docker Compose** | Levanta la base de datos MongoDB local. |
| **tsx** | Ejecución de TypeScript en desarrollo (`npm run dev`) y del seed. |
| **rimraf** | Limpia la carpeta `dist/` antes de compilar. |
| **Postman** | Colección de peticiones autenticadas y casos de seguridad. |
| **AWS SDK for JavaScript** | Acceso del vertical slice de videos a DynamoDB. |
| **Docker** | Empaquetado del backend para ejecutarlo en EC2. |

`jsonwebtoken` se usa para la autenticación de la entrega 2. `multer` queda reservado para la subida de archivos.

## Requisitos

- Node.js **22.23.3 o superior**
- Git
- Docker (con Docker Desktop abierto, si usas Windows o Mac)

## Cómo levantar el proyecto

### 1. Obtener el código de la entrega

```bash
git clone https://github.com/khanjurt/ProyTecDesServ.git
cd ProyTecDesServ
git checkout entrega-2
```

`entrega-2` es la etiqueta del commit de `main` que corresponde a esta entrega.

### 2. Instalar dependencias y crear el `.env`

```bash
npm ci
cp .env.example .env        # en Windows: copy .env.example .env
```

La base de datos ya apunta al MongoDB local del siguiente paso. Solo hay que llenar las **tres variables de Google** siguiendo [Configurar el login con Google](#configurar-el-login-con-google-paso-a-paso). `JWT_SECRET` es obligatorio (el servidor no arranca sin él): el valor de ejemplo sirve para desarrollo, pero en un entorno real debe ser una cadena larga y aleatoria.

| Variable | Descripción | Valor por defecto |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `MONGODB_URI` | Conexión a MongoDB | `mongodb://127.0.0.1:27017/videohub` |
| `JWT_SECRET` | Secreto para firmar tokens | Define un valor largo y aleatorio |
| `JWT_EXPIRES_IN` | Vigencia del token | `2h` |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | Credencial de tu proyecto |
| `GOOGLE_CLIENT_SECRET` | Client secret de Google OAuth | Credencial de tu proyecto |
| `GOOGLE_CALLBACK_URL` | Callback registrado en Google | `http://localhost:3000/api/auth/google/callback` |

### 3. Levantar la base de datos (MongoDB en Docker)

Desde la raíz del proyecto, donde está `docker-compose.yml`:

```bash
docker compose up -d
```

Con `docker ps` debe aparecer el contenedor `videohub-mongo`. No hay migraciones: MongoDB crea las colecciones y los índices al arrancar el servidor.

### 4. Cargar los datos de prueba (seed)

```bash
npm run seed
```

Borra las colecciones y las llena con 6 usuarios, 6 categorías, 12 videos, 18 comentarios y 27 reacciones, con relaciones coherentes. Se puede ejecutar varias veces sin errores ni duplicados.

Cuentas de prueba:

| Rol | Correo | Contraseña |
|---|---|---|
| admin | `admin@videohub.com` | `Admin123!` |
| user | `maria@videohub.com` (también `carlos`, `ana`, `luis` y `sofia` @videohub.com) | `Usuario123!` |

### 5. Compilar y arrancar el servidor

```bash
npm run build && npm start
```

- Vistas: <http://localhost:3000>
- API: <http://localhost:3000/api>

Si no puede conectarse a MongoDB, el servidor muestra un mensaje claro y termina el proceso.

## Entrega intermedia de Desarrollo en la Nube

La entrega intermedia implementa un vertical slice desplegable en AWS:

- `GET /api/cloud/videos` consulta el catálogo en DynamoDB.
- `POST /api/cloud/videos` publica un video en DynamoDB.
- `GET /api/cloud/videos/:id` consulta un video por su clave primaria.

En AWS, API Gateway expone estos métodos y los integra por HTTP proxy con un contenedor Docker en EC2. El contenedor usa `CLOUD_MODE=true` para omitir MongoDB y conectarse únicamente a DynamoDB mediante el rol de la instancia. En desarrollo local, `CLOUD_MODE=false` mantiene el flujo original con MongoDB.

### Ejecutar el backend cloud localmente

```bash
copy .env.example .env
npm run build
docker build -t videohub-cloud .
docker run --rm -p 3000:3000 `
  -e CLOUD_MODE=true `
  -e AWS_REGION=us-east-1 `
  -e DYNAMODB_TABLE=VideoHubVideos `
  -e JWT_SECRET=local-only-secret `
  videohub-cloud
```

Las credenciales no se guardan en la imagen ni en el repositorio. En Learner Lab se recomienda asociar a EC2 el rol existente `LabRole`, si está disponible, para que el SDK use credenciales temporales mediante el proveedor estándar de AWS.

Los scripts reproducibles para crear y poblar la tabla están en `cloud/scripts/`:

```bash
python cloud/scripts/create_table.py
python cloud/scripts/seed_table.py
```

La arquitectura, el modelo, la API, las evidencias y los pendientes están documentados en `docs/`.

### Despliegue resumido en Learner Lab

1. Crea una instancia EC2 Amazon Linux, asigna el rol disponible `LabRole` y permite TCP `3000` en su grupo de seguridad.
2. En la instancia instala Docker, clona el repositorio y construye la imagen:

   ```bash
   docker build -t videohub-cloud .
   ```

3. Ejecuta el contenedor:

   ```bash
   docker run -d --name videohub-cloud --restart unless-stopped \
     -p 3000:3000 \
     -e CLOUD_MODE=true \
     -e PORT=3000 \
     -e JWT_SECRET="define-un-secret-temporal" \
     -e AWS_REGION=us-east-1 \
     -e DYNAMODB_TABLE=VideoHubVideos \
     videohub-cloud
   ```

4. Crea en API Gateway una HTTP API con stage `dev`, agrega `GET /videos` y `POST /videos` y configura la integración HTTP proxy hacia `http://<ip-publica-ec2>:3000/api/cloud/videos`.
5. Prueba la URL del stage y guarda las capturas indicadas en `docs/evidencias/`.

Los nombres de recursos y la IP real no se escriben en el código. Deben sustituirse únicamente en el entorno de Learner Lab y en la documentación de la entrega.

## Autenticación y sesión

**Mecanismo elegido: JWT.** Lo usan la API y las vistas, con un único formato de sesión:

- `POST /api/auth/login` responde `200` con `{ token, user }` y además guarda el token en una cookie `token` (`httpOnly`, `sameSite=lax` y `secure` en producción).
- La API acepta el token en `Authorization: Bearer <token>` (clientes como Postman) o en la cookie (navegador). Si llegan ambos, se usa el encabezado.
- El payload solo lleva `sub` (id del usuario) y `role`. Nada de contraseñas ni datos personales: un JWT se puede leer sin la llave.
- El token expira según `JWT_EXPIRES_IN` (por defecto `2h`) y la cookie dura exactamente lo mismo. Para probar un token expirado basta con bajar ese valor (p. ej. `10s`) y reiniciar.
- En cada petición protegida se vuelve a leer el usuario de la base de datos: si el token es inválido, expiró o el usuario ya no existe, responde `401`. Un cambio de rol aplica de inmediato.
- `POST /api/auth/logout` y el botón **Cerrar sesión** de las vistas borran la cookie. Como el JWT no se guarda en el servidor, un token copiado manualmente sigue siendo válido hasta que expira (la revocación de tokens queda fuera del alcance de esta entrega).
- Las contraseñas se guardan con **bcrypt** y nunca salen en una respuesta (`select: false` y `toJSON` en el modelo). Tampoco sale el `googleId`.

| Endpoint | Qué hace | Respuestas |
|---|---|---|
| `POST /api/auth/register` | Crea un usuario con rol `user` | `201`; `409` correo o usuario repetido; `400` cuerpo inválido o si envía `role` |
| `POST /api/auth/login` | Inicia sesión | `200` con el token; `401` "Correo o contraseña incorrectos" (no revela si el correo existe) |
| `GET /api/auth/me` | Usuario de la sesión actual | `200`; `401` sin sesión |
| `POST /api/auth/logout` | Cierra la sesión (borra la cookie) | `200`; `401` sin sesión |
| `GET /api/auth/google` | Inicia el login con Google | Redirige a Google; `503` si faltan las credenciales en el `.env` |
| `GET /api/auth/google/callback` | Termina el login con Google | Crea la sesión y redirige a `/profile` |

## Configurar el login con Google (paso a paso)

1. Entra a [Google Cloud Console](https://console.cloud.google.com/) y crea un proyecto nuevo (o elige uno existente).
2. Configura la **pantalla de consentimiento de OAuth** (en la consola nueva aparece como *Google Auth Platform*): tipo de usuario **Externo**, nombre de la app (`VideoHub`) y correo de soporte. Los permisos necesarios son `email` y `profile`.
3. Mientras la app esté en modo **Prueba (Testing)**, agrega en **Usuarios de prueba** las cuentas de Google con las que vas a iniciar sesión. Solo esas cuentas podrán entrar.
4. Ve a **Credenciales → Crear credenciales → ID de cliente de OAuth** (en la consola nueva: **Clientes → Crear cliente**) y elige **Aplicación web**.
5. En **Orígenes autorizados de JavaScript** agrega `http://localhost:3000`.
6. En **URI de redireccionamiento autorizados** agrega exactamente el valor de `GOOGLE_CALLBACK_URL` del `.env`: `http://localhost:3000/api/auth/google/callback`. Si no coincide letra por letra, Google responde `redirect_uri_mismatch`.
7. Copia el **ID de cliente** y el **secreto del cliente** a `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en tu `.env` (nunca en `.env.example` ni en el repositorio).
8. Reinicia el servidor, abre <http://localhost:3000/login> y pulsa **Continuar con Google**.

Al volver de Google: si ya existe un usuario con ese `googleId`, inicia su sesión; si existe uno con el mismo correo **y Google lo marca como verificado**, se vincula la cuenta; si no existe, se crea con el rol `user` y sin contraseña. Un correo sin verificar que ya pertenece a otra cuenta no se vincula: vuelve al login con un mensaje de error. En todos los casos recibe el mismo JWT y los mismos permisos que un login con contraseña.

Si faltan las tres variables de Google, el servidor arranca igual (con un aviso en consola) y `/api/auth/google` responde `503`.

## Roles y permisos

Hay dos roles en el campo `role` del usuario: `user` (por defecto, el de menor privilegio) y `admin`. El primer admin lo crea el seed; no existe ningún endpoint público para crearlo.

- El rol **nunca** se toma del body del usuario: si se envía `role` en el registro o al editar el perfil, responde `400`.
- Solo un admin cambia el rol de otro usuario, con `PATCH /api/users/:id/role`. No puede cambiar el suyo (`400`), para no quedarse el sistema sin administradores.
- El dueño de un recurso siempre se toma del token: si el cliente manda `authorId` (videos y comentarios), `user` (reacciones) o `createdBy` (categorías), se ignora.
- Ocultar un botón en una vista no es seguridad: todas las reglas se aplican en el API con middlewares (`requireAuth`, `allowRoles` y los de propiedad en `src/middleware/ownership.middleware.ts`).

### Matriz de permisos (igual a la del documento)

Leyenda: **Sí** = permitido; **Propio** = solo sobre lo que creó; **No** = denegado.

| Acción | Invitado | Usuario | Admin |
|---|---|---|---|
| Registrarse e iniciar sesión (incluye Google) | Sí | No aplica | No aplica |
| Ver catálogo, buscar y filtrar videos | Sí | Sí | Sí |
| Ver detalle y reproducir un video | Sí | Sí | Sí |
| Ver comentarios de un video | Sí | Sí | Sí |
| Ver perfiles públicos y videos de un usuario | Sí | Sí | Sí |
| Ver categorías | Sí | Sí | Sí |
| Publicar un video | No | Sí | Sí |
| Editar un video | No | Propio | Sí |
| Eliminar un video | No | Propio | Sí |
| Comentar un video | No | Sí | Sí |
| Editar un comentario | No | Propio | Propio |
| Eliminar un comentario | No | Propio | Sí |
| Dar y quitar "me gusta" | No | Propio | Propio |
| Consultar reacciones (listado y detalle) | No | Propio | Sí |
| Editar su perfil | No | Propio | Propio |
| Eliminar una cuenta | No | Propia | Sí |
| Listar todos los usuarios | No | No | Sí |
| Cambiar el rol de un usuario | No | No | Sí |
| Crear, editar y eliminar categorías | No | No | Sí |

### Permisos por endpoint

**Público** = sin sesión; **Sesión** = cualquier usuario con sesión; **Dueño** = quien creó el recurso. Sin sesión, toda ruta que no sea pública responde `401`.

| Endpoint | Quién puede | Si no cumple |
|---|---|---|
| `GET /api/videos`, `GET /api/videos/:id` | Público | — |
| `POST /api/videos` | Sesión | `401` |
| `PUT` / `PATCH` / `DELETE /api/videos/:id` | Dueño o admin | `403` |
| `GET /api/comments`, `GET /api/comments/:id` | Público | — |
| `POST /api/comments` | Sesión | `401` |
| `PUT` / `PATCH /api/comments/:id` | Dueño (también para el admin) | `403` |
| `DELETE /api/comments/:id` | Dueño o admin | `403` |
| `GET /api/reactions` | Sesión: un usuario ve solo las suyas; el admin ve todas | `403` si un usuario filtra por otro `user` |
| `GET /api/reactions/:id` | Dueño o admin | `404` |
| `POST /api/reactions` | Sesión | `401`; `409` si ya dio like |
| `DELETE /api/reactions/:id` | Dueño (también para el admin) | `404` |
| `PUT` / `PATCH /api/reactions/:id` | Nadie: las reacciones no se editan | `405` |
| `GET /api/categories`, `GET /api/categories/:id` | Público | — |
| `POST /api/categories`, `PUT` / `PATCH` / `DELETE /api/categories/:id` | Admin | `403` |
| `GET /api/users/:id`, `GET /api/users/:id/videos` | Público (el perfil público no incluye el correo) | — |
| `GET /api/users`, `POST /api/users` | Admin | `403` |
| `PUT` / `PATCH /api/users/:id` | Dueño (también para el admin; sin `role`) | `403` |
| `PATCH /api/users/:id/role` | Admin, sobre otro usuario | `403`; `400` si es el suyo |
| `DELETE /api/users/:id` | Dueño o admin | `403` |
| `GET /api/auth/me`, `POST /api/auth/logout` | Sesión | `401` |

### Recurso ajeno: 403 o 404

- **Videos, comentarios y usuarios responden `403`**: son contenido público (cualquiera puede verlos), así que ocultar que existen no aporta nada. En `/users/:id` la comparación se hace contra el id de la URL, sin consultar la base de datos.
- **Las reacciones responden `404`**: son datos personales (qué le gustó a cada quien), así que una reacción ajena no revela que existe, ni siquiera al admin al intentar quitarla.

## Vistas

| Ruta | Acceso |
|---|---|
| `/`, `/videos`, `/videos/:id`, `/login`, `/register` | Públicas. Login y registro incluyen el botón **Continuar con Google**. |
| `/profile` | Con sesión: perfil, mis videos, formulario para subir video y notificaciones. Sin sesión redirige a `/login`. |
| `/admin` | Solo admin: métricas y usuarios recientes. Sin sesión redirige a `/login`; un usuario normal recibe `403`. |

El navbar muestra la sesión (avatar con el nombre, insignia de notificaciones y menú con perfil, panel de admin si aplica y **Cerrar sesión**). El formulario de subir video, las notificaciones, los comentarios y los "me gusta" de las vistas son por ahora una maqueta visual: la funcionalidad real ya existe en el API y se conectará en las siguientes entregas.

## Colección de peticiones

Archivo: [`docs/api.postman_collection.json`](./docs/api.postman_collection.json) (Postman).

1. Importa el archivo en Postman.
2. La URL base está en la variable de colección **`baseUrl`** (`http://localhost:3000/api`); si cambia el puerto, solo se edita ahí.
3. Ejecuta `npm run seed` antes (las peticiones usan los datos de prueba) y corre la colección **completa y en orden** con *Run collection*.

Cómo maneja la sesión:

- **Login correcto (admin)** guarda el JWT en la variable `{{token}}` con un script, y la colección lo envía como `Bearer` en todas las peticiones que heredan la autenticación.
- La carpeta **Users** inicia sesión con el usuario recién creado (`{{newUserToken}}`) para editar su propio perfil, porque ni el admin puede editar perfiles ajenos.
- La carpeta **08 - Seguridad** usa a María (`{{userToken}}`) y cubre: sin token y token inválido o alterado (`401`), rol sin permiso (`403`), editar y borrar un video ajeno (`403`), comentar mandando un `authorId` ajeno (el autor sale del token), el admin editando un comentario ajeno (`403`) y quitando un like ajeno (`404`). Las peticiones de `401` desactivan las cookies, porque Postman reenvía la cookie `token` del último login.

Está organizada por módulo (Auth, Users, Categories, Videos, Comments, Reactions, Seguridad) e incluye las peticiones **`ERROR ·`** con los casos de cuerpo inválido, id inexistente, id mal formado, duplicado y ruta inexistente.

## Estructura del proyecto

```
├── src/                         # Código fuente en TypeScript
│   ├── server.ts                # Lee el .env, conecta a MongoDB y arranca el servidor
│   ├── app.ts                   # Configura Express: Handlebars, middlewares, rutas y errores
│   ├── models/                  # Esquemas de Mongoose: User, Category, Video, Comment, Reaction
│   ├── validators/              # Esquemas de Zod para validar body, params y query
│   ├── config/
│   │   ├── passport.ts              # Estrategia de Google OAuth 2.0
│   │   └── session.ts               # Firma del JWT y cookie de sesión
│   ├── middleware/
│   │   ├── auth.middleware.ts       # requireAuth, allowRoles, optionalAuth y requireAuthView
│   │   ├── ownership.middleware.ts  # Propiedad de recursos (dueño o admin) e ignoreBodyFields
│   │   ├── validate.middleware.ts   # Middleware reutilizable de validación
│   │   └── error.middleware.ts      # Manejo central de errores y 404 en JSON
│   ├── controllers/             # Lógica de cada módulo de la API
│   │   ├── view.controller.ts       # Vistas: inicio, listado y detalle de videos
│   │   └── view-auth.controller.ts  # Vistas: login, registro, perfil y panel de admin
│   ├── routes/                  # Rutas de la API (/api) y de las vistas (views.routes.ts)
│   └── seed/seed.ts             # Script de datos de prueba (npm run seed)
├── views/                       # Plantillas Handlebars
│   ├── layouts/                 # Layout base con navegación
│   ├── partials/                # Piezas reutilizables (barra de navegación, tarjeta de video)
│   ├── auth/                    # Formularios de login y registro
│   ├── user/                    # Perfil de usuario
│   ├── admin/                   # Panel de administración
│   ├── videos/                  # Listado y detalle de videos
│   └── home, error              # Página de inicio y página de error
├── public/                      # Archivos estáticos (estilos)
├── docs/                        # Colección de Postman de la API
├── dist/                        # Código compilado (se genera con npm run build; no se versiona)
├── documentacion.docx           # Documento del proyecto (versión 3)
├── docker-compose.yml           # MongoDB local en Docker
├── .env.example                 # Plantilla de variables de entorno
├── package.json                 # Dependencias y scripts
└── tsconfig.json                # Configuración de TypeScript
```

## Política de borrado

El borrado es **físico**, y las dependencias se eliminan desde el código (sin triggers):

| Al eliminar… | Qué pasa |
|---|---|
| **Video** | Se borra junto con sus comentarios y reacciones. |
| **Usuario** | Se borran sus videos (con los comentarios y reacciones de esos videos), sus comentarios y sus reacciones en videos ajenos. **Si creó categorías responde `409`**: hay que eliminarlas primero. |
| **Categoría** | Si tiene videos responde **`409`**. Si no tiene, se borra. |
| **Comentario** | Se borra. |
| **Reacción** | Se borra y se descuenta `likesCount` del video. |
