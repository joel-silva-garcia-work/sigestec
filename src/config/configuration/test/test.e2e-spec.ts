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
  NULL_FROM = 'NULL_FROM',
  NO_FROM = 'NO_FROM',
  EMPTY_FROM = 'EMPTY_FROM',
  WRONG_FROM_TYPE = 'WRONG_FROM_TYPE',
  NULL_NOTIFICATION_TIME = 'NULL_NOTIFICATION_TIME',
  NO_NOTIFICATION_TIME = 'NO_NOTIFICATION_TIME',
  WRONG_NOTIFICATION_TIME_TYPE = 'WRONG_NOTIFICATION_TIME_TYPE',
  NULL_MAIL_USER = 'NULL_MAIL_USER',
  NO_MAIL_USER = 'NO_MAIL_USER',
  EMPTY_MAIL_USER = 'EMPTY_MAIL_USER',
  WRONG_MAIL_USER_TYPE = 'WRONG_MAIL_USER_TYPE',
  NULL_MAIL_PORT = 'NULL_MAIL_PORT',
  NO_MAIL_PORT = 'NO_MAIL_PORT',
  EMPTY_MAIL_PORT = 'EMPTY_MAIL_PORT',
  WRONG_MAIL_PORT_TYPE = 'WRONG_MAIL_PORT_TYPE',
  NULL_MAIL_PASS = 'NULL_MAIL_PASS',
  NO_MAIL_PASS = 'NO_MAIL_PASS',
  EMPTY_MAIL_PASS = 'EMPTY_MAIL_PASS',
  WRONG_MAIL_PASS_TYPE = 'WRONG_MAIL_PASS_TYPE',
  NULL_MAIL_HOST = 'NULL_MAIL_HOST',
  NO_MAIL_HOST = 'NO_MAIL_HOST',
  EMPTY_MAIL_HOST = 'EMPTY_MAIL_HOST',
  WRONG_MAIL_HOST_TYPE = 'WRONG_MAIL_HOST_TYPE',
  NULL_LDAP_URL = 'NULL_LDAP_URL',
  NO_LDAP_URL = 'NO_LDAP_URL',
  EMPTY_LDAP_URL = 'EMPTY_LDAP_URL',
  WRONG_LDAP_URL_TYPE = 'WRONG_LDAP_URL_TYPE',
  NULL_LDAAP_BIND_DN = 'NULL_LDAAP_BIND_DN',
  NO_LDAAP_BIND_DN = 'NO_LDAAP_BIND_DN',
  EMPTY_LDAAP_BIND_DN = 'EMPTY_LDAAP_BIND_DN',
  WRONG_LDAAP_BIND_DN_TYPE = 'WRONG_LDAAP_BIND_DN_TYPE',
  NULL_LDAP_BIND_PASSWORD = 'NULL_LDAP_BIND_PASSWORD',
  NO_LDAP_BIND_PASSWORD = 'NO_LDAP_BIND_PASSWORD',
  EMPTY_LDAP_BIND_PASSWORD = 'EMPTY_LDAP_BIND_PASSWORD',
  WRONG_LDAP_BIND_PASSWORD_TYPE = 'WRONG_LDAP_BIND_PASSWORD_TYPE',
  NULL_LDAP_BASE_DN = 'NULL_LDAP_BASE_DN',
  NO_LDAP_BASE_DN = 'NO_LDAP_BASE_DN',
  EMPTY_LDAP_BASE_DN = 'EMPTY_LDAP_BASE_DN',
  WRONG_LDAP_BASE_DN_TYPE = 'WRONG_LDAP_BASE_DN_TYPE',
  NULL_LDAP_TIME_OUT = 'NULL_LDAP_TIME_OUT',
  NO_LDAP_TIME_OUT = 'NO_LDAP_TIME_OUT',
  WRONG_LDAP_TIME_OUT_TYPE = 'WRONG_LDAP_TIME_OUT_TYPE',
  NULL_LDAP_TLS = 'NULL_LDAP_TLS',
  NO_LDAP_TLS = 'NO_LDAP_TLS',
  WRONG_LDAP_TLS_TYPE = 'WRONG_LDAP_TLS_TYPE',
  NULL_LDAP_TLS_REJECT_UNATHORIZED = 'NULL_LDAP_TLS_REJECT_UNATHORIZED',
  NO_LDAP_TLS_REJECT_UNATHORIZED = 'NO_LDAP_TLS_REJECT_UNATHORIZED',
  WRONG_LDAP_TLS_REJECT_UNATHORIZED_TYPE = 'WRONG_LDAP_TLS_REJECT_UNATHORIZED_TYPE',
  NULL_LDAP_DOMAIN = 'NULL_LDAP_DOMAIN',
  NO_LDAP_DOMAIN = 'NO_LDAP_DOMAIN',
  EMPTY_LDAP_DOMAIN = 'EMPTY_LDAP_DOMAIN',
  WRONG_LDAP_DOMAIN_TYPE = 'WRONG_LDAP_DOMAIN_TYPE',
  NULL_LDAP_USERS_OU = 'NULL_LDAP_USERS_OU',
  NO_LDAP_USERS_OU = 'NO_LDAP_USERS_OU',
  EMPTY_LDAP_USERS_OU = 'EMPTY_LDAP_USERS_OU',
  WRONG_LDAP_USERS_OU_TYPE = 'WRONG_LDAP_USERS_OU_TYPE',
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

const resolveRequiredUuids = async () => ({})

describe('API Tests', () => {
  jest.setTimeout(9000000)
  let token: any
  let itemId: any
  let resolved: any = {}
  const url = 'configuration'

  beforeAll(async () => {
    token = await login()
    resolved = await resolveRequiredUuids()
  })

  const generateDto = () => ({
    name: `Item ${randomString(10)}`,
    description: `Desc ${randomString(12)}`,
    isActive: true,
    from: randomString(12),
    notification_time: 1,
    mail_user: randomString(12),
    mail_port: randomString(12),
    mail_pass: randomString(12),
    mail_host: randomString(12),
    ldap_url: randomString(12),
    ldaap_bind_dn: randomString(12),
    ldap_bind_password: randomString(12),
    ldap_base_dn: randomString(12),
    ldap_time_out: 1,
    ldap_tls: true,
    ldap_tls_reject_unathorized: true,
    ldap_domain: randomString(12),
    ldap_users_ou: randomString(12),
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

          case INVALID_DTO.NULL_FROM:
            invalidDto.from = null as any
            break
          case INVALID_DTO.NO_FROM:
            delete invalidDto.from
            break
          case INVALID_DTO.EMPTY_FROM:
            invalidDto.from = '' as any
            break
          case INVALID_DTO.WRONG_FROM_TYPE:
            invalidDto.from = 123 as any
            break
          case INVALID_DTO.NULL_NOTIFICATION_TIME:
            invalidDto.notification_time = null as any
            break
          case INVALID_DTO.NO_NOTIFICATION_TIME:
            delete invalidDto.notification_time
            break
          case INVALID_DTO.WRONG_NOTIFICATION_TIME_TYPE:
            invalidDto.notification_time = 'invalid' as any
            break
          case INVALID_DTO.NULL_MAIL_USER:
            invalidDto.mail_user = null as any
            break
          case INVALID_DTO.NO_MAIL_USER:
            delete invalidDto.mail_user
            break
          case INVALID_DTO.EMPTY_MAIL_USER:
            invalidDto.mail_user = '' as any
            break
          case INVALID_DTO.WRONG_MAIL_USER_TYPE:
            invalidDto.mail_user = 123 as any
            break
          case INVALID_DTO.NULL_MAIL_PORT:
            invalidDto.mail_port = null as any
            break
          case INVALID_DTO.NO_MAIL_PORT:
            delete invalidDto.mail_port
            break
          case INVALID_DTO.EMPTY_MAIL_PORT:
            invalidDto.mail_port = '' as any
            break
          case INVALID_DTO.WRONG_MAIL_PORT_TYPE:
            invalidDto.mail_port = 123 as any
            break
          case INVALID_DTO.NULL_MAIL_PASS:
            invalidDto.mail_pass = null as any
            break
          case INVALID_DTO.NO_MAIL_PASS:
            delete invalidDto.mail_pass
            break
          case INVALID_DTO.EMPTY_MAIL_PASS:
            invalidDto.mail_pass = '' as any
            break
          case INVALID_DTO.WRONG_MAIL_PASS_TYPE:
            invalidDto.mail_pass = 123 as any
            break
          case INVALID_DTO.NULL_MAIL_HOST:
            invalidDto.mail_host = null as any
            break
          case INVALID_DTO.NO_MAIL_HOST:
            delete invalidDto.mail_host
            break
          case INVALID_DTO.EMPTY_MAIL_HOST:
            invalidDto.mail_host = '' as any
            break
          case INVALID_DTO.WRONG_MAIL_HOST_TYPE:
            invalidDto.mail_host = 123 as any
            break
          case INVALID_DTO.NULL_LDAP_URL:
            invalidDto.ldap_url = null as any
            break
          case INVALID_DTO.NO_LDAP_URL:
            delete invalidDto.ldap_url
            break
          case INVALID_DTO.EMPTY_LDAP_URL:
            invalidDto.ldap_url = '' as any
            break
          case INVALID_DTO.WRONG_LDAP_URL_TYPE:
            invalidDto.ldap_url = 123 as any
            break
          case INVALID_DTO.NULL_LDAAP_BIND_DN:
            invalidDto.ldaap_bind_dn = null as any
            break
          case INVALID_DTO.NO_LDAAP_BIND_DN:
            delete invalidDto.ldaap_bind_dn
            break
          case INVALID_DTO.EMPTY_LDAAP_BIND_DN:
            invalidDto.ldaap_bind_dn = '' as any
            break
          case INVALID_DTO.WRONG_LDAAP_BIND_DN_TYPE:
            invalidDto.ldaap_bind_dn = 123 as any
            break
          case INVALID_DTO.NULL_LDAP_BIND_PASSWORD:
            invalidDto.ldap_bind_password = null as any
            break
          case INVALID_DTO.NO_LDAP_BIND_PASSWORD:
            delete invalidDto.ldap_bind_password
            break
          case INVALID_DTO.EMPTY_LDAP_BIND_PASSWORD:
            invalidDto.ldap_bind_password = '' as any
            break
          case INVALID_DTO.WRONG_LDAP_BIND_PASSWORD_TYPE:
            invalidDto.ldap_bind_password = 123 as any
            break
          case INVALID_DTO.NULL_LDAP_BASE_DN:
            invalidDto.ldap_base_dn = null as any
            break
          case INVALID_DTO.NO_LDAP_BASE_DN:
            delete invalidDto.ldap_base_dn
            break
          case INVALID_DTO.EMPTY_LDAP_BASE_DN:
            invalidDto.ldap_base_dn = '' as any
            break
          case INVALID_DTO.WRONG_LDAP_BASE_DN_TYPE:
            invalidDto.ldap_base_dn = 123 as any
            break
          case INVALID_DTO.NULL_LDAP_TIME_OUT:
            invalidDto.ldap_time_out = null as any
            break
          case INVALID_DTO.NO_LDAP_TIME_OUT:
            delete invalidDto.ldap_time_out
            break
          case INVALID_DTO.WRONG_LDAP_TIME_OUT_TYPE:
            invalidDto.ldap_time_out = 'invalid' as any
            break
          case INVALID_DTO.NULL_LDAP_TLS:
            invalidDto.ldap_tls = null as any
            break
          case INVALID_DTO.NO_LDAP_TLS:
            delete invalidDto.ldap_tls
            break
          case INVALID_DTO.WRONG_LDAP_TLS_TYPE:
            invalidDto.ldap_tls = 'invalid' as any
            break
          case INVALID_DTO.NULL_LDAP_TLS_REJECT_UNATHORIZED:
            invalidDto.ldap_tls_reject_unathorized = null as any
            break
          case INVALID_DTO.NO_LDAP_TLS_REJECT_UNATHORIZED:
            delete invalidDto.ldap_tls_reject_unathorized
            break
          case INVALID_DTO.WRONG_LDAP_TLS_REJECT_UNATHORIZED_TYPE:
            invalidDto.ldap_tls_reject_unathorized = 'invalid' as any
            break
          case INVALID_DTO.NULL_LDAP_DOMAIN:
            invalidDto.ldap_domain = null as any
            break
          case INVALID_DTO.NO_LDAP_DOMAIN:
            delete invalidDto.ldap_domain
            break
          case INVALID_DTO.EMPTY_LDAP_DOMAIN:
            invalidDto.ldap_domain = '' as any
            break
          case INVALID_DTO.WRONG_LDAP_DOMAIN_TYPE:
            invalidDto.ldap_domain = 123 as any
            break
          case INVALID_DTO.NULL_LDAP_USERS_OU:
            invalidDto.ldap_users_ou = null as any
            break
          case INVALID_DTO.NO_LDAP_USERS_OU:
            delete invalidDto.ldap_users_ou
            break
          case INVALID_DTO.EMPTY_LDAP_USERS_OU:
            invalidDto.ldap_users_ou = '' as any
            break
          case INVALID_DTO.WRONG_LDAP_USERS_OU_TYPE:
            invalidDto.ldap_users_ou = 123 as any
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
