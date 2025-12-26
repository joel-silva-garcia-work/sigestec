import { faker } from '@faker-js/faker'
import { fetchData,fetchItemById,createData, deleteData,   HttpError, InvalidStandardDTO, login, updateData, validateTest } from '../../../common/base/test/test.helper'
import { RulesDto } from '../../../common/base/dto/rules.dto';


export const generateEquipo = (rules?: RulesDto) => {
     const equipo ={
      name : faker.word.noun(),
      description : faker.word.noun(),
      isActive : true,
      rules: rules
    }
    return equipo
  }
  export enum INVALID_DTO {
    Active = 'Wrong Value ',
    }
  describe('API Tests', () => {
    jest.setTimeout(9000000)
    let token: any
    let equipoId: any
    const url = 'equipos'
  

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
    describe('Basic CRUD', () => {
      test('should read all equipos', async () => {
        const result = await fetchData(url)
        validateTest(expect.getState().currentTestName, result)
      })
      // test('should create a new Equipo', async () => {
      //   const Dto = generateEquipo()
      //   const result = await createData(url, Dto, token)
      //   validateTest(expect.getState().currentTestName, result)
      //   //  modificar
      //   expect(result.payload.data).toHaveProperty('id') // Asegúrate de que hay un ID
      //   equipoId = result.payload.data.id
      // })
      // test('should get a bus-stop by ID', async () => {
      //   const result = await fetchItemById(url, equipoId, token)
      //   validateTest(expect.getState().currentTestName, result)
      // })
      // test('should edit a bus-stop', async () => {
      //   const dto = generateEquipo()
      //   const result = await updateData(url, equipoId, dto, token)
      //   validateTest(expect.getState().currentTestName, result)
      // })
      // test('should delete an equipo', async () => {
      //   const dto = generateEquipo()
  
      //   const deleted = await createData(url, dto, token)
      //   expect(deleted).toBeTruthy()
      //   const deletedId = deleted.payload.data.id
      //   const result = await deleteData(url, deletedId, token)
      //   validateTest(expect.getState().currentTestName, result)
      // })
    })
    // describe('Failed Cases', () => {
    //   describe('Failed Created Cases', () => {
    //     Object.values(InvalidStandardDTO).forEach((errorType) => {
    //       test(`should fail to create a new equipo: ${errorType}`, async () => {

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
    //       test(`should fail to create a new bus-stop: ${errorType}`, async () => {
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
    //       test(`should fail to create a new bus-stop: ${errorType}`, async () => {
    //         const dto = generateInvalidDTO( errorType)
    //         const result = await updateData(url, equipoId, dto, token)
    //         // validateTest(expect.getState().currentTestName, result);
    //         validateWrongTest(
    //           expect.getState().currentTestName,
    //           result,
    //           errorType,
    //         )
    //       })
    //     })
    //     Object.values(INVALID_DTO).forEach((errorType) => {
    //       test(`should fail to edit a new bus-stop: ${errorType}`, async () => {
    //         const dto = generateInvalidDTO(errorType)
    //         const result = await updateData(url, equipoId, dto, token)
    //         validateWrongTest(
    //           expect.getState().currentTestName,
    //           result,
    //           errorType,
    //         )
    //       })
    //     })
    //   })
    // })
  })
 