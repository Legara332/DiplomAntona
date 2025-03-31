import { supabase, saveOrder } from './supabase.js'
window.toggleNestedImages = function(containerId) {
    const container = document.getElementById(`container-${containerId}`);
    container.style.display = container.style.display === "none" ? "flex" : "none";
};
window.openFullImage = function(event) {
    event.stopPropagation();
    const imageUrl = event.target.closest('.image').dataset.fullImage;
    openModal(imageUrl);
};
let updateCartDisplay;
document.addEventListener("DOMContentLoaded", function () {
    const cartIcon = document.getElementById("cart-icon");
    const cartModal = document.getElementById("cart-modal");
    const closeCart = document.getElementById("close-cart");
    const cartItemsContainer = document.querySelector("#cart-items");
    const cartCountElement = document.getElementById("cart-count");
document.querySelectorAll('.quantity-controls button').forEach(button => {
    button.addEventListener('click', function(e) {
        e.stopPropagation();
        const productId = this.getAttribute('data-product-id');
        const input = this.parentElement.querySelector('.product-quantity');
        if (this.classList.contains('increase-qty')) {
            input.value = parseInt(input.value) + 1;
        } else if (this.classList.contains('decrease-qty')) {
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
            }
        }
    });
});
    function updateCartDisplay() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        cartItemsContainer.innerHTML = "";
        let total = 0;
        let totalItems = 0;
        cart.forEach(item => {
            total += item.price * item.quantity;
            totalItems += item.quantity;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.name}</td>
                <td>₽${item.price}</td>
                <td>
                    <button class="decrease-qty" data-id="${item.id}">−</button>
                    <span class="item-qty">${item.quantity}</span>
                    <button class="increase-qty" data-id="${item.id}">+</button>
                </td>
                <td>₽${(item.price * item.quantity).toFixed(2)}</td>
                <td><button class="remove-item" data-id="${item.id}">Удалить</button></td>
            `;
            cartItemsContainer.appendChild(row);
        });
        cartCountElement.textContent = totalItems;
        attachEventListeners();
    }
    window.updateCartDisplay = updateCartDisplay;
    window.showImages = function(containerId) {
        const container = document.getElementById(`container-${containerId}`);
        if (container.style.display === "none") {
            container.style.display = "block";
        } else {
            container.style.display = "none";
        }
    };
    window.openModal = function(imageSrc, description = '') {
        const modal = document.getElementById("modal");
        const modalImg = document.getElementById("modal-img");
        const modalDesc = document.getElementById("modal-description");
    
        modalImg.src = imageSrc;
        modalDesc.innerHTML = description || getImageDescription(imageSrc);
        modal.style.display = "flex";
    };
    window.openModal = function(imageElement) {
        const modal = document.getElementById("modal");
        const modalImg = document.getElementById("modal-img");
        const modalDesc = document.getElementById("modal-description");
        const description = imageElement.getAttribute("data-description");
        
        modalImg.src = imageElement.src;
        modalDesc.textContent = description;
        modal.style.display = "flex";
    };
    window.closeModal = function() {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
    };
    if (!cartItemsContainer) {
        return;
    }
    if (cartIcon) {
        cartIcon.addEventListener("click", () => {
            cartModal.classList.add("show");
            window.updateCartDisplay();
        });
    }
    if (closeCart) {
        closeCart.addEventListener("click", () => {
            cartModal.classList.remove("show");
        });
    }
    window.attachEventListeners = function() {
        document.querySelectorAll(".increase-qty").forEach(button => {
            button.addEventListener("click", function () {
                const productId = this.getAttribute("data-id");
                window.changeProductQuantity(productId, 1);
            });
        });
        document.querySelectorAll(".decrease-qty").forEach(button => {
            button.addEventListener("click", function () {
                const productId = this.getAttribute("data-id");
                window.changeProductQuantity(productId, -1);
            });
        });
        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", function () {
                const productId = this.getAttribute("data-id");
                removeProductFromCart(productId);
            });
        });
    }
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function () {
            const productId = this.getAttribute("data-product-id");
            const productName = this.getAttribute("data-product-name");
            const productPrice = this.getAttribute("data-product-price");
            addProductToCart(productId, productName, parseFloat(productPrice));
        });
    });
    window.addProductToCart = function (productId, productName, productPrice) {
        const quantityInput = document.querySelector(`.product-quantity[data-product-id="${productId}"]`);
        const quantity = parseInt(quantityInput.value) || 1;
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingProductIndex = cart.findIndex(item => item.id === productId);
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += quantity;
        } else {
            cart.push({ 
                id: productId, 
                name: productName, 
                price: productPrice, 
                quantity: quantity
            });
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        window.updateCartDisplay();
        showNotification('Товар добавлен в корзину', 'success');
    }
    window.changeProductQuantity = function (productId, amount) { 
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const productIndex = cart.findIndex(item => item.id === productId);
        if (productIndex !== -1) {
            const newQuantity = cart[productIndex].quantity + amount;
            if (newQuantity > 0) {
                cart[productIndex].quantity = newQuantity;
                localStorage.setItem("cart", JSON.stringify(cart));
                updateCartDisplay();
            }
        }
    }
    window.updateCartDisplay();
    window.removeProductFromCart = function (productId) { 
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const productToRemove = cart.find(item => item.id === productId);
        if (productToRemove) {
            const updatedCart = cart.filter(item => item.id !== productId);
            localStorage.setItem("cart", JSON.stringify(updatedCart));
            updateCartDisplay();
            updateCartCount();
            showNotification(`Товар "${productToRemove.name}" удален из корзины`, 'success');
        }
    }
    window.updateCartDisplay();
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }
    updateCartCount();
    updateCartDisplay();
});
document.getElementById('checkout-btn')?.addEventListener('click', async function() {
    if (typeof window.updateCartDisplay !== 'function') {
        console.error('Функция updateCartDisplay не определена!');
        return;
    }
    const btn = this;
    const originalText = btn.innerHTML;
    const fullName = document.getElementById('full-name').value;
    const phone = document.getElementById('phone-number').value;
    if (!fullName || !phone) {
        showNotification('Заполните все поля!', 'error');
        return;
    }
    btn.innerHTML = '<div class="loader"></div>';
    btn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 2000));
    btn.innerHTML = '<div class="checkmark">✓</div>';
    showNotification('Заказ оформлен!', 'success');
    localStorage.removeItem('cart');
    window.updateCartDisplay();
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
        document.getElementById('cart-modal').classList.remove('show');
    }, 1500);
    try {
        const cart = JSON.parse(localStorage.getItem("cart")) || []
        const orderData = {
            customer_name: fullName,
            customer_phone: phone,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            items: cart,
            status: 'new'
        }
        await saveOrder(orderData)
        localStorage.removeItem('cart')
        showNotification('Заказ оформлен!', 'success')
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error)
        showNotification('Ошибка при оформлении!', 'error')
    }
});
function showNotification(text, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) {
        console.error('Контейнер для уведомлений не найден!');
        return;
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = text;
    container.appendChild(notification);
    setTimeout(() => notification.classList.add('hide'), 3000);
    setTimeout(() => notification.remove(), 3500);
}
window.openModalFromContainer = function(container) {
    const imageUrl = container.querySelector('.image').dataset.fullImage;
    openModal(imageUrl);
};
window.openFullImage = function(event) {
    event.stopPropagation();
    const imageUrl = event.target.closest('.image').dataset.fullImage;
    openModal(imageUrl);
};
window.toggleNestedImages = function(containerId) {
    const container = document.getElementById(`container-${containerId}`);
    container.style.display = container.style.display === "none" ? "flex" : "none";
};