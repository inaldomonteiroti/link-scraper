import app from "../../src/server";

const request = require("supertest");
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const mockPrismaClient = new PrismaClient();

jest.mock("bcryptjs", () => {
  return {
    hash: jest.fn().mockResolvedValue("hashed_password"),
    compare: jest.fn().mockImplementation((password: string, hash: string) => {
      return Promise.resolve(true);
    }),
  };
});

describe("Auth Routes", () => {
  let prisma: any;

  beforeEach(() => {
    prisma = mockPrismaClient;
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        username: "newuser",
        email: "new@example.com",
        password: "password123",
      };

      prisma.user.findFirst.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        username: userData.username,
        email: userData.email,
        password: "hashed_password",
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("token", "mock_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("username", userData.username);
      expect(response.body.user).toHaveProperty("email", userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
    });

    it("should return 400 if username is already taken", async () => {
      const userData = {
        username: "existinguser",
        email: "new@example.com",
        password: "password123",
      };

      prisma.user.findFirst.mockResolvedValue({
        id: 1,
        username: "existinguser",
        email: "existing@example.com",
      });

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Username already taken");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const loginData = {
        email: "user@example.com",
        password: "password123",
      };

      const user = {
        id: 1,
        username: "testuser",
        email: loginData.email,
        password: "hashed_password",
      };

      prisma.user.findUnique.mockResolvedValue(user);

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token", "mock_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("username", user.username);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginData.password,
        user.password
      );
    });

    it("should return 401 with invalid credentials", async () => {
      const loginData = {
        email: "user@example.com",
        password: "wrongpassword",
      };

      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        username: "testuser",
        email: loginData.email,
        password: "hashed_password",
      });
      bcrypt.compare.mockImplementationOnce(
        (password: string, hash: string) => {
          return Promise.resolve(false);
        }
      );

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message", "Invalid credentials");
    });
  });
});
