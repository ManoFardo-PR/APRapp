import PDFDocument from 'pdfkit';
import type { AprImage, AprResponse } from '../drizzle/schema';
import type { AprAIAnalysis } from './aprAI';

interface AprData {
  id: number;
  title: string;
  description: string;
  location: string;
  activityDescription: string;
  status: string;
  createdAt: Date;
  createdBy: number;
  approvedBy: number | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  aiAnalysis: AprAIAnalysis | null;
}

export async function generateAprPDF(
  apr: AprData,
  images: AprImage[],
  responses: AprResponse[],
  creatorName: string,
  approverName: string | null
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('APR - Análise Preliminar de Risco', { align: 'center' });
      doc.moveDown();
      
      // APR Info
      doc.fontSize(14).font('Helvetica-Bold').text('Informações Básicas');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.5);
      
      doc.text(`Título: ${apr.title}`);
      doc.text(`ID: ${apr.id}`);
      doc.text(`Status: ${getStatusLabel(apr.status)}`);
      doc.text(`Criado por: ${creatorName}`);
      doc.text(`Data de Criação: ${formatDate(apr.createdAt)}`);
      
      if (apr.approvedBy && apr.approvedAt && approverName) {
        doc.text(`Aprovado por: ${approverName}`);
        doc.text(`Data de Aprovação: ${formatDate(apr.approvedAt)}`);
      }
      
      if (apr.rejectionReason) {
        doc.text(`Motivo da Rejeição: ${apr.rejectionReason}`);
      }
      
      doc.moveDown();
      
      // Description
      doc.fontSize(14).font('Helvetica-Bold').text('Descrição');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.5);
      doc.text(apr.description || 'Não informada');
      doc.moveDown();
      
      // Location
      doc.fontSize(14).font('Helvetica-Bold').text('Localização');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.5);
      doc.text(apr.location || 'Não informada');
      doc.moveDown();
      
      // Activity Description
      doc.fontSize(14).font('Helvetica-Bold').text('Descrição da Atividade');
      doc.fontSize(10).font('Helvetica');
      doc.moveDown(0.5);
      doc.text(apr.activityDescription || 'Não informada');
      doc.moveDown();
      
      // AI Analysis
      if (apr.aiAnalysis) {
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('Análise por Inteligência Artificial', { align: 'center' });
        doc.moveDown();
        
        // Summary
        doc.fontSize(14).font('Helvetica-Bold').text('Resumo Executivo');
        doc.fontSize(10).font('Helvetica');
        doc.moveDown(0.5);
        doc.text(apr.aiAnalysis.summary || 'Não disponível');
        doc.moveDown();
        
        // Risks
        if (apr.aiAnalysis.risks && apr.aiAnalysis.risks.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('Riscos Identificados');
          doc.moveDown(0.5);
          
          apr.aiAnalysis.risks.forEach((risk, index) => {
            doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${risk.task}`);
            doc.fontSize(10).font('Helvetica');
            doc.text(`   Perigo: ${risk.hazard}`);
            doc.text(`   Probabilidade: ${risk.probability} | Severidade: ${risk.severity} | NR: ${risk.riskLevel}`);
            doc.text(`   Categoria: ${risk.riskCategory}`);
            doc.text(`   Medidas de Controle: ${risk.controlMeasures}`);
            if (risk.applicableNRs && risk.applicableNRs.length > 0) {
              doc.text(`   NRs Aplicáveis: ${risk.applicableNRs.join(', ')}`);
            }
            doc.moveDown(0.5);
          });
        }
        
        // Special Work Permits
        if (apr.aiAnalysis.specialWorkPermits) {
          doc.fontSize(14).font('Helvetica-Bold').text('Trabalhos Especiais');
          doc.fontSize(10).font('Helvetica');
          doc.moveDown(0.5);
          
          const permits = apr.aiAnalysis.specialWorkPermits;
          if (permits.nr10_electrical) doc.text('✓ NR-10: Trabalho com Energia Elétrica');
          if (permits.nr35_height) doc.text('✓ NR-35: Trabalho em Altura');
          if (permits.nr33_confined) doc.text('✓ NR-33: Espaço Confinado');
          if (permits.nr12_pressure) doc.text('✓ NR-12: Vasos de Pressão');
          if (permits.nr18_excavation) doc.text('✓ NR-18: Escavação');
          if (permits.nr18_hot_work) doc.text('✓ NR-18: Trabalho a Quente');
          if (permits.nr18_lifting) doc.text('✓ NR-18: Içamentos');
          if (permits.others) doc.text(`✓ Outros: ${permits.others}`);
          
          doc.moveDown();
        }
        
        // Required PPE
        if (apr.aiAnalysis.requiredPPE && apr.aiAnalysis.requiredPPE.length > 0) {
          doc.fontSize(14).font('Helvetica-Bold').text('EPIs Obrigatórios');
          doc.fontSize(10).font('Helvetica');
          doc.moveDown(0.5);
          apr.aiAnalysis.requiredPPE.forEach(ppe => {
            doc.text(`• ${ppe}`);
          });
          doc.moveDown();
        }
        
        // Communication Needs
        if (apr.aiAnalysis.communicationNeeds) {
          doc.fontSize(14).font('Helvetica-Bold').text('Setores a Comunicar');
          doc.fontSize(10).font('Helvetica');
          doc.moveDown(0.5);
          const needs = apr.aiAnalysis.communicationNeeds;
          if (needs.management) doc.text('• Gestão');
          if (needs.supervision) doc.text('• Supervisão');
          if (needs.safety) doc.text('• Segurança do Trabalho');
          if (needs.environment) doc.text('• Meio Ambiente');
          if (needs.emergency_brigade) doc.text('• Brigada de Emergência');
          if (needs.security) doc.text('• Segurança Patrimonial');
          if (needs.purchasing) doc.text('• Compras');
          if (needs.hr) doc.text('• Recursos Humanos');
          doc.moveDown();
        }
      }
      
      // Images
      if (images.length > 0) {
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('Imagens Anexadas', { align: 'center' });
        doc.moveDown();
        
        images.forEach((img, index) => {
          doc.fontSize(12).font('Helvetica-Bold').text(`Imagem ${index + 1}`);
          doc.fontSize(10).font('Helvetica');
          if (img.caption) {
            doc.text(`Legenda: ${img.caption}`);
          }
          doc.text(`URL: ${img.imageUrl}`);
          doc.moveDown();
        });
      }
      
      // Responses (if any)
      if (responses.length > 0) {
        doc.addPage();
        doc.fontSize(16).font('Helvetica-Bold').text('Respostas do Questionário', { align: 'center' });
        doc.moveDown();
        
        responses.forEach((response, index) => {
          doc.fontSize(12).font('Helvetica-Bold').text(`${index + 1}. ${response.questionText}`);
          doc.fontSize(10).font('Helvetica');
          doc.text(`Resposta: ${response.answer}`);
          doc.moveDown(0.5);
        });
      }
      
      // Footer
      doc.fontSize(8).font('Helvetica').text(
        `Documento gerado em ${formatDate(new Date())}`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Rascunho',
    pending_approval: 'Pendente de Aprovação',
    approved: 'Aprovada',
    rejected: 'Rejeitada',
  };
  return labels[status] || status;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
