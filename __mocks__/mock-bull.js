const mockQueue = {
  process: jest.fn(),
  on: jest.fn(),
  close: jest.fn(),
  add: jest.fn().mockResolvedValue({ id: "mock-job-id", data: {} }),
};

function Queue() {
  return mockQueue;
}

module.exports = Queue;
module.exports.default = Queue;
module.exports.Queue = Queue;
