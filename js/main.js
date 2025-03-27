import { supabase, saveOrder } from './supabase.js'
// Добавьте эти строки в начало main.js (после импортов)
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
        attachEventListeners();  // Привязываем обработчики для новых кнопок
    }
    window.updateCartDisplay = updateCartDisplay;

    window.showImages = function(containerId) {
        const container = document.getElementById(`container-${containerId}`); // Используем шаблонные строки
        if (container.style.display === "none") {
            container.style.display = "block";
        } else {
            container.style.display = "none";
        }
    };

    window.openModal = function(imageSrc) {
        const modal = document.getElementById("modal");
        const modalImg = document.getElementById("modal-img");

        modalImg.src = imageSrc;
        modal.style.display = "flex";  // Показываем модальное окно
    };

    // Закрытие модального окна
    window.closeModal = function() {
        const modal = document.getElementById("modal");
        modal.style.display = "none";  // Скрыть модальное окно
    };
    
    // Проверка существования cartItemsContainer перед использованием
    if (!cartItemsContainer) {
        return;
    }

    // Открытие корзины
    if (cartIcon) {
        cartIcon.addEventListener("click", () => {
            cartModal.classList.add("show");
            window.updateCartDisplay(); // Добавить window
        });
    }

    // Закрытие корзины
    if (closeCart) {
        closeCart.addEventListener("click", () => {
            cartModal.classList.remove("show");
        });
    }
    // Привязка обработчиков для кнопок изменения количества и удаления товара
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
                removeProductFromCart(productId);  // Удаляем товар из корзины
            });
        });
    }

    // Инициализация кнопок "Добавить в корзину"
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", function () {
            const productId = this.getAttribute("data-product-id");
            const productName = this.getAttribute("data-product-name");
            const productPrice = this.getAttribute("data-product-price");

            // Добавление товара в корзину
            addProductToCart(productId, productName, parseFloat(productPrice));
        });
    });

    // Функция добавления товара в корзину
    window.addProductToCart = function (productId, productName, productPrice) {
        const quantityInput = document.querySelector(`.product-quantity[data-product-id="${productId}"]`);
        const quantity = parseInt(quantityInput.value) || 1; // Получаем значение из поля
    
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existingProductIndex = cart.findIndex(item => item.id === productId);
    
        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += quantity; // Увеличиваем на указанное количество
        } else {
            cart.push({ 
                id: productId, 
                name: productName, 
                price: productPrice, 
                quantity: quantity // Используем значение из поля
            });
        }
    
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        window.updateCartDisplay(); // Добавьте window.
    }
    // Функция изменения количества товара в корзине
    window.changeProductQuantity = function (productId, amount) { 
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const productIndex = cart.findIndex(item => item.id === productId);

        if (productIndex !== -1) {
            const newQuantity = cart[productIndex].quantity + amount;
            if (newQuantity > 0) {
                cart[productIndex].quantity = newQuantity;
                localStorage.setItem("cart", JSON.stringify(cart));  // Обновляем localStorage
                updateCartDisplay();  // Обновляем корзину
            }
        }
    }
    window.updateCartDisplay();
    // Функция удаления товара из корзины
    window.removeProductFromCart = function (productId) { 
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const updatedCart = cart.filter(item => item.id !== productId);  // Фильтруем товар
        localStorage.setItem("cart", JSON.stringify(updatedCart));  // Обновляем localStorage
        updateCartDisplay();  // Обновляем отображение корзины
        updateCartCount();  // Обновляем количество товаров в корзине
    }
    window.updateCartDisplay();
    // Обновление количества товаров на иконке корзины
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

    // Показать лоадер
    btn.innerHTML = '<div class="loader"></div>';
    btn.disabled = true;

    // Имитация отправки данных (задержка 2 сек)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Скрыть лоадер, показать галочку
    btn.innerHTML = '<div class="checkmark">✓</div>';
    
    // Обновить интерфейс
    showNotification('Заказ оформлен!', 'success');
    localStorage.removeItem('cart');
    window.updateCartDisplay();
    // Вернуть обычную кнопку через 1.5 сек
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

        // Сохраняем заказ в Supabase
        await saveOrder(orderData)
        
        // Очистка корзины и уведомление
        localStorage.removeItem('cart')
        showNotification('Заказ оформлен!', 'success')
        
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error)
        showNotification('Ошибка при оформлении!', 'error')
    }
    
});

// Функция для кастомных уведомлений
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

// Функция для открытия модального окна из контейнера
window.openModalFromContainer = function(container) {
    const imageUrl = container.querySelector('.image').dataset.fullImage;
    openModal(imageUrl);
};

// Открытие полноразмерного изображения контейнера
window.openFullImage = function(event) {
    event.stopPropagation(); // Предотвращаем срабатывание родительского обработчика
    const imageUrl = event.target.closest('.image').dataset.fullImage;
    openModal(imageUrl);
};

// Переименованная функция для вложенных изображений
window.toggleNestedImages = function(containerId) {
    const container = document.getElementById(`container-${containerId}`);
    container.style.display = container.style.display === "none" ? "flex" : "none";
};