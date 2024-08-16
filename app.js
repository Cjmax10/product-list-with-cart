let userCartCount = 0;
let userCartBill = 0;
let data = '';
document.addEventListener('DOMContentLoaded', () => {
    localStorage.removeItem('cart');
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'data.json');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            data = JSON.parse(xhr.responseText);
            populateInitialData(data);
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
            console.error('Failed to fetch data:', xhr.statusText);
        }
    };

    xhr.send();
});

//Popalate page with data onload
function populateInitialData(data) {
    const container = document.getElementById('item-list');
    container.innerHTML = '';
    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = `card card-${index}`;
        card.innerHTML = `
            <div class="img">
                <img src="${item.image.desktop}" alt="${item.name}">
            </div>
            <div class="add-to-cart">
                <a class="click-to-add btn"><img src="assets/images/icon-add-to-cart.svg" alt="Add to cart icon"> Add to Cart 
                
                <span class="hover-content">
                    <div class="img decrement" data-item-name='${item.name}'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="2" fill="none" viewBox="0 0 10 2"><path fill="#fff" d="M0 .375h10v1.25H0V.375Z"/></svg>
                    </div>
                    <span class="item-count" data-counter-name='${item.name}'>0</span>
                    <div class="img increment" data-item-name='${item.name}'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#fff" d="M10 4.375H5.625V0h-1.25v4.375H0v1.25h4.375V10h1.25V5.625H10v-1.25Z"/></svg>
                    </div>
                </span></a>
            </div>
            <div class="item-desc">
                <div class="item-category">
                ${item.category}
                </div>
                <div class="item-name">
                ${item.name}
                </div>
                <div class="item-price">
                $${item.price}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    // Create cart
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = `
        <div class="cart">
            <h2>Your Cart (<span class="cart-item-count">0</span>)</h2>
            <div class="cart-content">
                <img src="assets/images/illustration-empty-cart.svg" alt="">
                <p class="empty-cart-message">Your added items will appear here</p>
            </div>
        </div>
    `;

    // Adding Event Listeners
    const decrementors = Array.from(document.querySelectorAll('.decrement'));
    const incrementors = Array.from(document.querySelectorAll('.increment'));

    decrementors.forEach((item)=> {
        item.addEventListener('click', decrementCount);
    });

    incrementors.forEach((item)=> {
        item.addEventListener('click', incrementCount);
    });


    function decrementCount(e) {
        const element = document.querySelector(`[data-counter-name="${e.currentTarget.getAttribute('data-item-name')}"]`);
        let count = element.textContent;
        if(count == 0) {
            return;
        }
        count--;
        userCartCount--;
        element.textContent = count;
        updateLS(`${e.currentTarget.getAttribute('data-item-name')}`, count);
    }

    function incrementCount(e) {
        userCartCount++;
        const element = document.querySelector(`[data-counter-name="${e.currentTarget.getAttribute('data-item-name')}"]`);
        let count = element.textContent;
        count++;
        element.textContent = count;
        updateLS(`${e.currentTarget.getAttribute('data-item-name')}`, count);
    }

    const addToCartButtons = document.querySelectorAll('.click-to-add');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Prevent default action
            e.preventDefault();

            // Toggle the visibility of the hover content
            const hoverContent = this.querySelector('.hover-content');
            hoverContent.classList.toggle('visible');
        });
    });

    function updateLS(itemName, itemCount) {
        let cart = getCartFromLS();
        
        const findItem = cart.find((item) => item.name == itemName);
        if(findItem) {
            findItem.count = itemCount;
            if(itemCount == 0) {
                const itemIndex = cart.findIndex((item) => item.name == itemName);
                cart.splice(itemIndex, 1);
            }
        } else {
            const findItemdata = data.find((item) => item.name == itemName);
            const newItem = {
                'name': itemName,
                'price': findItemdata.price,
                'count': itemCount,
                'image': findItemdata.image
            };
            cart.push(newItem);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart(cart);
    }


    function getCartFromLS() {
        let cart;
        if(localStorage.getItem('cart') === null) {
            cart = [];
        } else {
            cart = JSON.parse(localStorage.getItem('cart'));
        }
        return cart;
    }

    function updateCart(arr) {
        const cartContainer = document.getElementById('cart-container');
        userCartBill = 0;
        if(userCartCount == 0) {
            cartContainer.innerHTML = `
                <div class="cart">
                <h2>Your Cart (<span class="cart-item-count">0</span>)</h2>
                <div class="cart-content">
                    <img src="assets/images/illustration-empty-cart.svg" alt="">
                    <p class="empty-cart-message">Your added items will appear here</p>
                </div>
                </div>
            `;
        } else {
            let itemArr = '';
            arr.forEach((item) => {
                userCartBill += (item.price) * (item.count);
                itemArr += `
                    <div class="cart-item" data-cart-name='${item.name}' data-cart-count='${item.count}' data-cart-total="${(item.price) * (item.count)}">
                    <div class="cart-item-desc">
                        <p class="cart-item-name">${item.name}</p>
                        <div class="cart-item-details">
                        <div class="count">${item.count}x</div>
                        <div class="price">@$${item.price}</div>
                        <div class="item-total">${(item.price) * (item.count)}</div>
                        </div>
                    </div>
                    <div class="close-btn">
                        <svg class ="remove" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="none" viewBox="0 0 10 10"><path fill="#CAAFA7" d="M8.375 9.375 5 6 1.625 9.375l-1-1L4 5 .625 1.625l1-1L5 4 8.375.625l1 1L6 5l3.375 3.375-1 1Z"/></svg>
                    </div>
                    </div>
                `
            });
            cartContainer.innerHTML = `
                <div class="cart margin">
                    <h2>Your Cart (<span class="cart-item-count">${userCartCount}</span>)</h2>
                    <div class="cart-list">
                        ${itemArr}
                    </div>
                    <div class="cart-total">
                        <p>Order Total</p>
                        <p class="total-bill">$${userCartBill}</p>
                    </div>
                    <div class="carbon-neutral">
                        <img src="assets/images/icon-carbon-neutral.svg" alt="">
                        <p>This is a <strong>carbon-neutral</strong> delivery</p>
                    </div>
                    <button class="confirm-order" id="confirm-order">Confirm Order</button>
                    </div>
            `;
        }
        addEventOnCart();
    }

    function addEventOnCart() {
        const closeBtns = document.querySelectorAll('.close-btn');
        const confirm = document.getElementById('confirm-order');
        const overlay = document.getElementById('overlay');
        const modal = document.getElementById('confirm-modal');
        const body = document.querySelector('body');
        const newOrder = document.getElementById('new-order');

        closeBtns.forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const parent = e.currentTarget.parentElement;
                const itemName = parent.getAttribute('data-cart-name');
                const itemCount = parent.getAttribute('data-cart-count');
                const itemTotal = parent.getAttribute('data-cart-total');
                const domItemCounter = document.querySelector(`[data-counter-name = '${itemName}']`);
                domItemCounter.textContent = '0';

                userCartCount -= itemCount;
                userCartBill -= itemTotal;
                
                let cart = getCartFromLS();
        
                const findItem = cart.find((item) => item.name == itemName);
                if(findItem) {
                        const itemIndex = cart.findIndex((item) => item.name == itemName);
                        cart.splice(itemIndex, 1);
                }

                localStorage.setItem('cart', JSON.stringify(cart));
                updateCart(cart);
                    })
                });

        confirm.addEventListener('click', () => {
            populateModal();
            overlay.classList.add('active');
            modal.classList.add('active');
            body.classList.add('no-scroll');
        });

        newOrder.addEventListener('click', () => {
            location.reload();
            window.scrollTo(0,0);
        })
    }

    function populateModal() {
        const modalist = document.querySelector('.order-list');
        const lsData = JSON.parse(localStorage.getItem('cart'));
        const totalValue = document.getElementById('total-bill');
        let dataList = '';
        lsData.forEach((item) => {
            dataList += `
                <div class="order-item">
                    <img src="${item.image.thumbnail}" alt="${item.name}">
                    <div class="order-desc">
                        <div class="order-name">
                            ${item.name}
                        </div>
                        <div class="order-content">
                        <div class="order-count">
                            ${item.count}x
                        </div>
                        <div class="order-base-price">
                            $${item.price}
                        </div>
                        </div>
                    </div>
                    <div class="order-bill">
                        $${item.count * item.price}
                    </div>
                    </div>
            `;
        });
        modalist.innerHTML = `${dataList}`;
        totalValue.textContent = `$${userCartBill}`;
    }
}