const STORAGE_KEY = "firecracker_order_manager_v1";

const products = [
    "বড় চড়কা",
    "ছোট চড়কা",
    "বিড়ি বাজি",
    "ফুল ঝুড়ি",
    "ছোট চটপটি",
    "মাঝারি চটপটি",
    "ব্ল্যাক ক্যাট",
    "আলু বোম",
    "মাতাল বক্স",
    "হাওয়াই",
    "সেল",
    "কালিপটকা",
    "দুধোমা",
    "ফানুস",
    "তুবড়ি"
];

const $ = (id) => document.getElementById(id);

let data = loadData();

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return {
                customers: [],
                orders: []
            };
        }

        const parsed = JSON.parse(saved);

        if (
            !parsed ||
            !Array.isArray(parsed.customers) ||
            !Array.isArray(parsed.orders)
        ) {
            throw new Error("Invalid saved data");
        }

        return parsed;
    } catch (error) {
        alert(
            "আগের সেভ করা ডেটা পড়তে সমস্যা হয়েছে। " +
            "পুরোনো ডেটা মুছে ফেলা হয়নি।"
        );

        return {
            customers: [],
            orders: []
        };
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        alert(
            "ডেটা সেভ করা যায়নি। " +
            "ব্রাউজারের স্টোরেজ পরীক্ষা করো।"
        );

        return false;
    }
}

function makeId() {
    if (window.crypto && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return (
        Date.now().toString(36) +
        Math.random().toString(36).slice(2)
    );
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
}

function showPage(pageId) {
    document.querySelectorAll(".page").forEach((page) => {
        page.classList.toggle("active-page", page.id === pageId);
    });

    document.querySelectorAll(".tab").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });

    if (pageId === "orderPage") {
        renderCustomerOptions();
    }

    if (pageId === "listPage") {
        renderOrders();
    }
}

document.querySelectorAll(".tab").forEach((button) => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

// Customer Registration

$("customerForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const name = $("customerName").value.trim();
    const phone = $("customerPhone").value.trim();

    if (!name) {
        alert("কাস্টমারের নাম লেখো।");
        return;
    }

    const customer = {
        id: makeId(),
        name: name,
        phone: phone,
        createdAt: new Date().toISOString()
    };

    data.customers.push(customer);

    if (!saveData()) {
        data.customers.pop();
        return;
    }

    $("customerForm").reset();

    renderAll();

    alert("কাস্টমার সফলভাবে যোগ হয়েছে!");
});

// Add Order Item

function createOrderItem() {
    const wrapper = document.createElement("div");
    wrapper.className = "order-item-input";

    const heading = document.createElement("div");
    heading.className = "item-heading";

    const title = document.createElement("strong");
    title.textContent = "বাজির নাম ও পরিমাণ";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-item";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
        wrapper.remove();
    });

    heading.append(title, removeButton);

    const productLabel = document.createElement("label");
    productLabel.textContent = "বাজির নাম";

    const productSelect = document.createElement("select");
    productSelect.className = "product-select";
    productSelect.required = true;

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "বাজির নাম বেছে নাও";

    productSelect.appendChild(placeholder);

    products.forEach((product) => {
        const option = document.createElement("option");
        option.value = product;
        option.textContent = product;
        productSelect.appendChild(option);
    });

    const customOption = document.createElement("option");
    customOption.value = "__custom__";
    customOption.textContent = "অন্যান্য বাজি...";
    productSelect.appendChild(customOption);

    const customInput = document.createElement("input");
    customInput.type = "text";
    customInput.className = "custom-product";
    customInput.placeholder = "নতুন বাজির নাম লেখো";
    customInput.hidden = true;

    productSelect.addEventListener("change", () => {
        const isCustom = productSelect.value === "__custom__";

        customInput.hidden = !isCustom;
        customInput.required = isCustom;

        if (!isCustom) {
            customInput.value = "";
        }
    });

    const quantityLabel = document.createElement("label");
    quantityLabel.textContent = "পরিমাণ";

    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.className = "quantity-input";
    quantityInput.min = "1";
    quantityInput.step = "1";
    quantityInput.placeholder = "যেমন: 10";
    quantityInput.required = true;

    wrapper.append(
        heading,
        productLabel,
        productSelect,
        customInput,
        quantityLabel,
        quantityInput
    );

    $("orderItems").appendChild(wrapper);
}

$("addItemBtn").addEventListener("click", createOrderItem);

// Customer Dropdowns

function renderCustomerOptions() {
    const orderSelect = $("orderCustomer");
    const filterSelect = $("filterCustomer");

    const previousOrderCustomer = orderSelect.value;
    const previousFilter = filterSelect.value;

    orderSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "কাস্টমার বেছে নাও";

    orderSelect.appendChild(placeholder);

    data.customers.forEach((customer) => {
        const option = document.createElement("option");

        option.value = customer.id;
        option.textContent = customer.name;

        orderSelect.appendChild(option);
    });

    orderSelect.value = data.customers.some(
        (customer) => customer.id === previousOrderCustomer
    ) ? previousOrderCustomer : "";

    filterSelect.replaceChildren();

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = "সব কাস্টমার";

    filterSelect.appendChild(allOption);

    data.customers.forEach((customer) => {
        const option = document.createElement("option");

        option.value = customer.id;
        option.textContent = customer.name;

        filterSelect.appendChild(option);
    });

    filterSelect.value = (
        previousFilter === "all" ||
        data.customers.some(
            (customer) => customer.id === previousFilter
        )
    ) ? previousFilter : "all";
}

// Save Order

$("orderForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const customerId = $("orderCustomer").value;
    const customer = data.customers.find(
        (item) => item.id === customerId
    );

    if (!customer) {
        alert("প্রথমে একজন কাস্টমার বেছে নাও।");
        return;
    }

    const itemElements = Array.from(
        document.querySelectorAll(".order-item-input")
    );

    if (itemElements.length === 0) {
        alert("অন্তত একটি বাজির নাম যোগ করো।");
        return;
    }

    const items = [];

    for (const element of itemElements) {
        const selected = element.querySelector(".product-select");
        const customInput = element.querySelector(".custom-product");
        const quantityInput = element.querySelector(".quantity-input");

        let productName = selected.value;

        if (productName === "__custom__") {
            productName = customInput.value.trim();
        }

        const quantity = Number(quantityInput.value);

        if (!productName) {
            alert("প্রতিটি অর্ডারের বাজির নাম বেছে নাও।");
            return;
        }

        if (
            !Number.isSafeInteger(quantity) ||
            quantity < 1
        ) {
            alert("পরিমাণ অবশ্যই ১ বা তার বেশি পূর্ণসংখ্যা হতে হবে।");
            return;
        }

        items.push({
            id: makeId(),
            product: productName,
            quantity: quantity,
            status: "pending"
        });
    }

    const order = {
        id: makeId(),
        customerId: customerId,
        items: items,
        note: $("orderNote").value.trim(),
        createdAt: new Date().toISOString()
    };

    data.orders.push(order);

    if (!saveData()) {
        data.orders.pop();
        return;
    }

    $("orderForm").reset();
    $("orderItems").replaceChildren();
    createOrderItem();

    renderAll();

    alert("অর্ডার সফলভাবে সেভ হয়েছে!");

    showPage("listPage");
});

// Render Customer List

function renderCustomers() {
    const container = $("customerList");
    container.replaceChildren();

    if (data.customers.length === 0) {
        container.innerHTML =
            '<p class="empty">এখনও কোনো কাস্টমার যোগ করা হয়নি।</p>';
        return;
    }

    data.customers.forEach((customer) => {
        const customerOrders = data.orders.filter(
            (order) => order.customerId === customer.id
        );

        const allItems = customerOrders.flatMap(
            (order) => order.items
        );

        const pending = allItems.filter(
            (item) => item.status === "pending"
        ).length;

        const done = allItems.filter(
            (item) => item.status === "done"
        ).length;

        const card = document.createElement("div");
        card.className = "customer-card";

        const name = document.createElement("h3");
        name.textContent = customer.name;

        const phone = document.createElement("p");
        phone.textContent = customer.phone
            ? "Phone: " + customer.phone
            : "Phone: দেওয়া হয়নি";

        const stats = document.createElement("p");
        stats.textContent =
            "মোট অর্ডার: " + allItems.length +
            " | Pending: " + pending +
            " | Done: " + done;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "secondary-btn";
        button.textContent = "এই কাস্টমারের অর্ডার দেখো";

        button.addEventListener("click", () => {
            $("filterCustomer").value = customer.id;
            $("filterStatus").value = "all";
            showPage("listPage");
            renderOrders();
        });

        card.append(name, phone, stats, button);
        container.appendChild(card);
    });
}

// Render All Orders

function renderOrders() {
    const container = $("ordersList");
    container.replaceChildren();

    const customerFilter = $("filterCustomer").value || "all";
    const statusFilter = $("filterStatus").value || "all";

    const visibleOrders = data.orders.filter((order) => {
        if (
            customerFilter !== "all" &&
            order.customerId !== customerFilter
        ) {
            return false;
        }

        return order.items.some((item) => {
            return (
                statusFilter === "all" ||
                item.status === statusFilter
            );
        });
    });

    if (visibleOrders.length === 0) {
        container.innerHTML =
            '<p class="empty">এই ফিল্টারে কোনো অর্ডার পাওয়া যায়নি।</p>';
        return;
    }

    visibleOrders.slice().reverse().forEach((order) => {
        const customer = data.customers.find(
            (item) => item.id === order.customerId
        );

        const card = document.createElement("div");
        card.className = "order-card";

        const heading = document.createElement("h3");
        heading.textContent = customer
            ? customer.name
            : "Unknown Customer";

        const date = document.createElement("p");
        date.textContent =
            "তারিখ: " +
            new Date(order.createdAt).toLocaleString("bn-IN");

        card.append(heading, date);

        if (order.note) {
            const note = document.createElement("p");
            note.textContent = "নোট: " + order.note;
            card.appendChild(note);
        }

        const visibleItems = order.items.filter((item) => {
            return (
                statusFilter === "all" ||
                item.status === statusFilter
            );
        });

        visibleItems.forEach((item) => {
            const itemBox = document.createElement("div");
            itemBox.className = "order-item-input";

            const product = document.createElement("p");
            product.textContent =
                "বাজি: " + item.product +
                " | পরিমাণ: " + item.quantity;

            const status = document.createElement("span");
            status.className = "status " + item.status;
            status.textContent = item.status === "done"
                ? "Done ✓"
                : "Pending";

            itemBox.append(product, status);

            if (item.status === "pending") {
                const doneButton = document.createElement("button");

                doneButton.type = "button";
                doneButton.className = "done-btn";
                doneButton.textContent = "✓ Mark as Done";

                doneButton.addEventListener("click", () => {
                    const confirmed = confirm(
                        item.product +
                        " — এই অর্ডারটি সম্পূর্ণ হয়েছে?"
                    );

                    if (!confirmed) {
                        return;
                    }

                    const oldStatus = item.status;
                    item.status = "done";

                    if (!saveData()) {
                        item.status = oldStatus;
                        return;
                    }

                    renderAll();
                });

                itemBox.appendChild(doneButton);
            } else {
                const completed = document.createElement("button");

                completed.type = "button";
                completed.className = "done-btn";
                completed.textContent = "✓ Completed";
                completed.disabled = true;

                itemBox.appendChild(completed);
            }

            card.appendChild(itemBox);
        });

        container.appendChild(card);
    });
}

// Dashboard Summary

function renderSummary() {
    $("totalCustomers").textContent = data.customers.length;

    const allItems = data.orders.flatMap(
        (order) => order.items
    );

    $("pendingCount").textContent = allItems.filter(
        (item) => item.status === "pending"
    ).length;

    $("doneCount").textContent = allItems.filter(
        (item) => item.status === "done"
    ).length;
}

// Refresh All Sections

function renderAll() {
    renderSummary();
    renderCustomers();
    renderCustomerOptions();
    renderOrders();
}

// Filters

$("filterCustomer").addEventListener("change", renderOrders);
$("filterStatus").addEventListener("change", renderOrders);

// Initial Setup

createOrderItem();
renderAll();