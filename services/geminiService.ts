import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem, AiRecommendation, CartItem, GeneralAiRecommendation } from '../types';

const getMenuRecommendations = async (menu: MenuItem[], cart: CartItem[]): Promise<AiRecommendation | null> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        // Return a mock recommendation if API key is not available
        const hasStarter = cart.some(i => i.category === 'Starters');
        const hasMain = cart.some(i => i.category === 'Mains');
        const hasDrink = cart.some(i => i.category === 'Drinks');
        
        return {
            starter: { name: !hasStarter ? menu.find(m => m.category === 'Starters')?.name || 'N/A' : 'Already selected', reasoning: 'This is a classic and popular choice to start your meal.' },
            main: { name: !hasMain ? menu.find(m => m.category === 'Mains')?.name || 'N/A' : 'Already selected', reasoning: 'A hearty and satisfying main course that pairs well with your selection.' },
            drink: { name: !hasDrink ? menu.find(m => m.category === 'Drinks')?.name || 'N/A' : 'Already selected', reasoning: 'This complements the meal perfectly.' },
            overallReasoning: 'This combination offers a balanced and delicious dining experience, building upon your excellent choices!',
        };
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const menuDescription = menu.map(item => `${item.category}: ${item.name} - ${item.description}`).join('\n');
        
        let prompt = '';

        if (cart.length > 0) {
            const cartDescription = cart.map(item => `${item.name} (Quantity: ${item.quantity})`).join(', ');
            prompt = `
                Based on the following menu and the items the user has already selected, please recommend additional items to create a balanced and delicious meal.
                The user's current selections are: ${cartDescription}.

                Suggest a starter, a main course, and a drink that would complement their existing choices. If they already have an item from a category (e.g., a starter), you can either suggest another one that pairs well or focus on completing the other categories. Ensure your recommendations are not items already in the cart.
                Provide a brief reason for each choice and an overall reason for the combination.
                
                Menu:
                ${menuDescription}
            `;
        } else {
            prompt = `
                Based on the following menu, please recommend a balanced and delicious three-course meal (a starter, a main, and a drink).
                Provide a brief reason for each choice and an overall reason for the combination.
                
                Menu:
                ${menuDescription}
            `;
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        starter: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the recommended starter. If a starter is already in the cart, you can note that or suggest a complementary one." },
                                reasoning: { type: Type.STRING, description: "A brief reason for choosing this starter." }
                            }
                        },
                        main: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the recommended main course. If a main is in the cart, suggest a complementary dish or note it." },
                                reasoning: { type: Type.STRING, description: "A brief reason for choosing this main course." }
                            }
                        },
                        drink: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "The name of the recommended drink." },
                                reasoning: { type: Type.STRING, description: "A brief reason for choosing this drink." }
                            }
                        },
                        overallReasoning: {
                            type: Type.STRING,
                            description: "An overall reason why this combination works well together, considering the items already in the cart."
                        }
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        const recommendation: AiRecommendation = JSON.parse(jsonText);
        return recommendation;

    } catch (error) {
        console.error("Error fetching recommendations from Gemini API:", error);
        return null;
    }
};

export const getGeneralRecommendations = async (
    promptType: 'trending' | 'location' | 'offers',
    location: { lat: number; lon: number } | null
): Promise<GeneralAiRecommendation | null> => {
     if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        // Return a mock recommendation if API key is not available
        return {
            suggestions: [
                { title: 'Spicy Taco Fiesta', description: 'A vibrant mix of flavors that is currently the talk of the town!' },
                { title: 'Gourmet Burger Bliss', description: 'Classic comfort food elevated to a new, delicious level.' },
                { title: 'Artisanal Pizza Night', description: 'Hand-crafted pizzas with fresh, local ingredients. A perfect shareable delight.' },
            ]
        };
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const promptTypeMessages = {
            trending: "What's trending in food right now?",
            location: "Meal ideas based on my current location.",
            offers: "Popular food deals and special offers."
        };

        const prompt = `
            You are a food recommendation expert for a restaurant discovery app. A user is looking for suggestions.
            The user's request is: '${promptTypeMessages[promptType]}'.
            ${location ? `The user is near latitude: ${location.lat}, longitude: ${location.lon}. Use this to provide locally relevant suggestions if applicable, but keep them general cuisine/meal types, not specific restaurant names.` : ''}
            Please provide 3 diverse and exciting meal or cuisine suggestions.
            For each suggestion, provide a catchy title and a short, enticing description (max 20 words).
            Keep the tone fun, friendly, and appealing to a foodie.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "The catchy title for the meal/cuisine suggestion." },
                                    description: { type: Type.STRING, description: "A short, enticing description (max 20 words)." }
                                }
                            }
                        }
                    },
                },
            },
        });

        const jsonText = response.text.trim();
        const recommendation: GeneralAiRecommendation = JSON.parse(jsonText);
        return recommendation;

    } catch (error) {
        console.error("Error fetching general recommendations from Gemini API:", error);
        return null;
    }
};


export default getMenuRecommendations;
