import axios from "axios";
const baseURL = process.env.NODE_ENV === 'production'
    ? "https://formatconvertorbackend-shashank-pants-projects.vercel.app"
    : "http://localhost:5000";

const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function fetchCredentials() {
    try {
        const response = await axiosInstance.get("/auth/fetchAuth");
        // console.log("fetc",response.data)
        return response.data;
    } catch (error) {
        console.error("Error fetching credentials:", error);
        return null;
    }
}

export const loginUser = async () => {
    try {
        console.log("reached login")
        const response = await axiosInstance.get("/auth/google");
        console.log("response", response)
        if (response.status === 200) {
            const data = response.data;
            return data;
        } else {
            throw new Error("Authentication failed");
        }
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};

export async function UpdateUserCount() {
    try {
        const response = await axiosInstance.post("/auth/updateCount");
        console.log("updated",response.data)
        return response.data;
    } catch (error) {
        console.error("Error fetching credentials:", error);
        return null;
    }
}