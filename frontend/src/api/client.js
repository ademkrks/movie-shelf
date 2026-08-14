const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5000";


const getStoredToken = () => {
    return localStorage.getItem(
        "movieshelf_token"
    );
};


const apiRequest = async (
    endpoint,
    options = {}
) => {
    const token = getStoredToken();


    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };


    if (token) {
        headers.Authorization =
            `Bearer ${token}`;
    }


    const response = await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
            ...options,
            headers,
        }
    );


    let body;

    try {
        body = await response.json();
    } catch {
        body = null;
    }


    if (!response.ok) {
        const error =
            new Error(
                body?.message ||
                "Bir hata oluştu."
            );


        error.status =
            response.status;

        error.errors =
            body?.errors || [];


        throw error;
    }


    return body;
};


export {
    API_BASE_URL,
    apiRequest,
};