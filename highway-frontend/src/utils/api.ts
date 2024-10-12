const API_BASE_URL = "https://f5ca-4-39-199-2.ngrok-free.app";

export async function callCustomer(phoneNumber: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/call-customer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to: phoneNumber }),
    });

    if (!response.ok) {
      throw new Error("Failed to initiate call");
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      const stream = new ReadableStream({
        start(controller) {
          function push() {
            if (!reader) return;
            reader.read().then(({ done, value }) => {
              if (done) {
                controller.close();
                return;
              }
              const chunk = decoder.decode(value, { stream: true });
              console.log("Stream chunk:", chunk);
              controller.enqueue(value);
              push();
            });
          }
          push();
        },
      });

      const responseStream = new Response(stream);
      await responseStream.text();
    }
  } catch (error) {
    console.error("Error initiating call:", error);
    throw error;
  }
}
