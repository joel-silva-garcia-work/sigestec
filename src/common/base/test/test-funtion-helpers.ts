import axios from 'axios';
import { CodeEnum } from 'src/common/enum/code.enum';
import { LoginDto } from 'src/security/auth/dto/login.dto';

const BaseURL = 'http://localhost:5005/v1';
// Esta función realiza login usando axios, y devuelve el token o un objeto DTO en caso de error.
async function loginAndGetToken() {

    const loginUrl = BaseURL + '/auth/login';
    // use an admin user and password
    const loginDto = new LoginDto()
    loginDto.username = 'admin'
    loginDto.password = '123456'
 
    
  // Nota: asegúrate de tener axios importado en el archivo real
  try {
    const response = await axios.post(loginUrl, {
      "username": loginDto.username,
      "password": loginDto.password,
    });
    // Se asume que el token viene en response.data.access_token (ajusta según tu API)
    return {
      isSuccess: true,
      token: response.data.access_token
    };
  } catch (error) {
    let errorCode = CodeEnum.BAD_REQUEST;
    let message = 'Error desconocido';
    if (error.response) {
      // Error con respuesta del servidor
      errorCode = error.response.status;
      message = error.response.data.message || error.response.statusText || message;
    } else if (error.request) {
      // No hubo respuesta del servidor
      errorCode = CodeEnum.NO_RESPONSE;
      message = 'No hubo respuesta del servidor';
    } else {
      // Otro error
      errorCode = CodeEnum.REQUEST_SETUP_ERROR;
      message = error.message;
    }
    return {
      isSuccess: false,
      errorCode,
      message
    };
  }
}
