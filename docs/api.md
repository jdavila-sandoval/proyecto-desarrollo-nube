# Diseño de la API en API Gateway

## Flujo desplegado

El cliente usa Postman para llamar a API Gateway. API Gateway reenvía la petición mediante una integración HTTP proxy al contenedor Docker que corre en EC2. El backend usa el SDK de AWS y el rol de la instancia para acceder a DynamoDB. La respuesta regresa por el mismo camino.

```text
Postman
   |
   | HTTPS
   v
API Gateway - stage dev
   |
   | HTTP proxy
   v
EC2:3000 -> Docker -> Node.js/Express
                            |
                            | AWS SDK
                            v
                    DynamoDB: VideoHubVideos
```

## Stage y URL

- **Stage:** `dev`
- **URL de invocación:** `https://<api-id>.execute-api.<region>.amazonaws.com/dev`
- **Región prevista:** `us-east-1`

La URL real debe sustituir `<api-id>` después de crear la API en Learner Lab y debe quedar registrada también en el README y en la evidencia de despliegue.

## Recursos y métodos

| Recurso | Método | Integración | Destino en EC2 | Request | Respuesta |
|---|---|---|---|---|---|
| `/videos` | GET | HTTP proxy | `GET /api/cloud/videos` | Query opcional `category` | `200` con `{ data, total }` |
| `/videos` | POST | HTTP proxy | `POST /api/cloud/videos` | JSON con `title`, `description`, `category`, `videoUrl` | `201` con el video creado |
| `/videos/{id}` | GET | HTTP proxy | `GET /api/cloud/videos/{id}` | UUID en la ruta | `200` o `404` |

Los recursos anteriores son los de la entrega intermedia. Los recursos de usuarios, autenticación, categorías, comentarios y reacciones del proyecto original quedan planeados para la entrega final.

Se usa **integración proxy** porque conserva el método, headers, query string y cuerpo sin duplicar mappings en API Gateway. La validación de negocio se realiza en Express con Zod y los errores se devuelven en JSON.

## Pruebas

Sustituye `<base-url>` por la URL del stage:

```bash
curl "<base-url>/videos"
```

```bash
curl -X POST "<base-url>/videos" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Demo AWS\",\"description\":\"Video de prueba\",\"category\":\"tecnologia\",\"videoUrl\":\"https://example.com/demo\"}"
```

```bash
curl "<base-url>/videos/<video-id>"
```

La colección existente `docs/api.postman_collection.json` cubre la API MongoDB original. Para la demo de AWS se deben ejecutar estas tres peticiones y guardar sus respuestas reales en `docs/evidencias/`.
