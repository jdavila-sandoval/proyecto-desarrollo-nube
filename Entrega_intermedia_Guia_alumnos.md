Desarrollo en la Nube Otoño 2026 



PR OY E C TO D E L C U R S O · G U Í A PA R A A L U M N O S 

# Entrega intermedia 

Qué entregar, cómo se revisa y cómo se evalúa 

|CURSO|PROFESOR|FECHA DE EMISIÓN|VERSIÓN|ENTREGA|
|---|---|---|---|---|
|Desarrollo en la Nube|Juan Carlos|22 oct 2026|1.0|Por definir|
||Jiménez E.||||
|1|6|20|min|100|
|caso de uso funcionando|entregables en el|de revisió|n en clase por|puntos; 60 por funcionalidad|
|de punta a punta|repositorio|equipo||y diseño|



#### 01 

## Objetivo 

En esta entrega intermedia su equipo demuestra que un caso de uso de su proyecto ya funciona de punta a punta en AWS: del cliente a API Gateway, de ahí al contenedor en EC2 y hasta la base de datos. 

No se espera el proyecto terminado. Se evalúa lo que ya funciona, qué tan claro tienen su diseño y si su plan para la entrega final es realista. Un flujo pequeño que funciona vale más que un diseño grande sin implementar. 

#### 02 

## Qué debe funcionar 

Con lo visto en clase S3, RDS, DynamoDB, API Gateway, EC2 y Docker), su solución debe cubrir al menos lo de la columna Mínimo. Lo de la columna Extra suma puntos, pero no es obligatorio. 

||OBLIGATORIO|OPCIONAL|
|---|---|---|
|CAPA|MÍNIMO|EXTRA|
|Cliente|Postman o un sitio sencillo que consuma la API|Sitio estático en S3 consumiendo la API|
|API|API Gateway con al menos 2 recursos o métodos (un<br>GET y un POST|Validación de requests, CORS configurado|
|Backend|Backend con Dockerfile, corriendo como contenedor<br>en una instancia EC2|Imagen en Amazon ECR, contenedor que<br>arranca solo al iniciar la instancia|



1 / 6 

ITESO, Universidad Jesuita de Guadalajara · Desarrollo en la Nube · Entrega intermedia 

||OBLIGATORIO|OPCIONAL|
|---|---|---|
|CAPA|MÍNIMO|EXTRA|
|Datos|Modelo de datos implementado en DynamoDB o RDS,|Justificación clara de por qué DynamoDB o|
||con datos de prueba|RDS|
|Almacenamiento|Bucket S3 para archivos o estáticos, si su proyecto lo|Organización por prefijos (carpetas) y|
||usa|versionado|



Los temas que aún no vemos en clase no se piden implementados. Si su proyecto los va a usar, márquenlos como planeados en el diagrama. 

#### 03 

## Qué entregar 

Cada equipo entrega un solo enlace a su repositorio y presenta en clase. El repositorio debe tener estos seis entregables: 

|#|ENTREGABLE|QUÉ DEBE INCLUIR|DÓNDE|
|---|---|---|---|
|1|Diagrama de la solución|Un solo diagrama: lo que ya está desplegado en un color y lo<br>planeado para la final en otro, con flechas de quién llama a<br>quién|`docs/solucion.png`|
|2|Modelo de datos|Tablas o entidades, claves PK/SK o primarias/foráneas) y las 2<br>o 3 consultas principales|`docs/modelo-`<br>`datos.md`|
|3|Diseño de la API en API<br>Gateway|Cómo fluye cada request: recursos, métodos, integración, stage,<br>URL y ejemplos (ver sección 04|`docs/api.md`|
|4|Código fuente|Backend con su Dockerfile y scripts (boto3, sin llaves ni<br>contraseñas en el código|`src/`|
|5|Evidencia de despliegue|Capturas de API Gateway, de la instancia EC2 con el contenedor<br>corriendo y de la tabla con datos; URL de la API|`docs/evidencias/`|
|6|Pendientes|Lista corta (máximo una página) de lo que falta para la final y<br>quién lo hace|`docs/pendientes.md`|



### Estructura sugerida del repositorio 



<!-- Start of picture text -->
proyecto/<br>├── README.md        ← proyecto, integrantes,<br>│                      cómo correrlo<br>├── docs/<br>│   ├── solucion.png<br>│   ├── modelo-datos.md<br>│   ├── api.md<br>│   ├── pendientes.md<br>│   └── evidencias/<br>└── src/<br>    ├── backend/     ← código + Dockerfile<br>    └── scripts/     ← scripts boto3<br><!-- End of picture text -->



<!-- Start of picture text -->
Recomendación. Como Learner Lab reinicia la<br>sesión, anoten en el README los pasos (o un script)<br>para volver a crear sus recursos. No es obligatorio<br>en esta entrega, pero les ahorra mucho tiempo.<br><!-- End of picture text -->

2 / 6 

ITESO, Universidad Jesuita de Guadalajara · Desarrollo en la Nube · Entrega intermedia 

## 04 Guía del entregable 3 diseño de la API en API Gateway 

En `docs/api.md` muestren el camino completo de un request, desde que entra a API Gateway hasta los datos, y una tabla con cada recurso. Este ejemplo usa un catálogo de productos; adáptenlo a su proyecto. 

Cada request entra por API Gateway y llega al contenedor en EC2 

|Cliente||API G|ateway|EC2Docker|Datos|
|---|---|---|---|---|---|
|Sitio en S3<br>o Postman<br> respuesta regresa por<br>gura 1. Flujo de un re|HTTPS<br> el mismo camin<br>quest en el eje|Stag<br>`GET /p`<br>`POST /p`<br>`GET /prod`<br>o hasta el cl<br>mplo del cat|HTTP proxy<br>e: dev<br>`roductos`<br>`roductos`<br>`uctos/{id}`<br>iente.<br>álogo de productos.|Contenedor con<br>el backend|boto3<br>DynamoDB<br>o RDS|
|DEFINICIÓN EN AP|I GATEWAY|INTEGR|ACIÓN|CONTRATO||
|RECURSO|MÉTODO|TIPO|DESTINO|REQUEST|RESPONSE<br>ESPERADA|
|`/productos`|GET|HTTP<br>proxy|Contenedor en EC2<br>`GET`<br>`/productos`|Sin cuerpo; filtros<br>opcionales en query<br>string|200lista en JSON|
|`/productos`|POST|HTTP<br>proxy|Contenedor en EC2<br>`POST`<br>`/productos`|JSON con nombre,<br>precio y categoría|201id creado;<br>400 si faltan<br>campos|
|`/productos/{id}`|GET|HTTP<br>proxy|Contenedor en EC2<br>`GET`<br>`/productos/{id}`|`id` en la ruta|200producto;<br>404 si no existe|
|`/productos/{id}`|DELETE|HTTP<br>proxy|Contenedor en EC2<br>`DELETE`<br>`/productos/{id}`|`id` en la ruta|204; 404 si no<br>existe|



La respuesta regresa por el mismo camino hasta el cliente. 

Figura 1. Flujo de un request en el ejemplo del catálogo de productos. 

### Además, su **`api.md`** debe indicar 

- El stage desplegado (por ejemplo, `dev` ) y la URL de invocación completa. 

- Qué recursos ya existen en API Gateway y cuáles son planeados para la final. 

- Si usan integración proxy (pasa el request tal cual) o no proxy (con mapping templates), y por qué. 

### Ejemplo de prueba con curl 

   - `curl -X POST \ https://<api-id>.execute-api.us-east-1 .amazonaws.com/dev/productos \ -H "Content-Type: application/json" \ -d '{"nombre": "Alimento iniciador", "precio": 450, "categoria": "aves"}'` 

- Una prueba de cada método (colección de Postman o comandos `curl` ) con su respuesta real. 

3 / 6 

ITESO, Universidad Jesuita de Guadalajara · Desarrollo en la Nube · Entrega intermedia 

## 05 Revisión en clase 

Cada equipo tiene 20 minutos. Todos los integrantes deben poder explicar cualquier parte; las preguntas se hacen a alguien al azar. 

|BLOQUE|TIEMPO|QUÉ PASA|
|---|---|---|
|1. Recorrido de la solución|5 min|Expliquen el diagrama: qué ya está desplegado y qué falta.|
|2. Demo en vivo|5 min|Ejecuten su caso de uso completo: un request a la API, el registro guardado<br>en DynamoDB o RDS y los logs del contenedor (<br>`docker logs` ) en la<br>instancia.|
|3. Preguntas|5 min|Ver la lista de abajo.|
|4. Retroalimentación|5 min|Reciben un semáforo (verde, amarillo o rojo) y 2 acciones concretas para la<br>final.|



Antes de su turno: verifiquen que su sesión de Learner Lab esté activa y que la instancia EC2 y el contenedor estén corriendo. 

### Prepárense para responder 

- ¿Por qué eligieron DynamoDB (o RDS y no la otra opción? 

- ¿Cuál es su clave de partición (o llave primaria) y qué consultas resuelve? 

- Si la API recibe un request mal formado, ¿qué responde y dónde se valida? 

- ¿Dónde guardan la configuración (nombres de tablas, endpoints)? ¿Hay algo escrito directo en el código? 

- ¿Cómo construyen y corren la imagen de Docker? Háganlo en vivo.) 

- Si el contenedor se reinicia, ¿qué pasa con los datos? 

- Si mañana se reinicia el laboratorio, ¿cuánto tardan en volver a levantar todo? 

- ¿Qué es lo más riesgoso que les falta y cuál es su plan B? 

- Cada integrante: muestren un commit suyo y expliquen qué cambió. 

4 / 6 

ITESO, Universidad Jesuita de Guadalajara · Desarrollo en la Nube · Entrega intermedia 

## 06 Cómo se evalúa 

La entrega vale 100 puntos; 60 corresponden a que funcione y a que el diseño sea claro. 

|||NIVEL DE DESEMPEÑO|||
|---|---|---|---|---|
|CRITERIO|PUNTOS|EXCELENTE (100%)|SUFICIENTE (70%)|INSUFICIENTE (≤ 40<br>%)|
|Funcionalidad de<br>punta a punta|35|Caso de uso completo<br>funcionando en vivo, con<br>manejo de errores|Funciona con pasos<br>manuales o errores<br>menores|No hay flujo completo<br>o la demo falla|
|Diseño de la solución y<br>diagrama|25|Diagrama claro, consistente<br>con lo desplegado y con lo<br>planeado bien distinguido|Diagrama con<br>inconsistencias<br>menores|Diagrama genérico o<br>que no refleja lo<br>construido|
|Decisiones técnicas<br>(respuestas en la<br>revisión)|15|Justifican cada servicio con<br>alternativas y ventajas o<br>desventajas|Justificación parcial|"Porque lo vimos en<br>clase"|
|Modelo de datos y API|15|Consultas principales definidas<br>y API documentada como en la<br>guía|Documentados con<br>huecos|Sin documentar|
|Trabajo en equipo y<br>pendientes|10|Commits de todos los<br>integrantes; lista de pendientes<br>realista|Participación desigual o<br>pendientes vagos|Un solo integrante<br>trabaja; sin pendientes|
|Total|100||||



Los puntos de la columna Extra de la sección 02 se suman aparte, hasta el máximo que indique el profesor. 

5 / 6 

ITESO, Universidad Jesuita de Guadalajara · Desarrollo en la Nube · Entrega intermedia 

## 07 Qué queda para la entrega final 

Esta entrega pide un caso de uso funcionando; la final lo extiende al resto del proyecto. Usen esta tabla para armar su lista de pendientes. 

||AHORA|DESPUÉS|
|---|---|---|
|TEMA|ENTREGA INTERMEDIA|ENTREGA FINAL|
|Flujo funcional|1 caso de uso completo|Todos los casos de uso del proyecto|
|API Gateway|Recursos de ese caso de uso, stage<br>`dev`|Todos los recursos, CORS y manejo de errores|
|Backend|Contenedor corriendo en EC2|Contenedor estable que arranca solo al iniciar la<br>instancia|
|Datos|Modelo definido y datos de prueba|Datos completos y consultas afinadas|
|Cliente|Postman o sitio básico|Sitio en S3 que consume la API|
|Documentación|Diagrama, modelo de datos, API y<br>pendientes|Lo anterior actualizado, decisiones técnicas por<br>escrito y README final|
|Temas nuevos|No se piden|Solo si ya se vieron en clase y el equipo los<br>planeó|



## 08 Antes de entregar 

El caso de uso funciona de punta a punta desde 

Postman o el sitio 

- API Gateway tiene al menos un GET y un POST 

- desplegados en un stage 

- El backend corre como contenedor en EC2 y el Dockerfile está en el repositorio 

La tabla en DynamoDB o RDS tiene datos de prueba Están los seis entregables en las rutas indicadas El README tiene nombre del proyecto, integrantes y cómo correrlo 

No hay llaves ni contraseñas en el código Todos los integrantes tienen commits 

### Fechas 

|MOMENTO|FECHA|
|---|---|
|Entrega del enlace al repositorio|Por definir|
|Revisión en clase|Por definir|
|Plataforma de entrega|Por definir|



6 / 6 

ITESO, Universidad Jesuita de Guadalajara · Desarrollo en la Nube · Entrega intermedia 

