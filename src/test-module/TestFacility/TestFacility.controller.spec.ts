import { Test, TestingModule } from '@nestjs/testing';
import { TestFacility } from './dtos/TestFacility.dto';
import { TestFacilityController } from './TestFacility.controller';
import { TestFacilityService } from './TestFacility.service';
import { ParsedRequest } from '@apso/crud';

const baseRequest: ParsedRequest = {
  query: {},
  options: {},
  parsed: {
    fields: [],
    paramsFilter: [],
    search: {},
    filter: [],
    or: [],
    join: [],
    sort: [],
    authPersist: undefined,
    limit: 10,
    offset: 0,
    page: 1,
    cache: 0,
  },
};

describe('TestFacilityController', () => {
  let controller: TestFacilityController;
  let spyService: TestFacilityService;

  beforeEach(async () => {
    const ApiServiceProvider = {
      provide: TestFacilityService,
      useFactory: () => ({
        createOne: jest.fn(() => ({ data: {} })),
        getOne: jest.fn(() => ({ data: {} })),
        getMany: jest.fn(() => ({ data: [], count: 0, total: 0, page: 1, pageCount: 0 })),
      }),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestFacilityController],
      providers: [TestFacilityService, ApiServiceProvider],
    }).compile();

    controller = module.get<TestFacilityController>(TestFacilityController);
    spyService = module.get<TestFacilityService>(TestFacilityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call FacilityController getOne method', async () => {
    // Note: In the new API, methods receive the raw request and extract ParsedRequest internally
    const mockReq = { parsedRequest: baseRequest };
    expect(await controller.getOne(mockReq)).not.toEqual(null);
    expect(spyService.getOne).toHaveBeenCalled();
  });

  it('should call FacilityController createOne method', async () => {
    const mockReq = { parsedRequest: baseRequest };
    const dto = new TestFacility();
    expect(await controller.createOne(mockReq, dto)).not.toEqual(null);
    expect(spyService.createOne).toHaveBeenCalled();
  });

  // Add your tests here
});
