import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all users dynamically
  useEffect(() => {
    if (user?.role === "admin") {
      axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
        .then((response) => setUsers(response.data))
        .catch((err) => setError("Error fetching users"))
        .finally(() => setLoading(false));
    }
  },  [user?.role]);

  const promoteUser = async (userId) => {
    try {
      await axios.post("http://localhost:5000/api/admin/assign-role", { userId, role: "admin" }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      alert("User promoted to admin!");
      window.location.reload(); // Refresh users list
    } catch (error) {
      alert("Failed to promote user.");
    }
  };

  return (
    <div className="container mt-5">
      <h1>Admin Dashboard</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                {user.role !== "admin" && (
                  <button className="btn btn-primary btn-sm" onClick={() => promoteUser(user.id)}>
                    Promote to Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;