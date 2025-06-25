import React, { useEffect, useState } from "react";
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
    TextField
} from "@mui/material";
import { ExpandMore, ExpandLess, ArrowDownward, ArrowUpward, SortByAlpha } from "@mui/icons-material";
import { db } from "../Firebase";
import { ref, onValue } from "firebase/database";

const Scoreboard: React.FC = () => {
    const [usersData, setUsersData] = useState<{id:string;name:string;balance:number;}[]>([]);

    useEffect(() => {
        const r = ref(db, 'users');
        onValue(r, snap => {
            const list: {id:string;name:string;balance:number;}[] = [];
            snap.forEach(c => {
                const v = c.val();
                list.push({ id: c.key!, name: v.name || c.key, balance: v.balance || 0 });
            });
            list.sort((a,b) => b.balance - a.balance);
            setUsersData(list);
        });
    }, []);

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
            sortAsc ? a.balance - b.balance : b.balance - a.balance
        );
    }

    const usersToShow = expanded ? filteredUsers : filteredUsers.slice(0, 3);

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
                    Balance
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
                            <TableCell sx={{ color: "#fff", width: "25%" }}>Balance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {usersToShow.map((user, idx) => (
                            <TableRow key={user.id}>
                                <TableCell sx={{ color: "#fff" }}>{idx + 1}</TableCell>
                                <TableCell sx={{ color: "#fff" }}>{user.name}</TableCell>
                                <TableCell sx={{ color: "#fff" }}>{user.balance}</TableCell>
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
