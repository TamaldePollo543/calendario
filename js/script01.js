(() => {

  
  const $ = (sel) => document.querySelector(sel);

  const etiquetaMes      = $('#monthLabel');
  const etiquetaRango    = $('#weekRange');
  const contDiasSemana   = $('#weekdays');
  const contDiasMes      = $('#daysGrid');
  const listaEventosSide = $('#eventsList');
  const modalFondo       = $('#modalBackdrop');

  let fechaActual = new Date();
  let eventos = [];

  function cargarEventos() {
    const guardado = localStorage.getItem('calendario_eventos');
    eventos = guardado ? JSON.parse(guardado) : [];
  }

  function guardarEventos() {
    localStorage.setItem('calendario_eventos', JSON.stringify(eventos));
  }

  function generarId() {
    return Math.random().toString(36).substr(2, 9);
  }

  function fechaAFormato(d) {
    const año = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  function formatoAFecha(cadena) {
    const [año, mes, dia] = cadena.split('-').map(Number);
    return new Date(año, mes - 1, dia);
  }

  function mostrarDiasSemana() {
    const dias = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    contDiasSemana.innerHTML = dias.map(d => `<div class="weekday">${d}</div>`).join('');
  }

  function mostrarCalendario() {
    contDiasMes.innerHTML = '';

    const año  = fechaActual.getFullYear();
    const mes  = fechaActual.getMonth();
    const inicioMes = new Date(año, mes, 1);

    const diaSemanaJS = inicioMes.getDay(); 
    const offset = (diaSemanaJS + 6) % 7;

    const diasMes = new Date(año, mes + 1, 0).getDate();
    const inicioCuadricula = new Date(año, mes, 1 - offset);

    const totalCuadros = 42;

    for (let i = 0; i < totalCuadros; i++) {
      const fechaCelda = new Date(inicioCuadricula.getFullYear(), inicioCuadricula.getMonth(), inicioCuadricula.getDate() + i);
      const formato = fechaAFormato(fechaCelda);

      const celda = document.createElement('div');
      celda.className = "day";

      if (fechaCelda.getMonth() !== mes) celda.classList.add("other-month");

      if (fechaAFormato(new Date()) === formato) celda.classList.add("today");

      celda.dataset.fecha = formato;

      const numero = document.createElement('div');
      numero.className = "date";
      numero.textContent = fechaCelda.getDate();
      celda.appendChild(numero);

      const eventosDia = eventos.filter(ev => ev.fecha === formato).slice(0, 3);
      eventosDia.forEach(ev => {
        const etiqueta = document.createElement('span');
        etiqueta.className = "event";
        etiqueta.textContent = `${ev.inicio ? ev.inicio + " " : ""}${ev.titulo}`;
        etiqueta.style.background = ev.color;

        etiqueta.addEventListener("click", (e) => {
          e.stopPropagation();
          mostrarDetallesEvento(ev);
        });

        celda.appendChild(etiqueta);
      });

      celda.addEventListener("click", () => abrirModalParaDia(formato));
      contDiasMes.appendChild(celda);
    }

    const nombreMes = fechaActual.toLocaleString("es-ES", { month: "long" });
    etiquetaMes.textContent = nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1) + " " + año;

    etiquetaRango.textContent =
      `${contDiasMes.firstChild.dataset.fecha} → ${contDiasMes.lastChild.dataset.fecha}`;

    mostrarListaEventos();
  }

  function mostrarListaEventos() {
    listaEventosSide.innerHTML = "";

    const ordenados = eventos.slice().sort((a, b) =>
      a.fecha.localeCompare(b.fecha) ||
      (a.inicio || "").localeCompare(b.inicio || "")
    );

    ordenados.slice(0, 8).forEach(ev => {
      const card = document.createElement("div");
      card.className = "ev-card";

      const color = document.createElement("div");
      color.className = "ev-color";
      color.style.background = ev.color;

      const info = document.createElement("div");
      info.innerHTML = `
        <div class="ev-title">${ev.titulo}</div>
        <div class="ev-meta">${ev.fecha} ${ev.inicio || ''} ${ev.fin ? "- " + ev.fin : ""}</div>
      `;

      card.appendChild(color);
      card.appendChild(info);
      card.addEventListener("click", () => mostrarDetallesEvento(ev));

      listaEventosSide.appendChild(card);
    });
  }

  function mostrarDetallesEvento(ev) {
    alert(
      `${ev.titulo}\n${ev.fecha}\n${ev.inicio} - ${ev.fin}\n\n${ev.descripcion}`
    );
  }

  const btnAbrirModal = $('#openModal');
  const btnCerrarModal = $('#closeModal');
  const btnGuardar = $('#saveEvent');

  const inpTitulo = $('#evTitle');
  const inpFecha = $('#evDate');
  const inpInicio = $('#evStart');
  const inpFin = $('#evEnd');
  const inpColor = $('#evColor');
  const inpDesc = $('#evDesc');

  function abrirModal(fecha) {
    modalFondo.style.display = "flex";
    inpFecha.value = fecha || fechaAFormato(new Date());
    inpTitulo.value = "";
    inpInicio.value = "";
    inpFin.value = "";
    inpDesc.value = "";
    inpColor.value = "#8b5cf6";
  }

  function abrirModalParaDia(fecha) {
    abrirModal(fecha);
    setTimeout(() => inpTitulo.focus(), 150);
  }

  function cerrarModal() {
    modalFondo.style.display = "none";
  }

  btnAbrirModal.addEventListener("click", () => abrirModal());
  btnCerrarModal.addEventListener("click", cerrarModal);

  modalFondo.addEventListener("click", (e) => {
    if (e.target === modalFondo) cerrarModal();
  });

  btnGuardar.addEventListener("click", () => {
    const titulo = inpTitulo.value.trim();
    const fecha = inpFecha.value;

    if (!titulo || !fecha) {
      alert("El título y la fecha son obligatorios");
      return;
    }

    const nuevo = {
      id: generarId(),
      titulo,
      fecha,
      inicio: inpInicio.value,
      fin: inpFin.value,
      color: inpColor.value,
      descripcion: inpDesc.value
    };

    eventos.push(nuevo);
    guardarEventos();
    mostrarCalendario();
    cerrarModal();
  });

  $('#prevBtn').addEventListener("click", () => {
    fechaActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth() - 1, 1);
    mostrarCalendario();
  });

  $('#nextBtn').addEventListener("click", () => {
    fechaActual = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 1);
    mostrarCalendario();
  });

  $('#todayBtn').addEventListener("click", () => {
    fechaActual = new Date();
    mostrarCalendario();
  });

  cargarEventos();
  mostrarDiasSemana();
  mostrarCalendario();

})();
