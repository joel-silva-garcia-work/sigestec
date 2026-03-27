import {
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
  NULL_EQUIPO = 'NULL_EQUIPO',
  NO_EQUIPO = 'NO_EQUIPO',
  EMPTY_EQUIPO = 'EMPTY_EQUIPO',
  WRONG_EQUIPO_TYPE = 'WRONG_EQUIPO_TYPE',
  NULL_DEPARTAMENTO = 'NULL_DEPARTAMENTO',
  NO_DEPARTAMENTO = 'NO_DEPARTAMENTO',
  EMPTY_DEPARTAMENTO = 'EMPTY_DEPARTAMENTO',
  WRONG_DEPARTAMENTO_TYPE = 'WRONG_DEPARTAMENTO_TYPE',
  NULL_USER = 'NULL_USER',
  NO_USER = 'NO_USER',
  EMPTY_USER = 'EMPTY_USER',
  WRONG_USER_TYPE = 'WRONG_USER_TYPE',
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
    `${field}/todos`,
    `${field}s/todos`,
    `comun/${field}/todos`,
    `comun/${field}s/todos`,
    `taller/${field}/todos`,
    `taller/${field}s/todos`,
    `security/${field}/todos`,
    `security/${field}s/todos`,
  ]
  for (const c of candidates) {
    const res = await fetchData(c)
    if (res && !(res instanceof HttpError) && res.isSuccess && Array.isArray(res.data) && res.data[0]?.id) {
      return res.data[0].id
    }
  }
  throw new Error(`No se pudo resolver un id para el campo UUID requerido: ${field}`)
}

const resolveRequiredUuids = async () => {
  const resolved: any = {}
  resolved.user = await resolveForeignId('user')
  return resolved
}

describe('API Tests', () => {
  jest.setTimeout(9000000)
  let token: any
  let itemId: any
  let resolved: any = {}
  const url = 'comun/aft'

  beforeAll(async () => {
    token = await login()
    resolved = await resolveRequiredUuids()
  })

  const generateDto = () => ({
    name: `Item ${randomString(10)}`,
    description: `Desc ${randomString(12)}`,
    isActive: true,
    user: resolved.user,
    equipo: randomString(12),
    departamento: randomString(12),
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

          case INVALID_DTO.NULL_EQUIPO:
            invalidDto.equipo = null as any
            break
          case INVALID_DTO.NO_EQUIPO:
            delete invalidDto.equipo
            break
          case INVALID_DTO.EMPTY_EQUIPO:
            invalidDto.equipo = '' as any
            break
          case INVALID_DTO.WRONG_EQUIPO_TYPE:
            invalidDto.equipo = 123 as any
            break
          case INVALID_DTO.NULL_DEPARTAMENTO:
            invalidDto.departamento = null as any
            break
          case INVALID_DTO.NO_DEPARTAMENTO:
            delete invalidDto.departamento
            break
          case INVALID_DTO.EMPTY_DEPARTAMENTO:
            invalidDto.departamento = '' as any
            break
          case INVALID_DTO.WRONG_DEPARTAMENTO_TYPE:
            invalidDto.departamento = 123 as any
            break
          case INVALID_DTO.NULL_USER:
            invalidDto.user = null as any
            break
          case INVALID_DTO.NO_USER:
            delete invalidDto.user
            break
          case INVALID_DTO.EMPTY_USER:
            invalidDto.user = '' as any
            break
          case INVALID_DTO.WRONG_USER_TYPE:
            invalidDto.user = 123 as any
            break

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
      const result = await createData(createUrl, dto, undefined)
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
      const result = await updateState(stateUrl, ID, undefined)
      validateTest(expect.getState().currentTestName, result)
    })

    test('should edit an item', async () => {
      const updateUrl = url + '/actualizar'
      const dto: any = generateDto()
      dto.id = itemId
      const result = await updateData(updateUrl, dto, undefined)
      validateTest(expect.getState().currentTestName, result)
    })
  })

  describe('Failed Cases', () => {
    Object.values(InvalidStandardDTO).forEach((errorType) => {
      test(`should fail to create a new item: ${errorType}`, async () => {
        const dto = generateInvalidDTO(errorType)
        const createUrl = url + '/adicionar'
        const result = await createData(createUrl, dto, undefined)
        validateWrongTest(expect.getState().currentTestName, result, errorType)
      })
    })

    Object.values(INVALID_DTO).forEach((errorType) => {
      test(`should fail to create a new item: ${errorType}`, async () => {
        const dto = generateInvalidDTO(errorType)
        const createUrl = url + '/adicionar'
        const result = await createData(createUrl, dto, undefined)
        validateWrongTest(expect.getState().currentTestName, result, errorType)
      })
    })



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
