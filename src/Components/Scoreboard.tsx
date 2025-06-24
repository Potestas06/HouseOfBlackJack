import React, { useState } from "react";
import {
    Box,
    Typography,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Paper,
    TextField,
    IconButton
} from "@mui/material";
import { ExpandMore, ExpandLess, ArrowDownward, ArrowUpward, SortByAlpha } from "@mui/icons-material";

const Scoreboard: React.FC = () => {
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

    const [expanded, setExpanded] = useState(false);
    const [filter, setFilter] = useState('');
    const [sortAsc, setSortAsc] = useState(true);
    const [sortByName, setSortByName] = useState(false);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
    };

    const toggleSortScore = () => {
        setSortAsc(!sortAsc);
        setSortByName(false);
    };

    const toggleSortName = () => {
        setSortByName(!sortByName);
    };

    let filteredUsers = usersData.filter(user =>
        user.name.toLowerCase().includes(filter.toLowerCase())
    );

    if (sortByName) {
        filteredUsers.sort((a, b) =>
            sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        );
    } else {
        filteredUsers.sort((a, b) =>
            sortAsc ? a.score - b.score : b.score - a.score
        );
    }

    const usersToShow = expanded ? filteredUsers : filteredUsers.slice(0, 5);

    return (
        <Box>
            <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                Top Players
            </Typography>

            <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Suche nach Name"
                value={filter}
                onChange={handleFilterChange}
                sx={{ mb: 1, input: { color: 'white' } }}
                InputProps={{
                    style: { backgroundColor: '#2c2c2c', borderRadius: 4 },
                }}
            />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={toggleSortScore}
                    startIcon={sortAsc ? <ArrowUpward /> : <ArrowDownward />}
                    sx={{ color: "white", borderColor: "#aaa", fontSize: "0.75rem" }}
                >
                    Punkte
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={toggleSortName}
                    startIcon={<SortByAlpha />}
                    sx={{ color: "white", borderColor: "#aaa", fontSize: "0.75rem" }}
                >
                    Name
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ backgroundColor: "#1e1e1e" }}>
                <Table size="small" aria-label="scoreboard" sx={{ minWidth: 280 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: "#fff", width: "25%" }}>Rank</TableCell>
                            <TableCell sx={{ color: "#fff", width: "50%" }}>Name</TableCell>
                            <TableCell sx={{ color: "#fff", width: "25%" }}>Score</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usersToShow.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell sx={{ color: "#fff" }}>{user.rank}</TableCell>
                                <TableCell sx={{ color: "#fff" }}>{user.name}</TableCell>
                                <TableCell sx={{ color: "#fff" }}>{user.score}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box textAlign="center" mt={1}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setExpanded(!expanded)}
                    sx={{ color: "#fff", borderColor: "#aaa", fontSize: "0.75rem" }}
                >
                    {expanded ? <>Weniger <ExpandLess fontSize="small" /></> : <>Mehr <ExpandMore fontSize="small" /></>}
                </Button>
            </Box>
        </Box>
    );
};

export default Scoreboard;
