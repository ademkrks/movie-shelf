import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    colors,
} from "../../theme/colors";

import {
    spacing,
} from "../../theme/spacing";

import {
    typography,
} from "../../theme/typography";


export default function SearchScreen() {
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
                    DISCOVER
                </Text>

                <Text
                    style={
                        styles.title
                    }
                >
                    Film Ara
                </Text>

                <Text
                    style={
                        styles.description
                    }
                >
                    MovieShelf kataloğunda film arama ekranı burada yer alacak.
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
                        Arama hazırlanıyor
                    </Text>

                    <Text
                        style={
                            styles.cardDescription
                        }
                    >
                        Bir sonraki adımda bu ekran ile MovieShelf backend arama API bağlantısını kuracağız.
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