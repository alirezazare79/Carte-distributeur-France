let allDistributeurs = [];

// Your existing DOMContentLoaded listener and fetchDepartments function...

function parseZone(zone) {
    // Split the zones by ' - ' and then by spaces, assuming the JSON is in the format provided
    return zone.split(' - ').flatMap(z => z.split(' '));
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map and set its view to our chosen geographical coordinates and a zoom level:
    var mymap = L.map('mapid').setView([46.2276, 2.2137], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    // Fetch the distributor data and the GeoJSON for the departments
    fetch('data.json').then(response => response.json()).then(distributors => {
        allDistributeurs = distributors;
        fetch('regions.geojson').then(response => response.json()).then(geojsonData => {
            L.geoJson(geojsonData, {
                style: function (feature) {
                    // Set the style of the department based on whether it has a distributor
                    const departmentCode = feature.properties.code.padStart(2, '0');
                    const hasDistributor = allDistributeurs.some(distributor =>
                        parseZone(distributor.Zone).includes(departmentCode)
                    );
                    return {
                        fillColor: hasDistributor ? 'green' : 'red',
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.7
                    };
                },
                onEachFeature: function (feature, layer) {
                    const departmentCode = feature.properties.code.padStart(2, '0');
                    const distributor = allDistributeurs.find(distributor =>
                        parseZone(distributor.Zone).includes(departmentCode)
                    );

                    if (distributor) {
                        // Construct and bind the popup content for the distributor
                        const popupContent = `
                            <strong>${distributor.Distributeur}</strong><br/>
                            ${distributor.Adresse}<br/>
                            Responsable: ${distributor.Responsable}<br/>
                            Email: ${distributor.mail}<br/>
                            Téléphone: ${distributor.Téléphone}
                        `;
                        layer.bindPopup(popupContent);
                    }
                    // Bind click event to each department if you want to perform additional actions
                    layer.on('click', function () {
                        // Additional click functionality if needed
                    });
                }
            }).addTo(mymap);
        });
    });
    fetchDepartments();
    fetchDistributeurs();
});


function fetchDepartments() {
    fetch('https://geo.api.gouv.fr/departements')
        .then(response => response.json())
        .then(data => {
            allDepartments = data; // Store the departments data
            displayDepartments(allDepartments); // Display all departments initially
        })
        .catch(error => console.error('Error fetching department data:', error));
}


function displayDepartments(departments) {
    const container = document.getElementById('departments');
    container.innerHTML = '';
    departments.forEach(dept => {
        const div = document.createElement('div');
        div.className = 'department';
        div.innerHTML = `<h2>${dept.nom}</h2><p>Code: ${dept.code}</p>`;
        div.onclick = () => showDistributorInfo(dept.code);
        container.appendChild(div);
    });
}

function fetchDistributeurs() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log('Distributeurs:', data); // Check distributor data
            allDistributeurs = data;
        })
        .catch(error => console.error('Error fetching distributor data:', error));
}

function showDistributorInfo(deptCode) {
    console.log(`Department clicked: ${deptCode}`);

    const formattedDeptCode = deptCode.padStart(2, '0');
    console.log(`Formatted Department Code: ${formattedDeptCode}`);

    // Find a distributor that covers the clicked department
    const distributor = allDistributeurs.find(d => parseZone(d.Zone).includes(formattedDeptCode));
    
    const distributorInfo = document.getElementById('distributorInfo');
    const distributorModal = document.getElementById('distributorModal');
    const closeBtn = document.getElementsByClassName("close-btn")[0];

    if (distributor) {
        console.log(`Found Distributor for Department ${formattedDeptCode}:`, distributor);
        // Constructing the information display
        let infoHtml = `<h2>${distributor.Distributeur}</h2>`;
        infoHtml += `<p>Adresse: ${distributor.Adresse}</p>`;
        infoHtml += `<p>Zone: ${distributor.Zone}</p>`;
        infoHtml += `<p>Responsable: ${distributor.Responsable}</p>`;
        infoHtml += `<p>Email: ${distributor.mail}</p>`;
        infoHtml += `<p>Téléphone: ${distributor.Téléphone}</p>`;
        infoHtml += `<p>Journée découverte: ${distributor["Journée découverte"]}</p>`;
        infoHtml += `<p>Date: ${distributor.Date}</p>`;
        infoHtml += `<p>Lieu: ${distributor.lieu}</p>`;
        infoHtml += `<p>Dentiste référent: ${distributor["Dentiste référent?"]}</p>`;

        distributorInfo.innerHTML = infoHtml;
        distributorModal.style.display = "block"; // Show the modal

        // When the user clicks on <span> (x), close the modal
        closeBtn.onclick = function() {
            distributorModal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == distributorModal) {
                distributorModal.style.display = "none";
            }
        }
    } else {
        console.log(`No Distributor Found for Department ${formattedDeptCode}`);
        distributorModal.style.display = "none"; // Hide the modal if no distributor found
    }
}




function parseZone(zone) {
    return zone.split(' - ').flatMap(z => z.split(' '));

}

const distributor = allDistributeurs.find(d => {
    const zones = parseZone(d.Zone);
    const match = zones.includes(deptCode);
    if (match) {
        console.log(`Matching distributor for department ${deptCode}:`, d);
    }
    return match;
});


function searchDepartments() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredDepartments = allDepartments.filter(dept =>
        dept.nom.toLowerCase().includes(searchTerm) ||
        dept.code.includes(searchTerm)
    );
    displayDepartments(filteredDepartments);
}

function filterDepartments(filterType) {
    let filteredDepartments;

    if (filterType === 'has') {
        // Filter departments that have a distributor
        filteredDepartments = allDepartments.filter(dept =>
            allDistributeurs.some(d => parseZone(d.Zone).includes(dept.code))
        );
    } else if (filterType === 'none') {
        // Filter departments that do not have a distributor
        filteredDepartments = allDepartments.filter(dept =>
            !allDistributeurs.some(d => parseZone(d.Zone).includes(dept.code))
        );
    } else {
        // No filter, or an unrecognized filter type was provided
        filteredDepartments = allDepartments;
    }

    displayDepartments(filteredDepartments);
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the map and set its view to our chosen geographical coordinates and a zoom level:
    var mymap = L.map('mapid').setView([46.2276, 2.2137], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(mymap);

    // Fetch the distributor data
    fetch('data.json')
        .then(response => response.json())
        .then(distributors => {
            fetch('regions.geojson') 
                .then(response => response.json())
                .then(geojsonData => {
                    // Add GeoJSON layer to the map once the data is loaded
                    L.geoJson(geojsonData, {
                        onEachFeature: onEachFeature(distributors)
                    }).addTo(mymap);
                });
        });
});

function onEachFeature(distributors) {
    return function(feature, layer) {
        const hasDistributor = distributors.some(d => feature.properties.code === parseCodeFromZone(d.Zone));

        // Bind popup with distributor info if it exists
        if (hasDistributor) {
            const distributor = distributors.find(d => feature.properties.code === parseCodeFromZone(d.Zone));
            const popupContent = `<b>${distributor.Distributeur}</b><br>Responsable: ${distributor.Responsable}`;
            layer.bindPopup(popupContent);
        }

        // Set the style of the department based on whether it has a distributor
        layer.setStyle({
            fillColor: hasDistributor ? 'green' : 'red',
            weight: 2,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        });
    };
}

function parseCodeFromZone(zone) {
    return zone.split(/[\s-]+/)[0]; 
}


fetch('france_departments.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJson(data, {
            style: function (feature) {
                // Default style for all departments
                return {
                    fillColor: 'red', // Default fill color
                    weight: 2,
                    opacity: 1,
                    color: 'white', // Border color
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function (feature, layer) {
                // Bind click event to each department
                layer.on('click', function () {
                    showDistributorInfo(feature.properties.code);
                });

                // Set hover styles
                layer.on('mouseover', function(e) {
                    e.target.setStyle({
                        fillColor: 'green', // Fill color when hovered
                        fillOpacity: 0.9 
                    });
                });

                layer.on('mouseout', function(e) {
                    e.target.setStyle({
                        fillColor: 'red', // Reset to default fill color when not hovered
                        fillOpacity: 0.7 //  Reset the opacity when not hovered
                    });
                });

                // Bind popup with distributor info if it exists
                const departmentCode = feature.properties.code.padStart(2, '0');
                const distributor = allDistributeurs.find(d => parseZone(d.Zone).includes(departmentCode));
                if (distributor) {
                    const popupContent = `
                        <strong>${distributor.Distributeur}</strong><br/>
                        ${distributor.Adresse}<br/>
                        Responsable: ${distributor.Responsable}<br/>
                        Email: ${distributor.mail}<br/>
                        Téléphone: ${distributor.Téléphone}
                    `;
                    layer.bindPopup(popupContent);
                }
            }
        }).addTo(mymap);
    });

