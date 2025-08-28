import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employees: [],
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    addEmployee: (state, action) => {
      state.employees.push(action.payload);
    },
    updateEmployee: (state, action) => {
      const { id, name, role } = action.payload;
      const index = state.employees.findIndex((emp) => emp.id === id);
      if (index !== -1) {
        state.employees[index] = { id, name, role };
      }
    },
    deleteEmployee: (state, action) => {
      state.employees = state.employees.filter(
        (emp) => emp.id !== action.payload
      );
    },
  },
});

export const { addEmployee, updateEmployee, deleteEmployee } =
  employeeSlice.actions;
export default employeeSlice.reducer;
