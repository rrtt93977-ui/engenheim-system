/* ============================================================
   ENGENHEIM — Shared Utilities v4 (app.js)
   Zero emojis. Professional toast, sidebar, FAQ, auth helpers.
   Arabic Localization.
   ============================================================ */

const AUTH = {
    getToken: () => localStorage.getItem('token'),
    getRole: () => localStorage.getItem('userRole'),
    getUsername: () => localStorage.getItem('currentEmpUser'),
    getName: () => localStorage.getItem('currentEmpName'),
    isLoggedIn: () => !!localStorage.getItem('token'),
    isAdmin: () => localStorage.getItem('userRole') === 'admin',
    logout() { localStorage.clear(); window.location.href = 'index.html'; },
    requireAuth(requiredRole) {
        if (!this.isLoggedIn()) { this.logout(); return false; }
        if (requiredRole && this.getRole() !== requiredRole) {
            showToast('ليس لديك صلاحية الوصول', 'error');
            setTimeout(() => this.logout(), 1200);
            return false;
        }
        return true;
    },
    async fetchWithAuth(url, options = {}) {
        options.headers = { ...options.headers, 'Authorization': 'Bearer ' + this.getToken() };
        const res = await fetch(url, options);
        if (res.status === 401 || res.status === 403) {
            showToast('انتهت الجلسة، يرجى تسجيل الدخول مجدداً', 'error');
            setTimeout(() => this.logout(), 1200);
            throw new Error('Unauthorized');
        }
        return res;
    }
};

function showToast(message, type) {
    type = type || 'success';
    var container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<span class="toast-dot"></span><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(function() {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-8px)';
        setTimeout(function() { toast.remove(); }, 250);
    }, 3500);
}

function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
    document.body.appendChild(btn);
    var sc = document.querySelector('.content-area');
    if (sc) {
        sc.addEventListener('scroll', function() { btn.classList.toggle('visible', sc.scrollTop > 300); });
        btn.addEventListener('click', function() { sc.scrollTo({ top: 0, behavior: 'smooth' }); });
    }
}

function initSidebar() {
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    var toggle = document.createElement('button');
    toggle.className = 'sidebar-toggle';
    toggle.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
    document.body.appendChild(toggle);
    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    function open() { sidebar.classList.add('open'); overlay.classList.add('active'); document.body.style.overflow = 'hidden'; }
    function close() { sidebar.classList.remove('open'); overlay.classList.remove('active'); document.body.style.overflow = ''; }
    toggle.addEventListener('click', open);
    overlay.addEventListener('click', close);
    sidebar.querySelectorAll('a').forEach(function(l) { l.addEventListener('click', close); });
}

function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var item = btn.closest('.faq-item');
            var wasOpen = item.classList.contains('open');
            document.querySelectorAll('.faq-item').forEach(function(i) { i.classList.remove('open'); });
            if (!wasOpen) item.classList.add('open');
        });
    });
}

function statusBadge(status) {
    var map = {
        'Deal': { c: 'badge-deal', l: 'تم الديل' },
        'NoDeal': { c: 'badge-nodeal', l: 'لم يتم' },
        'Meeting': { c: 'badge-meeting', l: 'ميتينغ' },
        'Called': { c: 'badge-called', l: 'تم الاتصال' }
    };
    var info = map[status] || { c: '', l: status };
    return '<span class="badge ' + info.c + '">' + info.l + '</span>';
}

function updateTimestamp(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var now = new Date();
    el.textContent = now.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' });
}

function animateNumber(el, target, dur) {
    dur = dur || 700;
    var start = parseInt(el.textContent) || 0;
    var diff = target - start;
    if (diff === 0) { el.textContent = target; return; }
    var t0 = performance.now();
    function step(t) {
        var p = Math.min((t - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(start + diff * e);
        if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initBackToTop();
    initFAQ();
    if (typeof lucide !== 'undefined') lucide.createIcons();
});
