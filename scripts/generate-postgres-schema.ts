import * as readline from 'readline';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Cargar variables de entorno
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

// Configuración de la conexión a la base de datos
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const ask = (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

async function generateSchema() {
  try {
    // Conectar a la base de datos
    await dataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');

    // Obtener el nombre del schema
    const schemaName = await ask('\nIngrese el nombre del schema (ej: public, auth, etc): ');
    
    // Verificar si el schema ya existe
    const schemaExists = await dataSource.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
      [schemaName]
    );

    if (schemaExists.length > 0) {
      console.log(`⚠️ El schema '${schemaName}' ya existe.`);
      const shouldDrop = await ask('¿Desea eliminarlo y recrearlo? (s/n): ');
      
      if (shouldDrop.toLowerCase() === 's') {
        // Eliminar el schema existente
        await dataSource.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
        console.log(`✅ Schema '${schemaName}' eliminado`);
      } else {
        console.log('Operación cancelada');
        await dataSource.destroy();
        rl.close();
        return;
      }
    }

    // Crear el nuevo schema
    await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    console.log(`✅ Schema '${schemaName}' creado exitosamente`);

    // Cerrar la conexión
    await dataSource.destroy();
    console.log('\n✅ Operación completada exitosamente');
    rl.close();

  } catch (error) {
    console.error('Error:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    rl.close();
    process.exit(1);
  }
}

generateSchema();
