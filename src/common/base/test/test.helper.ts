import axios, { AxiosResponse } from 'axios'
import http from 'http'
import https from 'https'
import { ReturnDto } from '../dto'
import { CodeEnum } from '../../../common/enum/code.enum'
import { LoginDto } from '../../../security/auth/dto/login.dto'
import { IdDto } from '../dto/id.dto'

const BASE_URL = 'http://localhost:5005/v1/'

const loginDto = new LoginDto()
loginDto.username = 'admin'
loginDto.password = '123456'



export enum ErrorType {
  HttpError = 'HTTP-ERROR',
  AxiosError = 'AXIOS-ERROR',
}
export class HttpError extends Error {
  public status: number
  public type: ErrorType
  constructor() {
    super('Error de la API')
    this.status = 400
    this.name = 'HttpError'
    this.type = ErrorType.HttpError
  }
}
export enum FailedTest {
  CREATE_FAILED = 'CREATE FAILED',
  UPDATE_FAILED = 'UPDATE FAILED',
  GET_FAILED = 'GET FAILED',
  GET_ALL_FAILED = 'GET ALL FAILED',
  CHANGE_STATE_FAILED = 'CHANGE STATE FAILED',
}

export enum InvalidStandardDTO {
  // First standard field
  NULL_NAME = 'NULL_NAME',
  NO_NAME = 'NO_NAME',
  EMPTY_NAME = 'EMPTY_NAME',
  WRONG_NAME_TYPE = 'WRONG_NAME_TYPE',
//   Second standard field
  WRONG_DESCRIPTION_TYPE = 'WRONG_DESCRIPTION_TYPE',
}


export const validateTest = (
  testName: string,
  result: any,
) => {
  if (result instanceof ReturnDto) {
    expect(result).toBeInstanceOf(ReturnDto)
    expect(result.isSuccess).toBe(true)
    expect(result.returnCode).toBe(CodeEnum.OK)
    expect(result.data).not.toBeNull()
  } 
}
// Función para iniciar sesión y establecer la agencia
export async function login(): Promise<any> {
  let token: string | undefined
  try {
    const response_login = await axios.post(`${BASE_URL}security/auth/autenticarse`, {
      "username": loginDto.username,
      "password": loginDto.password,
    })
    token = response_login.data.payload.data.access_token // revisar 
  } catch (error) {
    console.log('Error en la solicitud de login:', error)
  }
  return token
}
// Función para obtener todos los items
export const fetchData = async (url: string): Promise<any> => {
  // console.log(BASE_URL+url)
  try {
    const response: AxiosResponse<any[]> = await axios.get(
      `${BASE_URL}${url}`,
      {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        // },
        // httpAgent: agent,
       // httpAgent: new http.Agent({ keepAlive: false }),
      //  httpsAgent: new https.Agent({ keepAlive: false }),
      },
    )
    return response.data
  } catch (error) {
    // console.log(error)
    const customError = new HttpError() // Mensaje original del error
    // Manejo de errores
    if (axios.isAxiosError(error)) {
      // El error es específico de Axios
      customError.type = ErrorType.AxiosError
      customError.message = `Error de Axios:'${error.message}: ${error.code}` // Mensaje original del error
    } else {
      // Manejo de otros tipos de errores que no son de Axios
      customError.type = ErrorType.HttpError
      customError.status = error.response.status
      customError.message = error.message // Mensaje original del error
    }
    return customError // Retornar la instancia del nuevo Error
  }
}

// Función para obtener un item por ID
export const fetchItemById = async (
  url: string,
  object: IdDto,
  // token: string,
): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axios.get(
      `${BASE_URL}${url}`,
      {
        params: object,
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      //   // httpAgent: agent,
      //   httpsAgent: new https.Agent({ keepAlive: false }),
      },
    )
    return response.data
  } catch (error) {
    const customError = new HttpError() // Mensaje original del error
    // Manejo de errores
    if (axios.isAxiosError(error)) {
      // El error es específico de Axios
      customError.type = ErrorType.AxiosError
      customError.message = `Error de Axios:'${error.message}: ${error.code}` // Mensaje original del error
    } else {
      // Manejo de otros tipos de errores que no son de Axios
      customError.type = ErrorType.HttpError
      customError.status = error.response.status
      customError.message = error.message // Mensaje original del error
    }
    return customError // Retornar la instancia del nuevo Error
  }
}

// Función para obtener un item por ID
export const fetchActiveItems = async (
  url: string,
  // token: string,
): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axios.get(
      `${BASE_URL}${url}`,
      {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      //   // httpAgent: agent,
      //   httpsAgent: new https.Agent({ keepAlive: false }),
      },
    )
    return response.data
  } catch (error) {
    const customError = new HttpError() // Mensaje original del error
    // Manejo de errores
    if (axios.isAxiosError(error)) {
      // El error es específico de Axios
      customError.type = ErrorType.AxiosError
      customError.message = `Error de Axios:'${error.message}: ${error.code}` // Mensaje original del error
    } else {
      // Manejo de otros tipos de errores que no son de Axios
      customError.type = ErrorType.HttpError
      customError.status = error.response.status
      customError.message = error.message // Mensaje original del error
    }
    return customError // Retornar la instancia del nuevo Error
  }
}

// Función para crear un nuevo item
export const createData = async (
  url: string,
  newItem: {},
  token: string,
): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axios.post(
      `${BASE_URL}${url}`,
      newItem,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // httpAgent: agent,
        httpsAgent: new https.Agent({ keepAlive: false }),
      },
    )
    return response.data
  } catch (error) {
    const customError = new HttpError() // Mensaje original del error

    // Manejo de errores
    if (axios.isAxiosError(error)) {
      // El error es específico de Axios
      customError.type = ErrorType.AxiosError
      customError.message = `Error de Axios:'${error.message}: ${error.code}` // Mensaje original del error
    } else {
      // Manejo de otros tipos de errores que no son de Axios
      customError.type = ErrorType.HttpError
      customError.status = error.response.status
      customError.message = error.message // Mensaje original del error
    }
    return customError // Retornar la instancia del nuevo Error
  }
}

// Función para actualizar un item existente
export const updateData = async (
  url: string,
  id: string,
  updatedItem: {},
  token: string,
): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axios.patch(
      `${BASE_URL}${url}/${id}`,
      updatedItem,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        // httpAgent: agent,
        httpsAgent: new https.Agent({ keepAlive: false }),
      },
    )
    return response.data
  } catch (error) {
    const customError = new HttpError() // Mensaje original del error

    // Manejo de errores
    if (axios.isAxiosError(error)) {
      // El error es específico de Axios
      customError.type = ErrorType.AxiosError
      customError.message = `Error de Axios:'${error.message}: ${error.code}` // Mensaje original del error
    } else {
      // Manejo de otros tipos de errores que no son de Axios
      customError.type = ErrorType.HttpError
      customError.message = error.message // Mensaje original del error
    }
    return customError // Retornar la instancia del nuevo Error
  }
}

// Función para eliminar un item
export const deleteData = async (
  url: string,
  id: string,
  token: string,
): Promise<any> => {
  try {
    const result = await axios.delete(`${BASE_URL}${url}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // httpAgent: agent,
      httpsAgent: new https.Agent({ keepAlive: false }),
    })
    return result
  } catch (error) {
    const customError = new HttpError() // Mensaje original del error

    // Manejo de errores
    if (axios.isAxiosError(error)) {
      // El error es específico de Axios
      customError.type = ErrorType.AxiosError
      customError.message = `Error de Axios:'${error.message}: ${error.code}` // Mensaje original del error
    } else {
      // Manejo de otros tipos de errores que no son de Axios
      customError.type = ErrorType.HttpError
      customError.message = error.message // Mensaje original del error
    }
    return customError // Retornar la instancia del nuevo Error
  }
}
