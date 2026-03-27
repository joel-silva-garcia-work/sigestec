import * as fs from 'fs';
import * as path from 'path';
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

const askYesNo = async (question: string): Promise<boolean> => {
  const answer = await ask(`${question} (s/n): `);
  return answer.toLowerCase() === 's';
};

const getFieldType = async (): Promise<string> => {
  console.log('1. string');
  console.log('2. number');
  console.log('3. boolean');
  console.log('4. Date');
  console.log('5. json');
  
  const typeChoice = await ask('Seleccione el tipo (1-5): ');
  const types: { [key: string]: string } = {
    '1': 'string',
    '2': 'number',
    '3': 'boolean',
    '4': 'Date',
    '5': 'json',
  };
  return types[typeChoice] || 'string';
};

interface Field {
  name: string;
  type: string;
  decorator: string;
}

const toEnumKey = (name: string) =>
  String(name)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .toUpperCase();

const buildE2eTestContent = (params: {
  schemaName: string;
  resourceName: string;
  className: string;
  fields: Field[];
}) => {
  const { schemaName, resourceName, className, fields } = params;
  const url = `${schemaName}/${resourceName}`;

  const requiredFields = fields.filter((f) => !f.decorator.includes('nullable: true'));

  const defaultValueFor = (f: Field) => {
    switch (f.type) {
      case 'string':
        return `randomString(12)`;
      case 'number':
        return `1`;
      case 'boolean':
        return `true`;
      case 'Date':
        return `new Date()`;
      case 'json':
        return `{ key: randomString(6) }`;
      default:
        return `null`;
    }
  };

  const buildValidDto = () => {
    const lines: string[] = [];
    // BaseExtendedDto required field
    lines.push(`    name: \`${className} \${randomString(10)}\`,`);
    lines.push(`    description: \`Desc \${randomString(12)}\`,`);
    lines.push(`    isActive: true,`);

    for (const f of requiredFields) {
      lines.push(`    ${f.name}: ${defaultValueFor(f)},`);
    }
    return `{\n${lines.join('\n')}\n  }`;
  };

  const invalidEnumEntries: string[] = [];
  const invalidSwitchCases: string[] = [];

  // Include standard BaseExtendedDto invalids via InvalidStandardDTO in tests
  for (const f of requiredFields) {
    const kBase = toEnumKey(f.name);
    invalidEnumEntries.push(`  NULL_${kBase} = 'NULL_${kBase}',`);
    invalidEnumEntries.push(`  NO_${kBase} = 'NO_${kBase}',`);

    if (f.type === 'string') {
      invalidEnumEntries.push(`  EMPTY_${kBase} = 'EMPTY_${kBase}',`);
      invalidEnumEntries.push(`  WRONG_${kBase}_TYPE = 'WRONG_${kBase}_TYPE',`);
    } else if (f.type === 'number' || f.type === 'boolean' || f.type === 'Date' || f.type === 'json') {
      invalidEnumEntries.push(`  WRONG_${kBase}_TYPE = 'WRONG_${kBase}_TYPE',`);
    }

    invalidSwitchCases.push(`    case INVALID_DTO.NULL_${kBase}:\n      invalidDto.${f.name} = null as any;\n      break;`);
    invalidSwitchCases.push(`    case INVALID_DTO.NO_${kBase}:\n      delete invalidDto.${f.name};\n      break;`);

    if (f.type === 'string') {
      invalidSwitchCases.push(`    case INVALID_DTO.EMPTY_${kBase}:\n      invalidDto.${f.name} = "" as any;\n      break;`);
      invalidSwitchCases.push(`    case INVALID_DTO.WRONG_${kBase}_TYPE:\n      invalidDto.${f.name} = 123 as any;\n      break;`);
    } else if (f.type === 'number') {
      invalidSwitchCases.push(`    case INVALID_DTO.WRONG_${kBase}_TYPE:\n      invalidDto.${f.name} = "invalid" as any;\n      break;`);
    } else if (f.type === 'boolean') {
      invalidSwitchCases.push(`    case INVALID_DTO.WRONG_${kBase}_TYPE:\n      invalidDto.${f.name} = "invalid" as any;\n      break;`);
    } else if (f.type === 'Date') {
      invalidSwitchCases.push(`    case INVALID_DTO.WRONG_${kBase}_TYPE:\n      invalidDto.${f.name} = "invalid-date" as any;\n      break;`);
    } else if (f.type === 'json') {
      invalidSwitchCases.push(`    case INVALID_DTO.WRONG_${kBase}_TYPE:\n      invalidDto.${f.name} = "invalid-json" as any;\n      break;`);
    }
  }

  const edgeCasesForStrings = requiredFields
    .filter((f) => f.type === 'string')
    .slice(0, 3) // keep it bounded
    .map((f) => {
      const kBase = toEnumKey(f.name);
      return `
      test('should handle very long ${f.name}', async () => {
        const createUrl = url + '/adicionar'
        const dto: any = generateDto()
        dto.${f.name} = 'a'.repeat(1000)
        const result = await createData(createUrl, dto, token)
        expect(result).toBeInstanceOf(HttpError)
        expect((result as HttpError).status).toBe(400)
      })`.trim();
    })
    .join('\n\n');

  return `import {
  createData,
  fetchActiveItems,
  fetchData,
  fetchItemById,
  HttpError,
  InvalidStandardDTO,
  login,
  updateData,
  updateState,
  validateTest,
} from './../../../common/base/test/test.helper'
import { IdDto } from '../../../common/base/dto/id.dto'

const randomString = (len = 8) =>
  Math.random()
    .toString(36)
    .slice(2, 2 + len)

export enum INVALID_DTO {
${invalidEnumEntries.join('\n')}
  NO_TOKEN = 'NO_TOKEN',
  NO_ID = 'NO_ID',
}

const generateDto = () => ${buildValidDto()}

const generateInvalidDTO = (invalid: InvalidStandardDTO | INVALID_DTO) => {
  const dto = generateDto()
  const invalidDto: any = { ...dto }

  switch (invalid) {
    case InvalidStandardDTO.NULL_NAME:
      invalidDto.name = null as any
      break
    case InvalidStandardDTO.EMPTY_NAME:
      invalidDto.name = '' as any
      break
    case InvalidStandardDTO.WRONG_NAME_TYPE:
      invalidDto.name = 123 as any
      break
    case InvalidStandardDTO.NO_NAME:
      delete invalidDto.name
      break
    case InvalidStandardDTO.WRONG_DESCRIPTION_TYPE:
      invalidDto.description = 123 as any
      break
${invalidSwitchCases.length ? `\n${invalidSwitchCases.map((c) => c.replace(/^/gm, '    ')).join('\n')}\n` : ''}
    default:
      break
  }

  return invalidDto
}

const validateWrongTest = (
  testName: string,
  result: any,
  invalid: InvalidStandardDTO | INVALID_DTO,
) => {
  if (result instanceof HttpError) {
    expect(result).toBeInstanceOf(HttpError)
    switch (invalid) {
      case INVALID_DTO.NO_TOKEN:
        expect(result.status).toBe(401)
        break
      default:
        expect(result.status).toBe(400)
        break
    }
  } else {
    expect(result).toBeTruthy()
  }
}

describe('API Tests', () => {
  jest.setTimeout(9000000)
  let token: any
  let itemId: any
  const url = '${url}'

  describe('Basic CRUD', () => {
    test('should read all items', async () => {
      const todos = url + '/todos'
      const result = await fetchData(todos)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should create a new item', async () => {
      token = await login()
      const createUrl = url + '/adicionar'
      const dto = generateDto()
      const result = await createData(createUrl, dto, token)
      validateTest(expect.getState().currentTestName, result)

      if (result?.isSuccess) {
        itemId = result.data.id
      } else if (result?.data?.id) {
        itemId = result.data.id
      } else {
        throw new Error('Failed to create item')
      }
    })

    test('should get all active items', async () => {
      const todosActivos = url + '/ver-todos-activos-public'
      const result = await fetchActiveItems(todosActivos)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should get an item by ID', async () => {
      const uno = url + '/ver-uno-public'
      const ID = new IdDto()
      ID.id = itemId
      const result = await fetchItemById(uno, ID)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should get an active item by ID', async () => {
      const unoActivo = url + '/ver-uno-activo-public'
      const ID = new IdDto()
      ID.id = itemId
      const result = await fetchItemById(unoActivo, ID)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should set active/inactive item by ID', async () => {
      const changeStateUrl = url + '/cambiar-estado'
      const ID = new IdDto()
      ID.id = itemId
      const result = await updateState(changeStateUrl, ID, token)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should edit an item', async () => {
      const updateUrl = url + '/actualizar'
      const dto = generateDto()
      const updDto: any = { ...dto, id: itemId }
      const result = await updateData(updateUrl, updDto, token)
      validateTest(expect.getState().currentTestName, result)
    })
  })

  describe('Failed Cases', () => {
    describe('Failed Created Cases', () => {
      describe('Edge Cases', () => {
${edgeCasesForStrings ? edgeCasesForStrings.replace(/^/gm, '        ') : `        test('should handle very long name', async () => {
          const createUrl = url + '/adicionar'
          const dto: any = generateDto()
          dto.name = 'a'.repeat(1000)
          const result = await createData(createUrl, dto, token)
          expect(result).toBeInstanceOf(HttpError)
          expect((result as HttpError).status).toBe(400)
        })`.replace(/^/gm, '        ')}
      })

      Object.values(InvalidStandardDTO).forEach((errorType) => {
        test(\`should fail to create a new item: \${errorType}\`, async () => {
          const dto = generateInvalidDTO(errorType)
          const createUrl = url + '/adicionar'
          const result = await createData(createUrl, dto, token)
          validateWrongTest(expect.getState().currentTestName, result, errorType)
        })
      })

      Object.values(INVALID_DTO).forEach((errorType) => {
        if (errorType === INVALID_DTO.NO_ID) return
        test(\`should fail to create a new item: \${errorType}\`, async () => {
          const createUrl = url + '/adicionar'

          if (errorType === INVALID_DTO.NO_TOKEN) {
            const dto = generateDto()
            const result = await createData(createUrl, dto)
            validateWrongTest(expect.getState().currentTestName, result, errorType)
            return
          }

          const dto = generateInvalidDTO(errorType)
          const result = await createData(createUrl, dto, token)
          validateWrongTest(expect.getState().currentTestName, result, errorType)
        })
      })
    })

    describe('Failed Edit Cases', () => {
      Object.values(InvalidStandardDTO).forEach((errorType) => {
        test(\`should fail to edit an item: \${errorType}\`, async () => {
          const updateUrl = url + '/actualizar'
          const dto = generateInvalidDTO(errorType)
          const updDto: any = { ...dto, id: itemId }
          const result = await updateData(updateUrl, updDto, token)
          validateWrongTest(expect.getState().currentTestName, result, errorType)
        })
      })

      Object.values(INVALID_DTO).forEach((errorType) => {
        if (errorType === INVALID_DTO.NO_TOKEN) return
        test(\`should fail to edit an item: \${errorType}\`, async () => {
          const updateUrl = url + '/actualizar'

          if (errorType === INVALID_DTO.NO_ID) {
            const dto: any = generateDto()
            const result = await updateData(updateUrl, dto, token)
            validateWrongTest(expect.getState().currentTestName, result, errorType)
            return
          }

          const dto = generateInvalidDTO(errorType)
          const updDto: any = { ...dto, id: itemId }
          const result = await updateData(updateUrl, updDto, token)
          validateWrongTest(expect.getState().currentTestName, result, errorType)
        })
      })

      test('should handle state change with non-existent ID', async () => {
        const stateUrl = url + '/cambiar-estado'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        const result = await updateState(stateUrl, ID, token)
        expect(result).toBeInstanceOf(HttpError)
        expect((result as HttpError).status).toBe(400)
      })

      test('should handle get one with non-existent ID', async () => {
        const uno = url + '/ver-uno-public'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        const result = await fetchItemById(uno, ID)
        expect(result).toBeInstanceOf(HttpError)
        expect((result as HttpError).status).toBe(400)
      })

      test('should handle get one active with non-existent ID', async () => {
        const unoActivo = url + '/ver-uno-activo-public'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        const result = await fetchItemById(unoActivo, ID)
        expect(result).toBeInstanceOf(HttpError)
        expect((result as HttpError).status).toBe(400)
      })
    })
  })
})
`;
};

async function modifyResource() {
  try {

    // Obtener el nombre del recurso
    const resourceName = process.argv[2];
    if (!resourceName || typeof resourceName !== 'string') {
      console.error('No se proporcionó nombre del recurso válido');
      process.exit(1);
    }

    // Conectar a la base de datos
    await dataSource.initialize();
    console.log('✅ Conexión a la base de datos establecida');
    
    // Preguntar por el schema
    const schemaName = await ask('Ingrese el nombre del schema (ej: public, auth, etc): ');

    // Verificar si el schema ya existe
    const schemaExists = await dataSource.query(
      `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
      [schemaName]
    );

    if (schemaExists.length > 0) {
      console.log(`⚠️ El schema '${schemaName}' ya existe.`);
    }
    else
    {
    // Crear el nuevo schema
    await dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    console.log(`✅ Schema '${schemaName}' creado exitosamente`);
    }


    // Cerrar la conexión
    await dataSource.destroy();
    console.log('\n✅ Operación completada exitosamente');
    
    const tableName = resourceName;
    // Convertir a PascalCase
    const className = String(resourceName)
      .split('-')
      .map(part => {
        if (part && part.length > 0) {
          return String(part.charAt(0)).toUpperCase() + String(part.slice(1));
        }
        return part;
      })
      .join('');

    // Validar que el className sea válido
    if (!className || className.length === 0) {
      console.error('No se pudo generar un nombre de clase válido');
      process.exit(1);
    }

    // Crear la estructura de directorios
    const schemaDir = path.join('src', schemaName);
    const resourceDir = path.join(schemaDir, resourceName);
    const entitiesDir = path.join(resourceDir, 'entities');
    const dtoDir = path.join(resourceDir, 'dto');

    // Crear directorios si no existen
    fs.mkdirSync(schemaDir, { recursive: true });
    fs.mkdirSync(resourceDir, { recursive: true });
    fs.mkdirSync(entitiesDir, { recursive: true });
    fs.mkdirSync(dtoDir, { recursive: true });

    // Recolectar campos
    const fields: Field[] = [];
    
    // Preguntar si desea añadir campos
    let wantsToAddFields = await askYesNo('\n¿Desea añadir campos a la entidad?');

    while (wantsToAddFields) {
      const fieldName = await ask('\nNombre del campo: ');
      const fieldType = await getFieldType();
      
      // Preguntar si es único
      const isUnique = await askYesNo('¿El campo debe ser único?');
      
      // Preguntar si es nullable solo si no es único
      const isNullable = !isUnique ? await askYesNo('¿El campo puede ser nulo?') : false;
      
      let decoratorOptions = [];
      if (isNullable) decoratorOptions.push('nullable: true');
      if (isUnique) decoratorOptions.push('unique: true');
      
      const decorator = decoratorOptions.length > 0 
        ? `@Column({ ${decoratorOptions.join(', ')} })`
        : '@Column()';
      
      fields.push({
        name: fieldName,
        type: fieldType,
        decorator
      });

      wantsToAddFields = await askYesNo('¿Desea añadir otro campo?');
    }

    // Generar el contenido de la entidad
    const fieldsContent = fields
      .map(field => `  ${field.decorator}\n  ${field.name}: ${field.type};`)
      .join('\n\n');

    // const entityPath = path.join(process.cwd(), 'src', resourceName, 'entities', `${resourceName}.entity.ts`);
    
    // Modificar las rutas de los archivos generados
    const entityPath = path.join(entitiesDir, `${resourceName}.entity.ts`);
    const dtoPath = path.join(dtoDir, `create-${resourceName}.dto.ts`);
    const dtoIndexPath = path.join(dtoDir, 'index.ts');
    const updateDtoPath = path.join(dtoDir, `update-${resourceName}.dto.ts`);
    const modulePath = path.join(resourceDir, `${resourceName}.module.ts`);
    const servicePath = path.join(resourceDir, `${resourceName}.service.ts`);
    const controllerPath = path.join(resourceDir, `${resourceName}.controller.ts`);
    const testDir = path.join(resourceDir, 'test');
    const e2eTestPath = path.join(testDir, `test.e2e-spec.ts`);

    const entityContent = `import { Entity, Column } from 'typeorm';
import { BasicInformationEntity } from './../../../common/base/entities';

@Entity({ name: '${tableName}', schema: '${schemaName}' })
export class ${className} extends BasicInformationEntity {
${fieldsContent}
}
`;

    fs.writeFileSync(entityPath, entityContent);

    // Después de generar la entidad, generamos el DTO
    // const dtoPath = path.join(process.cwd(), 'src', resourceName, 'dto', `create-${resourceName}.dto.ts`);
    
    // Generar el contenido del DTO con los decoradores correspondientes según el tipo
    const dtoFieldsContent = fields
      .map(field => {
        const decorators = [];
        
        // Agregar IsOptional si el campo es nullable
        if (field.decorator.includes('nullable: true')) {
          decorators.push('@IsOptional()');
        } else {
          decorators.push('@IsNotEmpty(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_CANNOT_BE_EMPTY))');
        }

        // Agregar validador según el tipo
        switch(field.type) {
          case 'string':
            decorators.push('@IsString(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_STRING))');
            break;
          case 'number':
            decorators.push('@IsNumber({}, withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_NUMBER))');
            break;
          case 'boolean':
            decorators.push('@IsBoolean(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_BOOLEAN))');
            break;
          case 'Date':
            decorators.push('@IsDate(withDtoContext(DTO_MESSAGES.VALIDATION.FIELD_MUST_BE_DATE))');
            break;
        }

        const decoratorString = decorators.join('\n  ');
        return `  ${decoratorString}\n  ${field.name}${field.decorator.includes('nullable: true') ? '?' : ''}: ${field.type};`;
      })
      .join('\n\n');

    const dtoContent = `import { IsNotEmpty, IsString, IsNumber, IsBoolean, IsDate, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BaseExtendedDto } from './../../../common/base/dto/base.dto';
import { DTO_MESSAGES, withDtoContext } from './../../../common/resource/dto.messages';

export class Create${className}Dto extends BaseExtendedDto {
${dtoFieldsContent}
}
`;

    fs.writeFileSync(dtoPath, dtoContent);

    // Generar index.ts para los DTOs
    // const dtoIndexPath = path.join(process.cwd(), 'src', resourceName, 'dto', 'index.ts');
    const dtoIndexContent = `export * from './create-${resourceName}.dto';
export * from './update-${resourceName}.dto';
`;

    fs.writeFileSync(dtoIndexPath, dtoIndexContent);

    // Generar update DTO
    // const updateDtoPath = path.join(process.cwd(), 'src', resourceName, 'dto', `update-${resourceName}.dto.ts`);
    const updateDtoContent = `import { PartialType } from '@nestjs/swagger';
import { Create${className}Dto } from './create-${resourceName}.dto';

export class Update${className}Dto extends PartialType(Create${className}Dto) {}
`;

    fs.writeFileSync(updateDtoPath, updateDtoContent);

    // Generar el module
    const moduleContent = `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${className} } from './entities/${resourceName}.entity';
import { ${className}Service } from './${resourceName}.service';
import { ${className}Controller } from './${resourceName}.controller';
import { Traza } from '../../security/trazas/entities/traza.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([${className}, Traza])
  ],
  controllers: [${className}Controller],
  providers: [${className}Service],
  exports: [${className}Service]
})
export class ${className}Module {}
`;

    fs.writeFileSync(modulePath, moduleContent);

  // Generar el service
const serviceContent = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseServiceCRUD } from './../../../common/base/class/base.service.crud.class';
import { ${className} } from './entities/${resourceName}.entity';
import { Create${className}Dto, Update${className}Dto } from './dto';
import { IdDto } from './../../../common/base/dto/id.dto';
import { Traza } from '../../security/trazas/entities/traza.entity';
import { CreateTrazaDto } from '../../security/trazas/dto/create-traza.dto';


@Injectable()
export class ${className}Service extends BaseServiceCRUD<
${className},
Create${className}Dto,
Update${className}Dto> {
  constructor(
    @InjectRepository(${className})
    private readonly repository: Repository<${className}>,
    @InjectRepository(Traza)
    private readonly trazaRepository: Repository<Traza>,
  ) {
    super(repository)
  }

  override async findAllItems() {
    return await super.findAllItems();
  }


  override async findActiveItems() {
    return await super.findActiveItems();
  }

  override async findOne(id: IdDto) {
    return await super.findOne(id);
  }

  async Add(createDto: Create${className}Dto, traza: CreateTrazaDto) {
    const result = await super.create(createDto);
    if (result.isSuccess) {
      await this.trazaRepository.save(traza);
    }
    return result;
  }

  async Edit(updateDto: Update${className}Dto, traza: CreateTrazaDto) {
    const result = await super.update(updateDto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async State(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.active(dto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    return result;
  }

  async Delete(dto: IdDto, traza: CreateTrazaDto) {
    const result = await super.remove(dto);
    if (result.isSuccess) {
      this.trazaRepository.save(traza);
    }
    return result;
  }

}`;

    fs.writeFileSync(servicePath, serviceContent);

    // Generar el controller
const controllerContent = `import { Controller } from '@nestjs/common';
import { BaseControllerCRUD } from './../../../common/base/class/base.controller.crud.class';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Create${className}Dto, Update${className}Dto } from './dto';
import { ${className}Service } from './${resourceName}.service';
import { IdDto } from './../../../common/base/dto/id.dto';
import { CreateTrazaDto } from './../../../security/trazas/dto/create-traza.dto';
import { 
  Body,
  Get,
  Put,
  ValidationPipe,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { 
  Body,
  Get,
  Put,
  ValidationPipe,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { JwtGuard } from './../../../security/auth/guard';
import { RouteAccessGuard } from './../../../common/guards/route-access.guard';
import { ReturnDto } from './../../../common/base/dto';

@ApiTags('${resourceName}')
@Controller('${schemaName}/${resourceName}')
export class ${className}Controller extends BaseControllerCRUD<
Create${className}Dto,
Update${className}Dto,
${className}Service
> {
  constructor(private readonly Service: ${className}Service) {
    super(Service);
  }

     @Get('todos')
    override async findItems() {
      return super.findItems();
    }
  
  @UseGuards(RouteAccessGuard)
  @Get(['ver-todos-activos-secure', 'ver-todos-activos-public'])
    override async findActiveItems(
    // @GetUserAdmin() user: User
    ) {
      return super.findActiveItems();
    }

  @UseGuards(RouteAccessGuard)
  @Get(['ver-uno-secure', 'ver-uno-public'])  
  @ApiOperation({ summary: 'Obtener un item por ID' })
  @ApiResponse({
    status: 200,
    description: 'Item obtenido exitosamente',
    type: ReturnDto,
  })
  @ApiBadRequestResponse({
    description: 'Error de validación o datos incorrectos.',
  })
  @ApiBody({ type: IdDto, description: 'ID del elemento a buscar.' })
  override async findOne(@Body(new ValidationPipe({ transform: true })) dto: IdDto, securityParam?: any): Promise<ReturnDto> {
    return this.Service.findOne(dto);
  }
  
  
  @UseGuards(RouteAccessGuard)
  @Get(['ver-uno-activo-secure', 'ver-uno-activo-public'])  
  @ApiOperation({ summary: 'Obtener un item por ID' })
  @ApiResponse({
    status: 200,
    description: 'Item obtenido exitosamente',
    type: ReturnDto,
  })
  @ApiBadRequestResponse({
    description: 'Error de validación o datos incorrectos.',
  })
  @ApiBody({ type: IdDto, description: 'ID del elemento a buscar.' })
  override async findOneActive(@Body(new ValidationPipe({ transform: true })) dto: IdDto, securityParam?: any): Promise<ReturnDto> {
    return this.Service.findOneActive(dto);
  }

  @UseGuards(JwtGuard)
  @Post('adicionar')
  @ApiOperation({ summary: 'Crear un nuevo item en ${resourceName}' })
  @ApiResponse({ status: 200, description: 'Item creado exitosamente,returnDto.data={object saved}' })
  @ApiResponse({ status: 400, description: 'Datos inválidos proporcionados' })
  async Add(
    @Body(new ValidationPipe({ transform: true })) createDto: Create${className}Dto,
    @Req() request: Request
  ) {
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    const { rules, ...trazaSinRules } = createDto;
    traza.traza = trazaSinRules;
    return await this.Service.Add(createDto, traza);
  }

  @UseGuards(JwtGuard)
  @Patch('actualizar')
  @ApiOperation({ summary: 'Actualizar un item existente en ${resourceName}' })
  @ApiResponse({ status: 200, description: 'Item actualizado exitosamente,returnDto.data={object updated} ' })
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async Edit(
    @Body(new ValidationPipe({ transform: true })) updateDto: Update${className}Dto,
    @Req() request: Request
  ) {
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    const { rules, ...trazaSinRules } = updateDto;
    traza.traza = trazaSinRules;
    return await this.Service.Edit(updateDto, traza);
  }

  @UseGuards(JwtGuard)
  @Put('cambiar-estado')
  @ApiOperation({ summary: 'Activar/Desactivar un item de ${resourceName}' })
  @ApiResponse({ status: 200, description: 'Item activado/desactivado exitosamente,returnDto.data={object active/inactive}  '})
  @ApiResponse({ status: 400, description: 'Item no encontrado' })
  async State(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  @Req() request: Request
  ) {
    const clientIp = request.socket.remoteAddress;
    const ipv4 = clientIp?.replace('::ffff:', '');
    const executedUrl = request.originalUrl;
    const traza = new CreateTrazaDto();
    traza.ip = ipv4;
    traza.url = executedUrl;
    traza.traza = dto;
    return await this.Service.State(dto, traza);
  }

  // @UseGuards(JwtGuard)
  // @Delete('eliminar')
  // @ApiOperation({ summary: 'Eliminar un item de ${resourceName}' })
  // @ApiResponse({ status: 200, description: 'Item eliminado exitosamente,returnDto.data={object deleted}' })
  // @ApiResponse({ status: 400, description: 'Item no encontrado' })
  // async Delete(@Body(new ValidationPipe({ transform: true })) dto: IdDto,
  // @Req() request: Request
  // ) {
  //   const clientIp = request.socket.remoteAddress;
  //   const ipv4 = clientIp?.replace('::ffff:', '');
  //   const executedUrl = request.originalUrl;
  //   const traza = new CreateTrazaDto();
  //   traza.ip = ipv4;
  //   traza.url = executedUrl;
  //   traza.traza = dto;
  //   return await this.Service.Delete(dto, traza);
  // }
}`;

    fs.writeFileSync(controllerPath, controllerContent);

    // Generar test e2e (OK + failures) dinámicamente según campos
    fs.mkdirSync(testDir, { recursive: true });
    const e2eContent = buildE2eTestContent({
      schemaName,
      resourceName,
      className,
      fields,
    });
    fs.writeFileSync(e2eTestPath, e2eContent);

    // Actualizar ormconfig.ts si existe
    const ormConfigPath = path.join(process.cwd(), 'ormconfig.ts');
    if (fs.existsSync(ormConfigPath)) {
      let ormConfigContent = fs.readFileSync(ormConfigPath, 'utf8');

      // // Agregar import de la nueva entidad
      const importStatement = `import { ${className} } from '../../../${schemaName}/${resourceName}/entities/${resourceName}.entity';\n`;
      
      // // Encontrar la última importación
      // palabra //import
      const lastImportIndex = ormConfigContent.lastIndexOf('//import');
      const lastImportEndIndex = ormConfigContent.indexOf('\n', lastImportIndex) + 1;
      
      // Insertar el nuevo import
      ormConfigContent = 
          ormConfigContent.slice(0, lastImportEndIndex) +
          importStatement +
          ormConfigContent.slice(lastImportEndIndex);
       
      // Encontrar el array de entities
      //  palabra //////------- New tables
      const entitiesArrayStart = ormConfigContent.indexOf('//////------- New tables') + '//////------- New tables'.length;
      ormConfigContent = ormConfigContent.slice(0, entitiesArrayStart) + `\n    ${className},` + ormConfigContent.slice(entitiesArrayStart);
      
      fs.writeFileSync(ormConfigPath, ormConfigContent);
    }

    // Después de generar todos los archivos, agregar esta sección para actualizar app.module.ts
    const appModulePath = path.join('src', 'app.module.ts');
    if (fs.existsSync(appModulePath)) {
      let appModuleContent = fs.readFileSync(appModulePath, 'utf8');

      // Agregar import del nuevo módulo solo si no existe
      const importStatement = `import { ${className}Module } from './${schemaName}/${resourceName}/${resourceName}.module';\n`;
      const oldImportStatement = `import { ${className}Module } from './${resourceName}/${resourceName}.module';\n`;
      if (appModuleContent.includes(oldImportStatement)) {
        appModuleContent = appModuleContent.replace(oldImportStatement, '');
        const oldResourceDir = path.join('src', resourceName);
        if (fs.existsSync(oldResourceDir)) {
          fs.rmSync(oldResourceDir, { recursive: true, force: true });
          console.log(`- Directorio antiguo eliminado: ${oldResourceDir}`);
        }
      }
      // remover directorios creados en src
      const oldResourceDir = path.join('src', resourceName);
      if (fs.existsSync(oldResourceDir)) {
        fs.rmSync(oldResourceDir, { recursive: true, force: true });
        console.log(`- Directorio antiguo eliminado: ${oldResourceDir}`);
      }
      // remover directorios creados en src
      const oldResourceDir2 = path.join('src', className);
      if (fs.existsSync(oldResourceDir2)) {
        fs.rmSync(oldResourceDir2, { recursive: true, force: true });
        console.log(`- Directorio antiguo eliminado: ${oldResourceDir2}`);
      }
      
      if (!appModuleContent.includes(importStatement)) {
        // Encontrar la última importación
        const lastImportIndex = appModuleContent.lastIndexOf('//import');
        const lastImportEndIndex = appModuleContent.indexOf('\n', lastImportIndex) + 1;
        appModuleContent =
          appModuleContent.slice(0, lastImportEndIndex) +
          importStatement +
          appModuleContent.slice(lastImportEndIndex);
      }

      // Agregar el módulo al array de imports solo si no existe
      const moduleDecoratorStart = appModuleContent.indexOf('@Module({');
      const importsArrayStart = appModuleContent.indexOf('imports: [', moduleDecoratorStart);
      const importsArrayEnd = appModuleContent.indexOf(']', importsArrayStart);
      const importsArrayContent = appModuleContent.slice(importsArrayStart, importsArrayEnd);
      if (!importsArrayContent.includes(`${className}Module`)) {
        appModuleContent =
          appModuleContent.slice(0, importsArrayEnd) +
          `\n    ${className}Module,` +
          appModuleContent.slice(importsArrayEnd);
      }

      fs.writeFileSync(appModulePath, appModuleContent);
      console.log('- Actualizado app.module.ts');
    }

    console.log(`\nRecurso ${resourceName} generado completamente:`);
    console.log('- Entidad creada');
    console.log('- DTOs generados');
    console.log('- Módulo configurado');
    console.log('- Servicio implementado');
    if (fs.existsSync(ormConfigPath)) {
      console.log('- Actualizado fichero ormconfig.ts');
    }

    rl.close();

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

modifyResource();