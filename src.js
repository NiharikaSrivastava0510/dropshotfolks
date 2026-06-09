// Web3Forms submission — coaching + volunteer forms
// Loaded with `defer` from index.html, so the DOM is parsed before this runs.

(function () {
  const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

  const popup       = document.getElementById('formSuccessPopup');
  const popupDialog = popup ? popup.querySelector('.form-popup-dialog') : null;
  const popupTitle  = document.getElementById('formSuccessTitle');
  const popupBody   = document.getElementById('formSuccessBody');
  const popupClose  = document.getElementById('formSuccessClose');

  // The modal we should close after the user dismisses the popup
  let modalToClose = null;

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function openPopup({ title, bodyHtml, untrustedDetail, isError }) {
    if (!popup) return;
    if (popupTitle) popupTitle.textContent = title;
    if (popupBody) {
      // bodyHtml is a fixed template under our control. untrustedDetail
      // (e.g. data.message from the API) is HTML-escaped before injection.
      const safeDetail = untrustedDetail ? escapeHtml(untrustedDetail) + ' ' : '';
      popupBody.innerHTML = safeDetail + bodyHtml;
    }
    popup.classList.toggle('is-error', !!isError);
    popup.classList.add('show');
    popup.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (popupClose) setTimeout(() => popupClose.focus(), 50);
  }

  function closePopupOnly() {
    if (!popup) return;
    popup.classList.remove('show');
    popup.classList.remove('is-error');
    popup.setAttribute('aria-hidden', 'true');
  }

  function closeParentModal() {
    if (!modalToClose) return;
    modalToClose.classList.remove('show');
    modalToClose.setAttribute('aria-hidden', 'true');
    modalToClose = null;
  }

  function handlePopupDismiss() {
    closePopupOnly();
    closeParentModal();
    document.body.style.overflow = '';
  }

  if (popupClose) popupClose.addEventListener('click', handlePopupDismiss);
  if (popup) {
    popup.addEventListener('click', (e) => {
      if (e.target === popup) handlePopupDismiss();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && popup && popup.classList.contains('show')) {
      handlePopupDismiss();
    }
  });

  function wireForm(formId, opts) {
    const form = document.getElementById(formId);
    if (!form) return;
    const submitBtn = form.querySelector('button[type="submit"]');
    // Hide the legacy inline success/banner — popup is the new path
    const inlineBox = document.getElementById(opts.successId);
    if (inlineBox) inlineBox.classList.remove('show');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
    const hCaptcha = form.querySelector('textarea[name=h-captcha-response]').value;

    if (!hCaptcha) {
        e.preventDefault();
        alert("Please fill out captcha field")
        return
    }

      const formData = new FormData(form);
      // Collapse multi-value checkbox groups (e.g. `roles`) into one
      // comma-separated string so Web3Forms emails them on a single line.
      if (opts.csvGroups && Array.isArray(opts.csvGroups)) {
        opts.csvGroups.forEach((groupName) => {
          const values = formData.getAll(groupName);
          if (values.length > 0) {
            formData.delete(groupName);
            formData.set(groupName, values.join(', '));
          }
        });
      }
      if (opts.subject)  formData.set('subject', opts.subject(form));
      if (opts.fromName) formData.set('from_name', opts.fromName(form));

      const originalLabel = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalLabel = originalLabel;
        submitBtn.textContent = 'Sending…';
      }

      try {
        const res = await fetch(WEB3FORMS_URL, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        });
        const data = await res.json().catch(() => ({}));
        // Remember the parent modal so the popup can close it on dismiss
        modalToClose = form.closest('.coach-modal') || null;
        if (res.ok && data.success !== false) {
          openPopup({
            title: 'Thanks — your request is in.',
            bodyHtml: 'We\'ll be in touch soon. If you don\'t hear back within a few days, drop us a note at <a href="mailto:info@dropshotfolks.co.uk">info@dropshotfolks.co.uk</a>.',
          });
          form.reset();
        } else {
          openPopup({
            title: 'Sorry — that didn\'t go through.',
            untrustedDetail: data && data.message ? data.message : '',
            bodyHtml: 'Please try again or email <a href="mailto:info@dropshotfolks.co.uk">info@dropshotfolks.co.uk</a>.',
            isError: true,
          });
        }
      } catch (err) {
        modalToClose = form.closest('.coach-modal') || null;
        openPopup({
          title: 'Sorry — that didn\'t go through.',
          bodyHtml: 'Please check your connection and try again, or email <a href="mailto:info@dropshotfolks.co.uk">info@dropshotfolks.co.uk</a>.',
          isError: true,
        });
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = submitBtn.dataset.originalLabel || originalLabel;
        }
      }
    });
  }

  function val(form, name) {
    const el = form.elements[name];
    return (el && el.value || '').trim();
  }

  wireForm('coachForm', {
    successId: 'coachSuccess',
    subject: (f) => {
      const name = val(f, 'name') || 'Unknown';
      const type = val(f, 'coachType') || 'Coaching';
      return `Coaching request — ${name} (${type})`;
    },
    fromName: (f) => val(f, 'name') || 'Dropshot Folks website',
  });

  wireForm('volunteerForm', {
    successId: 'volSuccess',
    csvGroups: ['roles'],
    subject: (f) => {
      const first = val(f, 'firstName');
      const last  = val(f, 'lastName');
      const name  = [first, last].filter(Boolean).join(' ').trim() || 'Unknown';
      return `Volunteer application — ${name}`;
    },
    fromName: (f) => {
      const first = val(f, 'firstName');
      const last  = val(f, 'lastName');
      return [first, last].filter(Boolean).join(' ').trim() || 'Dropshot Folks website';
    },
  });
})();
