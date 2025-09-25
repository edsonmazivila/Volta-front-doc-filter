(function(){
	if (window.__APP_CORE_BOUND__) return; window.__APP_CORE_BOUND__ = true;

	// Garantir credenciais em todas as requisições HTMX
	try { if (window.htmx && htmx.config) { htmx.config.withCredentials = true; } } catch(e){}

	// Redirect global para 401
	document.body.addEventListener('htmx:afterRequest', function(e){
		try {
			if (e.detail && e.detail.xhr && e.detail.xhr.status === 401) {
				window.location.href = '/login';
			}
		} catch(err) { console.error('afterRequest handler error', err); }
	});

	// Erros de resposta
	document.body.addEventListener('htmx:responseError', function(e){
		try { console.warn('HTMX responseError', e.detail && e.detail.xhr && e.detail.xhr.status); } catch(err){}
	});

	// Peq. guarda para re-inits em bursts
	window.__APP_LAST_INIT_AT__ = 0;
	window.shouldInitNow = function(thresholdMs){
		const now = Date.now();
		const thr = typeof thresholdMs === 'number' ? thresholdMs : 600;
		if (now - window.__APP_LAST_INIT_AT__ < thr) return false;
		window.__APP_LAST_INIT_AT__ = now; return true;
	};

	document.body.addEventListener('htmx:afterSwap', function(evt){
		try {
			if (evt.target && (evt.target.id === 'main-content' || evt.target.tagName === 'MAIN')) {
				try { if (typeof window.refreshTailwindOnce === 'function') { window.refreshTailwindOnce(); } } catch(e){}
				var p = (evt.detail && evt.detail.pathInfo && evt.detail.pathInfo.requestPath) ? evt.detail.pathInfo.requestPath : window.location.pathname;
				// Defer init slightly to allow DOM to settle
				setTimeout(function(){
					if (typeof window.initForPath === 'function') { try { window.initForPath(p); } catch(e){} }
					if (typeof window.initByMarkers === 'function') { try { window.initByMarkers(); } catch(e){} }
					// Fire page-level inits if present
					if (window.NexuPayrollDocumentsInit) { try { window.NexuPayrollDocumentsInit(); } catch(e){} }
					if (window.NexuPayrollUsersInit) { try { window.NexuPayrollUsersInit(); } catch(e){} }
					if (window.NexuPayrollLeavesInit) { try { window.NexuPayrollLeavesInit(); } catch(e){} }
					if (window.initDashboard) { try { window.initDashboard(); } catch(e){} }
					if (window.NexuPayrollTimesheetsInit) { try { window.NexuPayrollTimesheetsInit(); } catch(e){} }
				}, 0);
			}
		} catch(e) { console.error('afterSwap init error', e); }
	});

	// Attendance month auto-init after HTMX loads
	document.body.addEventListener('htmx:load', function(evt){
		try {
			var root = evt.target || document;
			// My Attendance
			if (root.querySelector && (root.querySelector('#attendanceCalendar') || root.querySelector('#attendanceSummary'))) {
				var mp = document.getElementById('monthPicker');
				if (mp && !mp.value) {
					var d = new Date();
					var m = String(d.getMonth()+1).padStart(2,'0');
					mp.value = d.getFullYear() + '-' + m;
				}
				if (window.htmx) {
					window.htmx.trigger('#attendanceCalendar','refresh');
					window.htmx.trigger('#attendanceSummary','refresh');
				}
			}
			// HR Attendance
			if (root.querySelector && root.querySelector('#attendanceList')) {
				var mf = document.getElementById('monthFilter');
				if (mf && !mf.value) {
					var d2 = new Date();
					var m2 = String(d2.getMonth()+1).padStart(2,'0');
					mf.value = d2.getFullYear() + '-' + m2;
				}
				if (window.htmx) {
					window.htmx.trigger('#attendanceList','refresh');
					window.htmx.trigger('#teamJustifications','refresh');
				}
			}
		} catch(e) { /* no-op */ }
	});
})(); 