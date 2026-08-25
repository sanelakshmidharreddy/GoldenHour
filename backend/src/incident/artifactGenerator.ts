import { IncidentState, GeneratedArtifacts } from './types';

export function generateArtifacts(incident: IncidentState): GeneratedArtifacts {
  const generatedAt = new Date().toISOString();
  const totalAmount = incident.transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const primaryTx = incident.transactions[0] || null;

  // 1. Helpline Call Script (1930 / Bank Emergency Desk)
  const scriptBullets: string[] = [
    `"I am calling to report a cyber fraud incident involving an unauthorized debit of Rs. ${totalAmount.toLocaleString('en-IN')}."`,
  ];

  if (primaryTx) {
    if (primaryTx.transactionRef) {
      scriptBullets.push(`"The Transaction Reference (UTR / Txn ID) is: ${primaryTx.transactionRef}."`);
    }
    if (primaryTx.debitedBankOrApp) {
      scriptBullets.push(`"The money was transferred from my account at ${primaryTx.debitedBankOrApp}."`);
    }
    if (primaryTx.beneficiaryDetails) {
      scriptBullets.push(`"The suspect beneficiary account / UPI ID is: ${primaryTx.beneficiaryDetails}."`);
    }
  }

  scriptBullets.push(
    `"The incident occurred at approximately ${new Date(incident.incidentOccurredAt).toLocaleString('en-IN')}."`,
    `"Please initiate an immediate freeze request on the beneficiary account via the National Cyber Crime Reporting Portal (1930) mechanism."`
  );

  const helplineScript = {
    title: '1930 / Bank Emergency Call Script',
    targetHelplines: ['1930 (National Cyber Crime Helpline)', 'Bank Customer Care / Fraud Control Desk'],
    scriptBullets,
    quickReferenceData: {
      totalAmountLost: `Rs. ${totalAmount.toLocaleString('en-IN')}`,
      primaryTransactionRef: primaryTx?.transactionRef || 'Not specified',
      beneficiaryTarget: primaryTx?.beneficiaryDetails || 'Not specified',
      victimName: incident.victim.name || 'Anonymous Complainant',
      contactPhone: incident.victim.phone || 'Not specified',
    },
  };

  // 2. NCRP Portal (cybercrime.gov.in) Reference Payload
  const ncrpCategoryMap: Record<string, { cat: string; subCat: string }> = {
    upi_scam: { cat: 'Financial Fraud', subCat: 'UPI Fraud' },
    otp_fraud: { cat: 'Financial Fraud', subCat: 'OTP / Vishing Fraud' },
    phishing: { cat: 'Online Financial Fraud', subCat: 'Phishing / Fake Link' },
    fake_loan_app: { cat: 'Online Financial Fraud', subCat: 'Illegal Loan Apps' },
    investment_scam: { cat: 'Online Financial Fraud', subCat: 'Investment / Part-time Job Scam' },
    sim_swap: { cat: 'Telecom / Identity Cyber Crime', subCat: 'SIM Swap Fraud' },
    unknown: { cat: 'Financial Cyber Fraud', subCat: 'Other Financial Fraud' },
  };

  const ncrpMapping = ncrpCategoryMap[incident.fraudType] || ncrpCategoryMap.unknown;

  const ncrpPayload = {
    categoryCode: ncrpMapping.cat,
    subCategoryCode: ncrpMapping.subCat,
    incidentDate: incident.incidentOccurredAt,
    totalAmount,
    transactionDetails: incident.transactions,
    suspectDetails: incident.suspect,
    briefFacts: incident.description || 'Cyber financial fraud reported by victim.',
  };

  // 3. Formal Police Complaint / FIR-Ready Draft
  const complainantName = incident.victim.name || '[Complainant Name]';
  const complainantPhone = incident.victim.phone || '[Phone Number]';
  const complainantDistrict = incident.victim.district || '[District/City]';
  const complainantState = incident.victim.stateOrCity || '[State]';
  const policeStation = incident.victim.policeStationJurisdiction || 'Cyber Crime Police Station';

  const txDetailsMarkdown =
    incident.transactions.length > 0
      ? incident.transactions
          .map(
            (t, i) =>
              `- **Transaction ${i + 1}**: Rs. ${t.amount.toLocaleString('en-IN')} | Ref/UTR: \`${
                t.transactionRef || 'N/A'
              }\` | Debited Bank: ${t.debitedBankOrApp || 'N/A'} | Beneficiary: \`${t.beneficiaryDetails || 'N/A'}\``
          )
          .join('\n')
      : '- [No specific financial transaction listed]';

  const suspectMarkdown = [
    incident.suspect.phoneNumbers?.length ? `- **Suspect Phone(s)**: ${incident.suspect.phoneNumbers.join(', ')}` : null,
    incident.suspect.upiIds?.length ? `- **Suspect UPI ID(s)**: ${incident.suspect.upiIds.join(', ')}` : null,
    incident.suspect.bankAccounts?.length ? `- **Suspect Bank Account(s)**: ${incident.suspect.bankAccounts.join(', ')}` : null,
    incident.suspect.urlsOrWebsites?.length ? `- **Phishing URL(s)**: ${incident.suspect.urlsOrWebsites.join(', ')}` : null,
    incident.suspect.appNames?.length ? `- **Malicious App(s)**: ${incident.suspect.appNames.join(', ')}` : null,
  ]
    .filter(Boolean)
    .join('\n') || '- [Suspect details to be verified during investigation]';

  const firBody = `
# FORMAL COMPLAINT OF CYBER FRAUD

**To:**
The Station House Officer (SHO),
${policeStation},
${complainantDistrict}, ${complainantState}

**Date:** ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}

**Subject:** Complaint regarding cyber financial fraud involving loss of Rs. ${totalAmount.toLocaleString('en-IN')} via ${incident.fraudType.replace(/_/g, ' ').toUpperCase()}.

---

### 1. Complainant Information
- **Name:** ${complainantName}
- **Contact Phone:** ${complainantPhone}
- **Address / District:** ${complainantDistrict}, ${complainantState}

### 2. Incident Description & Modus Operandi
On ${new Date(incident.incidentOccurredAt).toLocaleString('en-IN')}, an incident of cyber fraud took place:
${incident.description || 'The complainant was fraudulently deceived into financial transactions without genuine authorization.'}

### 3. Financial Loss & Transaction Details
${txDetailsMarkdown}

**Total Financial Loss:** Rs. ${totalAmount.toLocaleString('en-IN')}

### 4. Suspect / Fraudster Details Captured
${suspectMarkdown}

### 5. Immediate Action Already Taken
- Emergency 1930 / Bank Action Status: ${incident.completedEmergencySteps.length ? incident.completedEmergencySteps.join(', ') : 'Reported on GoldenHour emergency portal'}

### 6. Prayer / Relief Sought
In light of the above facts, I respectfully request your office to:
1. Register a formal First Information Report (FIR) under applicable provisions of the Information Technology Act (Sections 66C, 66D) and relevant provisions of the Bharatiya Nyaya Sanhita / Indian Penal Code.
2. Direct the concerned payment intermediaries and banks to freeze and reverse the fraudulent debit.
3. Investigate the identified beneficiary accounts and phone numbers to apprehend the culprits.

Yours faithfully,

___________________________
**(${complainantName})**
Phone: ${complainantPhone}
`.trim();

  const firDraft = {
    title: 'Formal Cyber Crime Complaint Draft',
    recipientAuthority: `${policeStation}, ${complainantDistrict}`,
    subject: `Complaint regarding cyber fraud loss of Rs. ${totalAmount.toLocaleString('en-IN')}`,
    bodyMarkdown: firBody,
    evidenceChecklist: [
      'Bank statement showing fraudulent debit entries',
      'Transaction SMS and notification screenshots',
      'UPI app transaction receipt / UTR screenshot',
      'WhatsApp / Call logs with the suspect numbers',
      'Copy of Government ID Proof (Aadhaar / Voter ID / PAN)',
      'Acknowledgement slip of NCRP 1930 complaint (if filed)',
    ],
  };

  return {
    incidentId: incident.id,
    generatedAt,
    helplineCallScript: helplineScript,
    ncrpPayloadReference: ncrpPayload,
    firDraft,
  };
}
