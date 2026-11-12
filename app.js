/* ==========================================
   COFFEE BREW LAB
   APP.JS GLOBAL
========================================== */

/* ==========================================
   STORAGE
========================================== */

const Storage = {

    get(key) {

        try {
            return JSON.parse(
                localStorage.getItem(key)
            ) || [];
        }
        catch {
            return [];
        }

    },

    set(key, value) {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    }

};

/* ==========================================
   CONFIG
========================================== */

const Config = {

    load() {

        return JSON.parse(
            localStorage.getItem("config")
        ) || {

            sonido: true,
            vibracion: true,
            objetivoEspresso: 28

        };

    }

};

/* ==========================================
   UTILIDADES
========================================== */

function uid() {

    return Date.now() + "-" +

        Math.random()
            .toString(36)
            .substring(2, 9);

}

function fechaActual() {

    return new Date()
        .toLocaleString();

}

function promedio(lista) {

    if (lista.length === 0) return 0;

    return (

        lista.reduce(
            (a, b) => a + b, 0
        )

        /

        lista.length

    );

}

/* ==========================================
   CAFES
========================================== */

function obtenerCafes() {

    return Storage.get("cafes");

}

function cargarSelectCafes(id) {

    const select =
        document.getElementById(id);

    if (!select) return;

    const cafes =
        obtenerCafes();

    select.innerHTML =
        `<option value="">
        Seleccionar Café
    </option>`;

    cafes.forEach(cafe => {

        select.innerHTML +=

            `<option value="${cafe.nombre}">
            ${cafe.nombre}
        </option>`;

    });

}

/* ==========================================
   RECETAS
========================================== */

function obtenerRecetas() {

    return Storage.get("recetas");

}

function guardarReceta(receta) {

    const recetas =
        obtenerRecetas();

    recetas.push(receta);

    Storage.set(
        "recetas",
        recetas
    );

}

/* ==========================================
   CRONOMETRO GENERICO
========================================== */

let timer = null;
let startTime = null;
let running = false;
let objetivoAvisado = false;

function iniciarCronometro(

    displayId = "cronometro",

    objetivo = 28,

    callback = null

) {

    if (running) return;

    running = true;

    objetivoAvisado = false;

    startTime = Date.now();

    timer = setInterval(() => {

        const segundos =

            (Date.now() - startTime)

            / 1000;

        const display =
            document.getElementById(
                displayId
            );

        if (display) {

            display.innerText =
                segundos.toFixed(1);

        }

        const progressBar =
            document.getElementById(
                "progressBar"
            );

        if (progressBar) {

            const progreso =
                Math.min(
                    (segundos / objetivo) * 100,
                    100
                );

            progressBar.style.width =
                progreso + "%";

        }

        if (
            segundos >= objetivo &&
            !objetivoAvisado
        ) {

            objetivoAvisado = true;

            dispararAlerta();

        }

        if (callback) {

            callback(segundos);

        }

    }, 100);

}

function detenerCronometro() {

    clearInterval(timer);

    running = false;

}

function reiniciarCronometro() {

    clearInterval(timer);

    running = false;

    const reloj =
        document.getElementById(
            "cronometro"
        );

    if (reloj) {

        reloj.innerText = "00.0";

    }

    const barra =
        document.getElementById(
            "progressBar"
        );

    if (barra) {

        barra.style.width = "0%";

    }

}

/* ==========================================
   ALERTA
========================================== */

function dispararAlerta() {

    const cfg =
        Config.load();

    if (
        cfg.vibracion &&
        navigator.vibrate
    ) {

        navigator.vibrate(300);

    }

    alert(
        "🎯 Objetivo alcanzado"
    );

}

/* ==========================================
   ESPRESSO
========================================== */

function obtenerShots() {

    return Storage.get(
        "espressoShots"
    );

}

function guardarShot(shot) {

    const shots =
        obtenerShots();

    shots.push(shot);

    Storage.set(
        "espressoShots",
        shots
    );

}

function estadisticasEspresso() {

    const shots =
        obtenerShots();

    const total =
        shots.length;

    if (total === 0) {

        return {

            total: 0,
            promedio: 0,
            perfectos: 0,
            ratio: 0

        };

    }

    let tiempo = 0;
    let ratio = 0;
    let perfectos = 0;

    shots.forEach(s => {

        tiempo +=
            Number(
                s.tiempo || 0
            );

        if (
            s.dosis &&
            s.salida
        ) {

            ratio +=
                s.salida /
                s.dosis;

        }

        if (
            s.tiempo >= 25 &&
            s.tiempo <= 32
        ) {

            perfectos++;

        }

    });

    return {

        total,

        promedio:
            (
                tiempo / total
            ).toFixed(1),

        ratio:
            (
                ratio / total
            ).toFixed(2),

        perfectos:
            Math.round(
                (perfectos / total)
                * 100
            )

    };

}

/* ==========================================
   KPI DASHBOARD
========================================== */

function cargarKPIs() {

    const datos =
        estadisticasEspresso();

    const shots =
        document.getElementById(
            "kpiShots"
        );

    if (shots) {

        shots.innerText =
            datos.total;

    }

    const perfect =
        document.getElementById(
            "kpiPerfect"
        );

    if (perfect) {

        perfect.innerText =
            datos.perfectos + "%";

    }

    const tiempo =
        document.getElementById(
            "kpiTiempo"
        );

    if (tiempo) {

        tiempo.innerText =
            datos.promedio + "s";

    }

    const ratio =
        document.getElementById(
            "kpiRatio"
        );

    if (ratio) {

        ratio.innerText =
            "1:" + datos.ratio;

    }

}

/* ==========================================
   CHART
========================================== */

let chartInstance;

function crearGrafico(

    canvasId,

    valores,

    titulo = "Datos"

) {

    const canvas =
        document.getElementById(
            canvasId
        );

    if (
        !canvas ||
        typeof Chart ===
        "undefined"
    ) return;

    if (chartInstance) {

        chartInstance.destroy();

    }

    chartInstance =
        new Chart(canvas, {

            type: "line",

            data: {

                labels:
                    valores.map(
                        (_, i) => "#" + (i + 1)
                    ),

                datasets: [{

                    label: titulo,

                    data: valores,

                    borderColor: "#c58b45",

                    tension: .3,

                    fill: false

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false

            }

        });

}

/* ==========================================
   V60
========================================== */

function obtenerV60() {

    return Storage.get(
        "v60Preparaciones"
    );

}

function guardarV60(data) {

    const lista =
        obtenerV60();

    lista.push(data);

    Storage.set(
        "v60Preparaciones",
        lista
    );

}

/* ==========================================
   PRENSA FRANCESA
========================================== */

function obtenerFrancesa() {

    return Storage.get(
        "francesaPreparaciones"
    );

}

function guardarFrancesa(data) {

    const lista =
        obtenerFrancesa();

    lista.push(data);

    Storage.set(
        "francesaPreparaciones",
        lista
    );

}

/* ==========================================
   MOKA
========================================== */

function obtenerMoka() {

    return Storage.get(
        "mokaPreparaciones"
    );

}

function guardarMoka(data) {

    const lista =
        obtenerMoka();

    lista.push(data);

    Storage.set(
        "mokaPreparaciones",
        lista
    );

}

/* ==========================================
   AEROPRESS
========================================== */

function obtenerAeropress() {

    return Storage.get(
        "aeropressPreparaciones"
    );

}

function guardarAeropress(data) {

    const lista =
        obtenerAeropress();

    lista.push(data);

    Storage.set(
        "aeropressPreparaciones",
        lista
    );

}

/* ==========================================
   COLD BREW
========================================== */

function obtenerColdBrew() {

    return Storage.get(
        "coldbrewPreparaciones"
    );

}

function guardarColdBrew(data) {

    const lista =
        obtenerColdBrew();

    lista.push(data);

    Storage.set(
        "coldbrewPreparaciones",
        lista
    );

}

/* ==========================================
   INIT
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarKPIs();

    }
);