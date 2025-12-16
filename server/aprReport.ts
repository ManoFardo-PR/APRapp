import type { Apr, AprImage } from "../drizzle/schema";
import type { AprAIAnalysis } from "./aprAI";

export interface AprReportData {
  apr: Apr;
  images: AprImage[];
  analysis: AprAIAnalysis | null;
  company: {
    name: string;
    code: string;
  };
  creator: {
    name: string;
    email: string;
  };
  approver?: {
    name: string;
    email: string;
  };
}

/**
 * Generate APR report in Excel format following the provided template
 */
export async function generateAprExcelReport(data: AprReportData): Promise<Buffer> {
  // This will be implemented using a library like exceljs
  // For now, return a placeholder
  throw new Error("Excel generation not yet implemented");
}

/**
 * Generate APR report in PDF format
 */
export async function generateAprPdfReport(data: AprReportData, language: "pt-BR" | "en-US" = "pt-BR"): Promise<Buffer> {
  const isPt = language === "pt-BR";

  // Build HTML content
  let html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      margin: 20px;
    }
    h1 {
      text-align: center;
      font-size: 16pt;
      margin-bottom: 20px;
    }
    h2 {
      font-size: 12pt;
      background-color: #4472C4;
      color: white;
      padding: 5px;
      margin-top: 15px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    th, td {
      border: 1px solid #000;
      padding: 5px;
      text-align: left;
    }
    th {
      background-color: #D9E1F2;
      font-weight: bold;
    }
    .header-table td {
      border: 1px solid #000;
    }
    .risk-table th {
      text-align: center;
      font-size: 9pt;
    }
    .risk-inadmissible {
      background-color: #FF0000;
      color: white;
      font-weight: bold;
    }
    .risk-unacceptable {
      background-color: #FFC000;
    }
    .risk-tolerable {
      background-color: #FFFF00;
    }
    .risk-acceptable {
      background-color: #92D050;
    }
    .criteria-box {
      border: 2px solid #000;
      padding: 10px;
      margin: 10px 0;
    }
    .signature-box {
      border: 1px solid #000;
      padding: 30px 10px 10px 10px;
      margin: 10px 0;
      min-height: 60px;
    }
  </style>
</head>
<body>
  <h1>${isPt ? 'ANÁLISE PRELIMINAR DE RISCOS - APR' : 'PRELIMINARY RISK ANALYSIS - PRA'}</h1>
  
  <table class="header-table">
    <tr>
      <td><strong>${isPt ? 'Setor/Área:' : 'Sector/Area:'}</strong></td>
      <td>${data.apr.location || 'N/A'}</td>
      <td><strong>${isPt ? 'Data Elaboração:' : 'Date Created:'}</strong></td>
      <td>${new Date(data.apr.createdAt).toLocaleDateString(language)}</td>
    </tr>
    <tr>
      <td><strong>${isPt ? 'Equipamento:' : 'Equipment:'}</strong></td>
      <td colspan="3">${data.apr.title}</td>
    </tr>
    <tr>
      <td><strong>${isPt ? 'Responsável:' : 'Responsible:'}</strong></td>
      <td>${data.creator.name}</td>
      <td><strong>${isPt ? 'Empresa:' : 'Company:'}</strong></td>
      <td>${data.company.name}</td>
    </tr>
  </table>

  <h2>${isPt ? 'DESCRIÇÃO DO TRABALHO' : 'WORK DESCRIPTION'}</h2>
  <p>${data.apr.activityDescription}</p>

  ${generateTeamSection(data.apr.teamMembers, language)}
  
  ${generateToolsSection(data.apr.tools, language)}
  
  ${generateEmergencySection(data.apr.emergencyContacts, language)}

  ${data.analysis ? generateRiskAnalysisSection(data.analysis, language) : ''}
  
  ${generateCriteriaSection(language)}
  
  ${data.analysis ? generateSpecialWorkSection(data.analysis, language) : ''}
  
  ${data.analysis ? generatePPESection(data.analysis, language) : ''}
  
  ${generateSignatureSection(data, language)}
</body>
</html>
  `;

  // Convert HTML to PDF using puppeteer
  const puppeteer = (await import('puppeteer')).default;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    await browser.close();
    throw error;
  }
}

function generateRiskAnalysisSection(analysis: AprAIAnalysis, language: "pt-BR" | "en-US"): string {
  const isPt = language === "pt-BR";

  let html = `
  <h2>${isPt ? 'METODOLOGIA E ANÁLISE DE RISCO' : 'METHODOLOGY AND RISK ANALYSIS'}</h2>
  <table class="risk-table">
    <thead>
      <tr>
        <th style="width: 25%">${isPt ? 'Tarefas' : 'Tasks'}</th>
        <th style="width: 20%">${isPt ? 'Perigos' : 'Hazards'}</th>
        <th style="width: 5%">P</th>
        <th style="width: 5%">S</th>
        <th style="width: 5%">NR</th>
        <th style="width: 25%">${isPt ? 'Medidas de Controle' : 'Control Measures'}</th>
        <th style="width: 15%">${isPt ? 'NRs Aplicáveis' : 'Applicable NRs'}</th>
      </tr>
    </thead>
    <tbody>
  `;

  for (const risk of analysis.risks) {
    const riskClass =
      risk.riskLevel >= 12 ? 'risk-inadmissible' :
        risk.riskLevel >= 6 ? 'risk-unacceptable' :
          risk.riskLevel >= 3 ? 'risk-tolerable' :
            'risk-acceptable';

    html += `
      <tr>
        <td>${risk.task}</td>
        <td>${risk.hazard}</td>
        <td style="text-align: center">${risk.probability}</td>
        <td style="text-align: center">${risk.severity}</td>
        <td class="${riskClass}" style="text-align: center">${risk.riskLevel}</td>
        <td>${risk.controlMeasures}</td>
        <td>${risk.applicableNRs.join(', ')}</td>
      </tr>
    `;
  }

  html += `
    </tbody>
  </table>
  `;

  return html;
}

function generateCriteriaSection(language: "pt-BR" | "en-US"): string {
  const isPt = language === "pt-BR";

  return `
  <h2>${isPt ? 'CRITÉRIOS DE AVALIAÇÃO DE RISCOS' : 'RISK ASSESSMENT CRITERIA'}</h2>
  <div class="criteria-box">
    <table>
      <tr>
        <td style="width: 50%">
          <strong>${isPt ? 'PROBABILIDADE (P):' : 'PROBABILITY (P):'}</strong><br>
          1 = ${isPt ? 'Controles efetivos' : 'Effective controls'}<br>
          2 = ${isPt ? 'Controles pouco efetivos' : 'Minimally effective controls'}<br>
          3 = ${isPt ? 'Controles não efetivos' : 'Ineffective controls'}<br>
          4 = ${isPt ? 'Sem controles' : 'No controls'}
        </td>
        <td style="width: 50%">
          <strong>${isPt ? 'SEVERIDADE (S):' : 'SEVERITY (S):'}</strong><br>
          1 = ${isPt ? 'Lesão leve' : 'Minor injury'}<br>
          2 = ${isPt ? 'Incapacidade temporária' : 'Temporary disability'}<br>
          3 = ${isPt ? 'Incapacidade permanente' : 'Permanent disability'}<br>
          4 = ${isPt ? 'Lesão grave ou morte' : 'Serious injury or death'}
        </td>
      </tr>
    </table>
    <br>
    <strong>${isPt ? 'CATEGORIA DE RISCO (NR = P × S):' : 'RISK CATEGORY (NR = P × S):'}</strong><br>
    <span class="risk-acceptable">1-2: ${isPt ? 'Aceitável' : 'Acceptable'}</span> | 
    <span class="risk-tolerable">3-4: ${isPt ? 'Tolerável' : 'Tolerable'}</span> | 
    <span class="risk-unacceptable">6-9: ${isPt ? 'Inaceitável' : 'Unacceptable'}</span> | 
    <span class="risk-inadmissible">12-16: ${isPt ? 'Inadmissível' : 'Inadmissible'}</span>
  </div>
  `;
}

function generateSpecialWorkSection(analysis: AprAIAnalysis, language: "pt-BR" | "en-US"): string {
  const isPt = language === "pt-BR";
  const permits = analysis.specialWorkPermits;

  return `
  <h2>${isPt ? 'TRABALHOS ESPECIAIS DE RISCO' : 'SPECIAL RISK WORK'}</h2>
  <table>
    <tr>
      <td>${permits.nr10_electrical ? '☑' : '☐'} ${isPt ? 'Energia Elétrica NR-10' : 'Electrical Work NR-10'}</td>
      <td>${permits.nr18_excavation ? '☑' : '☐'} ${isPt ? 'Escavação NR-18' : 'Excavation NR-18'}</td>
    </tr>
    <tr>
      <td>${permits.nr35_height ? '☑' : '☐'} ${isPt ? 'Trabalho em Altura NR-35' : 'Work at Height NR-35'}</td>
      <td>${permits.nr18_hot_work ? '☑' : '☐'} ${isPt ? 'Trabalho a Quente NR-18' : 'Hot Work NR-18'}</td>
    </tr>
    <tr>
      <td>${permits.nr33_confined ? '☑' : '☐'} ${isPt ? 'Espaço Confinado NR-33' : 'Confined Space NR-33'}</td>
      <td>${permits.nr18_lifting ? '☑' : '☐'} ${isPt ? 'Içamentos NR-18' : 'Lifting NR-18'}</td>
    </tr>
    <tr>
      <td>${permits.nr12_pressure ? '☑' : '☐'} ${isPt ? 'Vasos de Pressão NR-12' : 'Pressure Vessels NR-12'}</td>
      <td>${permits.others ? `${isPt ? 'Outros:' : 'Others:'} ${permits.others}` : ''}</td>
    </tr>
  </table>
  `;
}

function generatePPESection(analysis: AprAIAnalysis, language: "pt-BR" | "en-US"): string {
  const isPt = language === "pt-BR";

  return `
  <h2>${isPt ? 'EQUIPAMENTOS DE PROTEÇÃO INDIVIDUAL (EPIs) - NR-6' : 'PERSONAL PROTECTIVE EQUIPMENT (PPE) - NR-6'}</h2>
  <ul>
    ${analysis.requiredPPE.map(ppe => `<li>${ppe}</li>`).join('')}
  </ul>
  `;
}

function generateSignatureSection(data: AprReportData, language: "pt-BR" | "en-US"): string {
  const isPt = language === "pt-BR";

  return `
  <h2>${isPt ? 'ASSINATURAS' : 'SIGNATURES'}</h2>
  <table>
    <tr>
      <td style="width: 50%">
        <div class="signature-box">
          <strong>${isPt ? 'Elaborado por:' : 'Prepared by:'}</strong><br>
          ${data.creator.name}
        </div>
      </td>
      <td style="width: 50%">
        <div class="signature-box">
          <strong>${isPt ? 'Aprovado por (Segurança):' : 'Approved by (Safety):'}</strong><br>
          ${data.approver?.name || ''}
        </div>
      </td>
    </tr>
  </table>
  <p style="text-align: center; margin-top: 20px;">
    <small>${isPt ? 'Documento gerado em' : 'Document generated on'} ${new Date().toLocaleString(language)}</small>
  </p>
  `;
}

function generateTeamSection(teamMembers: unknown, language: "pt-BR" | "en-US"): string {
  const isPt = language === "pt-BR";
  const members = Array.isArray(teamMembers) ? teamMembers as string[] : [];

  if (members.length === 0) return '';

  return `
  <h2>${isPt ? 'EQUIPE DE TRABALHO' : 'WORK TEAM'}</h2>
  <ul>
    ${members.map(member => `<li>${member}</li>`).join('')}
  </ul>
  `;
}

function generateToolsSection(tools: unknown, language: "pt-BR" | "en-US"): string {
  const isPt = language === "pt-BR";
  const items = Array.isArray(tools) ? tools as string[] : [];

  if (items.length === 0) return '';

  return `
  <h2>${isPt ? 'FERRAMENTAS E EQUIPAMENTOS' : 'TOOLS AND EQUIPMENT'}</h2>
  <ul>
    ${items.map(item => `<li>${item}</li>`).join('')}
  </ul>
  `;
}

function generateEmergencySection(contacts: unknown, language: "pt-BR" | "en-US"): string {
  const isPt = language === "pt-BR";
  const items = Array.isArray(contacts) ? contacts as { name: string, phone: string, role?: string }[] : [];

  if (items.length === 0) return '';

  return `
  <h2>${isPt ? 'CONTATOS DE EMERGÊNCIA' : 'EMERGENCY CONTACTS'}</h2>
  <table>
    <thead>
      <tr>
        <th>${isPt ? 'Nome' : 'Name'}</th>
        <th>${isPt ? 'Telefone' : 'Phone'}</th>
        <th>${isPt ? 'Cargo' : 'Role'}</th>
      </tr>
    </thead>
    <tbody>
      ${items.map(contact => `
        <tr>
          <td>${contact.name}</td>
          <td>${contact.phone}</td>
          <td>${contact.role || '-'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  `;
}
