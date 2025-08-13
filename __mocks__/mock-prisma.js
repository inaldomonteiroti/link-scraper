const createMockFn = () => {
  return jest.fn();
};

const mockPrismaClient = {
  user: {
    findUnique: createMockFn(),
    findFirst: createMockFn(),
    create: createMockFn(),
    upsert: createMockFn(),
  },
  $disconnect: createMockFn(),
  $connect: createMockFn(),
  $transaction: function (callback) {
    return Promise.resolve(callback(mockPrismaClient));
  },
  link: {
    deleteMany: createMockFn(),
    createMany: createMockFn(),
    count: createMockFn(),
    findMany: createMockFn(),
  },
  page: {
    update: createMockFn(),
    create: createMockFn(),
    count: createMockFn(),
    findMany: createMockFn(),
    findFirst: createMockFn(),
  },
};

const PrismaClientMock = function () {
  return mockPrismaClient;
};

module.exports = {
  PrismaClient: PrismaClientMock,
};
