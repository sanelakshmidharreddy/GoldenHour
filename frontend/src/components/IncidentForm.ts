export function renderIncidentForm(error: string | null): string {
  const nowIso = new Date().toISOString().slice(0, 16);

  return `
    <main class="intake-wrapper container" role="main">
      <div class="intake-header">
        <button id="btn-back-home" class="btn btn-text" aria-label="Go back to landing page">← Back to Overview</button>
        <h2>Emergency Incident Intake</h2>
        <p class="intake-subtitle">Please provide whatever information you have right now. You can update it later.</p>
      </div>

      ${
        error
          ? `
        <div class="error-banner" role="alert">
          <span class="error-icon">⚠️</span>
          <div class="error-text">${escapeHtml(error)}</div>
        </div>
      `
          : ''
      }

      <form id="incident-form" class="intake-form" novalidate>
        <!-- Step 1: Fraud Type -->
        <fieldset class="form-section">
          <legend class="section-title">1. What type of incident occurred?</legend>
          <div class="radio-card-grid">
            <label class="radio-card">
              <input type="radio" name="fraudType" value="upi_scam" checked>
              <div class="card-box">
                <span class="card-icon">💸</span>
                <strong>UPI / QR Scam</strong>
                <small>Fake QR code, collect request, fake payment screenshot</small>
              </div>
            </label>

            <label class="radio-card">
              <input type="radio" name="fraudType" value="otp_fraud">
              <div class="card-box">
                <span class="card-icon">🔐</span>
                <strong>OTP / Bank Vishing</strong>
                <small>Call claiming to be bank manager / KYC renewal asking for OTP</small>
              </div>
            </label>

            <label class="radio-card">
              <input type="radio" name="fraudType" value="phishing">
              <div class="card-box">
                <span class="card-icon">🔗</span>
                <strong>Phishing Link / Fake Site</strong>
                <small>Electricity bill, courier parcel, lottery link on SMS/WhatsApp</small>
              </div>
            </label>

            <label class="radio-card">
              <input type="radio" name="fraudType" value="investment_scam">
              <div class="card-box">
                <span class="card-icon">📈</span>
                <strong>Investment / Part-time Job</strong>
                <small>Telegram task scam, guaranteed returns, crypto trading</small>
              </div>
            </label>

            <label class="radio-card">
              <input type="radio" name="fraudType" value="fake_loan_app">
              <div class="card-box">
                <span class="card-icon">📱</span>
                <strong>Illegal Loan App</strong>
                <small>Instant credit app, extortion, unauthorized contact access</small>
              </div>
            </label>

            <label class="radio-card">
              <input type="radio" name="fraudType" value="sim_swap">
              <div class="card-box">
                <span class="card-icon">📶</span>
                <strong>SIM Swap Fraud</strong>
                <small>Sudden loss of cellular network / unauthorized eSIM transfer</small>
              </div>
            </label>
          </div>
        </fieldset>

        <!-- Step 2: Timing -->
        <fieldset class="form-section">
          <legend class="section-title">2. When did the incident happen?</legend>
          <p class="form-hint">Timing determines the Golden Hour freeze protocol priority.</p>
          
          <div class="time-presets" role="group" aria-label="Incident time presets">
            <button type="button" class="btn btn-outline btn-preset" data-minutes="15">15 mins ago</button>
            <button type="button" class="btn btn-outline btn-preset" data-minutes="30">30 mins ago</button>
            <button type="button" class="btn btn-outline btn-preset" data-minutes="60">1 hour ago</button>
            <button type="button" class="btn btn-outline btn-preset" data-minutes="180">3 hours ago</button>
          </div>

          <div class="form-group">
            <label for="incidentOccurredAt">Exact Date & Time:</label>
            <input type="datetime-local" id="incidentOccurredAt" name="incidentOccurredAt" value="${nowIso}" class="form-control" required>
          </div>
        </fieldset>

        <!-- Step 3: Financial Details -->
        <fieldset class="form-section">
          <legend class="section-title">3. Financial Loss & Transaction Reference</legend>
          <div class="form-row">
            <div class="form-group col-half">
              <label for="amount">Total Amount Lost (INR) *</label>
              <input type="number" id="amount" name="amount" min="0" step="1" placeholder="e.g. 50000" class="form-control" required>
            </div>

            <div class="form-group col-half">
              <label for="transactionRef">Transaction Reference / 12-digit UTR *</label>
              <input type="text" id="transactionRef" name="transactionRef" placeholder="e.g. 409812739182 or UPI/..." class="form-control" required>
              <small class="form-hint">Found in transaction SMS, GPay/PhonePe receipt, or bank statement.</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-half">
              <label for="debitedBankOrApp">Your Debited Bank / App</label>
              <input type="text" id="debitedBankOrApp" name="debitedBankOrApp" placeholder="e.g. HDFC Bank / PhonePe" class="form-control">
            </div>

            <div class="form-group col-half">
              <label for="beneficiaryDetails">Suspect Beneficiary UPI / Account</label>
              <input type="text" id="beneficiaryDetails" name="beneficiaryDetails" placeholder="e.g. fraudster@okhdfcbank or Account No" class="form-control">
            </div>
          </div>
        </fieldset>

        <!-- Step 4: Suspect Identifiers -->
        <fieldset class="form-section">
          <legend class="section-title">4. Suspect Information (if available)</legend>
          <div class="form-row">
            <div class="form-group col-half">
              <label for="suspectPhone">Suspect Phone Number(s)</label>
              <input type="text" id="suspectPhone" name="suspectPhone" placeholder="e.g. 9812345678" class="form-control">
            </div>

            <div class="form-group col-half">
              <label for="suspectUrlOrApp">Phishing Link / Malicious App Name</label>
              <input type="text" id="suspectUrlOrApp" name="suspectUrlOrApp" placeholder="e.g. https://fake-bill.xyz or QuickLoan APK" class="form-control">
            </div>
          </div>

          <div class="form-group">
            <label for="description">Brief Summary of What Happened</label>
            <textarea id="description" name="description" rows="3" class="form-control" placeholder="Briefly describe the deceptive message or call received..."></textarea>
          </div>
        </fieldset>

        <!-- Step 5: Victim / Jurisdictional Info -->
        <fieldset class="form-section">
          <legend class="section-title">5. Complainant Details (for Police Complaint Draft)</legend>
          <div class="form-row">
            <div class="form-group col-half">
              <label for="victimName">Your Full Name</label>
              <input type="text" id="victimName" name="victimName" placeholder="e.g. Rajesh Sharma" class="form-control">
            </div>

            <div class="form-group col-half">
              <label for="victimPhone">Your Contact Phone</label>
              <input type="tel" id="victimPhone" name="victimPhone" placeholder="e.g. 9876543210" class="form-control">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group col-half">
              <label for="victimState">State / City</label>
              <input type="text" id="victimState" name="victimState" placeholder="e.g. Karnataka / Bengaluru" class="form-control">
            </div>

            <div class="form-group col-half">
              <label for="policeStation">Local Police Station / District (Jurisdiction)</label>
              <input type="text" id="policeStation" name="policeStation" placeholder="e.g. Cyber Crime PS, Bengaluru Urban" class="form-control">
            </div>
          </div>
        </fieldset>

        <div class="form-actions">
          <button type="submit" id="btn-submit-intake" class="btn btn-primary btn-large">
            <span>⚡ Generate Action Plan & FIR Draft</span>
          </button>
        </div>
      </form>
    </main>
  `;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
