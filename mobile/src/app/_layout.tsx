import {
    Stack,
} from "expo-router";

import {
    StatusBar,
} from "expo-status-bar";

import {
    AuthProvider,
} from "../providers/AuthProvider";

import {
    colors,
} from "../theme/colors";


export default function RootLayout() {
    return (
        <AuthProvider>
            <StatusBar
                style="light"
            />

            <Stack
                screenOptions={{
                    headerShown:
                        false,

                    contentStyle: {
                        backgroundColor:
                            colors.background,
                    },
                }}
            />
        </AuthProvider>
    );
}