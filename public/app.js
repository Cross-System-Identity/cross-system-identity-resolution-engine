﻿﻿﻿﻿﻿// Cross-System Identity Resolution Engine — Enterprise Portal JS
// Enhanced: robust error handling, cross-system scoring, dynamic citizen registry
// v2.0: Added smooth animations, loading states, and enhanced visual feedback

document.addEventListener('DOMContentLoaded', () => {
    let apiKey = localStorage.getItem('cs_identity_api_key') || 'MODULE4_SECRET_KEY_2026';
    let allPersonsData = [];
    let allIdentitiesData = [];
    let allAuditLogs = [];

    // API availability flag
    let apiReady = false;

    // Loading state management
    let isLoading = false;

    // Create loading overlay
    function createLoadingOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'loadingOverlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div style="text-align: center; color: white;">
                <div style="margin-bottom: 16px;">
                    <div class="loading-spinner"></div>
                </div>
                <div style="font-size: 1.1rem; font-weight: 500;">Processing request, please wait...</div>
                <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-top: 8px;">Do not refresh the page</div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    // Create toast notification
    function createToast() {
        const toast = document.createElement('div');
        toast.id = 'toastNotification';
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            padding: 14px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            font-size: 0.9rem;
            z-index: 1100;
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            transform: translateY(20px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            max-width: 360px;
        `;
        document.body.appendChild(toast);
        return toast;
    }

    function showToast(message, type = 'info') {
        const toast = document.getElementById('toastNotification');
        if (!toast) return;

        const colors = {
            success: '#059669',
            error: '#dc2626',
            warning: '#f59e0b',
            info: '#2563eb'
        };

        toast.textContent = message;
        toast.style.background = colors[type] || colors.info;
        toast.style.opacity = '1';
        toast.style.visibility = 'visible';
        toast.style.transform = 'translateY(0)';

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.visibility = 'hidden';
            toast.style.transform = 'translateY(20px)';
        }, 3500);
    }

    // Enhanced tooltip functionality
    function enhanceTooltips() {
        // Stepper tooltip
        const stepItems = document.querySelectorAll('.step-item');
        stepItems.forEach(item => {
            const stepNumber = item.querySelector('.step-icon');
            if (stepNumber) {
                stepNumber.title = `Step ${stepNumber.textContent}`;
            }
        });

        // Progress bar tooltips
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const parentRow = bar.closest('.breakdown-row');
            if (parentRow) {
                const meta = parentRow.querySelector('.breakdown-meta');
                if (meta) {
                    bar.title = 'Progress: ' + bar.style.width;
                }
            }
        });
    }

    const loadingOverlay = createLoadingOverlay();
    createToast();

    function showLoading(message = 'Processing request, please wait...') {
        if (isLoading) return;
        isLoading = true;
        loadingOverlay.classList.add('active');
        loadingOverlay.querySelector('div').innerHTML = `
            <div style="margin-bottom: 16px;">
                <div class="loading-spinner"></div>
            </div>
            <div style="font-size: 1.1rem; font-weight: 500;">${message}</div>
            <div style="font-size: 0.9rem; color: rgba(255,255,255,0.7); margin-top: 8px;">Do not refresh the page</div>
        `;
        // Disable interactive elements
        document.querySelectorAll('.btn-action, .nav-tab').forEach(el => {
            el.style.pointerEvents = 'none';
        });
    }

    function hideLoading() {
        if (!isLoading) return;
        isLoading = false;
        loadingOverlay.classList.remove('active');
        // Re-enable interactive elements
        document.querySelectorAll('.btn-action, .nav-tab').forEach(el => {
            el.style.pointerEvents = 'auto';
        });
    }

    // Navigation Tab Switching
    const navTabs = document.querySelectorAll('.nav-tab');
    const viewPanels = document.querySelectorAll('.view-panel');

    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            if (isLoading) return;
            navTabs.forEach(t => t.classList.remove('active'));
            viewPanels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetView = tab.getAttribute('data-view');
            const targetPanel = document.getElementById(targetView);
            if (targetPanel) targetPanel.classList.add('active');

            if (targetView === 'citizensView') renderCitizenRegistry();
            if (targetView === 'auditView') fetchAuditExplorerLogs();
        });
    });

    // Resolution stepper: users enter exactly two fictional identity values.
    const sourceIdentityType = document.getElementById('sourceIdentityType');
    const sourceIdentityValue = document.getElementById('sourceIdentityValue');
    const targetIdentityType = document.getElementById('targetIdentityType');
    const targetIdentityValue = document.getElementById('targetIdentityValue');
    const executeMatchBtn = document.getElementById('executeMatchBtn');
    const stNode3 = document.getElementById('stNode3');
    const vBox = document.getElementById('vBox');
    const vTitle = document.getElementById('vTitle');
    const vDesc = document.getElementById('vDesc');

    const txtToken = document.getElementById('txtToken');
    const barToken = document.getElementById('barToken');
    const txtName = document.getElementById('txtName');
    const barName = document.getElementById('barName');
    const txtDob = document.getElementById('txtDob');
    const barDob = document.getElementById('barDob');
    const txtIdVal = document.getElementById('txtIdVal');
    const barIdVal = document.getElementById('barIdVal');
    const txtZkp = document.getElementById('txtZkp');
    const barZkp = document.getElementById('barZkp');

    // Keep the separate Citizen Registry populated; this data is not used by the stepper.
    loadDirectoryData();
    async function loadDirectoryData() {
        try {
            const [peopleResponse, identitiesResponse] = await Promise.all([
                fetch('/api/persons'), fetch('/api/identities')
            ]);
            if (peopleResponse.ok) {
                const people = await peopleResponse.json();
                allPersonsData = people.persons || [];
            }
            if (identitiesResponse.ok) {
                const identities = await identitiesResponse.json();
                allIdentitiesData = identities.identities || [];
                apiReady = true;
            }
            renderCitizenRegistry();
        } catch (error) {
            console.warn('Could not load the separate registry data:', error.message);
        }
    }

    executeMatchBtn.addEventListener('click', async () => {
        const sourceType = sourceIdentityType.value;
        const sourceValue = sourceIdentityValue.value.trim().toUpperCase();
        const targetType = targetIdentityType.value;
        const targetValue = targetIdentityValue.value.trim().toUpperCase();
        const idPattern = /^[A-Z]+_TEST_[0-9]{3}$/;

        if (!sourceValue || !targetValue) {
            showToast('Enter both fictional test IDs.', 'error');
            return;
        }
        if (!idPattern.test(sourceValue) || !idPattern.test(targetValue)) {
            showToast('Use the format SYSTEM_TEST_001.', 'error');
            return;
        }
        if (!sourceValue.startsWith(`${sourceType}_TEST_`) ||
            !targetValue.startsWith(`${targetType}_TEST_`)) {
            showToast('Each ID must match its selected identity system.', 'error');
            return;
        }

        stNode3.classList.add('active');
        vBox.className = 'verdict-box';
        vTitle.textContent = 'CHECKING';
        vDesc.textContent = 'Checking the two fictional identifiers…';
        executeMatchBtn.disabled = true;

        try {
            const response = await fetch('/api/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
                body: JSON.stringify({
                    source_identity_type: sourceType,
                    source_identity_value: sourceValue,
                    target_identity_type: targetType,
                    target_identity_value: targetValue
                })
            });
            let data = null;
            try {
                data = await response.json();
            } catch (jsonErr) {
                // response is not JSON
            }
            if (!response.ok || !data || !data.success) {
                throw new Error((data && data.message) || `Server error (HTTP ${response.status}). Check server database logs.`);
            }
            vBox.className = `verdict-box ${data.match_result}`;
            vTitle.textContent = data.match_result;
            vDesc.textContent = `${data.confidence_score}% confidence. ${data.description || ''}`;

            if (data.scoring && data.scoring.breakdown) {
                renderBreakdownBars(data.scoring.breakdown, sourceType, targetType);
            }
        } catch (error) {
            vBox.className = 'verdict-box';
            vTitle.textContent = 'CHECK FAILED';
            vDesc.textContent = error.message || 'Could not check these identifiers.';
        } finally {
            executeMatchBtn.disabled = false;
            await fetchAuditExplorerLogs();
        }
    });

    function resetProgressBars() {
        const bars = [barToken, barName, barDob, barIdVal, barZkp];
        const texts = [txtToken, txtName, txtDob, txtIdVal, txtZkp];
        bars.forEach(b => { if (b) { b.style.width = '0%'; b.classList.remove('animate-in'); } });
        texts.forEach(t => { if (t) t.textContent = '0.00 / 0.00'; });
    }

    function renderBreakdownBars(bd, srcType, tgtType) {
        const isCross = (srcType && tgtType && srcType.toUpperCase() !== tgtType.toUpperCase());
        const maxExact = isCross ? 0 : 40;
        const maxName = isCross ? 50 : 20;
        const maxDob = isCross ? 40 : 15;
        const maxIdVal = isCross ? 5 : 15;
        const maxZkp = isCross ? 5 : 10;

        updateScoringLabels(isCross);

        updateBar(txtToken, barToken, bd.exactTokenScore || 0, maxExact);
        updateBar(txtName, barName, bd.nameScore || 0, maxName);
        updateBar(txtDob, barDob, bd.dobScore || 0, maxDob);
        updateBar(txtIdVal, barIdVal, bd.identityValueScore || 0, maxIdVal);
        updateBar(txtZkp, barZkp, bd.zkpScore || 0, maxZkp);
    }

    function updateScoringLabels(isCross) {
        const lblToken = document.getElementById('lblToken');
        const lblName = document.getElementById('lblName');
        const lblDob = document.getElementById('lblDob');
        const lblIdVal = document.getElementById('lblIdVal');
        const lblZkp = document.getElementById('lblZkp');

        if (isCross) {
            if (lblToken) lblToken.textContent = 'Exact PPRL Token Match (0%)';
            if (lblName) lblName.textContent = 'Person Name Similarity (50%)';
            if (lblDob) lblDob.textContent = 'Date of Birth Match (40%)';
            if (lblIdVal) lblIdVal.textContent = 'Identity Value Similarity (5%)';
            if (lblZkp) lblZkp.textContent = 'Zero-Knowledge Proof (ZKP) Bonus (5%)';
        } else {
            if (lblToken) lblToken.textContent = 'Exact PPRL Token Match (40%)';
            if (lblName) lblName.textContent = 'Person Name Similarity (20%)';
            if (lblDob) lblDob.textContent = 'Date of Birth Match (15%)';
            if (lblIdVal) lblIdVal.textContent = 'Identity Value Similarity (15%)';
            if (lblZkp) lblZkp.textContent = 'Zero-Knowledge Proof (ZKP) Bonus (10%)';
        }
    }

    function updateBar(txtElem, barElem, val, max) {
        if (!txtElem || !barElem) return;
        txtElem.textContent = `${val.toFixed(2)} / ${max.toFixed(2)}`;
        const pct = max > 0 ? (val / max) * 100 : 0;
        const clampedPct = Math.min(Math.max(pct, 0), 100);
        barElem.style.setProperty('--target-width', `${clampedPct}%`);
        barElem.style.width = `${clampedPct}%`;
        barElem.classList.add('animate-in');
    }

    // VIEW 3: CITIZEN REGISTRY
    const badgeMap = {
        'PHONE': 'badge-blue',
        'ABHA': 'badge-green',
        'AADHAAR': 'badge-purple',
        'DIGILOCKER': 'badge-amber',
        'EMAIL': 'badge-teal',
        'PAN': 'badge-red',
        'VOTER': 'badge-indigo'
    };

    function renderCitizenRegistry(filterQuery = '') {
        const tbody = document.getElementById('citizensTableBody');
        if (!allPersonsData || allPersonsData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 2rem;">No citizen data available.</td></tr>';
            return;
        }

        const q = filterQuery.toLowerCase().trim();

        const filteredPersons = allPersonsData.filter(p => {
            if (!q) return true;
            const pidMatches = String(p.person_id).includes(q);
            const nameMatches = p.full_name.toLowerCase().includes(q);
            const userIdentities = allIdentitiesData.filter(i => Number(i.person_id) === Number(p.person_id));
            const idTypeMatches = userIdentities.some(i => (i.identity_type || '').toLowerCase().includes(q));
            return pidMatches || nameMatches || idTypeMatches;
        });

        if (filteredPersons.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 2rem;">No citizens found matching search criteria.</td></tr>';
            return;
        }

        tbody.innerHTML = filteredPersons.map(p => {
            const pIdentities = allIdentitiesData.filter(i => Number(i.person_id) === Number(p.person_id));

            let badgesHtml = '';
            let systemsText = '';

            if (pIdentities.length > 0) {
                const types = Array.from(new Set(pIdentities.map(i => i.identity_type)));
                badgesHtml = types.map(t => `<span class="badge-pill ${badgeMap[t] || 'badge-blue'}" style="margin-right: 4px;">${t}</span>`).join('');

                const systems = Array.from(new Set(pIdentities.map(i => i.source_system).filter(Boolean)));
                systemsText = systems.join(', ');
            } else {
                badgesHtml = `<span class="badge-pill badge-blue">PHONE</span>`;
                systemsText = 'Demo Mobile System';
            }

            return `
                <tr>
                    <td><strong>#${p.person_id}</strong></td>
                    <td><strong>${p.full_name}</strong></td>
                    <td>${p.date_of_birth || '1998-05-14'}</td>
                    <td>${badgesHtml}</td>
                    <td style="font-size: 0.85rem; color: #475569;">${systemsText}</td>
                </tr>
            `;
        }).join('');
    }

    const searchCitizenInput = document.getElementById('searchCitizenInput');
    if (searchCitizenInput) {
        searchCitizenInput.addEventListener('input', (e) => {
            renderCitizenRegistry(e.target.value);
        });
    }

    // VIEW 4: AUDIT EXPLORER
    async function fetchAuditExplorerLogs() {
        const btn = document.getElementById('refreshAuditViewBtn');
        const originalBtnText = btn?.innerHTML;
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner-inline"></span> Loading...';
        }

        try {
            const res = await fetch('/api/audit-logs?limit=100', {
                headers: { 'x-api-key': apiKey }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.success && data.logs) {
                allAuditLogs = data.logs;
                renderAuditTable(allAuditLogs);
                showToast('Audit logs refreshed successfully', 'success');
                return;
            }
        } catch (e) {
            console.log('Audit logs fetch error:', e.message);
            showToast('Failed to fetch audit logs - using cached data', 'warning');
        }

        if (allAuditLogs.length > 0) {
            renderAuditTable(allAuditLogs);
        } else {
            const tbody = document.getElementById('auditExplorerTableBody');
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:2rem;">No audit logs yet. Run a match to generate logs.</td></tr>';
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalBtnText;
        }
    }

    const clearAuditViewBtn = document.getElementById('clearAuditViewBtn');
    if (clearAuditViewBtn) {
        clearAuditViewBtn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to clear ALL audit logs? This action cannot be undone.')) return;
            try {
                await fetch('/api/audit-logs', {
                    method: 'DELETE',
                    headers: { 'x-api-key': apiKey }
                });
            } catch (e) {
                console.log('DB truncate failed, clearing local list only');
            }
            allAuditLogs = [];
            const tbody = document.getElementById('auditExplorerTableBody');
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:2rem;">All audit logs cleared. Numbering resets from #1 on next match.</td></tr>';
        });
    }

    function renderAuditTable(logs) {
        const tbody = document.getElementById('auditExplorerTableBody');
        if (!logs || logs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:2rem;">No audit logs found.</td></tr>';
            return;
        }
        tbody.innerHTML = logs.map(log => `
            <tr>
                <td><strong>#${log.audit_id || log.auditId || 'N/A'}</strong></td>
                <td>${new Date(log.action_timestamp || log.timestamp || Date.now()).toLocaleString()}</td>
                <td><span class="badge-pill badge-blue">${log.action_type || log.actionType || 'N/A'}</span></td>
                <td><code>${log.entity_type || log.entityType || 'N/A'}:${log.entity_id || log.entityId || 'N/A'}</code></td>
                <td>${log.performed_by || log.performedBy || 'N/A'}</td>
                <td style="font-family: monospace; font-size: 0.78rem; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || '')}">${typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || 'N/A')}</td>
            </tr>
        `).join('');
    }

});
