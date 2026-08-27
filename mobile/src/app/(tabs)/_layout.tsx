import {
    Ionicons,
} from "@expo/vector-icons";

import {
    Tabs,
} from "expo-router";

import useAuth from "../../hooks/useAuth";

import {
    colors,
} from "../../theme/colors";


export default function TabsLayout() {
    const {
        isAuthenticated,
        isRestoring,
    } =
        useAuth();

    const showProtectedTabs =
        !isRestoring &&
        isAuthenticated;


    return (
        <Tabs
            screenOptions={{
                headerShown:
                    false,

                tabBarActiveTintColor:
                    colors.primary,

                tabBarInactiveTintColor:
                    colors.textMuted,

                tabBarHideOnKeyboard:
                    true,

                tabBarStyle: {
                    backgroundColor:
                        colors.surface,

                    borderTopColor:
                        colors.border,

                    borderTopWidth:
                        1,

                    paddingTop:
                        6,

                    paddingBottom:
                        6,
                },

                tabBarLabelStyle: {
                    fontSize:
                        11,

                    fontWeight:
                        "600",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title:
                        "Ana Sayfa",

                    tabBarIcon: ({
                        color,
                        size,
                        focused,
                    }) => (
                        <Ionicons
                            name={
                                focused
                                    ? "home"
                                    : "home-outline"
                            }
                            color={
                                color
                            }
                            size={
                                size
                            }
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="search"
                options={{
                    title:
                        "Ara",

                    tabBarIcon: ({
                        color,
                        size,
                        focused,
                    }) => (
                        <Ionicons
                            name={
                                focused
                                    ? "search"
                                    : "search-outline"
                            }
                            color={
                                color
                            }
                            size={
                                size
                            }
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="library"
                options={{
                    title:
                        "Listem",

                    href:
                        showProtectedTabs
                            ? undefined
                            : null,

                    tabBarIcon: ({
                        color,
                        size,
                        focused,
                    }) => (
                        <Ionicons
                            name={
                                focused
                                    ? "library"
                                    : "library-outline"
                            }
                            color={
                                color
                            }
                            size={
                                size
                            }
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title:
                        "Profil",

                    href:
                        showProtectedTabs
                            ? undefined
                            : null,

                    tabBarIcon: ({
                        color,
                        size,
                        focused,
                    }) => (
                        <Ionicons
                            name={
                                focused
                                    ? "person"
                                    : "person-outline"
                            }
                            color={
                                color
                            }
                            size={
                                size
                            }
                        />
                    ),
                }}
            />
        </Tabs>
    );
}