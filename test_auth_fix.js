// CÓDIGO CORREGIDO PARA MANEJAR AUTENTICACIÓN JWT

// 1. Función createData modificada para aceptar token
/*
export const createData = async (
  url: string,
  newItem: {},
  token: string,  // ← Token ahora es parámetro requerido
): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axios.post(
      `${BASE_URL}${url}`,
      newItem,
      {
        headers: {
          Authorization: `Bearer ${token}`,  // ← Headers de autorización activados
        },
        // httpAgent: agent,
        // httpsAgent: new https.Agent({ keepAlive: false }),
      },
    )
    return response.data
  } catch (error) {
    // ... manejo de errores
  }
}
*/

// 2. Cómo usar en las pruebas:
/*
describe('API Tests', () => {
  jest.setTimeout(9000000)
  let token: any
  let departamentoId: any
  const url = 'comun/departamentos'

  // Primero: hacer login para obtener token
  describe('Login', () => {
    test('login', async () => {
      token = await login()
      expect(token).toBeDefined()
    })
  })

  describe('Basic CRUD', () => {
    test('should create a new Departamento', async () => {
      const create = url + '/adicionar'
      const rules = new RulesDto()
      rules.comparisonKind = KindEnum.UINQUE
      rules.field = ['name']
      rules.method = MethodEnum.CREATE

      const Dto = generateDepartamento(rules)
      console.log(Dto)
      
      // Pasar el token a createData
      const result = await createData(create, Dto, token)
      validateTest(expect.getState().currentTestName, result)
      
      if (result.isSuccess) {
        departamentoId = result.data.id
      } else {
        console.error('Error creating departamento:', result)
        throw new Error('Failed to create departamento')
      }
    })
    
    // ... otras pruebas que requieran autenticación
  })
})
*/

// 3. También necesitas modificar otras funciones que requieran autenticación:
// - updateData
// - deleteData
// - fetchData (si algunos endpoints requieren auth)

// 4. Cambios en test.helper.ts:
/*
// Función para crear un nuevo item (CON AUTENTICACIÓN)
export const createData = async (
  url: string,
  newItem: {},
  token: string,  // Token ahora es requerido
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
        // httpsAgent: new https.Agent({ keepAlive: false }),
      },
    )
    return response.data
  } catch (error) {
    // ... manejo de errores existente
  }
}

// Función para actualizar un item existente (CON AUTENTICACIÓN)
export const updateData = async (
  url: string,
  id: string,
  updatedItem: {},
  token: string,  // Token ahora es requerido
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
    // ... manejo de errores existente
  }
}

// Función para eliminar un item (CON AUTENTICACIÓN)
export const deleteData = async (
  url: string,
  id: string,
  token: string,  // Token ahora es requerido
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
    // ... manejo de errores existente
  }
}
*/

// 5. Para endpoints públicos que NO requieren autenticación, mantén las funciones sin token:
/*
// Función para obtener todos los items (SIN AUTENTICACIÓN - para endpoints públicos)
export const fetchData = async (url: string): Promise<any> => {
  try {
    const response: AxiosResponse<any[]> = await axios.get(
      `${BASE_URL}${url}`,
      {
        // Sin headers de autorización para endpoints públicos
      },
    )
    return response.data
  } catch (error) {
    // ... manejo de errores existente
  }
}
*/

console.log('Código de corrección para autenticación JWT guardado en test_auth_fix.js');
console.log('Implementa estos cambios en los archivos correspondientes cuando estés listo.');
