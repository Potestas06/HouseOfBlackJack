import React, { useEffect, useState } from "react";
import { Table } from 'react-bootstrap';
import { getLeaderboard } from "./Services/UserService.tsx";

const Scoreboard = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLeaderboard();
      setUsers(data);
    };
    fetchData();
  }, []);

  return (
    <div className="container mt-5">
      <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>Blackjack Scoreboard</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.email}</td>
              <td>{user.balance}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Scoreboard;
