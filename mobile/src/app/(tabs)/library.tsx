import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Redirect,
} from "expo-router";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import useAuth from "../../hooks/useAuth";

import {
    colors,
} from "../../theme/colors";

import {
    spacing,
} from "../../theme/spacing";

import {
    typography,
} from "../../theme/typography";


export default function LibraryScreen() {
    const {
        isAuthenticated,
        isRestoring,
    } =
        useAuth();


    if (
        !isRestoring &&
        !isAuthenticated
    ) {
        return (
            <Redirect
                href="/login"
            />
        );
    }


    return (
        <SafeAreaView
            style={
                styles.safeArea
            }
        >
            <View
                style={
                    styles.container
                }
            >
                <Text
                    style={
                        styles.eyebrow
                    }
                >
                    YOUR COLLECTION
                </Text>

                <Text
                    style={
                        styles.title
                    }
                >
                    Listem
                </Text>

                <Text
                    style={
                        styles.description
                    }
                >
                    Favorilerin ve izleme listen burada toplanacak.
                </Text>

                <View
                    style={
                        styles.card
                    }
                >
                    <Text
                        style={
                            styles.cardTitle
                        }
                    >
                        Koleksiyon ekranı hazırlanıyor
                    </Text>

                    <Text
                        style={
                            styles.cardDescription
                        }
                    >
                        Favoriler ve watchlist backend servisleri sonraki aşamalarda bu ekrana bağlanacak.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}


const styles =
    StyleSheet.create({
        safeArea: {
            flex: 1,

            backgroundColor:
                colors.background,
        },

        container: {
            flex: 1,

            paddingHorizontal:
                spacing.xl,

            paddingTop:
                spacing.xxl,
        },

        eyebrow: {
            ...typography.caption,

            color:
                colors.primary,

            fontWeight:
                "700",

            letterSpacing:
                1.5,
        },

        title: {
            ...typography.title,

            marginTop:
                spacing.sm,

            color:
                colors.text,
        },

        description: {
            ...typography.body,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,
        },

        card: {
            marginTop:
                spacing.xxl,

            padding:
                spacing.xl,

            borderWidth:
                1,

            borderColor:
                colors.border,

            borderRadius:
                16,

            backgroundColor:
                colors.surface,
        },

        cardTitle: {
            ...typography.body,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        cardDescription: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,
        },
    });