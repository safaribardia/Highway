const API_BASE_URL = 'https://c8d2-4-39-199-2.ngrok-free.app';

export async function callCustomer(phoneNumber: string): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/call-customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to: phoneNumber }),
        });

        if (!response.ok) {
            throw new Error('Failed to initiate call');
        }

        const data = await response.json();
        console.log('Call initiated:', data);
    } catch (error) {
        console.error('Error initiating call:', error);
        throw error;
    }
}
