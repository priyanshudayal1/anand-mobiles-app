import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Keyboard, Platform, Alert } from "react-native";
import { Image } from "expo-image";
import { Search, X, TrendingUp, Mic } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../store/useTheme";
import { useSiteConfig } from "../../store/useSiteConfig";
// expo-av is deprecated in SDK 54, using expo-audio instead
import { useAudioRecorder, AudioModule, RecordingPreset } from 'expo-audio';

export default function SearchBar({ placeholder = 'Search "Mobile"', autoFocus = false, onFocus, style }) {
    const { colors, mode } = useTheme();
    const router = useRouter();
    const { logoUrl } = useSiteConfig();

    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // Voice Search State
    const [isRecording, setIsRecording] = useState(false);
    
    // Using expo-audio hook
    // Using expo-audio hook with default quality
    const audioRecorder = useAudioRecorder({
        sampleRate: 44100,
        bitRate: 128000,
        channels: 2,
    });

    const debounceTimer = useRef(null);

    // Debounced Search Suggestions
    const fetchSuggestions = async (text) => {
        if (!text || text.trim().length < 2) {
            setSuggestions([]);
            return;
        }

        try {
            const response = await fetch(
                `https://suggestqueries.google.com/complete/search?client=firefox&ds=sh&q=${encodeURIComponent(text)}`
            );
            const data = await response.json();
            if (Array.isArray(data) && data[1]) {
                setSuggestions(data[1]);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    const handleSearchChange = (text) => {
        setSearchQuery(text);
        if (text.length > 0) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            fetchSuggestions(text);
        }, 300);
    };

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            setShowSuggestions(false);
            Keyboard.dismiss();
            router.push({
                pathname: "/products",
                params: { search: searchQuery.trim() },
            });
        }
    };

    const handleSuggestionPress = (suggestion) => {
        setSearchQuery(suggestion);
        setShowSuggestions(false);
        Keyboard.dismiss();
        router.push({
            pathname: "/products",
            params: { search: suggestion },
        });
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSuggestions([]);
        setShowSuggestions(false);
        Keyboard.dismiss();
    };

    const handleVoicePress = async () => {
        try {
            if (isRecording) {
                stopRecording();
                return;
            }

            if (Platform.OS === 'web') {
                 console.log("Voice search not supported on web yet");
                 return;
            }
            
            // Request permissions using AudioModule
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert('Permission Denied', 'Permission to access microphone is required for voice search!');
                return;
            }

            await startRecording();
        } catch (err) {
            console.error('Failed to handle voice press', err);
        }
    };

    const startRecording = async () => {
        try {
            // Start recording
            console.log('Starting recording..');
            audioRecorder.record();
            setIsRecording(true);

            // Simulate voice recognition delay then mock result
            // In a real app, you would send the audio file from audioRecorder.uri to an API
            setTimeout(() => {
                stopRecording(true);
            }, 3000);

        } catch (err) {
            console.error('Failed to start recording', err);
            setIsRecording(false);
        }
    };

    const stopRecording = async (mockResult = false) => {
        console.log('Stopping recording..');
        setIsRecording(false);

        if (audioRecorder.isRecording) {
            try {
                await audioRecorder.stop();
            } catch (error) {
                // Ignore errors on stop if any
            }
        }

        if (mockResult) {
            // Mock result for demonstration
            const mockTexts = ["Samsung", "iPhone", "Headphones", "Cover"];
            const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
            setSearchQuery(randomText);
            
            // Auto-submit after small delay to show the text
            setTimeout(() => {
                 router.push({
                    pathname: "/products",
                    params: { search: randomText },
                });
            }, 500);
        }
    };

    return (
        <View style={[{ zIndex: 100 }, style]}>
             {/* Voice Recording Overlay */}
            {isRecording && (
                <View style={{
                    position: 'absolute',
                    top: 0, bottom: -500, left: 0, right: 0, // Extend bottom to cover suggestive dropdown/screen
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    alignItems: 'center',
                    paddingTop: 100, // Push it down a bit
                }}>
                    <View style={{
                        backgroundColor: mode === 'dark' ? colors.surface : '#fff',
                        padding: 24,
                        borderRadius: 16,
                        alignItems: 'center',
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                        width: 200,
                    }}>
                        <View style={{
                            width: 64, height: 64,
                            borderRadius: 32,
                            backgroundColor: colors.primary + '20',
                            justifyContent: 'center', alignItems: 'center',
                            marginBottom: 16
                        }}>
                            <Mic size={32} color={colors.primary} />
                        </View>
                        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 }}>Listening...</Text>
                        <Text style={{ fontSize: 12, color: colors.textSecondary }}>Speak now</Text>

                        <TouchableOpacity
                            onPress={() => stopRecording(false)}
                            style={{ marginTop: 20, padding: 8 }}
                        >
                            <Text style={{ color: colors.error, fontWeight: '500' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View
                style={{
                    borderRadius: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 12,
                    height: 48,
                    backgroundColor: mode === 'dark' ? colors.surfaceSecondary : '#f3f4f6',
                    borderWidth: 1,
                    borderColor: mode === 'dark' ? colors.border : '#e5e7eb',
                    // Remove bottom corners if suggestions are shown
                    borderBottomLeftRadius: showSuggestions && suggestions.length > 0 ? 0 : 12,
                    borderBottomRightRadius: showSuggestions && suggestions.length > 0 ? 0 : 12,
                }}
            >
                {/* Logo at the start (as per request) */}
                {logoUrl ? (
                    <Image
                        source={{ uri: logoUrl }}
                        style={{ width: 24, height: 24, marginRight: 8 }}
                        contentFit="contain"
                    />
                ) : (
                    // Fallback icon if no logo
                    <Search size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                )}

                <TextInput
                    style={{
                        flex: 1,
                        fontSize: 14,
                        color: colors.text,
                        height: '100%',
                        paddingVertical: 0,
                    }}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={handleSearchChange}
                    onSubmitEditing={handleSearchSubmit}
                    returnKeyType="search"
                    autoFocus={autoFocus}
                    onFocus={() => {
                        if (onFocus) onFocus();
                        if (searchQuery.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => {
                        // Small delay to allow clicking on suggestions
                        setTimeout(() => setShowSuggestions(false), 200);
                    }}
                />

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={clearSearch}>
                            <X size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}

                    {/* Voice Option */}
                    <TouchableOpacity onPress={handleVoicePress}>
                        <Mic size={20} color={colors.primary} />
                    </TouchableOpacity>

                    {/* Search Icon at the end as well (standard) or just keep mic? 
               User image showed Update: "Logo Search 'Jeans' SearchIcon".
               So adding Search Icon at the end too.
            */}
                    {logoUrl && ( // Only show search icon at end if logo is at start, to avoid double search icons clutter
                        <TouchableOpacity onPress={handleSearchSubmit}>
                            <Search size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <View
                    style={{
                        position: 'absolute',
                        top: 48,
                        left: 0,
                        right: 0,
                        backgroundColor: mode === 'dark' ? colors.surfaceSecondary : '#fff',
                        borderBottomLeftRadius: 12,
                        borderBottomRightRadius: 12,
                        borderWidth: 1,
                        borderTopWidth: 0,
                        borderColor: mode === 'dark' ? colors.border : '#e5e7eb',
                        elevation: 5,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        zIndex: 1000,
                        maxHeight: 300,
                    }}
                >
                    <View style={{ maxHeight: 300 }}>
                        {suggestions.map((item, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleSuggestionPress(item)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderBottomWidth: index === suggestions.length - 1 ? 0 : 1,
                                    borderBottomColor: mode === 'dark' ? colors.border : '#f3f4f6',
                                }}
                            >
                                <TrendingUp size={16} color={colors.textSecondary} style={{ marginRight: 12 }} />
                                <Text style={{ color: colors.text, fontSize: 14 }}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
}
