
  let modalMap, modalMarker;
  
  function initModalMap(lat, lng) {
    if (!modalMap) {
      modalMap = L.map('modalMap').setView([lat, lng], 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(modalMap);
      
      modalMarker = L.marker([lat, lng], { draggable: true }).addTo(modalMap);
      
      modalMarker.on('dragend', function(e) {
        const pos = modalMarker.getLatLng();
        document.getElementById('locLat').value = pos.lat;
        document.getElementById('locLng').value = pos.lng;
      });
      
      modalMap.on('click', function(e) {
        modalMarker.setLatLng(e.latlng);
        document.getElementById('locLat').value = e.latlng.lat;
        document.getElementById('locLng').value = e.latlng.lng;
      });
    } else {
      modalMap.setView([lat, lng], 13);
      modalMarker.setLatLng([lat, lng]);
    }
    setTimeout(() => modalMap.invalidateSize(), 200);
  }

  function searchModalAddress() {
    const q = document.getElementById('locAddress').value;
    if (!q) return showToast('Enter an address to search', 'warning');
    
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => {
        if(data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          document.getElementById('locLat').value = lat;
          document.getElementById('locLng').value = lng;
          initModalMap(lat, lng);
          showToast('Location found', 'success');
        } else {
          showToast('Location not found', 'error');
        }
      })
      .catch(e => showToast('Search failed', 'error'));
  }

  function openLocModal(id = '', name = '', address = '', emp = '', rad = '', lat = 37.7749, lng = -122.4194) {
    document.getElementById('locId').value = id;
    document.getElementById('locName').value = name;
    document.getElementById('locAddress').value = address;
    document.getElementById('locEmp').value = emp;
    document.getElementById('locRad').value = rad;
    document.getElementById('locLat').value = lat;
    document.getElementById('locLng').value = lng;
    document.getElementById('locModalTitle').innerText = id ? 'Edit Location' : 'Add Location';
    document.getElementById('locModal').classList.add('open');
    
    initModalMap(parseFloat(lat), parseFloat(lng));
  }
  
  function closeLocModal() {
    document.getElementById('locModal').classList.remove('open');
  }

  function saveLocation() {
    const id = document.getElementById('locId').value;
    const name = document.getElementById('locName').value;
    const address = document.getElementById('locAddress').value;
    const emp = parseInt(document.getElementById('locEmp').value) || 0;
    const rad = document.getElementById('locRad').value;
    const lat = parseFloat(document.getElementById('locLat').value);
    const lng = parseFloat(document.getElementById('locLng').value);
    
    if(!name) return showToast('Name is required', 'error');
    
    let locObj;
    if (id) {
      locObj = window.locationsData.find(l => l.id === id);
      if (locObj) {
        locObj.name = name; locObj.address = address; locObj.emp = emp; locObj.rad = rad;
        locObj.lat = lat; locObj.lng = lng;
        
        const card = document.getElementById('card-' + id);
        if (card) {
          card.querySelector('.loc-name-text').innerText = name;
          card.querySelector('.loc-addr-text').innerHTML = `<svg style="color: #10b981; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${address}`;
          const statVals = card.querySelectorAll('.stat-val');
          if(statVals.length >= 3) {
            statVals[0].innerText = emp;
            statVals[2].innerText = rad;
          }
        }
        showToast('Location updated', 'success');
      }
    } else {
      const newId = 'LOC' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      locObj = {
        name, id: newId, address, emp, act: 0, rad, cap: '0%', pct: 0, active: true, lat, lng, footer: 'New'
      };
      window.locationsData.push(locObj);
      
      const activeStyle = `background: rgba(34,197,94,0.1); color: #16a34a; border: 1px solid rgba(34,197,94,0.2);`;
      const html = `
      <div class="loc-grid-card active-card" id="card-${newId}" data-active="true">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
          <div style="display: flex; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--bg-page); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: #10b981;">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div>
              <div class="loc-name-text" style="font-size: 14px; font-weight: 700; color: var(--text-primary);">${name}</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Office - ${newId}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span id="badge-${newId}" style="font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; ${activeStyle}">Active</span>
            <div class="loc-menu-wrap" style="position: relative;">
              <div class="loc-menu-trigger" style="color: var(--text-muted); cursor: pointer; padding: 0 4px;" onclick="toggleLocMenu(event, 'menu-\${newId}')">⋮</div>
              <div id="menu-\${newId}" class="loc-dropdown" style="display: none; position: absolute; right: 0; top: 100%; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 100; min-width: 120px; overflow: hidden; margin-top: 4px;">
                <div style="padding: 10px 12px; font-size: 12.5px; cursor: pointer; color: var(--text-primary);" class="loc-menu-item" onclick="openLocModal('\${newId}', '\${name}', '\${address}', '\${emp}', '\${rad}', \${lat}, \${lng})">Edit</div>
                <div style="padding: 10px 12px; font-size: 12.5px; cursor: pointer; color: var(--text-primary);" class="loc-menu-item" onclick="toggleLocStatus('\${newId}')">Change Status</div>
                <div style="padding: 10px 12px; font-size: 12.5px; cursor: pointer; color: #ef4444; border-top: 1px solid var(--border);" class="loc-menu-item" onclick="deleteLoc('\${newId}')">Delete</div>
              </div>
            </div>
          </div>
        </div>
        <div class="loc-addr-text" style="display: flex; align-items: flex-start; gap: 8px; font-size: 11px; color: var(--text-secondary); margin-bottom: 20px;">
          <svg style="color: #10b981; flex-shrink: 0;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          \${address}
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); text-align: center; margin-bottom: 24px;">
          <div>
            <div class="stat-val" style="font-size: 16px; font-weight: 700; color: var(--text-primary);">\${emp}</div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Employees</div>
          </div>
          <div style="border-left: 1px solid var(--border); border-right: 1px solid var(--border);">
            <div class="stat-val" style="font-size: 16px; font-weight: 700; color: #16a34a;">0</div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Active Now</div>
          </div>
          <div>
            <div class="stat-val" style="font-size: 16px; font-weight: 700; color: var(--text-primary);">\${rad}</div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Radius</div>
          </div>
        </div>
        <div style="margin-top: auto; padding-top: 16px; border-top: 1px dashed var(--border);">
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-secondary); margin-bottom: 8px;">
            <span>Capacity</span>
            <span>0%</span>
          </div>
          <div style="height: 4px; background: var(--bg-page); border-radius: 2px; overflow: hidden; margin-bottom: 12px;">
            <div style="height: 100%; background: #22c55e; width: 0%; border-radius: 2px;"></div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; font-size: 10px; color: var(--text-muted);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="10" height="10"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
            New
          </div>
        </div>
      </div>\`;
      document.getElementById('locationsGrid').insertAdjacentHTML('beforeend', html);
      showToast('Location added', 'success');
    }
    
    if(window.renderMapMarkers) window.renderMapMarkers();
    closeLocModal();
  }

  function toggleLocStatus(id) {
    const card = document.getElementById('card-' + id);
    if (!card) return;
    const isActive = card.getAttribute('data-active') === 'true';
    const newStatus = !isActive;
    card.setAttribute('data-active', newStatus);
    
    if (newStatus) {
      card.classList.add('active-card');
      card.querySelector('.loc-menu-wrap').previousElementSibling.outerHTML = `<span id="badge-${id}" style="font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; background: rgba(34,197,94,0.1); color: #16a34a; border: 1px solid rgba(34,197,94,0.2);">Active</span>`;
    } else {
      card.classList.remove('active-card');
      card.querySelector('.loc-menu-wrap').previousElementSibling.outerHTML = `<span id="badge-${id}" style="font-size: 10px; font-weight: 700; padding: 4px 8px; border-radius: 4px; background: var(--bg-page); color: var(--text-secondary); border: 1px solid var(--border);">Inactive</span>`;
    }
    showToast('Status changed', 'success');
  }

  function deleteLoc(id) {
    const card = document.getElementById('card-' + id);
    if (card) {
      card.remove();
      showToast('Location deleted', 'success');
    }
  }
  function toggleLocMenu(e, id) {
    e.stopPropagation();
    // Close all other menus first
    document.querySelectorAll('.loc-dropdown').forEach(m => {
      if (m.id !== id) m.style.display = 'none';
    });
    const menu = document.getElementById(id);
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  }

  // Close menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.loc-menu-wrap')) {
      document.querySelectorAll('.loc-dropdown').forEach(m => m.style.display = 'none');
    }
  });
