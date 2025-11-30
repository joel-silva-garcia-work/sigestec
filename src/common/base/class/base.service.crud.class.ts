import { CodeEnum } from 'src/common/enum/code.enum';
import { CrudDto, ReturnDto } from '../dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { KindEnum } from 'src/common/enum/kind.enum';
import { ClassValidator } from '../validator/class.validator';
import { ValidateScenarioDto } from '../dto/validate.scenario.dto';
import { BaseDto } from '../dto/base.crud.dto';
import { IdDto } from '../dto/id.dto';
import { MethodEnum } from 'src/common/enum/method.enum';
import { ResourceEnum } from 'src/common/enum/resource.enum';

// Interfaz completa del SearchingDto

export class BaseServiceCRUD<
  TEntity,
  createDto extends BaseDto,
  updateDto extends BaseDto,
> {
  private dto: CrudDto;
  private returnDto: ReturnDto;
  private valid: boolean;
  private queryBuilder: SelectQueryBuilder<TEntity>;

  constructor(repo: Repository<TEntity>) {
    this.dto = new CrudDto();
    this.dto.repo = repo;
    this.returnDto = new ReturnDto();
  }

  async findAllItems(): Promise<ReturnDto> {
    const returnDto = new ReturnDto();
    returnDto.data = await this.dto.repo.find({});
    return returnDto;
  }
  async findActiveItems(): Promise<ReturnDto> {
    const returnDto = new ReturnDto();
    returnDto.data = await this.dto.repo.find({
      where: { isActive: true },
    });
    return returnDto;
  }

  async create(createDto: createDto): Promise<ReturnDto> {
    if (createDto.rules) {
      this.valid = await this._validate(createDto);
    } else {
      this.valid = true;
    }
    if (this.valid) {
      try {
        this.returnDto.data = await this.dto.repo.save(createDto);
      } catch (error) {
        this.returnDto.isSuccess = false;
        this.returnDto.errorCode = error.code
        this.returnDto.returnCode = CodeEnum.BAD_REQUEST;
        this.returnDto.errorMessage = error.message ;
      }
    } else {
      this.returnDto.isSuccess = false;
      this.returnDto.errorCode = CodeEnum.BAD_REQUEST
      this.returnDto.returnCode = CodeEnum.BAD_REQUEST;
      this.returnDto.errorMessage =  ResourceEnum.ALREADY_EXST ;
    }
    return this.returnDto;
  }
  async update(updateDto: updateDto): Promise<ReturnDto> {
    this.dto.id = updateDto.id;
    if (updateDto.rules) {
      this.valid = await this._validate(updateDto);
    } else {
      this.valid = true;
    }
    if (this.valid) {
      try {
        const object = await this.dto.repo.findOne({
          where: {
            id: this.dto.id,
          },
        });
        if (!object) {
          this.returnDto.isSuccess = false;
          this.returnDto.returnCode = CodeEnum.BAD_REQUEST;
          // traducir
        } else {
          this.returnDto.data = await this.dto.repo.save(updateDto);
        }
      } catch (error) {
        this.returnDto.isSuccess = false;
        this.returnDto.errorMessage = error.message ;
        this.returnDto.returnCode = error.code;
      }
    } else {
      this.returnDto.isSuccess = false;
      this.returnDto.returnCode = CodeEnum.BAD_REQUEST;
      this.returnDto.errorMessage = ResourceEnum.ALREADY_EXST ;
    }
    return this.returnDto;
  }

  async remove(IdDto: IdDto): Promise<ReturnDto> {
    this.dto.id = IdDto.id;
    const item = await this.dto.repo.findOne({
      where: {
        id: this.dto.id,
      },
    });
    if (!item) {
      this.returnDto.isSuccess = false;
      // traducir
      this.returnDto.returnCode = CodeEnum.BAD_REQUEST;
      this.returnDto.errorMessage =  `the Item with id ${this.dto.id} do not exist`
    } 
    else {
      this.returnDto.data = await this.dto.repo.softDelete(this.dto.id);
    }
    return this.returnDto;
  }

  async findOne(dto: IdDto):Promise<ReturnDto> {
    const item = await this.dto.repo.findOne({
      where: {
        id: dto.id,
      },
    });
    if (!item) {
      this.returnDto.isSuccess = false;
      // traducir
      this.returnDto.returnCode = CodeEnum.BAD_REQUEST;
    } else {
      this.returnDto.isSuccess = true
      this.returnDto.data = [item];
    }
    return this.returnDto
  }
  async findOneActive(dto: IdDto):Promise<ReturnDto> {
    const item = await this.dto.repo.findOne({
      where: {
        id: dto.id,
        isActive: true
      },
    });
    if (!item) {
      this.returnDto.isSuccess = false;
      // traducir
      this.returnDto.returnCode = CodeEnum.BAD_REQUEST;
    } else {
      this.returnDto.isSuccess = true
      this.returnDto.data = [item];
    }
    return this.returnDto
  }

  async _validate(dto: BaseDto): Promise<boolean> {
    const rules = dto.rules;
    this.valid = true;
    if (rules.comparisonKind == KindEnum.UINQUE) {
      const scenarios = [];
      rules.field.forEach((rule: string) => {
        const scenario = new ValidateScenarioDto();
        scenario.table = this.dto.repo.metadata.tableName;
        scenario.field = rule;
        scenario.value = dto[rule];
        scenarios.push(scenario);
      });
      const validated: ClassValidator = new ClassValidator();
      if (rules.method == MethodEnum.CREATE) {
        this.valid = await validated.validateCreate(this.dto.repo, scenarios);
      } else if (rules.method == MethodEnum.UPDATE) {
        this.valid = await validated.validateUpdate(
          dto.id,
          this.dto.repo,
          scenarios,
        );
      }
    }
    return this.valid;
  }
  async active(dto: IdDto): Promise<ReturnDto> {
    this.dto.id = dto.id;
    this.returnDto = new ReturnDto
    this.returnDto.isSuccess = false
    this.returnDto.returnCode = CodeEnum.BAD_REQUEST
    this.returnDto.errorCode = CodeEnum.NOT_FOUND
    const item = await this.dto.repo.findOne({      
      where: {
        id: this.dto.id,
      },
    });
    if (item && item.id == this.dto.id) 
     {
      item.isActive = !item.isActive;
      this.returnDto.isSuccess = true
      this.returnDto.returnCode = null
      this.returnDto.errorCode = null     
      this.returnDto.data = await this.dto.repo.save(item);
    }
    return this.returnDto;
  }
}
