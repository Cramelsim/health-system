import doctorReducer, { 
    registerNewDoctor, 
    resetRegistrationStatus 
  } from '../store/slices/doctorSlice';
  
  describe('doctorSlice', () => {
    const initialState = {
      registrationStatus: 'idle',
      error: null
    };
  
    it('should handle initial state', () => {
      expect(doctorReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  
    it('should handle registerNewDoctor.pending', () => {
      const action = { type: registerNewDoctor.pending.type };
      const state = doctorReducer(initialState, action);
      expect(state).toEqual({
        registrationStatus: 'loading',
        error: null
      });
    });
  
    it('should handle registerNewDoctor.fulfilled', () => {
      const action = { type: registerNewDoctor.fulfilled.type };
      const state = doctorReducer(initialState, action);
      expect(state).toEqual({
        registrationStatus: 'succeeded',
        error: null
      });
    });
  
    it('should handle registerNewDoctor.rejected', () => {
      const errorMessage = 'Registration failed';
      const action = { 
        type: registerNewDoctor.rejected.type,
        payload: errorMessage
      };
      const state = doctorReducer(initialState, action);
      expect(state).toEqual({
        registrationStatus: 'failed',
        error: errorMessage
      });
    });
  
    it('should handle resetRegistrationStatus', () => {
      const currentState = {
        registrationStatus: 'succeeded',
        error: null
      };
      const action = { type: resetRegistrationStatus.type };
      const state = doctorReducer(currentState, action);
      expect(state).toEqual(initialState);
    });
  });