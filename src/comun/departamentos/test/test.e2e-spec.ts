import { faker } from '@faker-js/faker'
import { createData, deleteData, fetchActiveItems, fetchData, fetchItemById, HttpError, InvalidStandardDTO, login, updateData, validateTest } from './../../../common/base/test/test.helper'
import { RulesDto } from './../../../common/base/dto/rules.dto'
import { IdDto } from '../../../common/base/dto/id.dto'

const generateInvalidDTO = (
    invalid:  InvalidStandardDTO | INVALID_DTO ,
    rules?: RulesDto
  ) => {
    const departamento = generateDepartamento(rules)
    
    // Crear una copia modificable de los campos del departamento
    const invalidDepartamento = { ...departamento };
    
    switch (invalid) {
      case InvalidStandardDTO.NULL_NAME:
        invalidDepartamento.name = null as any;
        break;
      case InvalidStandardDTO.EMPTY_NAME:
        invalidDepartamento.name = "" as any;
        break;
      case InvalidStandardDTO.WRONG_NAME_TYPE:
        invalidDepartamento.name = faker.number.int() as any;
        break;
      case InvalidStandardDTO.NO_NAME:
        delete (invalidDepartamento as any).name;
        break;
      case InvalidStandardDTO.WRONG_DESCRIPTION_TYPE:
        invalidDepartamento.description = faker.number.int() as any;
        break;
      case INVALID_DTO.Active:
        invalidDepartamento.isActive = "invalid" as any;
        break;
      default:
        // No modificar nada
        break;
    }
    
    return invalidDepartamento;
  }

  
  const validateWrongTest = (
    testName: string,
    result: any,
    invalid:  InvalidStandardDTO | INVALID_DTO,
  ) => {
    if (result instanceof HttpError) {
      expect(result).toBeInstanceOf(HttpError)
      switch (invalid) {
        case InvalidStandardDTO.NULL_NAME:
          expect(result.status).toBe(400)
          break
        case InvalidStandardDTO.EMPTY_NAME:
          expect(result.status).toBe(500)
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
      console.log(`${testName}:${result.type}:${result.message}`)
    } else {
      expect(result).toBeTruthy()
      if (result.payload) {
        if (result.payload.data.id) {
          console.log(`${testName}:${result.payload.data.id}`)
        } else {
          console.log(`${testName}:${result.payload.data.length}`)
        }
      } else console.log(`${testName}:${result.status}`)
    }
  }
  // describe('Login', () => {
  //   test('login', async () => {
  //      token = await login()
  //   })
  // })
export const generateDepartamento = (rules?: RulesDto) => {
     const departamento ={
      name : faker.word.noun(),
      description : faker.word.noun(),
      isActive : true,
      rules: rules
    }
    return departamento
  }
  export enum INVALID_DTO {
    Active = 'Wrong Value',
    }
  describe('API Tests', () => {
    jest.setTimeout(9000000)
    let token: any
    let departamentoId: any
    const url = 'comun/departamentos'
  


    describe('Basic CRUD', () => {
      test('should read all departamentos', async () => {
        const todos = url + '/todos'
        const result = await fetchData(todos)
        validateTest(expect.getState().currentTestName, result)
      })
      
      test('should get a departamento by ID', async () => {
        const todos_activos = url + '/ver-todos-activos-public'
        const result = await fetchActiveItems(todos_activos)
        validateTest(expect.getState().currentTestName, result)
      })
      test('should get all active departamentos', async () => {
        const ID = new IdDto()
        ID.id = departamentoId
        const result = await fetchItemById(url, ID)
        validateTest(expect.getState().currentTestName, result)
      })

    //   test('should create a new Departamento', async () => {
    //     const Dto = generateDepartamento()
    //     const result = await createData(url, Dto, token)
    //     validateTest(expect.getState().currentTestName, result)
    //     //  modificar
    //     expect(result.payload.data).toHaveProperty('id') // Asegúrate de que hay un ID
    //     departamentoId = result.payload.data.id
    //   })

    //   test('should edit a departamento', async () => {
    //     const dto = generateDepartamento()
    //     const result = await updateData(url, departamentoId, dto, token)
    //     validateTest(expect.getState().currentTestName, result)
    //   })
    //   test('should delete a departamento', async () => {
    //     const dto = generateDepartamento()

    //     const deleted = await createData(url, dto, token)
    //     expect(deleted).toBeTruthy()
    //     const deletedId = deleted.payload.data.id
    //     const result = await deleteData(url, deletedId, token)
    //     validateTest(expect.getState().currentTestName, result)
    //   })
    // })
    // describe('Failed Cases', () => {
    //   describe('Failed Created Cases', () => {
    //     Object.values(InvalidStandardDTO).forEach((errorType) => {
    //       test(`should fail to create a new departamento: ${errorType}`, async () => {

    //         const dto = generateInvalidDTO(errorType)
    //         const result = await createData(url, dto, token)
    //         // validateTest(expect.getState().currentTestName, result);
    //         validateWrongTest(
    //           expect.getState().currentTestName,
    //           result,
    //           errorType,
    //         )
    //       })
    //     })
    //     Object.values(INVALID_DTO).forEach((errorType) => {
    //       test(`should fail to create a new departamento: ${errorType}`, async () => {
    //         const dto = generateInvalidDTO(errorType)
    //         const result = await createData(url, dto, token)
    //         validateWrongTest(
    //           expect.getState().currentTestName,
    //           result,
    //           errorType,
    //         )
    //       })
    //     })
    //   })
    //   describe('Failed Edit Cases', () => {
    //     Object.values(InvalidStandardDTO).forEach((errorType) => {
    //       test(`should fail to edit a departamento: ${errorType}`, async () => {
    //         const dto = generateInvalidDTO( errorType)
    //         const result = await updateData(url, departamentoId, dto, token)
    //         // validateTest(expect.getState().currentTestName, result);
    //         validateWrongTest(
    //           expect.getState().currentTestName,
    //           result,
    //           errorType,
    //         )
    //       })
    //     })
    //     Object.values(INVALID_DTO).forEach((errorType) => {
    //       test(`should fail to edit a departamento: ${errorType}`, async () => {
    //         const dto = generateInvalidDTO(errorType)
    //         const result = await updateData(url, departamentoId, dto, token)
    //         validateWrongTest(
    //           expect.getState().currentTestName,
    //           result,
    //           errorType,
    //         )
    //       })
    //     })
    //   })
    })
  })