import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../src/contexts/AuthContext";
import Login from "../../src/pages/Login";
import Register from "../../src/pages/Register";
import { authAPI } from "../../src/services/api";

jest.mock("../../src/services/api", () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Authentication E2E Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe("Login Page", () => {
    it("should render login form and submit successfully", async () => {
      // Setup
      const loginData = {
        email: "user@example.com",
        password: "password123",
      };

      const mockResponse = {
        data: {
          token: "mock_token",
          user: {
            id: 1,
            username: "testuser",
            email: loginData.email,
          },
          message: "Login successful",
        },
      };

      (authAPI.login as jest.Mock).mockImplementation(() => {
        localStorage.setItem("token", "mock_token");
        localStorage.setItem("user", JSON.stringify(mockResponse.data.user));
        return Promise.resolve(mockResponse);
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /login/i })
      ).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: loginData.email },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: loginData.password },
      });

      fireEvent.click(screen.getByRole("button", { name: /login/i }));

      await waitFor(() => {
        expect(authAPI.login).toHaveBeenCalledWith(
          loginData.email,
          loginData.password
        );
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
        expect(localStorage.getItem("token")).toBe("mock_token");
        expect(localStorage.getItem("user")).toBeTruthy();
      });
    });

    it("should display error message on login failure", async () => {
      const errorMessage = "Invalid credentials";
      (authAPI.login as jest.Mock).mockRejectedValue({
        response: { data: { message: errorMessage } },
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: "user@example.com" },
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: "wrongpassword" },
      });
      fireEvent.click(screen.getByRole("button", { name: /login/i }));

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });
  });

  describe("Register Page", () => {
    it("should render registration form and submit successfully", async () => {
      const registerData = {
        username: "newuser",
        email: "new@example.com",
        password: "password123",
      };

      const mockResponse = {
        data: {
          token: "mock_token",
          user: {
            id: 1,
            username: registerData.username,
            email: registerData.email,
          },
          message: "User registered successfully",
        },
      };

      (authAPI.register as jest.Mock).mockImplementation(() => {
        localStorage.setItem("token", "mock_token");
        localStorage.setItem("user", JSON.stringify(mockResponse.data.user));
        return Promise.resolve(mockResponse);
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/username/i), {
        target: { value: registerData.username },
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: registerData.email },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: registerData.password },
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: registerData.password },
      });

      fireEvent.click(screen.getByRole("button", { name: /register/i }));

      await waitFor(() => {
        expect(authAPI.register).toHaveBeenCalledWith(
          registerData.username,
          registerData.email,
          registerData.password
        );
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
      });
    });
  });
});
