/**
 * API Client for Feedback Portal (Serverless Firestore Version)
 */

import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    setDoc
} from "firebase/firestore";
import { db } from "./firebase.js";
import { v4 as uuidv4 } from 'uuid';
import { analyzeFeedback } from "./nlp.js";

const COLLECTION_NAME = "feedback";

export const feedbackAPI = {
    getAll: async (filters = {}) => {
        try {
            const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
            const snapshot = await getDocs(q);
            let feedback = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (filters.sentiment) feedback = feedback.filter(f => f.sentiment === filters.sentiment);
            if (filters.status) feedback = feedback.filter(f => f.status === filters.status);
            if (filters.priority) feedback = feedback.filter(f => f.priority === filters.priority);
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                feedback = feedback.filter(f =>
                    (f.feedback || "").toLowerCase().includes(searchLower) ||
                    (f.name || "").toLowerCase().includes(searchLower)
                );
            }
            return { data: { success: true, data: feedback, count: feedback.length } };
        } catch (error) {
            console.error("Error fetching feedback:", error);
            throw error;
        }
    },

    getById: async (id) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);
        return { data: { success: true, data: docSnap.data() } };
    },

    create: async (feedbackData) => {
        try {
            console.log('Starting feedback creation with data:', feedbackData);
            
            // Test Firebase connection first
            const testDoc = doc(db, COLLECTION_NAME, 'test-connection');
            console.log('Firebase DB reference created:', testDoc);
            
            // Get existing feedback for repeat analysis
            console.log('Fetching existing feedback...');
            const existingSnapshot = await getDocs(query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc")));
            const existingFeedback = existingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log('Existing feedback count:', existingFeedback.length);

            const id = uuidv4();
            console.log('Generated ID:', id);
            
            // Analyze feedback
            console.log('Analyzing feedback...');
            const analysis = analyzeFeedback({ feedback: feedbackData.feedback }, existingFeedback);
            console.log('Analysis result:', analysis);
            
            const completeData = {
                ...feedbackData,
                id,
                status: 'New',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...analysis
            };
            
            console.log('Complete data to save:', completeData);
            
            // Save to Firestore
            const docRef = doc(db, COLLECTION_NAME, id);
            console.log('Document reference:', docRef);
            
            await setDoc(docRef, completeData);
            console.log('Document saved successfully');
            
            return { data: { success: true, data: completeData, message: 'Feedback submitted successfully' } };
        } catch (error) {
            console.error("Error creating feedback:", error);
            console.error("Error code:", error.code);
            console.error("Error message:", error.message);
            console.error("Full error:", error);
            
            // Return more detailed error information
            return { 
                data: { 
                    success: false, 
                    error: error.message || 'Unknown error occurred',
                    code: error.code || 'UNKNOWN',
                    details: error.toString()
                } 
            };
        }
    },

    update: async (id, updates) => {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { ...updates, updatedAt: new Date().toISOString() });
        return { data: { success: true, message: 'Updated' } };
    },

    delete: async (id) => {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        return { data: { success: true, message: 'Deleted' } };
    }
};

export const analyticsAPI = {
    getSummary: async () => {
        try {
            const snapshot = await getDocs(collection(db, COLLECTION_NAME));
            const allFeedback = snapshot.docs.map(doc => doc.data());

            const sentimentDist = { positive: 0, neutral: 0, negative: 0 };
            const priorityDist = { 'High Impact': 0, 'Medium Impact': 0, 'Low Impact': 0 };
            const statusDist = { New: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
            const toneDist = { Constructive: 0, Appreciative: 0, Critical: 0, Inquisitive: 0, Neutral: 0 };
            const issueTypeDist = {};
            const keywordFreq = {};

            allFeedback.forEach(f => {
                if (f.sentiment) sentimentDist[f.sentiment]++;
                if (f.priority) priorityDist[f.priority]++;
                if (f.status) statusDist[f.status]++;
                if (f.tone) toneDist[f.tone] = (toneDist[f.tone] || 0) + 1;
                if (f.issueType) issueTypeDist[f.issueType] = (issueTypeDist[f.issueType] || 0) + 1;
                
                // Process keywords
                if (f.keywords && Array.isArray(f.keywords)) {
                    f.keywords.forEach(kw => {
                        const word = kw.word || kw;
                        keywordFreq[word] = (keywordFreq[word] || 0) + (kw.count || 1);
                    });
                }
            });

            const avgRating = allFeedback.length > 0 ? (allFeedback.reduce((s, f) => s + (f.rating || 0), 0) / allFeedback.length).toFixed(2) : 0;

            const topKeywords = Object.entries(keywordFreq)
                .map(([word, count]) => ({ word, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 20);

            return {
                data: {
                    success: true, 
                    data: {
                        total: allFeedback.length,
                        averageRating: parseFloat(avgRating),
                        sentimentDistribution: sentimentDist,
                        priorityDistribution: priorityDist,
                        statusDistribution: statusDist,
                        toneDistribution: toneDist,
                        issueTypeDistribution: issueTypeDist,
                        topKeywords
                    }
                }
            };
        } catch (error) {
            console.error("Error getting analytics:", error);
            return { data: { success: false, error: error.message } };
        }
    },

    getTrends: async (days = 30) => {
        try {
            const snapshot = await getDocs(collection(db, COLLECTION_NAME));
            const allFeedback = snapshot.docs.map(doc => doc.data());
            
            const now = new Date();
            const trends = [];

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                const dayFeedback = allFeedback.filter(f => {
                    const feedbackDate = new Date(f.createdAt).toISOString().split('T')[0];
                    return feedbackDate === dateStr;
                });

                const sentiments = { positive: 0, neutral: 0, negative: 0 };
                dayFeedback.forEach(f => {
                    if (f.sentiment) sentiments[f.sentiment]++;
                });

                trends.push({
                    date: dateStr,
                    total: dayFeedback.length,
                    ...sentiments
                });
            }

            return {
                data: {
                    success: true, 
                    data: trends
                }
            };
        } catch (error) {
            console.error("Error getting trends:", error);
            return { data: { success: false, error: error.message } };
        }
    }
};

export default feedbackAPI;
