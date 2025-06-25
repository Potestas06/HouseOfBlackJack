import React, { useEffect, useState } from "react";
import Home from "../Components/Home";
import LogoutButton from "../Components/LogoutButton";
import GameField from "./GameField";
import {
    Box,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Typography,
    Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { signOut } from "firebase/auth";
import { auth } from "../Firebase";

const HomePage: React.FC = () => {
    const [showGame, setShowGame] = useState(false);
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleBackToHome = () => {
        setShowGame(false);
        handleCloseNavMenu();
    };

    const handleLogOut = async () => {
        handleCloseNavMenu();
        try {
            await signOut(auth);
            window.location.href = "/auth";
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <Box
            sx={{
                height: "100vh",
                width: "100vw",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: showGame ? "flex-start" : "center",
                alignItems: "center",
                padding: showGame ? "1rem" : 0,
            }}
        >
            {showGame ? (
                <GameField />
            ) : (
                <>
                    <Home />

                    <Grid container justifyContent="center" sx={{ mt: 4 }}>
                        <Grid item>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowGame(true)}
                            >
                                Go to Gamefield
                            </button>
                        </Grid>
                    </Grid>

                    <Grid container justifyContent="center" sx={{ mt: 2 }}>
                        <Grid item>
                            <LogoutButton />
                        </Grid>
                    </Grid>
                </>
            )}

            {showGame && (
                <Box sx={{ position: "absolute", top: "1rem", right: "1rem" }}>
                    <Tooltip title="Menü öffnen">
                        <IconButton
                            size="large"
                            aria-label="Menü"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Tooltip>

                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorElNav}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                        open={Boolean(anchorElNav)}
                        onClose={handleCloseNavMenu}
                        PaperProps={{
                            sx: {
                                backgroundColor: "#121212",
                                color: "#ffffff",
                            },
                        }}
                    >
                        <MenuItem onClick={handleBackToHome}>
                            <Typography textAlign="center">Zurück zur Startseite</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => { window.location.href = '/account'; }}>
                            <Typography textAlign="center">Account</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogOut}>
                            <Typography textAlign="center">Log out</Typography>
                        </MenuItem>
                    </Menu>
                </Box>
            )}
        </Box>
    );
};

export default HomePage;
