interface TicketType {
    id: string;
    name: string;
    price: number;
    description: string;
}

interface GameTicket {
    gameId: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    time: string;
    venue: string;
    availableTickets: TicketType[];
}

export class TicketService {
    private static instance: TicketService;
    private apiUrl = 'https://api.misl.com/tickets';

    private constructor() {}

    public static getInstance(): TicketService {
        if (!TicketService.instance) {
            TicketService.instance = new TicketService();
        }
        return TicketService.instance;
    }

    public async getAvailableTickets(gameId: string): Promise<GameTicket | null> {
        try {
            const response = await fetch(`${this.apiUrl}/games/${gameId}`);
            if (!response.ok) throw new Error('Failed to fetch tickets');
            return await response.json();
        } catch (error) {
            console.error('Error fetching tickets:', error);
            return null;
        }
    }

    public async purchaseTickets(
        gameId: string,
        ticketTypeId: string,
        quantity: number,
        customerInfo: {
            name: string;
            email: string;
            phone: string;
            paymentMethod: string;
            paymentDetails: any;
        }
    ): Promise<{ success: boolean; orderId?: string; error?: string }> {
        try {
            const response = await fetch(`${this.apiUrl}/purchase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gameId,
                    ticketTypeId,
                    quantity,
                    customerInfo,
                }),
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to purchase tickets');
            }

            return {
                success: true,
                orderId: result.orderId,
            };
        } catch (error) {
            console.error('Error purchasing tickets:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }

    public async getOrderStatus(orderId: string): Promise<{
        status: 'pending' | 'confirmed' | 'cancelled';
        tickets?: {
            ticketId: string;
            seatInfo: string;
            qrCode: string;
        }[];
    }> {
        try {
            const response = await fetch(`${this.apiUrl}/orders/${orderId}`);
            if (!response.ok) throw new Error('Failed to fetch order status');
            return await response.json();
        } catch (error) {
            console.error('Error fetching order status:', error);
            return { status: 'pending' };
        }
    }
}
