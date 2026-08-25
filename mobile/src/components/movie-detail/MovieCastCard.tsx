import {
    Image,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import type {
    TmdbCastMember,
} from "../../types/tmdb";

import {
    colors,
} from "../../theme/colors";

import {
    radius,
} from "../../theme/radius";

import {
    spacing,
} from "../../theme/spacing";

import {
    typography,
} from "../../theme/typography";


const PROFILE_BASE_URL =
    "https://image.tmdb.org/t/p/w185";


type MovieCastCardProps = {
    person: TmdbCastMember;
};


export default function MovieCastCard({
    person,
}: MovieCastCardProps) {
    return (
        <View
            style={
                styles.castCard
            }
        >
            {person.profile_path ? (
                <Image
                    source={{
                        uri:
                            PROFILE_BASE_URL +
                            person.profile_path,
                    }}
                    style={
                        styles.castImage
                    }
                    resizeMode="cover"
                />
            ) : (
                <View
                    style={
                        styles.castImageFallback
                    }
                >
                    <Ionicons
                        name="person-outline"
                        size={
                            30
                        }
                        color={
                            colors.textMuted
                        }
                    />
                </View>
            )}

            <Text
                style={
                    styles.castName
                }
                numberOfLines={
                    2
                }
            >
                {
                    person.name
                }
            </Text>

            <Text
                style={
                    styles.castCharacter
                }
                numberOfLines={
                    2
                }
            >
                {
                    person.character ||
                    "—"
                }
            </Text>
        </View>
    );
}


const styles =
    StyleSheet.create({
        castCard: {
            width: 108,
        },

        castImage: {
            width: 108,

            height: 145,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        castImageFallback: {
            width: 108,

            height: 145,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderWidth: 1,

            borderColor:
                colors.border,

            borderRadius:
                radius.lg,

            backgroundColor:
                colors.surface,
        },

        castName: {
            ...typography.caption,

            marginTop:
                spacing.sm,

            color:
                colors.text,

            fontWeight:
                "700",
        },

        castCharacter: {
            fontSize: 12,

            lineHeight: 16,

            marginTop:
                spacing.xs,

            color:
                colors.textSecondary,
        },
    });