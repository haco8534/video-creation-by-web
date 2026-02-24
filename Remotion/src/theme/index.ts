
export interface ColorTheme {
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: {
            main: string;
            sub: string;
            inverse: string;
        };
        speakers: {
            zundamon: string;
            metan: string;
        }
    };
}

export const THEMES: Record<string, ColorTheme> = {
    cleanBlue: {
        name: "Clean Blue",
        colors: {
            primary: "#3B82F6", // Blue 500
            secondary: "#60A5FA", // Blue 400
            accent: "#F59E0B", // Amber 500
            background: "#F9FAFB", // Gray 50
            surface: "#FFFFFF",
            text: {
                main: "#1F2937", // Gray 800
                sub: "#6B7280", // Gray 500
                inverse: "#FFFFFF",
            },
            speakers: {
                zundamon: "#059669", // Emerald 600
                metan: "#DB2777", // Pink 600
            }
        }
    },
    softWarm: {
        name: "Soft Warm",
        colors: {
            primary: "#FB923C", // Orange 400
            secondary: "#FDBA74", // Orange 300
            accent: "#10B981", // Emerald 500
            background: "#FFF7ED", // Orange 50
            surface: "#FFFFFF",
            text: {
                main: "#431407", // Brown 900
                sub: "#9A3412", // Orange 800
                inverse: "#FFFFFF",
            },
            speakers: {
                zundamon: "#15803D", // Green 700
                metan: "#BE185D", // Pink 700
            }
        }
    },
    techLight: {
        name: "Tech Light",
        colors: {
            primary: "#6366F1", // Indigo 500
            secondary: "#A855F7", // Purple 500
            accent: "#06B6D4", // Cyan 500
            background: "#F8FAFC", // Slate 50
            surface: "#FFFFFF",
            text: {
                main: "#0F172A", // Slate 900
                sub: "#475569", // Slate 600
                inverse: "#FFFFFF",
            },
            speakers: {
                zundamon: "#0D9488", // Teal 600
                metan: "#D946EF", // Fuchsia 500
            }
        }
    }
};

// Default theme to use if none specified
export const defaultTheme = THEMES.cleanBlue;
