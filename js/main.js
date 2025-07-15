let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const carritoModal = document.getElementById("carrito-modal");
const overlay = carritoModal.querySelector(".carrito-modal-overlay");
const abrirCarritoBtn = document.getElementById("carrito-header");
const cerrarCarritoBtn = document.getElementById("cerrar-carrito");
const contadorCarrito = document.getElementById("carrito-contador");

function cargarProductos() {
  fetch('js/productos.json')
    .then(response => response.json())
    .then(data => {
      productos = data;
      mostrarProductos();
    })
    .catch(err => {
      document.getElementById("lista-productos").innerHTML =
        "<div class='msg-vacio'>No se pudieron cargar los productos.</div>";
      productos = [];
    });
}

function mostrarProductos() {
  const contenedor = document.getElementById("lista-productos");
  contenedor.innerHTML = "";

  const cardGroup = document.createElement("div");
  cardGroup.className = "card-group";

  productos.forEach(producto => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${producto.imagen}" class="card-img-top" alt="${producto.nombre}">
      <div class="card-body">
        <h5 class="card-title">${producto.nombre}</h5>
        <p class="card-text">${producto.descripcion}</p>
        <div class="card-precio">$${producto.precio}</div>
        <button class="btn-agregar" data-id="${producto.id}">Agregar</button>
      </div>
    `;
    cardGroup.appendChild(card);
  });

  contenedor.appendChild(cardGroup);

  document.querySelectorAll(".btn-agregar").forEach(btn => {
    btn.addEventListener("click", () => agregarAlCarrito(parseInt(btn.dataset.id)));
  });
}

function agregarAlCarrito(id) {
  const index = carrito.findIndex(p => p.id === id);
  if (index !== -1) {
    carrito[index].cantidad += 1;
  } else {
    const producto = productos.find(p => p.id === id);
    carrito.push({ ...producto, cantidad: 1 });
  }
  guardarCarrito();
  actualizarContador();
  mostrarCarrito();
}
function quitarUnidad(id) {
  const index = carrito.findIndex(p => p.id === id);
  if (index !== -1) {
    carrito[index].cantidad -= 1;
    if (carrito[index].cantidad <= 0) {
      carrito.splice(index, 1);
    }
    guardarCarrito();
    actualizarContador();
    mostrarCarrito();
  }
}
function sumarUnidad(id) {
  const index = carrito.findIndex(p => p.id === id);
  if (index !== -1) {
    carrito[index].cantidad += 1;
    guardarCarrito();
    actualizarContador();
    mostrarCarrito();
  }
}
function quitarProducto(id) {
  carrito = carrito.filter(p => p.id !== id);
  guardarCarrito();
  actualizarContador();
  mostrarCarrito();
}
function vaciarCarrito() {
  if (carrito.length === 0) return;
  Swal.fire({
    title: '¿Seguro que querés vaciar el carrito?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, vaciar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      carrito = [];
      guardarCarrito();
      actualizarContador();
      mostrarCarrito();
      Swal.fire({
        icon: 'success',
        title: 'Carrito vacío',
        timer: 1200,
        showConfirmButton: false
      });
    }
  });
}
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}


function actualizarContador() {
  const totalUnidades = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  contadorCarrito.textContent = totalUnidades;
}

function mostrarCarrito() {
  const contenedor = document.getElementById("lista-carrito");
  contenedor.innerHTML = "";
  const resumen = document.getElementById("resumen-compra");

  if (carrito.length === 0) {
    resumen.innerHTML = `<div class="msg-vacio">El carrito está vacío.</div>`;
    contenedor.innerHTML = "";
    return;
  }
  carrito.forEach(item => {
    const div = document.createElement("div");
    div.className = "item-carrito";
    div.innerHTML = `
      ${item.nombre} - $${item.precio} x ${item.cantidad}
      <button class="btn-menos" data-id="${item.id}">-</button>
      <button class="btn-mas" data-id="${item.id}">+</button>
      <button class="btn-quitar" data-id="${item.id}">Quitar</button>
    `;
    contenedor.appendChild(div);
  });

  document.querySelectorAll(".btn-menos").forEach(btn =>
    btn.addEventListener("click", () => quitarUnidad(parseInt(btn.dataset.id)))
  );
  document.querySelectorAll(".btn-mas").forEach(btn =>
    btn.addEventListener("click", () => sumarUnidad(parseInt(btn.dataset.id)))
  );
  document.querySelectorAll(".btn-quitar").forEach(btn =>
    btn.addEventListener("click", () => quitarProducto(parseInt(btn.dataset.id)))
  );

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  let mensaje = `<div class="msg-total">Total sin descuento: $${total}</div>`;

  if (total >= 10000) {
    const descuento = total * 0.1;
    const totalConDescuento = total - descuento;
    mensaje += `<div class="msg-descuento">Descuento aplicado: $${descuento}<br>Total a pagar: $${totalConDescuento}</div>`;
  } else {
    mensaje += `<div class="msg-descuento">No se aplicó descuento.</div>`;
  }

  resumen.innerHTML = mensaje;
}

let btnVaciar = document.getElementById("vaciar-carrito");
if (btnVaciar) {
  btnVaciar.onclick = vaciarCarrito;
}

document.getElementById("finalizar").addEventListener("click", () => {
  if (carrito.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'El carrito está vacío',
      text: 'Agregá productos antes de finalizar la compra.'
    });
    return;
  }

  const resumen = document.getElementById("resumen-compra");

  resumen.innerHTML = `
    <form id="form-checkout" class="form-checkout">
      <h3>Datos del comprador</h3>
      <label>
        Nombre: <input type="text" name="nombre" value="Juan Pérez" required autocomplete="name" />
      </label><br>
      <label>
        Email: <input type="email" name="email" value="juan@email.com" required autocomplete="email" />
      </label><br>
      <label>
        Dirección: <input type="text" name="direccion" value="Av. Siempre Viva 123" required autocomplete="address-line1" />
      </label><br>
      <button type="submit" class="btn-agregar" style="margin-top:10px;">Confirmar compra</button>
    </form>
    <div class="msg-total" style="margin-top:12px;">Total a pagar: $${calcularTotalFinal()}</div>
  `;

  document.getElementById("form-checkout").addEventListener("submit", (e) => {
    e.preventDefault();
    procesarCheckout(e.target);
  });
});

function calcularTotalFinal() {
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  if (total >= 10000) {
    return total - (total * 0.1);
  } else {
    return total;
  }
}

function procesarCheckout(form) {
  const nombre = form.nombre.value.trim();
  const email = form.email.value.trim();
  const direccion = form.direccion.value.trim();

 
  let resumen = `<b>Comprador:</b> ${nombre}<br>`;
  resumen += `<b>Email:</b> ${email}<br>`;
  resumen += `<b>Dirección:</b> ${direccion}<br><br>`;
  resumen += `<b>Detalle de la compra:</b><ul>`;

  carrito.forEach(item => {
    resumen += `<li>${item.nombre} x ${item.cantidad} = $${item.precio * item.cantidad}</li>`;
  });
  resumen += `</ul>`;

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  if (total >= 10000) {
    const descuento = total * 0.1;
    resumen += `<div>Descuento aplicado: $${descuento}</div>`;
    resumen += `<div><b>Total final:</b> $${total - descuento}</div>`;
  } else {
    resumen += `<div><b>Total final:</b> $${total}</div>`;
  }

  Swal.fire({
    icon: 'success',
    title: '¡Compra realizada!',
    html: `
      <div style="text-align:left">${resumen}</div>
      <div class="msg-exito" style="margin-top:10px;">¡Gracias por tu compra!</div>
    `,
    confirmButtonText: 'Aceptar'
  });

  document.getElementById("resumen-compra").innerHTML = `<div class="msg-exito">¡Compra finalizada! Revisá tu email para más información.</div>`;

  vaciarCarrito();
  actualizarContador();
}

abrirCarritoBtn.addEventListener("click", abrirCarrito);
cerrarCarritoBtn.addEventListener("click", cerrarCarrito);
overlay.addEventListener("click", cerrarCarrito);

function abrirCarrito() {
  carritoModal.classList.add("abierto");
}
function cerrarCarrito() {
  carritoModal.classList.remove("abierto");
}

document.addEventListener('keydown', (e) => {
  if (e.key === "Escape") cerrarCarrito();
});


cargarProductos();
mostrarCarrito();
actualizarContador();
