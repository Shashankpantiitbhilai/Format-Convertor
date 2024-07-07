import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#90caf9",
            dark: "#42a5f5",
        },
        secondary: {
            main: "#f48fb1",
            dark: "#f06292",
        },
        background: {
            default: "#303030",
            paper: "#424242",
        },
    },
    typography: {
        h4: {
            fontWeight: "bold",
            color: "orange",
        },
        h5: {
            fontWeight: "bold",
            color: "#90caf9",
        },
    },
});

export default theme;
