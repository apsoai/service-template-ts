import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@apso/crud-typeorm';

import { TestCustomer } from './TestCustomer.entity';

/**
 * TestCustomer Service (v2 - using @apso/crud-typeorm)
 *
 * This is the new CRUD service that uses @apso/crud-typeorm.
 *
 * Key differences from v1 (@nestjsx/crud-typeorm):
 * - Import from @apso/crud-typeorm
 * - No need for getSelect workaround - issue #777 is fixed in the base class
 * - Better TypeScript support
 */
@Injectable()
export class TestCustomerService extends TypeOrmCrudService<TestCustomer> {
  constructor(@InjectRepository(TestCustomer) repo) {
    super(repo);
  }

  // No workaround needed - issue #777 is fixed in @apso/crud-typeorm
}
