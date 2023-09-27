import { createTheme } from "@mui/material";
import { blueGrey, green, grey } from "@mui/material/colors";

export const theme = createTheme({
  palette: {
    success: {
      main: green[600]
    },
    info:{
      main: grey[700],
    },
    secondary: {
      main: blueGrey[600]
    }
  }
})