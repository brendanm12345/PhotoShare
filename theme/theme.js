import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  root: {
    display: "flex",
  }, 
  palette: {
    primary: {
      main: '#CFD11A',
      darker: '#011638',
    },
    secondary: {
        main: '#595959',
        darker: '#141115',
    },
    neutral: {
      main: '#E7F1F1',
      contrastText: '#000',
    },
    night: {
       main: '#141115',
    }
  },
  typography: {
    fontFamily: "Lato, Arial",
    fontSize: 12,
    h1: {
      fontFamily: "Lato, Arial",
      fontSize: 30,
      fontWeight: 700,
    },
    h2: {
      fontFamily: "Lato, Arial",
      fontSize: 20,
      fontWeight: 700,
      paddingBottom: 20,
    },
  },
  overrides: {
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: "#662E9B",
      },
    },
  },
});

export default createTheme(theme);
