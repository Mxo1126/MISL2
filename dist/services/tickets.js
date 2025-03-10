export class TicketService {
    constructor() {
        this.apiUrl = 'https://api.misl.com/tickets';
    }
    static getInstance() {
        if (!TicketService.instance) {
            TicketService.instance = new TicketService();
        }
        return TicketService.instance;
    }
    async getAvailableTickets(gameId) {
        try {
            const response = await fetch(`${this.apiUrl}/games/${gameId}`);
            if (!response.ok)
                throw new Error('Failed to fetch tickets');
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching tickets:', error);
            return null;
        }
    }
    async purchaseTickets(gameId, ticketTypeId, quantity, customerInfo) {
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
        }
        catch (error) {
            console.error('Error purchasing tickets:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    async getOrderStatus(orderId) {
        try {
            const response = await fetch(`${this.apiUrl}/orders/${orderId}`);
            if (!response.ok)
                throw new Error('Failed to fetch order status');
            return await response.json();
        }
        catch (error) {
            console.error('Error fetching order status:', error);
            return { status: 'pending' };
        }
    }
}
