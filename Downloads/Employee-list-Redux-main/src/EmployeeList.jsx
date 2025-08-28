import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deleteEmployee, updateEmployee } from "./EmployeeSlice";

const EmployeeList = () => {
  const employees = useSelector((state) => state.employees.employees);
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({ name: "", role: "" });

  const handleEdit = (employee) => {
    setEditing(employee.id);
    setEditData({ name: employee.name, role: employee.role });
  };

  const handleUpdate = () => {
    dispatch(updateEmployee({ id: editing, ...editData }));
    setEditing(null);
  };

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(({ id, name, role }) => {
            const isEditing = editing === id;

            return (
              <tr key={id}>
                <td>{id}</td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                    />
                  ) : (
                    <span>{name}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.role}
                      onChange={(e) =>
                        setEditData({ ...editData, role: e.target.value })
                      }
                    />
                  ) : (
                    <span>{role}</span>
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <button onClick={handleUpdate} className="edit-btn">
                      Save
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit({ id, name, role })}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => dispatch(deleteEmployee(id))}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
export default EmployeeList;
