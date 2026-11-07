# Modelo de datos de la entrega intermedia

## Alcance

La entrega intermedia demuestra el caso de uso **publicar y consultar videos de VideoHub**. Este flujo usa una tabla de DynamoDB independiente del modelo MongoDB que conserva la aplicación completa para desarrollo local y para la entrega final.

## Tabla `VideoHubVideos`

| Atributo | Tipo | Descripción |
|---|---|---|
| `videoId` | String | **Partition key (PK)**; UUID del video |
| `title` | String | Título del video |
| `description` | String | Descripción |
| `category` | String | Categoría textual |
| `videoUrl` | String | URL del contenido |
| `thumbnailUrl` | String | URL opcional de miniatura |
| `views` | Number | Reproducciones; inicia en cero |
| `publishedAt` | String ISO-8601 | Fecha de publicación |

La tabla usa `PAY_PER_REQUEST`, adecuado para una demostración de bajo volumen en Learner Lab. No se creó un índice secundario porque el alcance actual solo necesita un catálogo pequeño y el filtrado por categoría puede resolverse con un `Scan` controlado; para producción se agregaría un GSI por categoría y fecha.

## Consultas principales

1. **Publicar un video:** `PutItem` con un UUID como `videoId`.
2. **Consultar el catálogo:** `Scan`, ordenando los resultados por `publishedAt` en el backend; acepta el filtro opcional `category`.
3. **Consultar un video:** `GetItem` usando `videoId` como clave primaria.

## Relación con el modelo completo

El modelo original de VideoHub contiene usuarios, categorías, videos, comentarios y reacciones en MongoDB. Para no migrar toda la aplicación antes de la entrega intermedia, DynamoDB se usa únicamente para el vertical slice documentado. La migración completa o la integración de comentarios y reacciones queda planeada para la entrega final.
