import { extendTheme } from "@chakra-ui/react";

const config = {
    initialColorMode: "dark",
    useSystemColorMode: false,
};

const theme = extendTheme({
    config,
    colors: {
        glass: "rgba(218, 218, 218, 0.15)",
        brandBlack: { 
            100: "rgba(58, 58, 58, 0.6)", 
            200: "rgba(56, 58, 58, 0.8)" 
        },
    },
    fonts: {
        heading: `'Chakra Petch', sans-serif`,
        body: `'Chakra Petch', sans-serif`,
    },
    components: {
        Button: {
            defaultProps: {
                size: "lg",
            },
            variants: {
                solid: {
                    bg: "rgba(28, 200, 128, 0.9)",
                    _hover: {
                        bg: "rgba(28, 200, 128, 1)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(28, 200, 128, 0.4)",
                    },
                },
            },
        },
        Box: {
            baseStyle: {
                backdropFilter: "blur(10px)",
            },
        },
    },
    styles: {
        global: {
            body: {
                bg: "transparent",
            },
        },
    },
});

export default theme;
