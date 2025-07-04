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
import { collection, onSnapshot } from "firebase/firestore";

type UserData = {
    id: string;
    name: string;
    balance: number;
};

const Scoreboard: React.FC<{ balance: number }> = ({ balance }) => {
    const [usersData, setUsersData] = useState<UserData[]>([]);
    const [expanded, setExpanded] = useState(false);
    const [filter, setFilter] = useState('');
    const [sortByName, setSortByName] = useState(false);
    const [sortAscending, setSortAscending] = useState(false);

    // Firestore data fetching
    useEffect(() => {
        try {
            const usersRef = collection(db, 'users');
            
            const unsubscribe = onSnapshot(usersRef, (snapshot) => {
                const userList: UserData[] = [];
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    userList.push({
                        id: doc.id,
                        name: data.name || `User_${doc.id.slice(0, 6)}`,
                        balance: data.balance || 0
                    });
                });
                
                setUsersData(userList);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Failed to setup Firestore:", error);
        }
    }, []);

    // Event handlers
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
    };

    const handleSortByBalance = () => {
        if (sortByName) {
            setSortByName(false);
            setSortAscending(false);
        } else {
            setSortAscending(!sortAscending);
        }
    };

    const handleSortByName = () => {
        if (!sortByName) {
            setSortByName(true);
            setSortAscending(true);
        } else {
            setSortAscending(!sortAscending);
        }
    };

    const toggleExpanded = () => {
        setExpanded(!expanded);
    };

    // Process data
    let processedUsers = [...usersData];
    
    // Filter
    if (filter.trim()) {
        processedUsers = processedUsers.filter(user => 
            user.name.toLowerCase().includes(filter.toLowerCase().trim())
        );
    }
    
    // Sort
    if (sortByName) {
        processedUsers.sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return sortAscending ? comparison : -comparison;
        });
    } else {
        processedUsers.sort((a, b) => {
            const comparison = a.balance - b.balance;
            return sortAscending ? comparison : -comparison;
        });
    }
    
    // Limit
    const displayUsers = expanded ? processedUsers : processedUsers.slice(0, 3);

    return (
        <Box sx={{ 
            position: 'relative',
            zIndex: 1000,
            pointerEvents: 'auto'
        }}>
            <Typography 
                variant="h6" 
                align="center" 
                gutterBottom 
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
            >
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
                    onClick={handleSortByBalance}
                    startIcon={!sortByName ? (sortAscending ? <ArrowUpward /> : <ArrowDownward />) : null}
                    sx={{ 
                        color: "white", 
                        borderColor: !sortByName ? "#fff" : "#aaa", 
                        fontSize: "0.75rem",
                        opacity: !sortByName ? 1 : 0.7,
                        pointerEvents: 'auto'
                    }}
                >
                    Balance
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSortByName}
                    startIcon={<SortByAlpha />}
                    sx={{ 
                        color: "white", 
                        borderColor: sortByName ? "#fff" : "#aaa", 
                        fontSize: "0.75rem",
                        opacity: sortByName ? 1 : 0.7,
                        pointerEvents: 'auto'
                    }}
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
                        {displayUsers.map((user, index) => (
                            <TableRow key={user.id}>
                                <TableCell sx={{ color: "#fff" }}>{index + 1}</TableCell>
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
                    onClick={toggleExpanded}
                    sx={{ 
                        color: "#fff", 
                        borderColor: "#aaa", 
                        fontSize: "0.75rem",
                        pointerEvents: 'auto'
                    }}
                >
                    {expanded ? "Weniger" : "Mehr"} {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </Button>
            </Box>
        </Box>
    );
};

export default Scoreboard;