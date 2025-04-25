import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import DoctorRegister from '../components/DoctorRegister';
import doctorReducer from '../store/slices/doctorSlice';

const mockStore = configureStore({
  reducer: {
    doctors: doctorReducer
  }
});

describe('DoctorRegister Component', () => {
  it('renders registration form', () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <DoctorRegister />
        </MemoryRouter>
      </Provider>
    );
    
    expect(screen.getByText('Doctor Registration')).toBeInTheDocument();
    expect(screen.getByLabelText('Username*')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name*')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name*')).toBeInTheDocument();
    expect(screen.getByLabelText('Email*')).toBeInTheDocument();
    expect(screen.getByLabelText('Medical License Number*')).toBeInTheDocument();
    expect(screen.getByLabelText('Password* (min 8 characters)')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password*')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it('shows error when passwords do not match', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <DoctorRegister />
        </MemoryRouter>
      </Provider>
    );
    
    fireEvent.change(screen.getByLabelText('Password* (min 8 characters)'), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByLabelText('Confirm Password*'), {
      target: { value: 'differentpassword' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  it('shows error when password is too short', async () => {
    render(
      <Provider store={mockStore}>
        <MemoryRouter>
          <DoctorRegister />
        </MemoryRouter>
      </Provider>
    );
    
    fireEvent.change(screen.getByLabelText('Password* (min 8 characters)'), {
      target: { value: 'short' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Register' }));
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
  });

  it('shows success message after successful registration', async () => {
    const successStore = configureStore({
      reducer: {
        doctors: (state = { registrationStatus: 'succeeded', error: null }, action) => state
      }
    });
    
    render(
      <Provider store={successStore}>
        <MemoryRouter>
          <DoctorRegister />
        </MemoryRouter>
      </Provider>
    );
    
    expect(screen.getByText('Registration Successful!')).toBeInTheDocument();
    expect(screen.getByText(/Your account has been created/)).toBeInTheDocument();
  });
});