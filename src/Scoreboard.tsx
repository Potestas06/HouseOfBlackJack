import { Table, Form, Button } from 'react-bootstrap';
import React, { useState } from "react";

const Scoreboard = () => {
    // Beispiel-Daten für die Spieler, mit festem Rank
    const usersData = [
        { id: 1, rank: 1, name: 'Mike Koala', score: 95 },
        { id: 2, rank: 2, name: 'Gina Kangaroo', score: 92 },
        { id: 3, rank: 3, name: 'Sally Tortoise', score: 86 },
        { id: 4, rank: 4, name: 'Kim Lobster', score: 67 },
        { id: 5, rank: 5, name: 'Peter Rabbit', score: 56 },
        { id: 6, rank: 6, name: 'Frank Leopard', score: 43 },
        { id: 7, rank: 7, name: 'Mary Hyena', score: 34 },
        { id: 8, rank: 8, name: 'Caroline Bear', score: 32 },
        { id: 9, rank: 9, name: 'Tom Eagle', score: 24 },
        { id: 10, rank: 10, name: 'Jim Unicorn', score: 11 },
        { id: 11, rank: 11, name: 'Player 1', score: 0 }
    ];

    // State-Variablen
    const [users, setUsers] = useState(usersData);
    const [filter, setFilter] = useState(""); // Filter für Namen
    const [sortAsc, setSortAsc] = useState(true); // Für die Sortierung der Punktzahl
    const [sortByName, setSortByName] = useState(true); // Für Sortierung nach Namen A-Z oder Z-A

    // Handle Filteränderung
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    // Sortieren der Spieler basierend auf der Punktzahl
    const sortByScore = () => {
        const sortedUsers = [...users].sort((a, b) => {
            return sortAsc ? a.score - b.score : b.score - a.score;
        });
        setUsers(sortedUsers);
        setSortAsc(!sortAsc); // Richtung umkehren
        setSortByName(false); // Nach Namen nicht mehr sortieren
    };

    // Sortieren der Spieler basierend auf dem Namen (Alphabetisch A-Z oder Z-A)
    const sortByPlayerName = () => {
        const sortedUsers = [...users].sort((a, b) => {
            return sortByName
                ? a.name.localeCompare(b.name) // A-Z
                : b.name.localeCompare(a.name); // Z-A
        });
        setUsers(sortedUsers);
        setSortByName(!sortByName); // Richtung umkehren
    };

    // Gefilterte Benutzer basierend auf Namen
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="container mt-5">
            <h2 style={{ fontSize: "2rem", fontWeight: "bold", textAlign: "center", marginBottom: "20px" }}>Blackjack Scoreboard</h2>

            <div className="mb-3" style={{ maxWidth: "400px", margin: "0 auto" }}>
                <Form.Control
                    type="text"
                    placeholder="Search by name"
                    value={filter}
                    onChange={handleFilterChange}
                    style={{ padding: "10px", fontSize: "1.2rem" }}
                />
            </div>

            <Table striped bordered hover responsive style={{ border: "2px solid #ddd", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", marginTop: "20px" }}>
                <thead style={{ backgroundColor: "#f7f7f7", fontSize: "1.1rem", textAlign: "center" }}>
                <tr>
                    <th style={{ width: "20%" }}>
                        <Button variant="link" onClick={sortByScore} style={{ fontSize: "1rem" }}>
                            Rank {sortAsc ? '▲' : '▼'}
                        </Button>
                    </th>
                    <th style={{ width: "50%" }}>
                        <Button variant="link" onClick={sortByPlayerName} style={{ fontSize: "1rem" }}>
                            Name {sortByName ? '▲' : '▼'}
                        </Button>
                    </th>
                    <th style={{ width: "30%" }}>
                        <Button variant="link" onClick={sortByScore} style={{ fontSize: "1rem" }}>
                            Score {sortAsc ? '▲' : '▼'}
                        </Button>
                    </th>
                </tr>
                </thead>
                <tbody style={{ fontSize: "1rem", textAlign: "center" }}>
                {filteredUsers.map((user) => (
                    <tr key={user.id}>
                        <td>{user.rank}</td>
                        <td>{user.name}</td>
                        <td>{user.score}</td>
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    );
};

export default Scoreboard;
