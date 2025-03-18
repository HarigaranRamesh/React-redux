import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addEmployee } from "./EmployeeSlice";

const EmployeeForm = () => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id.trim() === "" || name.trim() === "" || role.trim() === "") return;

    dispatch(addEmployee({ id, name, role }));
    setId("");
    setName("");
    setRole("");
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <h1>Employee List Using Redux</h1>
      <input
        type="text"
        placeholder="Employee ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Employee Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      />
      <button type="submit">Add Employee</button>
    </form>
  );
};

export default EmployeeForm;
