import { Repository } from 'typeorm';
import { ValidateScenarioDto } from '../dto/validate.scenario.dto';

export class ClassValidator {
  async validateCreate(
    repo: Repository<any>,
    scenarios: ValidateScenarioDto[],
  ): Promise<boolean> {
    const query = repo.createQueryBuilder(repo.metadata.tableName);

    let valid = true;
     scenarios.forEach((scenario) => {
      if (scenario.value instanceof Object) {
        query.andWhere(
          `${scenario.table}.${scenario.field}->>'es' = '${scenario.value['es']}'`,
        );
        query.orWhere(
          `${scenario.table}.${scenario.field}->>'en' = '${scenario.value['en']}'`,
        );
      } else if (typeof scenario.value === 'string') {
        query.andWhere(
          `${scenario.table}.${scenario.field} = '${scenario.value}'`,
        );
      }
    });
    const result = await query.getCount();
    if (result) {
      valid = false;
    }
    return valid;
  }
  async validateUpdate(
    id:string,
    repo: Repository<any>,
    scenarios: ValidateScenarioDto[],
  ): Promise<boolean> {
    const query = repo.createQueryBuilder(repo.metadata.tableName);

    let valid = true;
     scenarios.forEach((scenario) => {
      if (scenario.value instanceof Object) {
        query.andWhere(
          `${scenario.table}.${scenario.field}->>'es' = '${scenario.value['es']}'`,
        );
        query.orWhere(
          `${scenario.table}.${scenario.field}->>'en' = '${scenario.value['en']}'`,
        );
      } else if (typeof scenario.value === 'string') {
        query.andWhere(
          `${scenario.table}.${scenario.field} = '${scenario.value}'`,
        );
      }
    });
    const result = await query.getOne();
    
    if (result) {
      if(result.id != id)
      { 
        valid = false;
      }
      else
      {
        valid = true
      }
    }
    return valid;
  }
}
