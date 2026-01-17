import "@/styles/globals.css";
import "@fontsource/chakra-petch";
import theme from "@/theme";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App({ Component, pageProps }) {
    return (
        <ChakraProvider theme={theme}>
            <AuthProvider>
                <Component {...pageProps} />
            </AuthProvider>
        </ChakraProvider>
    );
}
