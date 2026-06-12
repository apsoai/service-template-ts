import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@apso/crud';
import { ApiTags } from '@nestjs/swagger';
import { TestCustomer, TestCustomerCreate } from './dtos/TestCustomer.dto';
import { TestCustomerService } from './TestCustomer.service';

/**
 * TestCustomer Controller (v2 - using @apso/crud)
 *
 * This is the new simplified CRUD controller that extends CrudController
 * instead of implementing it with manual overrides.
 *
 * Key differences from v1 (@nestjsx/crud):
 * - Extends CrudController<T> instead of implements
 * - No need for @Override decorators
 * - No need for base getter
 * - API documentation is auto-generated
 * - Hooks available via protected methods (beforeGetMany, afterCreateOne, etc.)
 */
@Crud({
  model: {
    type: TestCustomer,
  },
  dto: {
    create: TestCustomerCreate,
    update: TestCustomer,
    replace: TestCustomer,
  },
  query: {
    // Issue #777 is fixed in @apso/crud - no workaround needed
    limit: 5,
    alwaysPaginate: true,
    join: {
      facilities: { eager: false },
      'facilities.customer': { eager: false },
    },
  },
})
@Controller('TestCustomers')
@ApiTags('Test Customers')
export class TestCustomerController extends CrudController<TestCustomer> {
  constructor(public service: TestCustomerService) {
    super();
  }

  // Optional: Add hooks for custom logic
  // protected async beforeGetMany(req: ParsedRequest): Promise<void> {
  //   // Custom logic before fetching many entities
  // }

  // protected async afterCreateOne(req: ParsedRequest, result: CreateOneResponse<TestCustomer>): Promise<CreateOneResponse<TestCustomer>> {
  //   // Custom logic after creating an entity
  //   return result;
  // }
}
