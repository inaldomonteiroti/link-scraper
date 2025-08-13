import { authenticate } from "../../src/middleware/auth";

const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const mockPrismaClient = new PrismaClient();

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn().mockReturnValue({ userId: 1 }),
  sign: jest.fn().mockReturnValue("mock_token"),
}));

describe("Authentication Middleware", () => {
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: jest.Mock;
  let mockPrisma: any;

  beforeEach(() => {
    mockRequest = {
      headers: {},
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    mockPrisma = mockPrismaClient;
    process.env.JWT_SECRET = "test_secret";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if no authorization header is provided", async () => {
    await authenticate(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Authentication required. No token provided.",
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should authenticate user with valid token", async () => {
    const userId = 1;
    const user = {
      id: userId,
      username: "testuser",
      email: "test@example.com",
    };

    mockRequest.headers.authorization = "Bearer valid_token";
    jest.mocked(jwt.verify).mockImplementationOnce(() => ({ userId }));
    mockPrisma.user.findUnique.mockResolvedValue(user);

    await authenticate(mockRequest, mockResponse, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith("valid_token", "test_secret");
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: userId },
    });
    expect(mockRequest.user).toEqual(user);
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });
});
