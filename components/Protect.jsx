import { useAuth } from "@/contexts/AuthContext";
import { Box, Spinner, Center } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Protect = ({ children }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" color="green.400" thickness="4px" />
            </Center>
        );
    }

    if (!user) {
        return null;
    }

    return <Box>{children}</Box>;
};

export default Protect;
