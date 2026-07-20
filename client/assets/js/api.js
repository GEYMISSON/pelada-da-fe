async function api(url, options = {}) {

    const response = await fetch(CONFIG.API_URL + url, {

        headers: {

            "Content-Type": "application/json"

        },

        ...options

    });

    if (!response.ok) {

        throw new Error("Erro ao comunicar com o servidor.");

    }

    return response.json();

}