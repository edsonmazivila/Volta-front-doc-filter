(function(){
	if (window.__APP_MODAL_BOUND__) return; window.__APP_MODAL_BOUND__ = true;

	function byId(id){ try { return document.getElementById(id); } catch(e){ return null; } }

	window.showModal = function(id){
		const modalId = id || 'modal';
		const m = byId(modalId);
		if (m) {
			m.classList.remove('hidden');
			document.body.style.overflow = 'hidden';
		}
	};

	window.hideModal = function(id){
		const modalId = id || 'modal';
		const m = byId(modalId);
		if (m) {
			m.classList.add('hidden');
			document.body.style.overflow = 'auto';
			// Limpar conteúdo padrão se existir
			const mc = byId('modal-content');
			if (mc) mc.innerHTML = '';
		}
	};

	// Handler genérico de Cancel
	document.body.addEventListener('click', function(evt){
		const btn = evt.target && evt.target.closest('[data-action="cancel"]');
		if (!btn) return;
		evt.preventDefault();
		const targetModal = btn.getAttribute('data-modal-id');
		if (targetModal && byId(targetModal)) { hideModal(targetModal); return; }
		if (byId('modal')) { hideModal('modal'); return; }
		if (window.history && typeof window.history.back === 'function') { window.history.back(); }
	});

	// Rebind após swaps
	document.body.addEventListener('htmx:load', function(){ /* no-op: funções já globais */ });
})(); 