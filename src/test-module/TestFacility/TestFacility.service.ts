import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@apso/crud-typeorm';

import { TestFacility } from './TestFacility.entity';

/**
 * TestFacility Service (v2 - using @apso/crud-typeorm)
 *
 * This is the new CRUD service that uses @apso/crud-typeorm.
 *
 * Key differences from v1 (@nestjsx/crud-typeorm):
 * - Import from @apso/crud-typeorm
 * - No need for getSelect workaround - issue #777 is fixed in the base class
 * - Better TypeScript support
 */
@Injectable()
export class TestFacilityService extends TypeOrmCrudService<TestFacility> {
  constructor(@InjectRepository(TestFacility) repo) {
    super(repo);
  }

  // No workaround needed - issue #777 is fixed in @apso/crud-typeorm
}
