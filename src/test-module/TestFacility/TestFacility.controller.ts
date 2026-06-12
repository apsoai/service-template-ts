import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@apso/crud';
import { ApiTags } from '@nestjs/swagger';
import { TestFacility, TestFacilityCreate } from './dtos/TestFacility.dto';
import { TestFacilityService } from './TestFacility.service';

/**
 * TestFacility Controller (v2 - using @apso/crud)
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
    type: TestFacility,
  },
  dto: {
    create: TestFacilityCreate,
    update: TestFacility,
    replace: TestFacility,
  },
  query: {
    // Issue #777 is fixed in @apso/crud - no workaround needed
    limit: 5,
    alwaysPaginate: true,
    join: {
      customer: { eager: false },
      'customer.facilities': { eager: false },
    },
  },
})
@Controller('TestFacilitys')
@ApiTags('Test Facilitys')
export class TestFacilityController extends CrudController<TestFacility> {
  constructor(public service: TestFacilityService) {
    super();
  }

  // Optional: Add hooks for custom logic
  // protected async beforeGetMany(req: ParsedRequest): Promise<void> {
  //   // Custom logic before fetching many entities
  // }

  // protected async afterCreateOne(req: ParsedRequest, result: CreateOneResponse<TestFacility>): Promise<CreateOneResponse<TestFacility>> {
  //   // Custom logic after creating an entity
  //   return result;
  // }
}
