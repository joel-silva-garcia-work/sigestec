import { faker } from '@faker-js/faker'
import { createData, fetchActiveItems, fetchData, fetchItemById, HttpError, InvalidStandardDTO, login, updateData, updateState, validateTest } from './../../../common/base/test/test.helper'
import { RulesDto } from './../../../common/base/dto/rules.dto'
import { IdDto } from '../../../common/base/dto/id.dto'
import { KindEnum } from '../../../common/enum/kind.enum'
import { MethodEnum } from '../../../common/enum/method.enum'

const generateInvalidDTO = (
    invalid:  InvalidStandardDTO | INVALID_DTO ,
    rules?: RulesDto
  ) => {
    const equipo = generateEquipo(rules)
    
    // Crear una copia modificable de los campos del equipo
    const invalidEquipo = { ...equipo };
    
    switch (invalid) {
      case InvalidStandardDTO.NULL_NAME:
        invalidEquipo.name = null as any;
        break;
      case InvalidStandardDTO.EMPTY_NAME:
        invalidEquipo.name = "" as any;
        break;
      case InvalidStandardDTO.WRONG_NAME_TYPE:
        invalidEquipo.name = faker.number.int() as any;
        break;
      case InvalidStandardDTO.NO_NAME:
        delete (invalidEquipo as any).name;
        break;
      case InvalidStandardDTO.WRONG_DESCRIPTION_TYPE:
        invalidEquipo.description = faker.number.int() as any;
        break;
      case INVALID_DTO.Active:
        invalidEquipo.isActive = "invalid" as any;
        break;
      default:
        // No modificar nada
        break;
    }
    
    return invalidEquipo;
  }

  
  const validateWrongTest = (
    testName: string,
    result: any,
    invalid:  InvalidStandardDTO | INVALID_DTO ,
  ) => {
    if (result instanceof HttpError) {
      expect(result).toBeInstanceOf(HttpError)
      switch (invalid) {
        case InvalidStandardDTO.NULL_NAME:
          expect(result.status).toBe(400)
          break
        case InvalidStandardDTO.EMPTY_NAME:
          expect(result.status).toBe(400)
          break
        case InvalidStandardDTO.NO_NAME:
          expect(result.status).toBe(400)
          break
          case InvalidStandardDTO.WRONG_NAME_TYPE:
            expect(result.status).toBe(400)
          case InvalidStandardDTO.WRONG_DESCRIPTION_TYPE:
            expect(result.status).toBe(400)
          break
        case INVALID_DTO.Active:
          expect(result.status).toBe(400)
          break
        default:
          break
      }
    //   console.log(`${testName}:${result.type}:${result.message}`)
    } else {
      expect(result).toBeTruthy()
      if (result.isSuccess) {
        if (result.data.id) {
        //   console.log(`${testName}:${result.payload.data.id}`)
        } else {
        //   console.log(`${testName}:${result.payload.data.length}`)
        }
      } //else //console.log(`${testName}:${result.status}`)
    }
  }
  // describe('Login', () => {
  //   test('login', async () => {
  //      token = await login()
  //   })
  // })
  export const generateEquipo = ( rules?: RulesDto) => {
     return {
      name : faker.word.noun(),
      description : faker.word.noun(),
      isActive : true,
      rules: rules
    }
  }
  export enum INVALID_DTO {
    Active = 'Wrong Value',
    }
  describe('API Tests', () => {
    jest.setTimeout(9000000)
    let token: any
    let equipoId: any
    const url = 'comun/equipos'
  
    describe('Basic CRUD', () => {
      test('should read all equipos', async () => {
        const todos = url + '/todos'
        const result = await fetchData(todos)
        validateTest(expect.getState().currentTestName, result)
      })
      test('should create a new Equipos', async () => {
        const create_url = url + '/adicionar'
        const rules = new RulesDto
        rules.comparisonKind = KindEnum.UINQUE
        rules.field = ['name']
        rules.method = MethodEnum.CREATE

        const Dto = generateEquipo(rules)
        const result = await createData(create_url, Dto)
        validateTest(expect.getState().currentTestName, result)
        
        // Acceder al ID verificando si la operación fue exitosa
        if (result.isSuccess) {
            equipoId = result.data.id
          } else if (result.data && result.data.id) {
            // Si falló pero tiene ID, usar ese ID (caso especial de constraints)
            equipoId = result.data.id
          } else {
            // Manejar el caso de error real
            console.error('Error creating equipo:', result)
            throw new Error('Failed to create equipo')
          }
      })
      test('should get all active equipos', async () => {
        const todos_activos = url + '/ver-todos-activos-public'
        const result = await fetchActiveItems(todos_activos)
        validateTest(expect.getState().currentTestName, result)
      })
      test('should get a equipo by ID', async () => {
        const uno = url + '/ver-uno-public'
        const ID = new IdDto()
        ID.id = equipoId
        const result = await fetchItemById(uno, ID)
        validateTest(expect.getState().currentTestName, result)
      })
      test('should get an active equipo by ID', async () => {
        const uno_activo = url + '/ver-uno-activo-public'
        const ID = new IdDto()
        ID.id = equipoId
        const result = await fetchItemById(uno_activo, ID)
        validateTest(expect.getState().currentTestName, result)
      })
      test('should set an active/inactive equipo by ID', async () => {
        const change_state_url = url + '/cambiar-estado'
        const ID = new IdDto()
        ID.id = equipoId
        const result = await updateState(change_state_url, ID)
        validateTest(expect.getState().currentTestName, result)
      })

      test('should edit a departamento', async () => {
        const update_url = url + '/actualizar'
        const rules = new RulesDto
        rules.comparisonKind = KindEnum.UINQUE
        rules.field = ['id', 'name']
        rules.method = MethodEnum.UPDATE
        const dto = generateEquipo()
        // Crea una copia y asegura que la propiedad id existe
        const updDto: any = { ...dto, id: equipoId }
        const result = await updateData(update_url, updDto)
        validateTest(expect.getState().currentTestName, result)
      })
    })
    describe('Failed Cases', () => {
      describe('Failed Created Cases', () => {
        // Pruebas de valores edge
       describe('Edge Cases', () => {
        test('should handle very long names', async () => {
        const createUrl = url + '/adicionar'
        const rules = new RulesDto()
        rules.comparisonKind = KindEnum.UINQUE
        rules.field = ['name']
        rules.method = MethodEnum.CREATE
        
        const longNameDto = generateEquipo(rules)
        longNameDto.name = 'a'.repeat(1000) // Nombre muy largo
        
        const result = await createData(createUrl, longNameDto)
        // Debería fallar con validación de longitud
        expect(result).toBeInstanceOf(HttpError)
        expect(result.status).toBe(400)
        })

    test('should handle very long names in edit', async () => {
      const updateUrl = url + '/actualizar'
      const rules = new RulesDto()
      rules.comparisonKind = KindEnum.UINQUE
      rules.field = ['id', 'name']
      rules.method = MethodEnum.UPDATE
      
      const longNameDto = generateEquipo(rules)
      longNameDto.description = 'a'.repeat(5000) // Descripción muy larga
      const longDto: any = { ...longNameDto, id: equipoId }
      const result = await updateData(updateUrl, longDto)
      // Debería fallar con validación de longitud
      expect(result).toBeInstanceOf(HttpError)
      expect(result.status).toBe(400)
    })

    test('should handle very long descriptions', async () => {
      const createUrl = url + '/adicionar'
      const rules = new RulesDto()
      rules.comparisonKind = KindEnum.UINQUE
      rules.field = ['name']
      rules.method = MethodEnum.CREATE
      
      const longDescDto = generateEquipo(rules)
      longDescDto.description = 'a'.repeat(5000) // Descripción muy larga
      
      const result = await createData(createUrl, longDescDto)
      // Debería fallar con validación de longitud
      expect(result).toBeInstanceOf(HttpError)
      expect(result.status).toBe(400)
    })

    test('should handle very long descriptions in edit', async () => {
      const updateUrl = url + '/actualizar'
      const rules = new RulesDto()
      rules.comparisonKind = KindEnum.UINQUE
      rules.field = ['id', 'name']
      rules.method = MethodEnum.UPDATE
      
      const longDescDto = generateEquipo(rules)
      longDescDto.description = 'a'.repeat(5000) // Descripción muy larga
      const longDto: any = { ...longDescDto, id: equipoId }
      const result = await updateData(updateUrl, longDto)
      // Debería fallar con validación de longitud
      expect(result).toBeInstanceOf(HttpError)
      expect(result.status).toBe(400)
    })
    })
    Object.values(InvalidStandardDTO).forEach((errorType) => {
        test(`should fail to create a new equipo: ${errorType}`, async () => {
        const dto = generateInvalidDTO(errorType)
        const create_url = url + '/adicionar'
        const rules = new RulesDto
        rules.comparisonKind = KindEnum.UINQUE
        rules.field = ['name']
        rules.method = MethodEnum.CREATE
        const result = await createData(create_url, dto)

        validateWrongTest(
            expect.getState().currentTestName,
            result,
            errorType,
        )
        })
    })
    Object.values(INVALID_DTO).forEach((errorType) => {
        test(`should fail to create a new equipo: ${errorType}`, async () => {
        const create_url = url + '/adicionar'
        const rules = new RulesDto
        rules.comparisonKind = KindEnum.UINQUE
        rules.field = ['name']
        rules.method = MethodEnum.CREATE
        const dto = generateInvalidDTO(errorType)
        const result = await createData(create_url, dto)
        validateWrongTest(
            expect.getState().currentTestName,
            result,
            errorType,
        )
        })
    })
    })
    describe('Failed Edit Cases', () => {
    Object.values(InvalidStandardDTO).forEach((errorType) => {
        test(`should fail to edit a equipo: ${errorType}`, async () => {
        const update_url = url + '/actualizar'
        const rules = new RulesDto
        rules.comparisonKind = KindEnum.UINQUE
        rules.field = ['id', 'name']
        rules.method = MethodEnum.UPDATE
        const dto = generateInvalidDTO( errorType)
        const updDto: any = { ...dto, id: equipoId }
        const result = await updateData(update_url, updDto)
        validateWrongTest(
            expect.getState().currentTestName,
            result,
            errorType,
        )
        })
    })
    Object.values(INVALID_DTO).forEach((errorType) => {
        test(`should fail to edit a equipo: ${errorType}`, async () => {
        const update_url = url + '/actualizar'
        const rules = new RulesDto
        rules.comparisonKind = KindEnum.UINQUE
        rules.field = ['id', 'name']
        rules.method = MethodEnum.UPDATE
        const dto = generateInvalidDTO(errorType)
        const updDto: any = { ...dto, id: equipoId }
        const result = await updateData(update_url, updDto)
        validateWrongTest(
            expect.getState().currentTestName,
            result,
            errorType,
        )
        })
    })

    test('should handle state change with non-existent ID', async () => {
        const state_url = url + '/cambiar-estado'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        
        const result = await fetchItemById(state_url, ID)
        // Debería fallar con un error 400
        expect(result).toBeInstanceOf(HttpError)
        expect(result.status).toBe(400)
      })

      test('should handle get one with non-existent ID', async () => {
        const uno = url + '/ver-uno-public'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        
        const result = await fetchItemById(uno, ID)
        // Debería fallar con un error 400
        expect(result).toBeInstanceOf(HttpError)
        expect(result.status).toBe(400)
      })

      test('should handle get one active with non-existent ID', async () => {
        const uno_activo = url + '/ver-uno-activo-public'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        
        const result = await fetchItemById(uno_activo, ID)
        // Debería fallar con un error 400
        expect(result).toBeInstanceOf(HttpError)
        expect(result.status).toBe(400)
      })
    })

    describe('Failed Logic Cases', () => {
    
    // Prueba que el service valide reglas de negocio específicas
    test('should validate business rules in service layer', async () => {
        const create_url = url + '/adicionar';
        const rules = new RulesDto();
        rules.comparisonKind = KindEnum.UINQUE;
        rules.field = ['name'];
        rules.method = MethodEnum.CREATE;
        
        // Crear equipo con nombre duplicado
        const dupeDto = generateEquipo(rules);
        const result1 = await createData(create_url, dupeDto);
        
        // Segundo intento con mismo nombre debería fallar
        const result2 = await createData(create_url, dupeDto);
        expect(result2.isSuccess).toBe(false);
        expect(result2.returnCode).toBe(400); // Código de violación de unique
    });

    test('should fail when editing second equipo with first equipo name', async () => {
        const create_url = url + '/adicionar';
        const update_url = url + '/actualizar';
        // Crear primer equipo        
        const rules1 = new RulesDto();        
        rules1.comparisonKind = KindEnum.UINQUE;        
        rules1.field = ['name'];        
        rules1.method = MethodEnum.CREATE;
        const firstDto = generateEquipo(rules1);
        const firstResult = await createData(create_url, firstDto);
        const firstId = firstResult.data.id;
        // Crear segundo equipo con nombre diferente
        const secondDto = generateEquipo(rules1);
        const secondResult = await createData(create_url, secondDto);
        const secondId = secondResult.data.id;
        // Intentar editar el segundo equipo con el nombre del primero
        const updateRules = new RulesDto();
        updateRules.comparisonKind = KindEnum.UINQUE;
        updateRules.field = ['id', 'name'];
        updateRules.method = MethodEnum.UPDATE;
        const updateDto = {...generateEquipo(updateRules), 
            id: secondId,
            name: firstDto.name};
        const updateResult = await updateData(update_url, updateDto);
        // Debería fallar debido a la restricción de unicidad
        expect(updateResult.isSuccess).toBe(false);
        expect(updateResult.returnCode).toBe(400);
        // console.log(`Test ${expect.getState().currentTestName}: Attempted to update equipo ${secondId} with name '${firstDto.name}' (from equipo ${firstId}) - Operation failed as expected with code ${updateResult.returnCode}`);    
    })
    
    test('should return error when edit anunexisting', async () => {
        const update_url = url + '/editar';
        const nonExistentId = '00000000-0000-0000-0000-000000000000';
        // Suponiendo que necesitas un DTO válido para editar
        const updateDto = {
            id: nonExistentId,
            name: 'equipo Fantasma',
            // agrega aquí otros campos requeridos por el DTO
        };

        const result = await updateData(update_url, updateDto);
        // Debería fallar con un error 400
        expect(result).toBeInstanceOf(HttpError);
        expect(result.status).toBe(400);
        })

    test('should handle get one with non-existent ID', async () => {
        const uno = url + '/ver-uno-public'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        
        const result = await fetchItemById(uno, ID)
        // Debería fallar con un error 400
        expect(result).toBeInstanceOf(HttpError)
        expect(result.status).toBe(400)
        })

    test('should handle get one active with non-existent ID', async () => {
        const uno_activo = url + '/ver-uno-activo-public'
        const ID = new IdDto()
        ID.id = '00000000-0000-0000-0000-000000000000'
        
        const result = await fetchItemById(uno_activo, ID)
        // Debería fallar con un error 400
        expect(result).toBeInstanceOf(HttpError)
        expect(result.status).toBe(400)
        })
    })
    })
  })