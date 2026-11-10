# EduStream

Entrega parcial del proyecto integrador EduStream, desarrollado con React, TypeScript, Vite y React Router.

## Fuente de datos

Se eligió json-server como API simulada porque permite demostrar un CRUD REST real con persistencia en `db.json`, sin bloquear el avance del frontend por la configuración de un backend productivo. La capa de servicios está separada de los componentes y puede cambiarse posteriormente por una API Express, Supabase u otra fuente sin modificar las vistas.

## Ejecución local

Instala dependencias:

```bash
npm install
```

En una terminal inicia la API:

```bash
npm run server
```

En otra terminal inicia la aplicación:

```bash
npm run dev
```

La API estará disponible en `http://localhost:3001` y el frontend en `http://localhost:5173`.

La URL de la API puede cambiarse con un archivo `.env`:

```env
VITE_API_URL=http://localhost:3001
```

## Contrato de API

Entidad principal: `VideoItem`.

```ts
{
  id: number | string;
  title: string;
  subject: string;
  code: string;
  unit: string;
  description: string;
  visibility: "campus" | "group";
  duration: string;
  uploadedAt: string;
  views: number;
  thumbnailClass: string;
}
```

| Método | Endpoint | Uso |
|---|---|---|
| GET | `/videos` | Lista todos los videos |
| GET | `/videos/:id` | Obtiene el detalle de un video |
| POST | `/videos` | Crea un video |
| PATCH | `/videos/:id` | Actualiza un video |
| DELETE | `/videos/:id` | Elimina un video |

Las respuestas exitosas usan los códigos HTTP estándar de json-server. Cuando la API falla, `src/services/apiClient.ts` centraliza el error en `ApiError`; la interfaz muestra un mensaje amigable y, cuando aplica, un botón para reintentar.

## Formularios y estados

El alta y la edición usan el componente reutilizable `VideoForm` con validación manual en `src/utils/videoValidation.ts`. Se validan título, materia, código, unidad y descripción. Mientras se procesa una operación se deshabilita el botón y se muestra `Procesando...`.

Las vistas que consumen la API manejan:

- Carga: mensaje `Cargando...`.
- Error: mensaje de API y opción `Reintentar`.
- Vacío: mensaje cuando no existen registros o los filtros no encuentran resultados.
- Éxito: toast después de crear, editar o eliminar.

## Autenticación y permisos

La autenticación usa una API propia con Express y JWT. Las contraseñas se almacenan con hash bcrypt en `db.json`; nunca se guarda la contraseña original. El servidor expone:

| Método | Endpoint | Uso |
|---|---|---|
| POST | `/auth/register` | Registra un usuario y devuelve JWT |
| POST | `/auth/login` | Valida credenciales y devuelve JWT |
| GET | `/auth/me` | Valida el token y devuelve el usuario actual |

El frontend guarda el token y el usuario en `localStorage`, agrega automáticamente el token como `Authorization: Bearer ...` desde `apiClient.ts` y elimina la sesión cuando recibe un 401. El JWT expira después de 60 minutos. Al expirar, se redirige al login con un mensaje claro.

### Roles y permisos

| Rol | Puede ver dashboard y videos | Puede crear | Puede editar | Puede eliminar |
|---|---:|---:|---:|---:|
| `alumno` | Sí | No | No | No |
| `docente` | Sí | Sí | Sí | Sí |

Los botones se controlan con el componente reutilizable `Can`, pero la API también valida el rol y responde 403 si un alumno intenta modificar videos directamente.

### Guardias

- `ProtectedRoute`: exige una sesión activa y conserva la ruta solicitada.
- `GuestRoute`: evita que un usuario autenticado vuelva a login o registro.
- `RoleRoute`: restringe `/upload-video` al rol `docente` y muestra `/403` cuando no hay permiso.
- `/404`: vista para rutas inexistentes.

### Usuarios de prueba

```text
Docente: docente@edustream.mx / Demo123!
Alumno:  alumno@edustream.mx  / Demo123!
```

Inicia la API con `npm run server` y el frontend con `npm run dev`. Para despliegue real se debe reemplazar el secreto JWT de desarrollo mediante `JWT_SECRET`, migrar los usuarios a una base de datos y usar cookies HttpOnly o un mecanismo equivalente más seguro.
