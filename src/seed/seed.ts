import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { UserModel } from "../models/User.model";
import { CategoryModel } from "../models/Category.model";
import { VideoModel } from "../models/Video.model";
import { CommentModel } from "../models/Comment.model";
import { ReactionModel } from "../models/Reaction.model";

dotenv.config({ quiet: true }); 

// npm run seed

const PASSWORD_ADMIN = "Admin123!";
const PASSWORD_USUARIOS = "Usuario123!";

// Videos de prueba de acceso público
const CLIPS = [
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://download.blender.org/peach/bigbuckbunny_movies/BigBuckBunny_320x180.mp4",
];

const diasAtras = (dias: number): Date => new Date(Date.now() - dias * 24 * 60 * 60 * 1000);

async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("La variable de entorno MONGODB_URI no está definida (copia .env.example a .env)");

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  await Promise.all(Object.values(mongoose.models).map((model) => model.init())); // índices únicos
  console.log(`Base de datos: ${mongoose.connection.name}`);

  // 1. Limpiar base de datos
  await ReactionModel.deleteMany({});
  await CommentModel.deleteMany({});
  await VideoModel.deleteMany({});
  await CategoryModel.deleteMany({});
  await UserModel.deleteMany({});
 
  //2. Usuarios: 1 admin y 5 usuarios
  const hashAdmin = await bcrypt.hash(PASSWORD_ADMIN, 10);
  const hashUsuario = await bcrypt.hash(PASSWORD_USUARIOS, 10);

  const usuarios = await UserModel.create([
    { username: "admin", email: "admin@videohub.com", passwordHash: hashAdmin, role: "admin", description: "Administrador de la plataforma" },
    { username: "maria_garcia", email: "maria@videohub.com", passwordHash: hashUsuario, description: "Me encanta la tecnología y la programación" },
    { username: "carlos_lopez", email: "carlos@videohub.com", passwordHash: hashUsuario, description: "Músico y creador de contenido" },
    { username: "ana_torres", email: "ana@videohub.com", passwordHash: hashUsuario, description: "Chef aficionada" },
    { username: "luis_hernandez", email: "luis@videohub.com", passwordHash: hashUsuario, description: "Gamer y entusiasta del deporte" },
    { username: "sofia_ramirez", email: "sofia@videohub.com", passwordHash: hashUsuario, description: "Estudiante de ingeniería" },
  ]);
  const [admin, maria, carlos, ana, luis, sofia] = usuarios;

  // 3. Categorías
  const categorias = await CategoryModel.create([
    { name: "Tecnología", description: "Programación, gadgets y novedades", createdBy: admin._id },
    { name: "Educación", description: "Tutoriales y clases", createdBy: admin._id },
    { name: "Música", description: "Covers, composiciones y conciertos", createdBy: admin._id },
    { name: "Videojuegos", description: "Gameplays y reseñas", createdBy: admin._id },
    { name: "Cocina", description: "Recetas y técnicas", createdBy: admin._id },
    { name: "Deportes", description: "Entrenamientos y resúmenes", createdBy: admin._id },
  ]);
  const [tecnologia, educacion, musica, videojuegos, cocina, deportes] = categorias;

  // 4. Videos 
  const definicionVideos = [
    { title: "Introducción a Node.js y Express", description: "Primeros pasos para crear una API REST.", autor: maria, categoria: tecnologia, views: 1520, dias: 30 },
    { title: "MongoDB desde cero", description: "Colecciones, documentos y consultas básicas.", autor: maria, categoria: tecnologia, views: 980, dias: 24 },
    { title: "Cómo estudiar mejor en la universidad", description: "Técnicas de estudio y organización del tiempo.", autor: sofia, categoria: educacion, views: 640, dias: 20 },
    { title: "Álgebra lineal en 10 minutos", description: "Vectores y matrices explicados con ejemplos.", autor: sofia, categoria: educacion, views: 410, dias: 15 },
    { title: "Cover acústico de mi canción favorita", description: "Guitarra y voz grabado en casa.", autor: carlos, categoria: musica, views: 2210, dias: 12 },
    { title: "Cómo componer una melodía", description: "Consejos para empezar a componer.", autor: carlos, categoria: musica, views: 760, dias: 9 },
    { title: "Reseña de un clásico de plataformas", description: "Opiniones después de 20 años.", autor: luis, categoria: videojuegos, views: 1330, dias: 8 },
    { title: "Mejores momentos del torneo estudiantil", description: "Resumen de la final.", autor: luis, categoria: videojuegos, views: 870, dias: 6 },
    { title: "Tacos al pastor caseros", description: "Receta paso a paso sin trompo.", autor: ana, categoria: cocina, views: 3050, dias: 5 },
    { title: "Pan de masa madre para principiantes", description: "Cómo crear y mantener tu masa madre.", autor: ana, categoria: cocina, views: 1180, dias: 3 },
    { title: "Rutina de entrenamiento de 20 minutos", description: "Ejercicio en casa sin equipo.", autor: luis, categoria: deportes, views: 920, dias: 2 },
    { title: "Resumen de la jornada de fútbol universitario", description: "Goles y mejores jugadas.", autor: carlos, categoria: deportes, views: 540, dias: 1 },
  ];

  const videos = await VideoModel.create(
    definicionVideos.map((v, i) => ({
      title: v.title,
      description: v.description,
      author: { userId: v.autor._id, username: v.autor.username },
      category: { categoryId: v.categoria._id, name: v.categoria.name },
      videoUrl: CLIPS[i % CLIPS.length],
      thumbnailUrl: `https://picsum.photos/seed/videohub${i + 1}/640/360`,
      views: v.views,
      likesCount: 0, 
      publishedAt: diasAtras(v.dias),
    }))
  );

  //5. Comentarios
  const comentarios: Array<[number, typeof maria, string]> = [
    [0, carlos, "Muy claro, justo lo que necesitaba para mi proyecto."],
    [0, sofia, "¿Podrías hacer una segunda parte con autenticación?"],
    [0, luis, "Excelente explicación, gracias."],
    [1, sofia, "Ahora sí entendí la diferencia entre colección y documento."],
    [2, maria, "Estas técnicas me sirvieron mucho en el parcial."],
    [3, carlos, "Buen resumen, muy directo."],
    [4, ana, "¡Qué bonita voz! Me encantó."],
    [4, luis, "Necesito la tablatura de esta canción."],
    [4, maria, "Lo escuché tres veces seguidas."],
    [5, sofia, "Gracias por los consejos, voy a intentarlo."],
    [6, carlos, "Totalmente de acuerdo con tu opinión."],
    [7, ana, "Qué final tan reñido."],
    [8, maria, "Los hice el fin de semana y quedaron buenísimos."],
    [8, carlos, "Se me antojó, gracias por la receta."],
    [8, sofia, "¿Se puede usar otra carne?"],
    [9, luis, "Mi masa madre ya burbujea, gracias."],
    [10, maria, "Ideal para los días con poco tiempo."],
    [11, luis, "Qué golazo el segundo."],
  ];
  await CommentModel.create(
    comentarios.map(([indiceVideo, autor, content], i) => ({
      video: videos[indiceVideo]._id,
      author: { userId: autor._id, username: autor.username },
      content,
      createdAt: diasAtras(Math.max(0, 11 - Math.floor(i / 2))),
    }))
  );

  // 6. Reacciones: likes 
  const likes: Array<[number, typeof maria]> = [
    [0, carlos], [0, sofia], [0, luis], [0, ana],
    [1, sofia], [1, carlos],
    [2, maria], [2, luis],
    [3, carlos],
    [4, ana], [4, luis], [4, maria], [4, sofia],
    [5, sofia], [5, maria],
    [6, carlos], [6, ana],
    [7, ana],
    [8, maria], [8, carlos], [8, sofia], [8, luis],
    [9, luis], [9, maria],
    [10, maria], [10, sofia],
    [11, luis],
  ];
  await ReactionModel.create(
    likes.map(([indiceVideo, usuario]) => ({
      video: videos[indiceVideo]._id,
      user: usuario._id,
      type: "like" as const,
    }))
  );

  for (let i = 0; i < videos.length; i++) {
    const total = likes.filter(([indice]) => indice === i).length;
    await VideoModel.updateOne({ _id: videos[i]._id }, { $set: { likesCount: total } }, { timestamps: false });
  }

  console.log("\nDatos de prueba cargados:");
  console.log(`  Usuarios:     ${await UserModel.countDocuments()}`);
  console.log(`  Categorías:   ${await CategoryModel.countDocuments()}`);
  console.log(`  Videos:       ${await VideoModel.countDocuments()}`);
  console.log(`  Comentarios:  ${await CommentModel.countDocuments()}`);
  console.log(`  Reacciones:   ${await ReactionModel.countDocuments()}`);
  console.log("\nCuentas de prueba:");
  console.log(`  admin@videohub.com  /  ${PASSWORD_ADMIN}   (rol admin)`);
  console.log(`  maria@videohub.com  /  ${PASSWORD_USUARIOS}  (rol user; también carlos, ana, luis y sofia @videohub.com)`);
}

seed()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("\nNo fue posible cargar los datos de prueba.");
    console.error(`  Motivo: ${error instanceof Error ? error.message : String(error)}`);
    console.error("  Verifica MONGODB_URI en tu .env y que la base de datos esté levantada (ver README).");
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
