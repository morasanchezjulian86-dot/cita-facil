// ==========================================
// EMAILJS - CONFIGURACIÓN
// ==========================================
// ⚠️ CAMBIA ESTOS 3 VALORES POR LOS TUYOS (te explico abajo cómo conseguirlos)
const EMAILJS_SERVICE_ID = "service_jh9mo1n";
const EMAILJS_TEMPLATE_ID = "template_rcdelkl";
const EMAILJS_PUBLIC_KEY = "mLzqDXGmHmBEDQep1";

emailjs.init(EMAILJS_PUBLIC_KEY);

// ==========================================
// DOCTORES POR ESPECIALIDAD
// ==========================================
const doctoresPorEspecialidad = {
    "Medicina General": ["Dra. Laura García", "Dr. Carlos López"],
    "Pediatría": ["Dra. Ana Martínez", "Dr. Miguel Hernández", "Dra. Sofía Ramírez"],
    "Odontología": ["Dr. Jorge Torres", "Dra. Patricia Vega"],
    "Dermatología": ["Dra. Elena Navarro", "Dr. Ricardo Mendoza"],
    "Nutrición": ["Lic. María Fuentes", "Lic. Daniel Ortiz"]
};

// ==========================================
// FILTRAR DOCTORES SEGÚN ESPECIALIDAD
// ==========================================
const especialidadSelect = document.getElementById("especialidad");
const doctorSelect = document.getElementById("doctor");

if (especialidadSelect && doctorSelect) {
    especialidadSelect.addEventListener("change", function() {
        const especialidad = this.value;
        doctorSelect.innerHTML = "";

        if (especialidad && doctoresPorEspecialidad[especialidad]) {
            doctorSelect.disabled = false;
            doctorSelect.innerHTML = `<option value="">Selecciona un doctor</option>`;

            doctoresPorEspecialidad[especialidad].forEach(function(doctor) {
                const opcion = document.createElement("option");
                opcion.value = doctor;
                opcion.textContent = doctor;
                doctorSelect.appendChild(opcion);
            });
        } else {
            doctorSelect.disabled = true;
            doctorSelect.innerHTML = `<option value="">Primero elige especialidad</option>`;
        }
    });
}

// ==========================================
// HORARIOS DISPONIBLES
// ==========================================
const fechaInput = document.getElementById("fecha");
const horaSelect = document.getElementById("hora");

function generarHoras() {
    const horas = [];
    for (let h = 9; h < 20; h++) {
        horas.push(`${String(h).padStart(2, "0")}:00`);
        horas.push(`${String(h).padStart(2, "0")}:30`);
    }
    return horas;
}

function obtenerCitas() {
    return JSON.parse(localStorage.getItem("citas")) || [];
}

function esDiaHabil(fechaISO) {
    const dia = new Date(fechaISO + "T00:00:00").getDay();
    return dia >= 1 && dia <= 5;
}

if (fechaInput) {
    fechaInput.addEventListener("input", function() {
        const fecha = this.value;
        if (fecha && !esDiaHabil(fecha)) {
            alert("Solo se pueden agendar citas de lunes a viernes.");
            this.value = "";
            horaSelect.disabled = true;
            horaSelect.innerHTML = `<option value="">Primero elige la fecha</option>`;
            return;
        }
        cargarHoras(fecha);
    });
}

function cargarHoras(fecha) {
    horaSelect.innerHTML = "";

    if (!fecha) {
        horaSelect.disabled = true;
        horaSelect.innerHTML = `<option value="">Primero elige la fecha</option>`;
        return;
    }

    const citas = obtenerCitas();
    const horas = generarHoras();
    const horasOcupadas = citas
        .filter(c => c.fecha === fecha)
        .map(c => c.hora);

    horaSelect.disabled = false;
    horaSelect.innerHTML = `<option value="">Selecciona una hora</option>`;

    horas.forEach(function(hora) {
        const opcion = document.createElement("option");
        opcion.value = hora;
        opcion.textContent = hora;

        if (horasOcupadas.includes(hora)) {
            opcion.disabled = true;
            opcion.textContent = hora + " (Ocupada)";
        }

        horaSelect.appendChild(opcion);
    });
}

// ==========================================
// REGISTRO
// ==========================================
const registroForm = document.getElementById("registroForm");

if (registroForm) {
    registroForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const correo = document.getElementById("correo").value;
        const telefono = document.getElementById("telefono").value;
        const password = document.getElementById("password").value;

        const usuario = {
            nombre: nombre,
            correo: correo,
            telefono: telefono,
            password: password
        };

        localStorage.setItem("usuario", JSON.stringify(usuario));
        alert("¡Registro realizado correctamente!");
        document.getElementById("registroForm").reset();
    });
}

// ==========================================
// AGENDAR CITA
// ==========================================
const citaForm = document.getElementById("citaForm");

if (citaForm) {
    citaForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const paciente = document.getElementById("paciente").value;
        const especialidad = document.getElementById("especialidad").value;
        const doctor = document.getElementById("doctor").value;
        const fecha = document.getElementById("fecha").value;
        const hora = document.getElementById("hora").value;
        const motivo = document.getElementById("motivo").value;

        const citasExistentes = obtenerCitas();
        const ocupada = citasExistentes.some(c => c.fecha === fecha && c.hora === hora);

        if (ocupada) {
            alert("Esa hora ya está ocupada. Elige otra.");
            return;
        }

        const cita = {
            paciente: paciente,
            especialidad: especialidad,
            doctor: doctor,
            fecha: fecha,
            hora: hora,
            motivo: motivo,
            estado: "Confirmada"
        };

        citasExistentes.push(cita);
        localStorage.setItem("citas", JSON.stringify(citasExistentes));

        // Enviar correo de notificación
        enviarCorreoCita(cita);

        alert("¡Cita agendada correctamente!");
        citaForm.reset();

        doctorSelect.disabled = true;
        doctorSelect.innerHTML = `<option value="">Primero elige especialidad</option>`;

        horaSelect.disabled = true;
        horaSelect.innerHTML = `<option value="">Primero elige la fecha</option>`;

        mostrarCitas();
        document.getElementById("mis-citas").scrollIntoView();
    });
}

// ==========================================
// ENVIAR CORREO DE CITA
// ==========================================
function enviarCorreoCita(cita) {
    const datos = {
        to_name: "Administrador",
        paciente: cita.paciente,
        especialidad: cita.especialidad,
        doctor: cita.doctor,
        fecha: cita.fecha,
        hora: cita.hora,
        motivo: cita.motivo
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, datos)
        .then(function() {
            console.log("Correo enviado correctamente");
        })
        .catch(function(error) {
            console.error("Error al enviar el correo:", error);
        });
}

// ==========================================
// MOSTRAR CITAS
// ==========================================
function mostrarCitas() {
    const lista = document.getElementById("listaCitas");

    if (!lista) return;

    const citas = obtenerCitas();
    lista.innerHTML = "";

    if (citas.length === 0) {
        lista.innerHTML = `<p class="vacio">No tienes citas registradas.</p>`;
        return;
    }

    citas.forEach(function(cita, index) {
        lista.innerHTML += `
            <div class="cita">
                <h3>${cita.especialidad}</h3>
                <p><strong>Paciente:</strong> ${cita.paciente}</p>
                <p><strong>Doctor:</strong> ${cita.doctor}</p>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <p><strong>Motivo:</strong> ${cita.motivo}</p>
                <p><strong>Estado:</strong> ${cita.estado}</p>
                <button onclick="cancelarCita(${index})">Cancelar cita</button>
            </div>
        `;
    });
}

// ==========================================
// CANCELAR CITA
// ==========================================
function cancelarCita(index) {
    const confirmar = confirm("¿Seguro que quieres cancelar esta cita?");

    if (!confirmar) return;

    let citas = obtenerCitas();
    citas.splice(index, 1);
    localStorage.setItem("citas", JSON.stringify(citas));

    mostrarCitas();
    alert("La cita fue cancelada correctamente.");
}

// ==========================================
// MOSTRAR CITAS AL ABRIR LA PÁGINA
// ==========================================
mostrarCitas();