import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Login from '../index';

// Mock the dependencies
vi.mock('../../../services/auth.service', () => ({
  authService: {
    login: vi.fn(() => Promise.resolve({
      accessToken: 'test-token',
      user: { id: 1, email: 'test@example.com', name: 'Test', role: 'admin' }
    })),
  },
}));

vi.mock('../../../stores/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn(),
  })),
}));

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
}));

describe('Login Component - POST Method Verification', () => {
  it('should render login form correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText('Agent任务管理系统')).toBeInTheDocument();
    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('should have form with onSubmit that prevents default', () => {
    const { container } = render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();
    
    // Create a submit event and check if preventDefault is called
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');
    
    fireEvent(form!, submitEvent);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should validate email field', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/请输入邮箱地址/i)).toBeInTheDocument();
    });
  });

  it('should validate password field', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/邮箱/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/请输入密码/i)).toBeInTheDocument();
    });
  });

  it('should call authService.login on valid submission', async () => {
    const { authService } = await import('../../../services/auth.service');
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const submitButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: '123456',
      });
    });
  });
});

describe('Login Form - Code Structure Verification', () => {
  it('should have onSubmit handler that prevents default form submission', () => {
    const fs = require('fs');
    const path = require('path');
    const loginComponentPath = path.join(__dirname, '..', 'index.tsx');
    const content = fs.readFileSync(loginComponentPath, 'utf-8');
    
    // Verify the fix is present - form should have onSubmit that prevents default
    expect(content).toMatch(/onSubmit=\{.*e\.preventDefault.*\}/);
    
    // Verify the form uses onFinish for POST request
    expect(content).toMatch(/onFinish=\{onFinish\}/);
  });

  it('should use authService.login which implements POST method', async () => {
    const fs = require('fs');
    const path = require('path');
    const authServicePath = path.join(__dirname, '..', '..', '..', 'services', 'auth.service.ts');
    const content = fs.readFileSync(authServicePath, 'utf-8');
    
    // Verify login uses POST method
    expect(content).toMatch(/api\.post.*auth\/login/);
    
    // Should NOT use GET method for login
    expect(content).not.toMatch(/api\.get.*auth\/login/);
  });
});
