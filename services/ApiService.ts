class ApiService {
  async Get<T>(url: string): Promise<T> {
    const response = await fetch(url);

    return response.json() as Promise<T>;
  }

  async Post<TRequest, TResponse>(
    url: string,
    data: TRequest,
  ): Promise<TResponse> {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json() as Promise<TResponse>;
  }

  async Put<TRequest, TResponse>(
    url: string,
    data: TRequest,
  ): Promise<TResponse> {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json() as Promise<TResponse>;
  }

  async Delete<TRequest, TResponse>(
    url: string,
    data: TRequest,
  ): Promise<TResponse> {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return response.json() as Promise<TResponse>;
  }
}

const apiService = new ApiService();

export default apiService;
