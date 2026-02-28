(function(){
  // Cart pricing update v2 - cache bust
  console.log('Cart pricing v2 loaded');
  const CART_KEY = 'ghp_cart_v1';

  const PRODUCTS = [
    { id: 'mango', name: 'Mango Pickle', price: 450, image: 'mango_pickle.jpg' },
    { id: 'korameenu', name: 'Korameenu Pickle', price: 1100, image: 'Korameenu pickle.jpg' },
    { id: 'prawns-large', name: 'Prawns Pickle (Large)', price: 1300, image: 'Prawns Pickle.jpeg' },
    { id: 'prawns-small', name: 'Prawns Pickle (Small)', price: 1100, image: 'Prawns Pickle.jpeg' },
    { id: 'natukodi', name: 'Natukodi Pickle', price: 1200, image: 'Natukodi Pickle.jpeg' },
    { id: 'mutton-boneless', name: 'Mutton Boneless Pickle', price: 1500, image: 'Mutton boneless Pickle.webp' },
    { id: 'chicken-bone', name: 'Chicken Bone Pickle', price: 800, image: 'Chicken Bone Pickle.jpg' },
    { id: 'chicken-boneless', name: 'Chicken Boneless Pickle', price: 1000, image: 'Chicken Boneless.jpeg' },
    { id: 'gongura', name: 'Gongura Pickle', price: 300, image: 'Gongura Pickle.jpeg' },
    { id: 'tomato', name: 'Tomato Pickle', price: 300, image: 'Tomato Pickle.jpeg' },
    { id: 'allam', name: 'Allam Pickle', price: 300, image: 'Allam Pickle.jpg' }
  ];

  function safeParse(json, fallback){
    try{ return JSON.parse(json) ?? fallback; }catch(_e){ return fallback; }
  }

  function getCart(){
    const raw = localStorage.getItem(CART_KEY);
    const cart = safeParse(raw, {});
    if(!cart || typeof cart !== 'object') return {};
    return cart;
  }

  function setCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  function cartDistinctCount(cart){
    return Object.values(cart).filter(v => Number(v) > 0).length;
  }

  function updateBadges(){
    const badgeEls = document.querySelectorAll('[data-cart-badge]');
    if(!badgeEls.length) return;
    const count = cartDistinctCount(getCart());
    badgeEls.forEach(el => { el.textContent = String(count); });
  }

  function formatRupees(n){
    const val = Math.round(Number(n) || 0);
    return `₹${val}`;
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }

  function findProduct(id){
    return PRODUCTS.find(p => p.id === id) || null;
  }

  function initNav(){
    const toggle = document.querySelector('[data-menu-toggle]');
    const links = document.querySelector('[data-nav-links]');
    if(!toggle || !links) return;

    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    links.addEventListener('click', (e) => {
      const a = e.target && e.target.closest('a');
      if(!a) return;
      links.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function initHeroScroll(){
    const btn = document.querySelector('[data-scroll-to-products]');
    if(!btn) return;
    btn.addEventListener('click', () => {
      const target = document.getElementById('products');
      if(target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function buildQtySelect(){
    const select = document.createElement('select');
    select.className = 'select';
    select.setAttribute('aria-label', 'Select quantity');

    const values = [0,1,2,3,4,5];
    values.forEach(v => {
      const opt = document.createElement('option');
      opt.value = String(v);
      opt.textContent = v === 0 ? 'Select (0 Kg)' : `${v} Kg`;
      select.appendChild(opt);
    });

    select.value = '0';
    return select;
  }

  function renderProducts(filter){
    const grid = document.querySelector('[data-product-grid]');
    if(!grid) return;

    grid.innerHTML = '';

    const list = PRODUCTS.filter(p => {
      if(filter === 'veg'){
        const vegIds = ['mango','gongura','tomato','allam'];
        return vegIds.includes(p.id);
      }
      if(filter === 'nonveg'){
        const nonVegIds = ['korameenu','prawns-large','prawns-small','natukodi','mutton-boneless','chicken-bone','chicken-boneless'];
        return nonVegIds.includes(p.id);
      }
      return true;
    });

    list.forEach(p => {
      const card = document.createElement('article');
      card.className = 'product-card';

      const imgWrap = document.createElement('div');
      imgWrap.className = 'product-card__img';
      const img = document.createElement('img');
      img.src = './images/' + p.image;
      img.alt = p.name;
      img.loading = 'lazy';
      imgWrap.appendChild(img);

      const body = document.createElement('div');
      body.className = 'product-card__body';

      const head = document.createElement('div');
      head.className = 'product-card__head';

      const title = document.createElement('h3');
      title.className = 'product-card__title';
      title.textContent = p.name;

      const price = document.createElement('div');
      price.className = 'product-card__price';
      price.textContent = `${formatRupees(p.price)}/Kg`;

      head.appendChild(title);
      head.appendChild(price);

      const label = document.createElement('div');
      label.className = 'product-card__label';
      label.textContent = 'Select Quantity:';

      const select = buildQtySelect();

      const actions = document.createElement('div');
      actions.className = 'product-card__actions';

      const addBtn = document.createElement('button');
      addBtn.className = 'btn btn--primary btn-add';
      addBtn.type = 'button';
      addBtn.textContent = 'Add to Cart';

      addBtn.addEventListener('click', () => {
        const qty = Number(select.value || 0);
        if(!qty || qty <= 0) return;

        const cart = getCart();
        cart[p.id] = (Number(cart[p.id] || 0) + qty);
        setCart(cart);
        updateBadges();
        select.value = '0';
        showToast("✅ Pickle added to cart!");
      });

      actions.appendChild(addBtn);

      body.appendChild(head);
      body.appendChild(label);
      body.appendChild(select);
      body.appendChild(actions);

      card.appendChild(imgWrap);
      card.appendChild(body);

      grid.appendChild(card);
    });
  }

  function initFilters(){
    const chips = Array.from(document.querySelectorAll('[data-filter]'));
    if(!chips.length) return;

    let active = 'all';
    renderProducts(active);

    chips.forEach(btn => {
      btn.addEventListener('click', () => {
        chips.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        active = btn.getAttribute('data-filter') || 'all';
        renderProducts(active);
      });
    });
  }

  function computeTotal(cart){
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const p = findProduct(id);
      if(!p) return sum;
      return sum + (Number(qty) * Number(p.price));
    }, 0);
  }

  function setQty(id, nextQty){
    const cart = getCart();
    const q = Math.max(0, Math.round(Number(nextQty) || 0));
    if(q <= 0){
      delete cart[id];
    }else{
      cart[id] = q;
    }
    setCart(cart);
  }

  function renderSummary(){
    const card = document.querySelector('[data-summary-card]');
    const wrap = document.querySelector('[data-summary-wrap]');
    if(!card || !wrap) return;

    const cart = getCart();
    const entries = Object.entries(cart).filter(([_id, qty]) => Number(qty) > 0);

    if(entries.length === 0){
      wrap.innerHTML = '';
      const empty = document.createElement('div');
      empty.className = 'summary-empty';

      const icon = document.createElement('div');
      icon.className = 'summary-empty__icon';
      icon.textContent = '🛒';

      const title = document.createElement('h2');
      title.className = 'summary-empty__title';
      title.textContent = 'Your cart is empty';

      const sub = document.createElement('p');
      sub.className = 'summary-empty__sub';
      sub.textContent = "You haven't added any pickles yet.";

      const btn = document.createElement('a');
      btn.className = 'btn btn--primary';
      btn.href = './order.html';
      btn.textContent = 'Go to Menu';

      empty.appendChild(icon);
      empty.appendChild(title);
      empty.appendChild(sub);
      empty.appendChild(btn);

      wrap.appendChild(empty);

      const form = document.querySelector('[data-user-form]');
      if(form) form.style.display = 'none';
      updateBadges();
      return;
    }

    const form = document.querySelector('[data-user-form]');
    if(form) form.style.display = '';

    card.innerHTML = '';

    const list = document.createElement('div');
    list.className = 'summary-list';

    entries.forEach(([id, qty]) => {
      const p = findProduct(id);
      if(!p) return;

      const itemTotal = Number(qty) * Number(p.price);

      const row = document.createElement('div');
      row.className = 'summary-item';

      const left = document.createElement('div');

      const name = document.createElement('p');
      name.className = 'summary-item__name';
      name.textContent = `${p.name} → ${formatRupees(itemTotal)}`;

      left.appendChild(name);

      const right = document.createElement('div');
      right.className = 'qty-row';

      const control = document.createElement('div');
      control.className = 'qty-control';

      const minus = document.createElement('button');
      minus.className = 'qty-btn';
      minus.type = 'button';
      minus.textContent = '−';

      const value = document.createElement('div');
      value.className = 'qty-value';
      value.textContent = `${qty} Kg`;

      const plus = document.createElement('button');
      plus.className = 'qty-btn';
      plus.type = 'button';
      plus.textContent = '+';

      minus.addEventListener('click', () => {
        console.log('Minus clicked for', id, 'current qty:', getCart()[id]);
        setQty(id, Number(getCart()[id] || 0) - 1);
        console.log('After minus, new qty:', getCart()[id]);
        updateBadges();
        renderSummary();
      });

      plus.addEventListener('click', () => {
        console.log('Plus clicked for', id, 'current qty:', getCart()[id]);
        const currentQty = Number(getCart()[id] || 0);
        const newQty = currentQty + 1;
        console.log('Setting new qty:', newQty);
        setQty(id, newQty);
        console.log('After setQty, cart:', getCart());
        updateBadges();
        renderSummary();
      });

      control.appendChild(minus);
      control.appendChild(value);
      control.appendChild(plus);
      right.appendChild(control);

      const trash = document.createElement('button');
      trash.className = 'icon-btn';
      trash.type = 'button';
      trash.setAttribute('aria-label', 'Remove');
      const t = document.createElement('span');
      t.textContent = '🗑️';
      trash.appendChild(t);

      trash.addEventListener('click', () => {
        setQty(id, 0);
        updateBadges();
        renderSummary();
      });

      const priceHint = document.createElement('span');
      priceHint.className = 'summary-item__hint';
      priceHint.textContent = `(${formatRupees(p.price)}/Kg)`;

      right.appendChild(priceHint);
      right.appendChild(trash);

      row.appendChild(left);
      row.appendChild(right);

      list.appendChild(row);
    });

    const total = document.createElement('div');
    total.className = 'total-row';

    const totalLabel = document.createElement('div');
    totalLabel.className = 'total-label';
    totalLabel.textContent = 'Final Total';

    const totalValue = document.createElement('div');
    totalValue.className = 'total-value';
    totalValue.textContent = formatRupees(computeTotal(getCart()));

    total.appendChild(totalLabel);
    total.appendChild(totalValue);

    card.appendChild(list);
    card.appendChild(total);
  }

  function initPlaceOrder(){
    const btn = document.querySelector('[data-place-order]');
    if(!btn) return;
    btn.addEventListener('click', () => {
      const cart = getCart();
      const entries = Object.entries(cart).filter(([_id, qty]) => Number(qty) > 0);
      if(entries.length === 0){
        alert("Your cart is empty!");
        return;
      }

      const fullName = document.querySelector('[name="fullName"]');
      const phone = document.querySelector('[name="phone"]');
      const address = document.querySelector('[name="address"]');

      const nameVal = (fullName && fullName.value || '').trim();
      const phoneVal = (phone && phone.value || '').trim();
      const addrVal = (address && address.value || '').trim();

      if(!nameVal || !phoneVal || !addrVal){
        alert("Please fill in all your details (Name, Phone, Address)");
        return;
      }

      // Build WhatsApp message
      let message = "Hello, I would like to place an order for Godavari Homemade Pickles:%0A%0A";
      let totalAmount = 0;

      entries.forEach(([id, qty]) => {
        const p = findProduct(id);
        if(!p) return;
        const itemTotal = p.price * Number(qty);
        totalAmount += itemTotal;
        message += `${p.name} - ${qty} Kg - ₹${itemTotal}%0A`;
      });

      message += `%0ATotal Amount: ₹${totalAmount}%0A%0A`;
      message += `Name: ${nameVal}%0A`;
      message += `Phone: ${phoneVal}%0A`;
      message += `Address: ${addrVal}`;

      const whatsappNumber = "919652131224";  // Godavari Pickles WhatsApp
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;

      window.open(whatsappURL, "_blank");

      // Clear cart after order
      setCart({});
      updateBadges();
      renderSummary();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeroScroll();
    initFilters();
    updateBadges();

    if(document.querySelector('[data-summary-card]')){
      renderSummary();
      initPlaceOrder();
    }
  });
})();
