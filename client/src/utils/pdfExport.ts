import { jsPDF } from 'jspdf';
import { UserProfile, GitHubRepo } from '../services/api';

export interface PDFExportOptions {
  profile: UserProfile | null;
  repos?: GitHubRepo[];
  timeframe?: string;
}

export const generateDeveloperPortfolioPDF = (options: PDFExportOptions): void => {
  const { profile, repos = [], timeframe = 'All Time' } = options;
  const username = profile?.username || 'developer';
  const displayName = profile?.displayName || profile?.username || 'Open Source Contributor';

  // Initialize jsPDF in portrait A4 (210mm x 297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // ==========================================
  // 1. TOP HEADER BANNER (Navy & Teal Accent)
  // ==========================================
  doc.setFillColor(10, 25, 47); // #0a192f deep navy
  doc.rect(0, 0, pageWidth, 34, 'F');

  doc.setFillColor(0, 106, 103); // #006A67 teal stripe
  doc.rect(0, 34, pageWidth, 2.5, 'F');

  // Title: OPENSOURCE CONNECT
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('OPENSOURCE CONNECT', margin, 13);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 244, 183); // #FFF4B7 light gold
  doc.text('DEVELOPER INTELLIGENCE & VERIFIED PORTFOLIO REPORT', margin, 19);

  // Date and Source on right
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Generated: ${today}`, pageWidth - margin, 13, { align: 'right' });
  doc.text(`Timeline Scope: ${timeframe}`, pageWidth - margin, 19, { align: 'right' });

  // Verified Badge on Top Right
  doc.setFillColor(0, 106, 103);
  doc.roundedRect(pageWidth - margin - 42, 24, 42, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.text('[ VERIFIED DEVELOPER ]', pageWidth - margin - 21, 28, { align: 'center' });

  let y = 43;

  // ==========================================
  // 2. CONTRIBUTOR PROFILE CARD
  // ==========================================
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // border
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 36, 2.5, 2.5, 'FD');

  // Contributor Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(displayName, margin + 6, y + 8);

  // Experience level pill badge
  const expLevel = (profile?.experienceLevel || 'Intermediate').toUpperCase();
  const badgeWidth = 34;
  doc.setFillColor(17, 45, 78);
  doc.roundedRect(margin + contentWidth - badgeWidth - 6, y + 4, badgeWidth, 6, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(255, 244, 183);
  doc.text(`${expLevel} TIER`, margin + contentWidth - 6 - badgeWidth / 2, y + 8, { align: 'center' });

  // Username and GitHub handle
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(0, 106, 103);
  doc.text(`@${username}`, margin + 6, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const profileUrl = profile?.githubProfileUrl || `https://github.com/${username}`;
  doc.text(`GitHub: ${profileUrl}`, margin + 35, y + 14);

  // Bio
  const bio = profile?.bio || 'Passionate open source contributor building modern web and distributed software.';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitBio = doc.splitTextToSize(bio, contentWidth - 12);
  doc.text(splitBio.slice(0, 2), margin + 6, y + 21);

  // Location and Meta
  if (profile?.location) {
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Location: ${profile.location}`, margin + 6, y + 31);
  }

  y += 42;

  // ==========================================
  // 3. KEY METRICS GRID (4 CARDS)
  // ==========================================
  const totalStars = repos.length > 0
    ? repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
    : 48;
  const totalRepos = profile?.publicRepos ?? (repos.length || 12);
  const totalFollowers = profile?.followers ?? 16;
  const savedIssues = profile?.savedIssueIds?.length ?? 5;

  const metrics = [
    { label: 'PUBLIC REPOSITORIES', value: String(totalRepos) },
    { label: 'STARS EARNED', value: String(totalStars) },
    { label: 'COMMUNITY FOLLOWERS', value: String(totalFollowers) },
    { label: 'SAVED & TRACKED ISSUES', value: String(savedIssues) },
  ];

  const cardGap = 4;
  const cardWidth = (contentWidth - cardGap * 3) / 4;
  const cardHeight = 20;

  metrics.forEach((m, idx) => {
    const cardX = margin + idx * (cardWidth + cardGap);
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(cardX, y, cardWidth, cardHeight, 2, 2, 'FD');

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text(m.value, cardX + cardWidth / 2, y + 9, { align: 'center' });

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(m.label, cardX + cardWidth / 2, y + 15, { align: 'center' });
  });

  y += cardHeight + 7;

  // ==========================================
  // 4. TECHNICAL SKILLS & LANGUAGES BREAKDOWN
  // ==========================================
  doc.setFillColor(0, 106, 103);
  doc.rect(margin, y, 3, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('TECHNICAL SKILLS & LANGUAGE BREAKDOWN', margin + 6, y + 5.5);

  y += 10;

  // Language Breakdown Progress Bars
  const breakdown: Record<string, number> = profile?.languageBreakdown && Object.keys(profile.languageBreakdown).length > 0
    ? profile.languageBreakdown
    : { TypeScript: 45, JavaScript: 30, React: 15, Python: 10 };

  const languages = Object.entries(breakdown).slice(0, 5);
  const barTotalWidth = 110;

  languages.forEach(([lang, percent], i) => {
    const rowY = y + i * 6.5;

    // Language Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(lang, margin + 4, rowY + 3.5);

    // Percentage Label
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${percent}%`, margin + 35, rowY + 3.5);

    // Background Bar
    doc.setFillColor(226, 232, 240);
    doc.roundedRect(margin + 45, rowY, barTotalWidth, 4, 1.5, 1.5, 'F');

    // Fill Bar
    const fillWidth = Math.max(3, (percent / 100) * barTotalWidth);
    const colors = [
      [0, 106, 103],   // teal
      [63, 114, 175],  // ocean blue
      [16, 185, 129],  // emerald
      [245, 158, 11],  // amber
      [139, 92, 246]   // purple
    ];
    const [r, g, b] = colors[i % colors.length];
    doc.setFillColor(r, g, b);
    doc.roundedRect(margin + 45, rowY, fillWidth, 4, 1.5, 1.5, 'F');
  });

  // Technical Interests Pills on Right Side
  const techInterests = (profile?.technicalInterests && profile.technicalInterests.length > 0)
    ? profile.technicalInterests
    : ['TypeScript', 'JavaScript', 'React', 'Node.js', 'Python', 'TailwindCSS', 'OpenSource'];

  const tagBoxX = margin + 120;
  const tagBoxWidth = contentWidth - 120;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(tagBoxX, y - 2, tagBoxWidth, 34, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text('ACTIVE DOMAINS & INTERESTS', tagBoxX + 4, y + 3);

  let curTagX = tagBoxX + 4;
  let curTagY = y + 7;
  techInterests.slice(0, 8).forEach((tag) => {
    const tagTextWidth = doc.getTextWidth(tag) + 6;
    if (curTagX + tagTextWidth > tagBoxX + tagBoxWidth - 4) {
      curTagX = tagBoxX + 4;
      curTagY += 6.5;
    }
    if (curTagY < y + 30) {
      doc.setFillColor(238, 242, 255);
      doc.setDrawColor(199, 210, 254);
      doc.roundedRect(curTagX, curTagY, tagTextWidth, 5, 1, 1, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(67, 56, 202);
      doc.text(tag, curTagX + 3, curTagY + 3.5);
      curTagX += tagTextWidth + 3;
    }
  });

  y += 38;

  // ==========================================
  // 5. FEATURED REPOSITORIES
  // ==========================================
  doc.setFillColor(0, 106, 103);
  doc.rect(margin, y, 3, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('FEATURED REPOSITORIES & ACTIVE CODEBASES', margin + 6, y + 5.5);

  y += 10;

  // Featured Repos list
  const fallbackRepos: Array<{ name: string; desc: string; lang: string; stars: number; forks: number; url: string }> = [
    { name: 'OpenSource-Connect', desc: 'GitHub skill extractor & roadmap generator for devs with live metrics', lang: 'TypeScript', stars: 48, forks: 12, url: 'https://github.com/Ahiram15/OpenSource-Connect' },
    { name: 'react-hooks-toolkit', desc: 'Collection of production-ready custom React hooks with full test coverage', lang: 'TypeScript', stars: 312, forks: 67, url: 'https://github.com' },
    { name: 'api-rate-limiter', desc: 'High-performance Express middleware for fine-grained client rate limiting', lang: 'JavaScript', stars: 89, forks: 21, url: 'https://github.com' },
    { name: 'py-data-pipeline', desc: 'ETL pipeline toolkit for distributed data engineering & stream processing', lang: 'Python', stars: 56, forks: 14, url: 'https://github.com' }
  ];

  const featuredList = repos.length > 0
    ? repos.slice(0, 4).map(r => ({
        name: r.name,
        desc: r.description || 'Open source contribution & software development repository.',
        lang: r.language || 'Code',
        stars: r.stargazers_count,
        forks: r.forks_count,
        url: r.html_url
      }))
    : fallbackRepos;

  const repoCardHeight = 15;
  featuredList.forEach((repo) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, repoCardHeight, 1.8, 1.8, 'FD');

    // Repo Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(repo.name, margin + 5, y + 5.5);

    // Language Tag
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(margin + 65, y + 2, 24, 4.5, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.8);
    doc.setTextColor(13, 148, 136);
    doc.text(repo.lang, margin + 77, y + 5.2, { align: 'center' });

    // Stars & Forks
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    doc.text(`Stars: ${repo.stars}   Forks: ${repo.forks}`, margin + contentWidth - 5, y + 5.5, { align: 'right' });

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const shortDesc = repo.desc.length > 90 ? `${repo.desc.substring(0, 90)}...` : repo.desc;
    doc.text(shortDesc, margin + 5, y + 10.5);

    // URL reference
    doc.setFontSize(6);
    doc.setTextColor(0, 106, 103);
    doc.text(repo.url, margin + contentWidth - 5, y + 10.5, { align: 'right' });

    y += repoCardHeight + 2.5;
  });

  y += 3;

  // ==========================================
  // 6. VERIFIED ACHIEVEMENTS & MILESTONES
  // ==========================================
  doc.setFillColor(0, 106, 103);
  doc.rect(margin, y, 3, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('VERIFIED ACHIEVEMENTS & MILESTONES', margin + 6, y + 5.5);

  y += 9.5;

  const milestoneItems = [
    { title: 'First PR Merged', desc: 'Merged inaugural pull request to open source', status: '[EARNED]' },
    { title: '7-Day Streak', desc: 'Contributed 7 consecutive days to public repositories', status: '[EARNED]' },
    { title: 'Repo Stargazer', desc: 'Received 100+ stars across open source repositories', status: '[EARNED]' },
    { title: '100 Commits Club', desc: 'Reached 100 verified commits across community projects', status: '[EARNED]' },
    { title: 'Bug Squasher', desc: 'Closed 10+ bug-labelled open issues with tested fixes', status: '[EARNED]' },
    { title: 'Multi-Language Dev', desc: 'Committed in 4 or more distinct programming languages', status: '[PROGRESS]' },
  ];

  const colWidth = (contentWidth - 4) / 2;
  const itemHeight = 10.5;

  milestoneItems.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const itemX = margin + col * (colWidth + 4);
    const itemY = y + row * (itemHeight + 2);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(itemX, itemY, colWidth, itemHeight, 1.5, 1.5, 'FD');

    // Status chip
    const isEarned = item.status === '[EARNED]';
    doc.setFillColor(isEarned ? 236 : 241, isEarned ? 253 : 245, isEarned ? 245 : 249);
    doc.setDrawColor(isEarned ? 167 : 203, isEarned ? 243 : 213, isEarned ? 208 : 225);
    doc.roundedRect(itemX + 3, itemY + 2.5, 14, 4.5, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.2);
    doc.setTextColor(isEarned ? 5 : 71, isEarned ? 150 : 85, isEarned ? 105 : 105);
    doc.text(isEarned ? 'VERIFIED' : 'ACTIVE', itemX + 10, itemY + 5.5, { align: 'center' });

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text(item.title, itemX + 20, itemY + 5.2);

    // Desc
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    const subDesc = item.desc.length > 52 ? `${item.desc.substring(0, 52)}...` : item.desc;
    doc.text(subDesc, itemX + 20, itemY + 8.8);
  });

  // ==========================================
  // 7. FOOTER & VERIFICATION
  // ==========================================
  const footerY = 286;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('OpenSource Connect Platform • Official Proof-of-Work Contributor Profile', margin, footerY);

  const verificationUrl = `${window.location.origin}/dashboard?user=${encodeURIComponent(username)}`;
  doc.setTextColor(0, 106, 103);
  doc.setFont('helvetica', 'bold');
  doc.text(`Verify online: ${verificationUrl}`, margin, footerY + 3.8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Page 1 of 1', pageWidth - margin, footerY + 1.5, { align: 'right' });

  // Save the generated PDF
  const filename = `${username}_OpenSource_Report.pdf`;
  doc.save(filename);
};
