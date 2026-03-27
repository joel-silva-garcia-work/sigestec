import * as fs from 'fs'
import * as path from 'path'

type ControllerInfo = {
  controllerPath: string
  route: string | null
  resourceDir: string
}

type DtoField = {
  name: string
  type: string
  optional: boolean
  decorators: string[]
}

const SRC_DIR = path.join(process.cwd(), 'src')

const walkFiles = (dir: string, predicate: (p: string) => boolean, out: string[] = []) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walkFiles(p, predicate, out)
    else if (e.isFile() && predicate(p)) out.push(p)
  }
  return out
}

const readText = (p: string) => fs.readFileSync(p, 'utf8')

const extractControllerRoute = (content: string): string | null => {
  const m = content.match(/@Controller\(\s*['"]([^'"]+)['"]\s*\)/)
  return m?.[1] ?? null
}

const isCrudController = (content: string) => /extends\s+BaseControllerCRUD\s*</.test(content)

const findCreateDtoPath = (resourceDir: string): string | null => {
  const dtoDir = path.join(resourceDir, 'dto')
  if (!fs.existsSync(dtoDir)) return null
  const files = fs.readdirSync(dtoDir).filter((f) => /^create-.*\.dto\.ts$/.test(f))
  if (files.length === 0) return null
  // If multiple, choose the shortest name (usually create-<resource>.dto.ts)
  files.sort((a, b) => a.length - b.length)
  return path.join(dtoDir, files[0])
}

const parseDtoFields = (dtoContent: string): DtoField[] => {
  const lines = dtoContent.split(/\r?\n/)
  const fields: DtoField[] = []

  let decoratorsBuf: string[] = []
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.startsWith('@')) {
      decoratorsBuf.push(line)
      continue
    }

    // reset on empty lines
    if (line.length === 0) {
      decoratorsBuf = []
      continue
    }

    const m = rawLine.match(/^\s*([a-zA-Z_]\w*)\??\s*:\s*([^;=]+)[;=]/)
    if (!m) {
      // if we hit other statements, clear decorators buffer to avoid leaking
      if (!rawLine.startsWith(' ') && !rawLine.startsWith('\t')) decoratorsBuf = []
      continue
    }

    const name = m[1]
    const type = m[2].trim()
    const optional = rawLine.includes('?:') || decoratorsBuf.some((d) => d.includes('@IsOptional'))

    fields.push({
      name,
      type,
      optional,
      decorators: decoratorsBuf,
    })
    decoratorsBuf = []
  }

  return fields
}

const hasIsUUID = (f: DtoField) => f.decorators.some((d) => d.startsWith('@IsUUID'))

const isBaseExtendedField = (name: string) =>
  ['id', 'name', 'description', 'isActive', 'rules'].includes(name)

const toEnumKey = (name: string) =>
  String(name)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .toUpperCase()

const buildTest = (params: {
  route: string
  guardedAdd: boolean
  guardedEdit: boolean
  guardedState: boolean
  dtoFields: DtoField[]
}) => {
  const { route, guardedAdd, guardedEdit, guardedState, dtoFields } = params
  const required = dtoFields.filter((f) => !f.optional && !isBaseExtendedField(f.name))

  const requiredUuidFields = required.filter((f) => hasIsUUID(f) && f.type.includes('string'))
  const requiredNonUuidFields = required.filter((f) => !requiredUuidFields.includes(f))

  const invalidEnumEntries: string[] = []
  const invalidSwitchCases: string[] = []

  for (const f of required.filter((x) => !isBaseExtendedField(x.name))) {
    const k = toEnumKey(f.name)
    invalidEnumEntries.push(`  NULL_${k} = 'NULL_${k}',`)
    invalidEnumEntries.push(`  NO_${k} = 'NO_${k}',`)

    // empty + wrong type mainly for string
    if (f.type.includes('string')) {
      invalidEnumEntries.push(`  EMPTY_${k} = 'EMPTY_${k}',`)
      invalidEnumEntries.push(`  WRONG_${k}_TYPE = 'WRONG_${k}_TYPE',`)
    } else if (f.type.includes('number') || f.type.includes('boolean') || f.type.includes('Date')) {
      invalidEnumEntries.push(`  WRONG_${k}_TYPE = 'WRONG_${k}_TYPE',`)
    }

    invalidSwitchCases.push(`    case INVALID_DTO.NULL_${k}:\n      invalidDto.${f.name} = null as any\n      break`)
    invalidSwitchCases.push(`    case INVALID_DTO.NO_${k}:\n      delete invalidDto.${f.name}\n      break`)

    if (f.type.includes('string')) {
      invalidSwitchCases.push(`    case INVALID_DTO.EMPTY_${k}:\n      invalidDto.${f.name} = '' as any\n      break`)
      invalidSwitchCases.push(`    case INVALID_DTO.WRONG_${k}_TYPE:\n      invalidDto.${f.name} = 123 as any\n      break`)
    } else if (f.type.includes('number')) {
      invalidSwitchCases.push(`    case INVALID_DTO.WRONG_${k}_TYPE:\n      invalidDto.${f.name} = 'invalid' as any\n      break`)
    } else if (f.type.includes('boolean')) {
      invalidSwitchCases.push(`    case INVALID_DTO.WRONG_${k}_TYPE:\n      invalidDto.${f.name} = 'invalid' as any\n      break`)
    } else if (f.type.includes('Date')) {
      invalidSwitchCases.push(`    case INVALID_DTO.WRONG_${k}_TYPE:\n      invalidDto.${f.name} = 'invalid-date' as any\n      break`)
    }
  }

  const dtoLines: string[] = []
  dtoLines.push(`    name: \`Item \${randomString(10)}\`,`)
  dtoLines.push(`    description: \`Desc \${randomString(12)}\`,`)
  dtoLines.push(`    isActive: true,`)

  // Required UUID fields resolved dynamically
  for (const f of requiredUuidFields) {
    dtoLines.push(`    ${f.name}: resolved.${f.name},`)
  }
  for (const f of requiredNonUuidFields) {
    if (f.type.includes('string')) dtoLines.push(`    ${f.name}: randomString(12),`)
    else if (f.type.includes('number')) dtoLines.push(`    ${f.name}: 1,`)
    else if (f.type.includes('boolean')) dtoLines.push(`    ${f.name}: true,`)
    else if (f.type.includes('Date')) dtoLines.push(`    ${f.name}: new Date(),`)
  }

  const resolveFn =
    requiredUuidFields.length === 0
      ? `const resolveRequiredUuids = async () => ({})`
      : `const resolveRequiredUuids = async () => {
  const resolved: any = {}
${requiredUuidFields
  .map(
    (f) => `  resolved.${f.name} = await resolveForeignId('${f.name}')`,
  )
  .join('\n')}
  return resolved
}`

  const noTokenTests =
    guardedAdd || guardedEdit || guardedState
      ? `
      test('should fail without JWT token', async () => {
        ${
          guardedAdd
            ? `const createUrl = url + '/adicionar'
        const dto = generateDto()
        const result = await createData(createUrl, dto)
        expect(result).toBeInstanceOf(HttpError)
        expect((result as HttpError).status).toBe(401)`
            : guardedEdit
              ? `const updateUrl = url + '/actualizar'
        const dto: any = generateDto()
        dto.id = '00000000-0000-0000-0000-000000000000'
        const result = await updateData(updateUrl, dto)
        expect(result).toBeInstanceOf(HttpError)
        expect((result as HttpError).status).toBe(401)`
              : `const stateUrl = url + '/cambiar-estado'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        const result = await updateState(stateUrl, ID)
        expect(result).toBeInstanceOf(HttpError)
        expect((result as HttpError).status).toBe(401)`
        }
      })`
      : ''

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
  NO_ID = 'NO_ID',
}

const validateWrongTest = (
  testName: string,
  result: any,
  invalid: InvalidStandardDTO | INVALID_DTO,
) => {
  if (result instanceof HttpError) {
    expect(result).toBeInstanceOf(HttpError)
    expect(result.status).toBe(400)
  } else {
    expect(result).toBeTruthy()
  }
}

// Intenta resolver IDs para campos UUID requeridos (FKs)
const resolveForeignId = async (field: string): Promise<string> => {
  const candidates = [
    \`\${field}/todos\`,
    \`\${field}s/todos\`,
    \`comun/\${field}/todos\`,
    \`comun/\${field}s/todos\`,
    \`taller/\${field}/todos\`,
    \`taller/\${field}s/todos\`,
    \`security/\${field}/todos\`,
    \`security/\${field}s/todos\`,
  ]
  for (const c of candidates) {
    const res = await fetchData(c)
    if (res && !(res instanceof HttpError) && res.isSuccess && Array.isArray(res.data) && res.data[0]?.id) {
      return res.data[0].id
    }
  }
  throw new Error(\`No se pudo resolver un id para el campo UUID requerido: \${field}\`)
}

${resolveFn}

describe('API Tests', () => {
  jest.setTimeout(9000000)
  let token: any
  let itemId: any
  let resolved: any = {}
  const url = '${route}'

  beforeAll(async () => {
    token = await login()
    resolved = await resolveRequiredUuids()
  })

  const generateDto = () => ({
${dtoLines.join('\n')}
  })

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
${invalidSwitchCases.length ? `\n${invalidSwitchCases.map((c) => c.replace(/^/gm, '      ')).join('\n')}\n` : ''}
      default:
        break
    }
    return invalidDto
  }

  describe('Basic CRUD', () => {
    test('should read all items', async () => {
      const todos = url + '/todos'
      const result = await fetchData(todos)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should create a new item', async () => {
      const createUrl = url + '/adicionar'
      const dto = generateDto()
      const result = await createData(createUrl, dto, ${guardedAdd ? 'token' : 'undefined'})
      validateTest(expect.getState().currentTestName, result)
      if (result?.isSuccess) itemId = result.data.id
      else if (result?.data?.id) itemId = result.data.id
      else throw new Error('Failed to create item')
    })

    test('should get all active items', async () => {
      const todosActivos = url + '/ver-todos-activos-public'
      const result = await fetchActiveItems(todosActivos, token)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should get an item by ID', async () => {
      const uno = url + '/ver-uno-public'
      const ID = new IdDto()
      ID.id = itemId
      const result = await fetchItemById(uno, ID, token)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should get an active item by ID', async () => {
      const unoActivo = url + '/ver-uno-activo-public'
      const ID = new IdDto()
      ID.id = itemId
      const result = await fetchItemById(unoActivo, ID, token)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should set active/inactive item by ID', async () => {
      const stateUrl = url + '/cambiar-estado'
      const ID = new IdDto()
      ID.id = itemId
      const result = await updateState(stateUrl, ID, ${guardedState ? 'token' : 'undefined'})
      validateTest(expect.getState().currentTestName, result)
    })

    test('should edit an item', async () => {
      const updateUrl = url + '/actualizar'
      const dto: any = generateDto()
      dto.id = itemId
      const result = await updateData(updateUrl, dto, ${guardedEdit ? 'token' : 'undefined'})
      validateTest(expect.getState().currentTestName, result)
    })
  })

  describe('Failed Cases', () => {
    Object.values(InvalidStandardDTO).forEach((errorType) => {
      test(\`should fail to create a new item: \${errorType}\`, async () => {
        const dto = generateInvalidDTO(errorType)
        const createUrl = url + '/adicionar'
        const result = await createData(createUrl, dto, ${guardedAdd ? 'token' : 'undefined'})
        validateWrongTest(expect.getState().currentTestName, result, errorType)
      })
    })

    Object.values(INVALID_DTO).forEach((errorType) => {
      test(\`should fail to create a new item: \${errorType}\`, async () => {
        const dto = generateInvalidDTO(errorType)
        const createUrl = url + '/adicionar'
        const result = await createData(createUrl, dto, ${guardedAdd ? 'token' : 'undefined'})
        validateWrongTest(expect.getState().currentTestName, result, errorType)
      })
    })

${noTokenTests}

    test('should handle get one with non-existent ID', async () => {
      const uno = url + '/ver-uno-public'
      const ID = new IdDto()
      ID.id = '00000000-0000-0000-0000-000000000000'
      const result = await fetchItemById(uno, ID, token)
      expect(result).toBeInstanceOf(HttpError)
      expect((result as HttpError).status).toBe(400)
    })
  })
})
`
}

const parseGuardUsage = (content: string) => {
  // very simple heuristics: check decorators near method names
  const guardedAdd = /@UseGuards\(\s*JwtGuard\s*\)[\s\S]{0,200}async\s+Add\s*\(/.test(content)
  const guardedEdit = /@UseGuards\(\s*JwtGuard\s*\)[\s\S]{0,200}async\s+Edit\s*\(/.test(content)
  const guardedState = /@UseGuards\(\s*JwtGuard\s*\)[\s\S]{0,200}async\s+State\s*\(/.test(content)
  return { guardedAdd, guardedEdit, guardedState }
}

const main = () => {
  const controllers = walkFiles(SRC_DIR, (p) => p.endsWith('.controller.ts'))

  const infos: ControllerInfo[] = []
  for (const controllerPath of controllers) {
    const content = readText(controllerPath)
    if (!isCrudController(content)) continue

    const route = extractControllerRoute(content)
    const resourceDir = path.dirname(controllerPath)
    infos.push({ controllerPath, route, resourceDir })
  }

  for (const info of infos) {
    const controllerContent = readText(info.controllerPath)
    const { guardedAdd, guardedEdit, guardedState } = parseGuardUsage(controllerContent)

    const route = info.route
    if (!route) continue

    const createDtoPath = findCreateDtoPath(info.resourceDir)
    if (!createDtoPath) continue

    const dtoContent = readText(createDtoPath)
    const dtoFields = parseDtoFields(dtoContent)

    const testDir = path.join(info.resourceDir, 'test')
    const testPath = path.join(testDir, 'test.e2e-spec.ts')
    fs.mkdirSync(testDir, { recursive: true })

    const testContent = buildTest({
      route,
      guardedAdd,
      guardedEdit,
      guardedState,
      dtoFields,
    })

    fs.writeFileSync(testPath, testContent)
  }

  console.log(`✅ Tests e2e generados/actualizados para ${infos.length} controllers CRUD.`)
}

main()

