// Web3Forms submission — coaching + volunteer forms
// Loaded with `defer` from index.html, so the DOM is parsed before this runs.

(function () {
  const WEB3FORMS_URL = 'https://api.web3forms.com/submit';

  function showSuccess(box) {
    if (!box) return;
    box.classList.add('show');
    box.querySelector('strong')?.replaceChildren(document.createTextNode('Thanks — your message has been sent!'));
    box.lastChild && (box.lastChild.nodeValue = '');
    // Replace the body text so it doesn't still say "your email app should have opened…"
    box.innerHTML =
      '<strong>Thanks — your request is in.</strong> We\'ll be in touch soon. ' +
      'If you don\'t hear back within a few days, drop us a note at ' +
      '<span data-edit="email">info@dropshotfolks.co.uk</span>.';
  }

  function showError(box, message) {
    if (!box) return;
    box.classList.add('show');
    box.style.background = 'rgba(155,28,28,.08)';
    box.style.borderColor = '#9b1c1c';
    box.style.color = '#7a1414';
    box.innerHTML =
      '<strong>Sorry — that didn\'t go through.</strong> ' +
      (message ? message + ' ' : '') +
      'Please try again or email <span data-edit="email">info@dropshotfolks.co.uk</span>.';
  }

  function wireForm(formId, opts) {
    const form = document.getElementById(formId);
    if (!form) return;
    const submitBtn = form.querySelector('button[type="submit"]');
    const successBox = document.getElementById(opts.successId);

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Use the browser's native validation for required fields
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      // Friendly subject + sender name for the email Web3Forms sends
      if (opts.subject) formData.set('subject', opts.subject(form));
      if (opts.fromName) formData.set('from_name', opts.fromName(form));

      const originalLabel = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalLabel = originalLabel;
        submitBtn.textContent = 'Sending…';
      }
      if (successBox) successBox.classList.remove('show');

      try {
        const res = await fetch(WEB3FORMS_URL, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success !== false) {
          showSuccess(successBox);
          form.reset();
        } else {
          showError(successBox, data && data.message);
        }
      } catch (err) {
        showError(successBox);
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
    subject: (f) => {
      const first = val(f, 'firstName');
      const last = val(f, 'lastName');
      const name = [first, last].filter(Boolean).join(' ').trim() || 'Unknown';
      return `Volunteer application — ${name}`;
    },
    fromName: (f) => {
      const first = val(f, 'firstName');
      const last = val(f, 'lastName');
      return [first, last].filter(Boolean).join(' ').trim() || 'Dropshot Folks website';
    },
  });
})();
