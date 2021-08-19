import { createTheme } from '@material-ui/core/styles';
import { grey } from '@material-ui/core/colors';

const theme = createTheme({
    palette: {
        primary: {
            main: grey[900],
        },
        secondary: {
            main: grey[700]
        },
        text: {
            main: grey[50]
        },
        background: {
            default: grey[800],
            lighter: grey[50]
        }
    },
});

export default theme;