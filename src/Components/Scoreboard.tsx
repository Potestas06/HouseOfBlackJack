import React, { useEffect, useState, useMemo } from "react";
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
import { ExpandMore, ExpandLess, ArrowDownward, ArrowUpward, SortByAlpha, NavigateNext, NavigateBefore } from "@mui/icons-material";
import { db } from "../Firebase";
import { collection, onSnapshot } from "firebase/firestore";

// ==================================================================================
// Functional Programming: Pure Functions and Utilities
// ==================================================================================

type UserData = {
    id: string;
    name: string;
    balance: number;
};

type SortConfig = {
    byName: boolean;
    ascending: boolean;
};

/**
 * A higher-order function that executes a chain of functions from left to right.
 * Each function passes its result to the next.
 * @param fns The functions to be executed in sequence.
 * @returns A new function that takes the initial value and returns the final result.
 */
const pipe = (...fns: Function[]) => (initialValue: any) => fns.reduce((acc, fn) => fn(acc), initialValue);

/**
 * Pure function to filter users based on a search term.
 * @param filterText The text to search for in the user's name.
 * @returns A new function that takes a user list and returns the filtered list.
 */
const filterUsers = (filterText: string) => (users: UserData[]): UserData[] => {
    const trimmedFilter = filterText.trim().toLowerCase();
    if (!trimmedFilter) {
        return users;
    }
    return users.filter(user => user.name.toLowerCase().includes(trimmedFilter));
};

/**
 * Pure function to sort users based on a configuration.
 * @param config The sorting configuration object.
 * @returns A new function that takes a user list and returns the sorted list.
 */
const sortUsers = (config: SortConfig) => (users: UserData[]): UserData[] => {
    const sortedUsers = [...users]; // Creates a copy to maintain immutability
    
    const comparator = config.byName
        ? (a: UserData, b: UserData) => a.name.localeCompare(b.name)
        : (a: UserData, b: UserData) => a.balance - b.balance;

    sortedUsers.sort((a, b) => {
        const comparison = comparator(a, b);
        return config.ascending ? comparison : -comparison;
    });

    return sortedUsers;
};

/**
 * Pure function for paginating data.
 * @param page The current page number (0-based).
 * @param rowsPerPage The number of items per page.
 * @returns A new function that takes a user list and returns the corresponding page of data.
 */
const paginateUsers = (page: number, rowsPerPage: number) => (users: UserData[]): UserData[] => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return users.slice(start, end);
};


// ==================================================================================
// React Component: Scoreboard
// ==================================================================================

const Scoreboard: React.FC<{ balance: number }> = ({ balance }) => {
    const [usersData, setUsersData] = useState<UserData[]>([]);
    const [expanded, setExpanded] = useState(false);
    const [filter, setFilter] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ byName: false, ascending: false });
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 5;

    // Firestore data fetching
    useEffect(() => {
        const usersRef = collection(db, 'users');
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const userList: UserData[] = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name || `User_${doc.id.slice(0, 6)}`,
                balance: doc.data().balance || 0
            }));
            setUsersData(userList);
        });
        return () => unsubscribe();
    }, []);

    // Event Handlers
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilter(e.target.value);
        setCurrentPage(0); // Reset pagination on filter change
    };

    const handleSort = (byName: boolean) => {
        setSortConfig(prevConfig => ({
            byName,
            ascending: prevConfig.byName === byName ? !prevConfig.ascending : true
        }));
    };

    const toggleExpanded = () => setExpanded(!expanded);
    const handleNextPage = () => setCurrentPage(prev => prev + 1);
    const handlePrevPage = () => setCurrentPage(prev => prev - 1);

    // Data processing with function composition (pipe)
    const processedUsers = useMemo(() => pipe(
        filterUsers(filter),
        sortUsers(sortConfig)
    )(usersData), [usersData, filter, sortConfig]);

    const paginatedUsers = useMemo(() => paginateUsers(currentPage, rowsPerPage)(processedUsers), [processedUsers, currentPage]);
    
    const displayUsers = expanded ? paginatedUsers : processedUsers.slice(0, 3);
    const maxPage = Math.ceil(processedUsers.length / rowsPerPage) - 1;

    return (
        <Box sx={{ position: 'relative', zIndex: 1000, pointerEvents: 'auto', width: 320 }}>
            <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                Top Players
            </Typography>

            <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search by name"
                value={filter}
                onChange={handleFilterChange}
                sx={{ mb: 1, input: { color: 'white' }, backgroundColor: '#2c2c2c', borderRadius: 1 }}
            />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Button variant="outlined" size="small" onClick={() => handleSort(false)} startIcon={!sortConfig.byName ? (sortConfig.ascending ? <ArrowUpward /> : <ArrowDownward />) : null} sx={{ color: "white", borderColor: !sortConfig.byName ? "#fff" : "#aaa", opacity: !sortConfig.byName ? 1 : 0.7 }}>
                    Balance
                </Button>
                <Button variant="outlined" size="small" onClick={() => handleSort(true)} startIcon={<SortByAlpha />} sx={{ color: "white", borderColor: sortConfig.byName ? "#fff" : "#aaa", opacity: sortConfig.byName ? 1 : 0.7 }}>
                    Name
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ backgroundColor: "#1e1e1e" }}>
                <Table size="small">
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
                                <TableCell sx={{ color: "#fff" }}>{currentPage * rowsPerPage + index + 1}</TableCell>
                                <TableCell sx={{ color: "#fff" }}>{user.name}</TableCell>
                                <TableCell sx={{ color: "#fff" }}>{user.balance}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {expanded && (
                <Box display="flex" justifyContent="center" alignItems="center" mt={1}>
                    <Button onClick={handlePrevPage} disabled={currentPage === 0} sx={{ color: 'white' }}><NavigateBefore /></Button>
                    <Typography sx={{ color: 'white', mx: 2 }}>Page {currentPage + 1} of {maxPage + 1}</Typography>
                    <Button onClick={handleNextPage} disabled={currentPage >= maxPage} sx={{ color: 'white' }}><NavigateNext /></Button>
                </Box>
            )}

            <Box textAlign="center" mt={1}>
                <Button onClick={toggleExpanded} sx={{ color: "#fff", borderColor: "#aaa" }}>
                    {expanded ? "Show Less" : "Show More"} {expanded ? <ExpandLess /> : <ExpandMore />}
                </Button>
            </Box>
        </Box>
    );
};

export default Scoreboard;
