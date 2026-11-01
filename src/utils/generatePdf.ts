import { jsPDF } from 'jspdf';
import type { ValidationReport } from '../types/sharkmind';

/**
 * Generates an executive, professional multi-page PDF startup validation report
 * with SharkMind branding, scores, pillar breakdowns, experiments, and roadmap.
 */
export async function generateValidationReportPdf(report: ValidationReport): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Colors
  const navyDark = [7, 26, 51];      // #071A33
  const deepNavy = [11, 37, 69];     // #0B2545
  const oceanBlue = [23, 59, 99];    // #173B63
  const electricBlue = [59, 130, 246]; // #3B82F6
  const skyBlue = [56, 189, 248];    // #38BDF8
  const textDark = [15, 23, 42];     // slate-900
  const textMuted = [100, 116, 139]; // slate-500
  const bgLight = [248, 250, 252];   // slate-50
  const borderLight = [226, 232, 240]; // slate-200
  const emerald = [16, 185, 129];
  const amber = [245, 158, 11];
  const rose = [239, 68, 68];

  const ensureSpace = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      y = margin + 8;
      drawHeaderMini();
    }
  };

  const drawHeaderMini = () => {
    doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
    doc.rect(margin, margin - 6, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(skyBlue[0], skyBlue[1], skyBlue[2]);
    doc.text('SHARKMIND', margin + 3, margin - 1);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 220, 245);
    doc.text(`Startup Validation Report • ${report.ideaTitle.substring(0, 45)}`, margin + 30, margin - 1);
    y = margin + 10;
  };

  // ================= PAGE 1: COVER & EXECUTIVE SUMMARY =================
  // Header Banner
  doc.setFillColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.rect(0, 0, pageWidth, 52, 'F');

  // Accent line
  doc.setFillColor(electricBlue[0], electricBlue[1], electricBlue[2]);
  doc.rect(0, 52, pageWidth, 2.5, 'F');

  // Shark Fin Icon / Graphic
  doc.setFillColor(electricBlue[0], electricBlue[1], electricBlue[2]);
  doc.triangle(margin, 28, margin + 8, 14, margin + 11, 28, 'F');
  doc.setFillColor(skyBlue[0], skyBlue[1], skyBlue[2]);
  doc.triangle(margin + 3, 28, margin + 8, 16, margin + 10, 28, 'F');

  // Logo Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text('SHARKMIND', margin + 15, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(skyBlue[0], skyBlue[1], skyBlue[2]);
  doc.text('STARTUP VALIDATION PLATFORM • EXECUTIVE REPORT', margin + 15, 29);

  // Meta info on the right
  doc.setFontSize(8.5);
  doc.setTextColor(180, 205, 235);
  const formattedDate = new Date(report.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Date: ${formattedDate}`, pageWidth - margin, 21, { align: 'right' });
  doc.text(`Report ID: ${report.id.substring(0, 10).toUpperCase()}`, pageWidth - margin, 27, { align: 'right' });
  doc.text(`Conf. Level: ${report.viability.confidenceLevel} (${report.viability.confidenceScore}%)`, pageWidth - margin, 33, { align: 'right' });

  // Project title box
  y = 62;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  const splitTitle = doc.splitTextToSize(report.ideaTitle, contentWidth);
  doc.text(splitTitle, margin, y);
  y += splitTitle.length * 7.5 + 4;

  // Viability Metric Cards Row
  const cardW = (contentWidth - 6) / 2;
  const cardH = 26;

  // Left card: Overall Viability
  const score = report.viability.overallScore;
  let scoreColor = electricBlue;
  if (score >= 75) scoreColor = emerald;
  else if (score >= 50) scoreColor = amber;
  else scoreColor = rose;

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
  doc.roundedRect(margin, y, cardW, cardH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('OVERALL VIABILITY SCORE', margin + 6, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${score}`, margin + 6, y + 19);

  doc.setFontSize(10);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('/ 100', margin + 22, y + 19);

  // Right card: Strategic Recommendation
  const rightCardX = margin + cardW + 6;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(rightCardX, y, cardW, cardH, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('STRATEGIC VERDICT', rightCardX + 6, y + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(deepNavy[0], deepNavy[1], deepNavy[2]);
  const splitVerdict = doc.splitTextToSize(report.finalRecommendation.category.toUpperCase(), cardW - 12);
  doc.text(splitVerdict, rightCardX + 6, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Data Confidence: ${report.viability.confidenceScore}%`, rightCardX + 6, y + 21);

  y += cardH + 8;

  // Executive Summary Section
  doc.setFillColor(oceanBlue[0], oceanBlue[1], oceanBlue[2]);
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('1. Executive Summary', margin + 6, y + 5.5);
  y += 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  const execSummaryLines = doc.splitTextToSize(report.executiveSummary, contentWidth);
  doc.text(execSummaryLines, margin, y);
  y += execSummaryLines.length * 4.8 + 8;

  // Criteria Pillars Table / Bars
  ensureSpace(45);
  doc.setFillColor(oceanBlue[0], oceanBlue[1], oceanBlue[2]);
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('2. Weighted Viability Breakdown', margin + 6, y + 5.5);
  y += 10;

  report.viability.criteria.forEach((criterion) => {
    ensureSpace(24);
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.roundedRect(margin, y, contentWidth, 20, 1.5, 1.5, 'FD');

    // Title and Weight
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(deepNavy[0], deepNavy[1], deepNavy[2]);
    doc.text(criterion.name, margin + 4, y + 5.5);

    const weightText = `Weight: ${Math.round(criterion.weight * 100)}%`;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(weightText, margin + 4, y + 10);

    // Score on right
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    let critColor = electricBlue;
    if (criterion.score >= 75) critColor = emerald;
    else if (criterion.score < 50) critColor = rose;
    doc.setTextColor(critColor[0], critColor[1], critColor[2]);
    doc.text(`${criterion.score}/100`, pageWidth - margin - 4, y + 6.5, { align: 'right' });

    // Score mini progress bar
    const barW = 35;
    const barX = pageWidth - margin - 4 - barW;
    doc.setFillColor(226, 232, 240);
    doc.rect(barX, y + 9, barW, 2, 'F');
    doc.setFillColor(critColor[0], critColor[1], critColor[2]);
    doc.rect(barX, y + 9, (barW * criterion.score) / 100, 2, 'F');

    // Brief description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const expLines = doc.splitTextToSize(criterion.explanation, contentWidth - 8);
    const shortExp = expLines.slice(0, 2);
    doc.text(shortExp, margin + 4, y + 14.5);

    y += 22;
  });

  // ================= SECTION 3: PROBLEM & CUSTOMER =================
  ensureSpace(40);
  y += 4;
  doc.setFillColor(oceanBlue[0], oceanBlue[1], oceanBlue[2]);
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('3. Problem, Urgency & Target Persona', margin + 6, y + 5.5);
  y += 10;

  const renderInfoRow = (label: string, text: string) => {
    ensureSpace(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(deepNavy[0], deepNavy[1], deepNavy[2]);
    doc.text(label, margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    const lines = doc.splitTextToSize(text || 'Not specified', contentWidth);
    doc.text(lines, margin, y);
    y += lines.length * 4.2 + 4;
  };

  renderInfoRow('Target Customer Segment & Persona', report.problemAndCustomer.customerPersona);
  renderInfoRow('Problem Severity & Urgency', report.problemAndCustomer.problemUrgency);
  renderInfoRow('Current Alternatives & Workarounds', report.problemAndCustomer.currentAlternatives);

  if (report.problemAndCustomer.painPoints && report.problemAndCustomer.painPoints.length > 0) {
    ensureSpace(15);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(deepNavy[0], deepNavy[1], deepNavy[2]);
    doc.text('Key Pain Points:', margin, y);
    y += 4.5;
    report.problemAndCustomer.painPoints.forEach((point) => {
      ensureSpace(8);
      doc.setFillColor(electricBlue[0], electricBlue[1], electricBlue[2]);
      doc.circle(margin + 2, y - 1, 1, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const pointLines = doc.splitTextToSize(point, contentWidth - 6);
      doc.text(pointLines, margin + 6, y);
      y += pointLines.length * 4 + 1.5;
    });
    y += 3;
  }

  // ================= SECTION 4: MARKET & COMPETITION =================
  ensureSpace(40);
  doc.setFillColor(oceanBlue[0], oceanBlue[1], oceanBlue[2]);
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('4. Market Opportunity & Competitive Moat', margin + 6, y + 5.5);
  y += 10;

  renderInfoRow('Market Dynamics & Growth Tailwinds', report.marketOpportunity.marketDynamics);
  renderInfoRow('Core Market Hypothesis', report.marketOpportunity.marketHypothesis);
  renderInfoRow('Defensible Moat / Unfair Advantage', report.competitorAnalysis.unfairAdvantageOrMoat);
  if (report.competitorAnalysis.directAndIndirectCompetitors.length > 0) {
    renderInfoRow(
      'Identified Competitors',
      report.competitorAnalysis.directAndIndirectCompetitors.join(', ')
    );
  }

  // ================= SECTION 5: BUSINESS MODEL & RISKS =================
  ensureSpace(40);
  doc.setFillColor(oceanBlue[0], oceanBlue[1], oceanBlue[2]);
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('5. Business Model & Critical Risks', margin + 6, y + 5.5);
  y += 10;

  renderInfoRow('Monetization & Revenue Streams', report.businessModel.revenueStreams.join(' • '));
  renderInfoRow('Primary Cost Drivers', report.businessModel.costDrivers.join(' • '));
  renderInfoRow('Pricing Hypothesis', report.businessModel.pricingHypothesis);

  if (report.risksAndWeaknesses && report.risksAndWeaknesses.length > 0) {
    ensureSpace(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(deepNavy[0], deepNavy[1], deepNavy[2]);
    doc.text('Identified Strategic Risks & Mitigations:', margin, y);
    y += 5;

    report.risksAndWeaknesses.forEach((risk) => {
      ensureSpace(14);
      doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
      doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
      doc.roundedRect(margin, y, contentWidth, 12, 1, 1, 'FD');

      let sevColor = electricBlue;
      const sev = String(risk.severity).toLowerCase();
      if (sev.includes('high') || sev.includes('alta')) sevColor = rose;
      else if (sev.includes('med')) sevColor = amber;

      doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
      doc.rect(margin, y, 2, 12, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(deepNavy[0], deepNavy[1], deepNavy[2]);
      doc.text(`${risk.title} [${risk.severity}]`, margin + 5, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const mitLines = doc.splitTextToSize(`Mitigation: ${risk.mitigation}`, contentWidth - 10);
      doc.text(mitLines[0] || '', margin + 5, y + 9);

      y += 14;
    });
    y += 4;
  }

  // ================= SECTION 6: VALIDATION EXPERIMENTS =================
  ensureSpace(40);
  doc.setFillColor(oceanBlue[0], oceanBlue[1], oceanBlue[2]);
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('6. Practical Validation Experiments (Lean Testing)', margin + 6, y + 5.5);
  y += 10;

  report.validationExperiments.forEach((exp, idx) => {
    ensureSpace(35);
    doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.roundedRect(margin, y, contentWidth, 30, 1.5, 1.5, 'FD');

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(deepNavy[0], deepNavy[1], deepNavy[2]);
    doc.text(`Exp ${idx + 1}: ${exp.name} (${exp.type})`, margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(`Duration: ${exp.estimatedDuration}  |  Est. Cost: ${exp.estimatedCost}  |  Target: ${exp.targetParticipants}`, margin + 4, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text('Hypothesis:', margin + 4, y + 14);
    doc.setFont('helvetica', 'normal');
    const hypLines = doc.splitTextToSize(exp.hypothesis, contentWidth - 28);
    doc.text(hypLines[0] || '', margin + 22, y + 14);

    doc.setFont('helvetica', 'bold');
    doc.text('Success Metric:', margin + 4, y + 19);
    doc.setFont('helvetica', 'normal');
    doc.text(`${exp.successMetric} (Passing: ${exp.suggestedThreshold})`, margin + 26, y + 19);

    doc.setFont('helvetica', 'bold');
    doc.text('Decision Rule:', margin + 4, y + 24);
    doc.setFont('helvetica', 'normal');
    const decLines = doc.splitTextToSize(exp.decisionRule, contentWidth - 28);
    doc.text(decLines[0] || '', margin + 24, y + 24);

    y += 33;
  });

  // ================= SECTION 7: ACTION ROADMAP =================
  ensureSpace(45);
  doc.setFillColor(oceanBlue[0], oceanBlue[1], oceanBlue[2]);
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(navyDark[0], navyDark[1], navyDark[2]);
  doc.text('7. De-Risking Action Roadmap', margin + 6, y + 5.5);
  y += 10;

  const renderRoadmapStep = (period: string, items: string[]) => {
    ensureSpace(20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(electricBlue[0], electricBlue[1], electricBlue[2]);
    doc.text(period.toUpperCase(), margin, y);
    y += 4.5;

    items.forEach((item) => {
      ensureSpace(8);
      doc.setFillColor(oceanBlue[0], oceanBlue[1], oceanBlue[2]);
      doc.circle(margin + 2, y - 1, 0.8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const lines = doc.splitTextToSize(item, contentWidth - 6);
      doc.text(lines, margin + 6, y);
      y += lines.length * 4 + 1;
    });
    y += 3;
  };

  renderRoadmapStep('First 48 Hours (Momentum & Immediate Verification)', report.actionPlan.first48Hours);
  renderRoadmapStep('First 7 Days (Field Interviews & Prototype)', report.actionPlan.first7Days);
  renderRoadmapStep('First 30 Days (Pilot Testing & Traction Signal)', report.actionPlan.first30Days);

  // Footer for each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(borderLight[0], borderLight[1], borderLight[2]);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('SHARKMIND • Understand before evaluating. Validate before investing.', margin, pageHeight - 8);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  // Trigger download reliably across desktop, mobile and iframe environments
  const cleanFilename = `sharkmind-validation-report-${report.ideaTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .substring(0, 30)
    .replace(/-+$/, '') || 'report'}.pdf`;

  try {
    doc.save(cleanFilename);
  } catch (err) {
    console.warn('Standard doc.save failed, falling back to Blob download:', err);
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = cleanFilename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  }
}
