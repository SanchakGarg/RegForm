/* eslint-disable @typescript-eslint/no-explicit-any */

export async function post<T>(
    url: string,
    body: Record<string, any>
  ): Promise<{ data: T | null; error: any | null }> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();
  
      if (!response.ok) {
        // Handle error responses
        return { data: null, error: data };
      }
  
      return { data, error: null };
    } catch (error) {
      console.error("Error during POST request:", error);
      return { data: null, error };
    }
  }

  
  export async function get<T>(
  url: string,
  params?: Record<string, any>
): Promise<{ data: T | null; error: any | null }> {
  try {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    const response = await fetch(url + queryString, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle error responses
      return { data: null, error: data };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error during GET request:", error);
    return { data: null, error };
  }
}
