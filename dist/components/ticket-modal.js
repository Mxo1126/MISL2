import { TicketService } from '../services/tickets';
export class TicketModal {
    constructor() {
        this.gameId = '';
        this.selectedTicketType = '';
        this.quantity = 1;
        this.ticketService = TicketService.getInstance();
        this.createModal();
    }
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'ticket-modal';
        this.modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content" role="dialog" aria-labelledby="modal-title">
                <button class="close-btn" aria-label="Close ticket purchase modal">×</button>
                <h2 id="modal-title">Purchase Tickets</h2>
                <div class="ticket-content">
                    <div class="game-info">
                        <h3>Game Information</h3>
                        <div class="game-details"></div>
                    </div>
                    <div class="ticket-selection">
                        <h3>Select Tickets</h3>
                        <div class="ticket-types"></div>
                        <div class="quantity-selector">
                            <label for="ticket-quantity">Quantity:</label>
                            <div class="quantity-controls">
                                <button class="quantity-btn minus" aria-label="Decrease quantity">-</button>
                                <input type="number" id="ticket-quantity" value="1" min="1" max="10">
                                <button class="quantity-btn plus" aria-label="Increase quantity">+</button>
                            </div>
                        </div>
                        <div class="total-price">
                            Total: <span>$0.00</span>
                        </div>
                    </div>
                    <form class="purchase-form" novalidate>
                        <div class="form-group">
                            <label for="customer-name">Full Name</label>
                            <input type="text" id="customer-name" required>
                        </div>
                        <div class="form-group">
                            <label for="customer-email">Email</label>
                            <input type="email" id="customer-email" required>
                        </div>
                        <div class="form-group">
                            <label for="customer-phone">Phone</label>
                            <input type="tel" id="customer-phone" required>
                        </div>
                        <div class="form-group">
                            <label for="payment-method">Payment Method</label>
                            <select id="payment-method" required>
                                <option value="">Select payment method</option>
                                <option value="credit-card">Credit Card</option>
                                <option value="paypal">PayPal</option>
                            </select>
                        </div>
                        <div id="payment-details"></div>
                        <button type="submit" class="btn-purchase" disabled>
                            Purchase Tickets
                        </button>
                    </form>
                </div>
                <div class="confirmation-content" style="display: none">
                    <div class="confirmation-message">
                        <i class="fas fa-check-circle"></i>
                        <h3>Purchase Successful!</h3>
                        <p>Your tickets have been confirmed.</p>
                        <div class="order-details"></div>
                    </div>
                    <button class="btn-close">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(this.modal);
        this.setupEventListeners();
    }
    setupEventListeners() {
        const closeBtn = this.modal.querySelector('.close-btn');
        const overlay = this.modal.querySelector('.modal-overlay');
        const form = this.modal.querySelector('.purchase-form');
        const quantityInput = this.modal.querySelector('#ticket-quantity');
        const minusBtn = this.modal.querySelector('.quantity-btn.minus');
        const plusBtn = this.modal.querySelector('.quantity-btn.plus');
        const paymentMethod = this.modal.querySelector('#payment-method');
        closeBtn?.addEventListener('click', () => this.close());
        overlay?.addEventListener('click', () => this.close());
        form?.addEventListener('submit', (e) => this.handleSubmit(e));
        minusBtn?.addEventListener('click', () => this.updateQuantity(-1));
        plusBtn?.addEventListener('click', () => this.updateQuantity(1));
        quantityInput?.addEventListener('change', (e) => this.handleQuantityChange(e));
        paymentMethod?.addEventListener('change', (e) => this.updatePaymentDetails(e));
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'block') {
                this.close();
            }
        });
    }
    async open(gameId) {
        this.gameId = gameId;
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        const gameTickets = await this.ticketService.getAvailableTickets(gameId);
        if (!gameTickets) {
            this.showError('Failed to load ticket information');
            return;
        }
        this.updateGameInfo(gameTickets);
        this.updateTicketTypes(gameTickets.availableTickets);
    }
    updateGameInfo(game) {
        const gameDetails = this.modal.querySelector('.game-details');
        if (!gameDetails)
            return;
        gameDetails.innerHTML = `
            <p><strong>${game.homeTeam}</strong> vs <strong>${game.awayTeam}</strong></p>
            <p>${game.date} at ${game.time}</p>
            <p>${game.venue}</p>
        `;
    }
    updateTicketTypes(tickets) {
        const ticketTypes = this.modal.querySelector('.ticket-types');
        if (!ticketTypes)
            return;
        ticketTypes.innerHTML = tickets.map(ticket => `
            <div class="ticket-type" data-ticket-id="${ticket.id}">
                <div class="ticket-info">
                    <h4>${ticket.name}</h4>
                    <p>${ticket.description}</p>
                </div>
                <div class="ticket-price">$${ticket.price.toFixed(2)}</div>
                <button class="btn-select ${this.selectedTicketType === ticket.id ? 'selected' : ''}">
                    Select
                </button>
            </div>
        `).join('');
        ticketTypes.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('btn-select')) {
                const ticketType = target.closest('.ticket-type');
                if (!ticketType)
                    return;
                this.selectedTicketType = ticketType.dataset.ticketId || '';
                this.updateSelection();
                this.updateTotal();
            }
        });
    }
    updateSelection() {
        const buttons = this.modal.querySelectorAll('.btn-select');
        buttons.forEach(btn => {
            const ticketType = btn.closest('.ticket-type');
            if (!ticketType)
                return;
            if (ticketType.dataset.ticketId === this.selectedTicketType) {
                btn.classList.add('selected');
            }
            else {
                btn.classList.remove('selected');
            }
        });
        const purchaseBtn = this.modal.querySelector('.btn-purchase');
        if (purchaseBtn) {
            purchaseBtn.disabled = !this.selectedTicketType;
        }
    }
    updateQuantity(change) {
        const input = this.modal.querySelector('#ticket-quantity');
        if (!input)
            return;
        const newValue = Math.max(1, Math.min(10, parseInt(input.value) + change));
        input.value = newValue.toString();
        this.quantity = newValue;
        this.updateTotal();
    }
    handleQuantityChange(e) {
        const input = e.target;
        const value = parseInt(input.value);
        if (isNaN(value) || value < 1) {
            input.value = '1';
            this.quantity = 1;
        }
        else if (value > 10) {
            input.value = '10';
            this.quantity = 10;
        }
        else {
            this.quantity = value;
        }
        this.updateTotal();
    }
    updateTotal() {
        const ticketType = this.modal.querySelector(`.ticket-type[data-ticket-id="${this.selectedTicketType}"]`);
        const totalElement = this.modal.querySelector('.total-price span');
        if (!ticketType || !totalElement)
            return;
        const priceElement = ticketType.querySelector('.ticket-price');
        if (!priceElement)
            return;
        const price = parseFloat(priceElement.textContent?.replace('$', '') || '0');
        const total = (price * this.quantity).toFixed(2);
        totalElement.textContent = `$${total}`;
    }
    updatePaymentDetails(e) {
        const select = e.target;
        const paymentDetails = this.modal.querySelector('#payment-details');
        if (!paymentDetails)
            return;
        switch (select.value) {
            case 'credit-card':
                paymentDetails.innerHTML = `
                    <div class="form-group">
                        <label for="card-number">Card Number</label>
                        <input type="text" id="card-number" required pattern="[0-9]{16}">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="expiry-date">Expiry Date</label>
                            <input type="text" id="expiry-date" required pattern="[0-9]{2}/[0-9]{2}">
                        </div>
                        <div class="form-group">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" required pattern="[0-9]{3,4}">
                        </div>
                    </div>
                `;
                break;
            case 'paypal':
                paymentDetails.innerHTML = `
                    <div class="paypal-button">
                        <button type="button" class="btn-paypal">
                            <i class="fab fa-paypal"></i> Pay with PayPal
                        </button>
                    </div>
                `;
                break;
            default:
                paymentDetails.innerHTML = '';
        }
    }
    async handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        const formData = new FormData(form);
        const customerInfo = {
            name: formData.get('customer-name'),
            email: formData.get('customer-email'),
            phone: formData.get('customer-phone'),
            paymentMethod: formData.get('payment-method'),
            paymentDetails: this.getPaymentDetails(formData),
        };
        const purchaseBtn = form.querySelector('.btn-purchase');
        if (purchaseBtn) {
            purchaseBtn.textContent = 'Processing...';
            purchaseBtn.disabled = true;
        }
        const result = await this.ticketService.purchaseTickets(this.gameId, this.selectedTicketType, this.quantity, customerInfo);
        if (result.success) {
            this.showConfirmation(result.orderId);
        }
        else {
            this.showError(result.error || 'Failed to purchase tickets');
            if (purchaseBtn) {
                purchaseBtn.textContent = 'Purchase Tickets';
                purchaseBtn.disabled = false;
            }
        }
    }
    getPaymentDetails(formData) {
        const paymentMethod = formData.get('payment-method');
        if (paymentMethod === 'credit-card') {
            return {
                cardNumber: formData.get('card-number'),
                expiryDate: formData.get('expiry-date'),
                cvv: formData.get('cvv'),
            };
        }
        return {};
    }
    showConfirmation(orderId) {
        const ticketContent = this.modal.querySelector('.ticket-content');
        const confirmationContent = this.modal.querySelector('.confirmation-content');
        const orderDetails = this.modal.querySelector('.order-details');
        if (ticketContent && confirmationContent && orderDetails) {
            ticketContent.style.display = 'none';
            confirmationContent.style.display = 'block';
            if (orderId) {
                orderDetails.innerHTML = `
                    <p>Order ID: ${orderId}</p>
                    <p>Your tickets will be emailed to you shortly.</p>
                `;
            }
        }
    }
    showError(message) {
        // Implement error display logic
        console.error(message);
    }
    close() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        // Reset the form
        const form = this.modal.querySelector('form');
        if (form)
            form.reset();
        // Reset the confirmation view
        const ticketContent = this.modal.querySelector('.ticket-content');
        const confirmationContent = this.modal.querySelector('.confirmation-content');
        if (ticketContent && confirmationContent) {
            ticketContent.style.display = 'block';
            confirmationContent.style.display = 'none';
        }
        this.selectedTicketType = '';
        this.quantity = 1;
        this.updateSelection();
        this.updateTotal();
    }
}
