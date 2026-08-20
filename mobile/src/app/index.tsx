import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";


export default function HomeScreen() {
    return (
        <SafeAreaView
            style={styles.safeArea}
        >
            <View
                style={styles.container}
            >
                <View
                    style={styles.brandContainer}
                >
                    <Text
                        style={styles.brand}
                    >
                        Movie
                        <Text
                            style={
                                styles.brandAccent
                            }
                        >
                            Shelf
                        </Text>
                    </Text>

                    <Text
                        style={styles.tagline}
                    >
                        Your movies.
                        Your shelf.
                    </Text>
                </View>

                <View
                    style={styles.statusContainer}
                >
                    <View
                        style={styles.statusDot}
                    />

                    <Text
                        style={styles.statusText}
                    >
                        Mobile foundation ready
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

            alignItems:
                "center",

            justifyContent:
                "center",

            paddingHorizontal:
                spacing.xl,

            backgroundColor:
                colors.background,
        },

        brandContainer: {
            alignItems:
                "center",
        },

        brand: {
            ...typography.title,

            color:
                colors.text,

            letterSpacing:
                -1,
        },

        brandAccent: {
            color:
                colors.primary,
        },

        tagline: {
            ...typography.body,

            marginTop:
                spacing.sm,

            color:
                colors.textSecondary,

            textAlign:
                "center",
        },

        statusContainer: {
            flexDirection:
                "row",

            alignItems:
                "center",

            marginTop:
                spacing.xxl,
        },

        statusDot: {
            width: 8,
            height: 8,

            marginRight:
                spacing.sm,

            borderRadius:
                4,

            backgroundColor:
                colors.success,
        },

        statusText: {
            ...typography.caption,

            color:
                colors.textSecondary,
        },
    });