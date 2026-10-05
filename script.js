/* =========================================================
   CARE REACH
   Healthcare access made simple for everyone.
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let careMap = null;
let userMarker = null;

let healthcareMarkers = [];

let userLatitude = null;
let userLongitude = null;

let healthcareLoading = false;


/* =========================================================
   STATUS
========================================================= */

function updateMapStatus(message) {

    const status =
        document.querySelector(".map-status");

    if (status) {
        status.innerHTML = message;
    }
}


/* =========================================================
   GO TO SERVICES
========================================================= */

function goToServices() {

    const section =
        document.getElementById("services");

    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }
}


/* =========================================================
   FIND LOCATION
========================================================= */

function findLocation() {

    if (!navigator.geolocation) {

        updateMapStatus(
            "⚠️ Location is not supported."
        );

        return;
    }


    updateMapStatus(
        "📍 Detecting your location..."
    );


    navigator.geolocation.getCurrentPosition(

        function(position) {

            userLatitude =
                position.coords.latitude;

            userLongitude =
                position.coords.longitude;


            console.log(
                "User location:",
                userLatitude,
                userLongitude
            );


            createCareMap(
                userLatitude,
                userLongitude
            );


            const mapSection =
                document.getElementById(
                    "map-section"
                );


            if (mapSection) {

                mapSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        },


        function(error) {

            console.error(
                "Location error:",
                error
            );


            updateMapStatus(
                "⚠️ Please allow location access."
            );

        },


        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
        }

    );

}


/* =========================================================
   MAP LOCATION BUTTON
========================================================= */

function findLocationOnMap() {

    findLocation();

}


/* =========================================================
   SERVICES
========================================================= */

const services = {

    Doctor: [
        "General Doctor",
        "Eye Care",
        "Dental Care",
        "Child Care"
    ],

    Medicines: [
        "Nearby Pharmacy",
        "Hospital Pharmacy",
        "Medical Store"
    ],

    Tests: [
        "Blood Test",
        "X-Ray",
        "Scan",
        "Diagnostic Centre"
    ],

    Hospital: [
        "Government Hospital",
        "Private Hospital",
        "General Hospital"
    ],

    "Family Care": [
        "Doctor",
        "Hospital",
        "Pharmacy"
    ]

};


/* =========================================================
   OPEN SERVICE
========================================================= */

function openService(service) {

    const options =
        services[service];


    if (!options) {
        return;
    }


    let message =
        "Choose what you need:\n\n";


    options.forEach(
        function(item, index) {

            message +=
                (index + 1) +
                ". " +
                item +
                "\n";

        }
    );


    const choice =
        prompt(message);


    if (!choice) {
        return;
    }


    const selectedIndex =
        parseInt(choice, 10) - 1;


    if (
        selectedIndex >= 0 &&
        selectedIndex < options.length
    ) {

        findHealthcare(
            options[selectedIndex]
        );

    }

}


/* =========================================================
   FIND HEALTHCARE
========================================================= */

function findHealthcare(type) {

    if (!careMap) {

        updateMapStatus(
            "📍 Please find your location first."
        );

        return;
    }


    const service =
        type.toLowerCase();


    let category = "all";


    if (

        service.includes("pharmacy") ||
        service.includes("medicine") ||
        service.includes("medical store")

    ) {

        category = "pharmacy";

    }


    else if (

        service.includes("doctor") ||
        service.includes("eye") ||
        service.includes("dental") ||
        service.includes("child")

    ) {

        category = "doctor";

    }


    else if (

        service.includes("test") ||
        service.includes("blood") ||
        service.includes("x-ray") ||
        service.includes("scan") ||
        service.includes("diagnostic")

    ) {

        category = "test";

    }


    else if (

        service.includes("hospital") ||
        service.includes("clinic")

    ) {

        category = "hospital";

    }


    filterHealthcare(category);


    const mapSection =
        document.getElementById(
            "map-section"
        );


    if (mapSection) {

        mapSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* =========================================================
   EMERGENCY
========================================================= */

function emergencyHelp() {

    const answer =
        confirm(
            "🚨 Emergency?\n\nPress OK to call 112."
        );


    if (answer) {

        window.location.href =
            "tel:112";

    }

}


/* =========================================================
   FIND EMERGENCY HOSPITAL
========================================================= */

function findEmergency() {

    const url =
        "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(
            "Emergency Hospital near me"
        );


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   CREATE MAP
========================================================= */

function createCareMap(
    latitude,
    longitude
) {

    healthcareMarkers = [];


    if (careMap) {

        careMap.remove();

        careMap = null;

    }


    careMap =
        L.map("careMap")
            .setView(
                [
                    latitude,
                    longitude
                ],
                13
            );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {

            attribution:
                "&copy; OpenStreetMap contributors"

        }

    ).addTo(careMap);


    /* =====================================================
       USER LOCATION
    ===================================================== */

    userMarker =
        L.marker(
            [
                latitude,
                longitude
            ]
        )
        .addTo(careMap)
        .bindPopup(
            "<b>📍 You are here</b><br>" +
            "CareReach location"
        );


    /*
       IMPORTANT:
       Do NOT automatically open the popup.
       This keeps the filter bar clean.
    */


    updateMapStatus(
        "⏳ Finding nearby healthcare..."
    );


    addHealthcareMarkers(
        latitude,
        longitude
    );

}


/* =========================================================
   LOAD HEALTHCARE DATA
========================================================= */

async function addHealthcareMarkers(
    latitude,
    longitude
) {

    if (healthcareLoading) {
        return;
    }


    healthcareLoading = true;


    const radius = 5000;


    const query = `

[out:json][timeout:40];

(
  nwr["amenity"="hospital"]
      (around:${radius},${latitude},${longitude});

  nwr["amenity"="clinic"]
      (around:${radius},${latitude},${longitude});

  nwr["amenity"="doctors"]
      (around:${radius},${latitude},${longitude});

  nwr["amenity"="dentist"]
      (around:${radius},${latitude},${longitude});

  nwr["amenity"="pharmacy"]
      (around:${radius},${latitude},${longitude});

  nwr["healthcare"="hospital"]
      (around:${radius},${latitude},${longitude});

  nwr["healthcare"="clinic"]
      (around:${radius},${latitude},${longitude});

  nwr["healthcare"="doctor"]
      (around:${radius},${latitude},${longitude});

  nwr["healthcare"="dentist"]
      (around:${radius},${latitude},${longitude});

  nwr["healthcare"="pharmacy"]
      (around:${radius},${latitude},${longitude});

  nwr["healthcare"="laboratory"]
      (around:${radius},${latitude},${longitude});

  nwr["healthcare"="medical_imaging"]
      (around:${radius},${latitude},${longitude});

  nwr["healthcare"="sample_collection"]
      (around:${radius},${latitude},${longitude});
);

out center tags;

`;


    const servers = [

        "https://overpass-api.de/api/interpreter",

        "https://overpass.kumi.systems/api/interpreter",

        "https://overpass.private.coffee/api/interpreter"

    ];


    let data = null;


    /* =====================================================
       TRY MULTIPLE SERVERS
    ===================================================== */

    for (
        const server of servers
    ) {

        try {

            console.log(
                "Trying:",
                server
            );


            const controller =
                new AbortController();


            const timeout =
                setTimeout(
                    function() {

                        controller.abort();

                    },
                    30000
                );


            const response =
                await fetch(
                    server,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/x-www-form-urlencoded;charset=UTF-8"

                        },

                        body:
                            new URLSearchParams({
                                data: query
                            }),

                        signal:
                            controller.signal

                    }
                );


            clearTimeout(timeout);


            if (!response.ok) {

                console.log(
                    "Server failed:",
                    response.status
                );

                continue;

            }


            const result =
                await response.json();


            if (
                result &&
                Array.isArray(
                    result.elements
                )
            ) {

                data = result;


                console.log(
                    "Healthcare data loaded:",
                    result.elements.length
                );


                break;

            }

        }

        catch (error) {

            console.log(
                "Server error:",
                error
            );

        }

    }


    healthcareLoading = false;


    /* =====================================================
       DATA FAILED
    ===================================================== */

    if (!data) {

        updateMapStatus(
            "⚠️ Healthcare data unavailable. Please try again."
        );

        return;

    }


    const places =
        data.elements || [];


    if (places.length === 0) {

        updateMapStatus(
            "⚠️ No mapped healthcare facilities found."
        );

        return;

    }


    /* =====================================================
       REMOVE DUPLICATES
    ===================================================== */

    const seen =
        new Set();


    const facilities =
        [];


    places.forEach(
        function(place) {

            const tags =
                place.tags || {};


            const lat =
                place.lat !== undefined
                    ? place.lat
                    : place.center?.lat;


            const lon =
                place.lon !== undefined
                    ? place.lon
                    : place.center?.lon;


            if (
                lat === undefined ||
                lon === undefined
            ) {

                return;

            }


            const name =
                tags.name ||
                tags["name:en"] ||
                "Healthcare Facility";


            const category =
                getHealthcareCategory(
                    tags
                );


            const key =
                name.toLowerCase() +
                "-" +
                Number(lat).toFixed(4) +
                "-" +
                Number(lon).toFixed(4);


            if (seen.has(key)) {
                return;
            }


            seen.add(key);


            const distance =
                calculateDistance(
                    latitude,
                    longitude,
                    lat,
                    lon
                );


            facilities.push({

                name: name,

                category: category,

                tags: tags,

                latitude: lat,

                longitude: lon,

                distance: distance

            });

        }
    );


    /* =====================================================
       SORT NEAREST FIRST
    ===================================================== */

    facilities.sort(
        function(a, b) {

            return (
                a.distance -
                b.distance
            );

        }
    );


    /* =====================================================
       CREATE MAP MARKERS
    ===================================================== */

    facilities.forEach(
        function(facility) {

            let icon = "🏥";

            let type =
                "Hospital / Clinic";


            if (
                facility.category ===
                "pharmacy"
            ) {

                icon = "💊";

                type = "Pharmacy";

            }


            else if (
                facility.category ===
                "doctor"
            ) {

                icon = "🩺";

                type =
                    "Doctor / Clinic";

            }


            else if (
                facility.category ===
                "test"
            ) {

                icon = "🧪";

                type =
                    "Diagnostic / Test";

            }


            const tags =
                facility.tags;


            const address =
                getAddress(tags);


            const phone =
                tags.phone || "";


            const hours =
                tags.opening_hours || "";


            const marker =
                L.marker(
                    [
                        facility.latitude,
                        facility.longitude
                    ]
                );


            marker.healthcareCategory =
                facility.category;


            marker.facilityData =
                facility;


            marker.bindPopup(`

                <div style="
                    min-width:220px;
                    font-family:Arial,sans-serif;
                    line-height:1.5;
                ">

                    <strong style="
                        font-size:16px;
                        color:#17324d;
                    ">

                        ${icon}
                        ${escapeHTML(
                            facility.name
                        )}

                    </strong>

                    <br>

                    <span style="
                        color:#1769e0;
                        font-weight:bold;
                    ">

                        ${type}

                    </span>

                    <br><br>

                    📍
                    ${facility.distance.toFixed(1)}
                    km away

                    ${
                        address
                        ?
                        `
                        <br><br>
                        🏠
                        ${escapeHTML(address)}
                        `
                        :
                        ""
                    }

                    ${
                        phone
                        ?
                        `
                        <br><br>
                        📞
                        ${escapeHTML(phone)}
                        `
                        :
                        ""
                    }

                    ${
                        hours
                        ?
                        `
                        <br><br>
                        🕒
                        ${escapeHTML(hours)}
                        `
                        :
                        ""
                    }

                    <br><br>

                    <button
                        onclick="
                            openMapDirections(
                                ${facility.latitude},
                                ${facility.longitude}
                            )
                        "
                        style="
                            width:100%;
                            border:none;
                            background:#1769e0;
                            color:white;
                            padding:10px;
                            border-radius:8px;
                            cursor:pointer;
                            font-weight:bold;
                        "
                    >

                        📍 Get Directions

                    </button>

                </div>

            `);


            marker.addTo(
                careMap
            );


            healthcareMarkers.push(
                marker
            );

        }
    );


    /* =====================================================
       SAVE FACILITY DATA FOR RESULTS
    ===================================================== */

    healthcareMarkers.forEach(
        function(marker, index) {

            marker.displayIndex =
                index;

        }
    );


    /* =====================================================
       SHOW RESULTS
    ===================================================== */

    renderHealthcareResults(
        "all"
    );


    updateMapStatus(
        "📍 " +
        healthcareMarkers.length +
        " healthcare facilities found"
    );


    console.log(
        "Final facilities:",
        healthcareMarkers.length
    );

}


/* =========================================================
   ADDRESS
========================================================= */

function getAddress(tags) {

    let address = "";


    if (
        tags["addr:housenumber"]
    ) {

        address +=
            tags["addr:housenumber"];

    }


    if (
        tags["addr:street"]
    ) {

        if (address) {
            address += " ";
        }

        address +=
            tags["addr:street"];

    }


    if (
        tags["addr:city"]
    ) {

        if (address) {
            address += ", ";
        }

        address +=
            tags["addr:city"];

    }


    return address;

}


/* =========================================================
   CATEGORY DETECTION
========================================================= */

function getHealthcareCategory(tags) {

    if (

        tags.amenity === "pharmacy" ||

        tags.healthcare === "pharmacy"

    ) {

        return "pharmacy";

    }


    if (

        tags.amenity === "doctors" ||

        tags.healthcare === "doctor" ||

        tags.amenity === "dentist" ||

        tags.healthcare === "dentist"

    ) {

        return "doctor";

    }


    if (

        tags.healthcare === "laboratory" ||

        tags.healthcare === "medical_imaging" ||

        tags.healthcare === "sample_collection"

    ) {

        return "test";

    }


    if (

        tags.amenity === "hospital" ||

        tags.amenity === "clinic" ||

        tags.healthcare === "hospital" ||

        tags.healthcare === "clinic"

    ) {

        return "hospital";

    }


    return "hospital";

}


/* =========================================================
   FILTER HEALTHCARE
========================================================= */

function filterHealthcare(category) {

    if (!careMap) {

        updateMapStatus(
            "📍 Please find your location first."
        );

        return;

    }


    let visibleCount = 0;


    healthcareMarkers.forEach(
        function(marker) {

            const show =
                category === "all" ||
                marker.healthcareCategory ===
                category;


            if (show) {

                marker.addTo(
                    careMap
                );

                visibleCount++;

            }

            else {

                if (
                    careMap.hasLayer(
                        marker
                    )
                ) {

                    careMap.removeLayer(
                        marker
                    );

                }

            }

        }
    );


    /* =====================================================
       UPDATE RESULTS TOO
    ===================================================== */

    renderHealthcareResults(
        category
    );


    /* =====================================================
       UPDATE FILTER BUTTON
    ===================================================== */

    const buttons =
        document.querySelectorAll(
            "button"
        );


    buttons.forEach(
        function(button) {

            button.classList.remove(
                "active"
            );


            const text =
                button.textContent
                    .toLowerCase()
                    .trim();


            let active = false;


            if (
                category === "all" &&
                text === "all"
            ) {

                active = true;

            }


            else if (
                category === "hospital" &&
                text.includes("hospital")
            ) {

                active = true;

            }


            else if (
                category === "doctor" &&
                text.includes("doctor")
            ) {

                active = true;

            }


            else if (
                category === "pharmacy" &&
                text.includes("pharm")
            ) {

                active = true;

            }


            else if (
                category === "test" &&
                text.includes("test")
            ) {

                active = true;

            }


            if (active) {

                button.classList.add(
                    "active"
                );

            }

        }
    );


    const labels = {

        all:
            "📍 Showing all healthcare facilities",

        hospital:
            "🏥 Showing hospitals & clinics",

        doctor:
            "🩺 Showing doctors",

        pharmacy:
            "💊 Showing pharmacies",

        test:
            "🧪 Showing diagnostic services"

    };


    updateMapStatus(
        labels[category] +
        " • " +
        visibleCount +
        " found"
    );

}


/* =========================================================
   RESULTS PANEL
========================================================= */

function renderHealthcareResults(
    category
) {

    const container =
        document.getElementById(
            "healthcareResults"
        );


    const countElement =
        document.getElementById(
            "resultsCount"
        );


    if (!container) {

        console.log(
            "Results container not found."
        );

        return;

    }


    const filtered =
        healthcareMarkers.filter(
            function(marker) {

                return (
                    category === "all" ||
                    marker.healthcareCategory ===
                    category
                );

            }
        );


    if (countElement) {

        countElement.innerHTML =
            filtered.length +
            " facilities";

    }


    if (filtered.length === 0) {

        container.innerHTML = `

            <div class="results-empty">

                <div class="empty-icon">
                    🔍
                </div>

                <h4>
                    No facilities found
                </h4>

                <p>
                    Try another healthcare category.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    /*
       Show nearest 10
    */

    const visibleResults =
        filtered.slice(0, 10);


    visibleResults.forEach(
        function(marker) {

            const data =
                marker.facilityData;


            let icon = "🏥";

            let type =
                "Hospital / Clinic";


            if (
                marker.healthcareCategory ===
                "pharmacy"
            ) {

                icon = "💊";

                type = "Pharmacy";

            }


            else if (
                marker.healthcareCategory ===
                "doctor"
            ) {

                icon = "🩺";

                type =
                    "Doctor / Clinic";

            }


            else if (
                marker.healthcareCategory ===
                "test"
            ) {

                icon = "🧪";

                type =
                    "Diagnostic / Test";

            }


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "healthcare-result-card";


            card.innerHTML = `

                <div class="result-info">

                    <div class="result-icon">
                        ${icon}
                    </div>

                    <div class="result-name">
                        ${escapeHTML(
                            data.name
                        )}
                    </div>

                    <div class="result-type">
                        ${type}
                    </div>

                    <div class="result-distance">
                        📍
                        ${data.distance.toFixed(1)}
                        km away
                    </div>

                </div>


                <button
                    class="result-direction-btn"
                >
                    Directions
                </button>

            `;


            const directionButton =
                card.querySelector(
                    ".result-direction-btn"
                );


            directionButton.addEventListener(
                "click",
                function(event) {

                    event.stopPropagation();


                    openMapDirections(
                        data.latitude,
                        data.longitude
                    );

                }
            );


            card.addEventListener(
                "click",
                function() {

                    careMap.setView(
                        [
                            data.latitude,
                            data.longitude
                        ],
                        16
                    );


                    marker.openPopup();

                }
            );


            container.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   DISTANCE
========================================================= */

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const R = 6371;


    const dLat =
        toRadians(
            lat2 - lat1
        );


    const dLon =
        toRadians(
            lon2 - lon1
        );


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(
            toRadians(lat1)
        ) *

        Math.cos(
            toRadians(lat2)
        ) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return R * c;

}


/* =========================================================
   RADIANS
========================================================= */

function toRadians(
    degrees
) {

    return (
        degrees *
        Math.PI /
        180
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    text
) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   DIRECTIONS
========================================================= */

function openMapDirections(
    latitude,
    longitude
) {

    const url =
        "https://www.google.com/maps/dir/?api=1" +
        "&destination=" +
        latitude +
        "," +
        longitude;


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   ANIMATED BACKGROUND
========================================================= */

const canvas =
    document.getElementById(
        "backgroundCanvas"
    );


if (canvas) {

    const ctx =
        canvas.getContext("2d");


    let particles = [];


    function resizeCanvas() {

        canvas.width =
            window.innerWidth;

        canvas.height =
            window.innerHeight;

    }


    resizeCanvas();


    window.addEventListener(
        "resize",
        resizeCanvas
    );


    for (
        let i = 0;
        i < 60;
        i++
    ) {

        particles.push({

            x:
                Math.random() *
                canvas.width,

            y:
                Math.random() *
                canvas.height,

            size:
                Math.random() * 2 + 1,

            speedX:
                (Math.random() - 0.5) * 0.4,

            speedY:
                (Math.random() - 0.5) * 0.4,

            opacity:
                Math.random() * 0.5 + 0.1

        });

    }


    function animateBackground() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        particles.forEach(
            function(particle) {

                particle.x +=
                    particle.speedX;

                particle.y +=
                    particle.speedY;


                if (
                    particle.x < 0
                ) {

                    particle.x =
                        canvas.width;

                }


                if (
                    particle.x >
                    canvas.width
                ) {

                    particle.x = 0;

                }


                if (
                    particle.y < 0
                ) {

                    particle.y =
                        canvas.height;

                }


                if (
                    particle.y >
                    canvas.height
                ) {

                    particle.y = 0;

                }


                ctx.beginPath();


                ctx.arc(
                    particle.x,
                    particle.y,
                    particle.size,
                    0,
                    Math.PI * 2
                );


                ctx.fillStyle =
                    `rgba(
                        23,
                        105,
                        224,
                        ${particle.opacity}
                    )`;


                ctx.fill();

            }
        );


        requestAnimationFrame(
            animateBackground
        );

    }


    animateBackground();

}


/* =========================================================
   READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "✅ CareReach is ready."
        );

    }
);
/* =========================================================
   SMART CARE INTENT
========================================================= */

function understandNeed() {

    const input =
        document.getElementById("needInput");

    const result =
        document.getElementById("aiResult");


    if (!input || !result) {
        return;
    }


    const text =
        input.value
            .toLowerCase()
            .trim();


    if (!text) {

        result.innerHTML =
            "💡 Tell me what healthcare service you need.";

        return;
    }


    let category = null;
    let message = "";


    /* MEDICINES */

    if (
        text.includes("medicine") ||
        text.includes("medicines") ||
        text.includes("tablet") ||
        text.includes("drug") ||
        text.includes("pharmacy") ||
        text.includes("medical store")
    ) {

        category = "pharmacy";

        message =
            "💊 We understood: You need medicines.";

    }


    /* DOCTOR */

    else if (
        text.includes("doctor") ||
        text.includes("physician") ||
        text.includes("dentist") ||
        text.includes("dental") ||
        text.includes("eye")
    ) {

        category = "doctor";

        message =
            "🩺 We understood: You need a doctor.";

    }


    /* TEST */

    else if (
        text.includes("test") ||
        text.includes("blood") ||
        text.includes("x-ray") ||
        text.includes("xray") ||
        text.includes("scan") ||
        text.includes("diagnostic")
    ) {

        category = "test";

        message =
            "🧪 We understood: You need a medical test.";

    }


    /* HOSPITAL */

    else if (
        text.includes("hospital") ||
        text.includes("clinic") ||
        text.includes("admission")
    ) {

        category = "hospital";

        message =
            "🏥 We understood: You need a hospital.";

    }


    /* UNKNOWN */

    else {

        result.innerHTML =
            "💡 Try words like doctor, medicines, hospital or blood test.";

        return;
    }


    result.innerHTML =
        message +
        " Finding nearby options...";


    if (!careMap) {

        result.innerHTML =
            message +
            "<br>📍 Please find your location first.";

        return;
    }


    filterHealthcare(category);


    setTimeout(
        function() {

            const mapSection =
                document.getElementById(
                    "map-section"
                );

            if (mapSection) {

                mapSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        },
        200
    );

}


/* =========================================================
   QUICK NEED BUTTONS
========================================================= */

function quickNeed(category) {

    const input =
        document.getElementById("needInput");


    const examples = {

        doctor:
            "I need a doctor",

        pharmacy:
            "I need medicines",

        test:
            "I need a blood test",

        hospital:
            "I need a hospital"

    };


    if (input) {

        input.value =
            examples[category] || "";

    }


    understandNeed();

}