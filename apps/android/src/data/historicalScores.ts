export interface HistoricalSessionPoint {
  sessionId: string;
  dateStr: string;
  timestamp: number;
  overallScore: number;
  passingScore: number;
  durationMins: number;
  stressFactor: number; // 0 - 100
  domainBreakdown: Record<string, number>; // domainId -> percent
}

export const HISTORICAL_SIMULATION_SESSIONS: HistoricalSessionPoint[] = [
  {
    sessionId: 'sess_oct02',
    dateStr: 'Oct 02',
    timestamp: Date.now() - 26 * 86400000,
    overallScore: 54,
    passingScore: 70,
    durationMins: 112,
    stressFactor: 78,
    domainBreakdown: {
      d1: 58,
      d2: 65,
      d3: 42,
      d4: 50,
      d5: 48,
      d6: 60,
      d7: 52,
      d8: 46
    }
  },
  {
    sessionId: 'sess_oct08',
    dateStr: 'Oct 08',
    timestamp: Date.now() - 20 * 86400000,
    overallScore: 61,
    passingScore: 70,
    durationMins: 104,
    stressFactor: 74,
    domainBreakdown: {
      d1: 64,
      d2: 70,
      d3: 51,
      d4: 59,
      d5: 58,
      d6: 64,
      d7: 62,
      d8: 52
    }
  },
  {
    sessionId: 'sess_oct14',
    dateStr: 'Oct 14',
    timestamp: Date.now() - 14 * 86400000,
    overallScore: 68,
    passingScore: 70,
    durationMins: 98,
    stressFactor: 70,
    domainBreakdown: {
      d1: 72,
      d2: 78,
      d3: 58,
      d4: 68,
      d5: 66,
      d6: 70,
      d7: 69,
      d8: 59
    }
  },
  {
    sessionId: 'sess_oct20',
    dateStr: 'Oct 20',
    timestamp: Date.now() - 8 * 86400000,
    overallScore: 71,
    passingScore: 70,
    durationMins: 92,
    stressFactor: 64,
    domainBreakdown: {
      d1: 76,
      d2: 82,
      d3: 65,
      d4: 72,
      d5: 74,
      d6: 73,
      d7: 75,
      d8: 66
    }
  },
  {
    sessionId: 'sess_oct26',
    dateStr: 'Oct 26',
    timestamp: Date.now() - 2 * 86400000,
    overallScore: 78,
    passingScore: 70,
    durationMins: 86,
    stressFactor: 58,
    domainBreakdown: {
      d1: 82,
      d2: 88,
      d3: 72,
      d4: 79,
      d5: 80,
      d6: 78,
      d7: 81,
      d8: 74
    }
  }
];

export interface DomainStressStat {
  domainId: string;
  domainName: string;
  orderNumber: number;
  averageAccuracy: number;
  averageLatencySeconds: number;
  hesitationCount: number;
  stressLevel: 'OPTIMAL' | 'MODERATE' | 'HIGH_STRESS';
  recommendation: string;
}

export const DOMAIN_STRESS_STATS: DomainStressStat[] = [
  {
    domainId: 'd1',
    domainName: 'Security and Risk Management',
    orderNumber: 1,
    averageAccuracy: 82,
    averageLatencySeconds: 44,
    hesitationCount: 2,
    stressLevel: 'OPTIMAL',
    recommendation: 'Solid command of RMF and quantitative risk calculation.'
  },
  {
    domainId: 'd2',
    domainName: 'Asset Security',
    orderNumber: 2,
    averageAccuracy: 88,
    averageLatencySeconds: 36,
    hesitationCount: 1,
    stressLevel: 'OPTIMAL',
    recommendation: 'Exceptional retention speed on NIST SP 800-88 sanitization methods.'
  },
  {
    domainId: 'd3',
    domainName: 'Security Architecture & Engineering',
    orderNumber: 3,
    averageAccuracy: 64,
    averageLatencySeconds: 78,
    hesitationCount: 8,
    stressLevel: 'HIGH_STRESS',
    recommendation: 'Elevated hesitation on Bell-LaPadula vs Biba and Clark-Wilson transaction rules.'
  },
  {
    domainId: 'd4',
    domainName: 'Communication & Network Security',
    orderNumber: 4,
    averageAccuracy: 76,
    averageLatencySeconds: 52,
    hesitationCount: 4,
    stressLevel: 'MODERATE',
    recommendation: 'Review TLS 1.3 cipher negotiation and IPsec AH vs ESP encapsulation.'
  },
  {
    domainId: 'd5',
    domainName: 'Identity and Access Management',
    orderNumber: 5,
    averageAccuracy: 79,
    averageLatencySeconds: 48,
    hesitationCount: 3,
    stressLevel: 'OPTIMAL',
    recommendation: 'Strong grasp of SAML 2.0 vs OIDC token formats and Kerberos TGT tickets.'
  },
  {
    domainId: 'd6',
    domainName: 'Security Assessment and Testing',
    orderNumber: 6,
    averageAccuracy: 75,
    averageLatencySeconds: 56,
    hesitationCount: 4,
    stressLevel: 'MODERATE',
    recommendation: 'Sharpen distinction between SOC 2 Type I and Type II testing periods.'
  },
  {
    domainId: 'd7',
    domainName: 'Security Operations',
    orderNumber: 7,
    averageAccuracy: 81,
    averageLatencySeconds: 42,
    hesitationCount: 2,
    stressLevel: 'OPTIMAL',
    recommendation: 'Consistently rapid recall of RFC 3227 order of volatility hierarchy.'
  },
  {
    domainId: 'd8',
    domainName: 'Software Development Security',
    orderNumber: 8,
    averageAccuracy: 68,
    averageLatencySeconds: 68,
    hesitationCount: 6,
    stressLevel: 'HIGH_STRESS',
    recommendation: 'High latency on OWASP XXE parsing exploits and secure SDLC threat modeling.'
  }
];
