import React from "react";
import { Provider } from "react-redux";
import store from "./Store";
import EmployeeList from "./EmployeeList";
import EmployeeForm from "./EmployeeForm";
import "./Styles.css";

function App() {
  return (
    <Provider store={store}>
      <div className="card">
        <EmployeeForm />
        <EmployeeList />
      </div>
    </Provider>
  );
}

export default App;
