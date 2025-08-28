import { configureStore } from "@reduxjs/toolkit";
import employeeReducer from "./EmployeeSlice";

const store = configureStore({
  reducer: {
    employees: employeeReducer,
  },
});

export default store;
