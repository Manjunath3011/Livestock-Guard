import { store } from './store';
import {
  Animal,
  Herd,
  Case,
  LabSample,
  VaccinationRecord,
  TreatmentRecord,
  MortalityReport,
  Alert,
  WeatherData,
  RiskCalculationResult,
  Species,
  SymptomObservation,
  CaseStatus,
  TestResult
} from '../types';
import { DISEASES_DATABASE, SYMPTOMS_LIST } from '../data/knowledgeBase';
import { assessLivestockRisk } from './riskEngine';

// Simulates network latency for realistic loading states
const latency = (ms: number = 100) => new Promise(res => setTimeout(res, ms));

export const api = {
  // Auth & Session
  auth: {
    getCurrentUser: async () => {
      await latency(50);
      return store.getCurrentUser();
    },
    switchRole: async (role: any) => {
      await latency(50);
      store.switchRole(role);
      return store.getCurrentUser();
    },
    getAllUsers: async () => {
      await latency(50);
      return store.getAllUsers();
    }
  },

  // Animals
  animals: {
    list: async (params?: { species?: Species; search?: string; healthStatus?: string }) => {
      await latency(80);
      let list = store.getAnimals();
      if (params?.species) {
        list = list.filter(a => a.species === params.species);
      }
      if (params?.healthStatus) {
        list = list.filter(a => a.currentHealthStatus === params.healthStatus);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          a =>
            a.tagNumber.toLowerCase().includes(q) ||
            (a.name && a.name.toLowerCase().includes(q)) ||
            a.ownerName.toLowerCase().includes(q) ||
            a.villageId.toLowerCase().includes(q)
        );
      }
      return list;
    },
    getById: async (id: string) => {
      await latency(50);
      return store.getAnimalById(id);
    },
    create: async (data: any) => {
      await latency(120);
      return store.registerAnimal(data);
    }
  },

  // Herds
  herds: {
    list: async () => {
      await latency(60);
      return store.getHerds();
    },
    create: async (data: any) => {
      await latency(100);
      return store.registerHerd(data);
    }
  },

  // Symptoms & Knowledge Base
  symptoms: {
    list: async () => {
      await latency(40);
      return SYMPTOMS_LIST;
    }
  },

  diseases: {
    list: async (params?: { species?: Species; category?: string; search?: string }) => {
      await latency(60);
      let list = DISEASES_DATABASE;
      if (params?.species) {
        list = list.filter(d => d.affectedSpecies.includes(params.species!) || d.affectedSpecies.includes('Other'));
      }
      if (params?.category) {
        list = list.filter(d => d.category === params.category);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          d =>
            d.name.toLowerCase().includes(q) ||
            (d.scientificName && d.scientificName.toLowerCase().includes(q)) ||
            (d.commonNames && d.commonNames.some(c => c.toLowerCase().includes(q))) ||
            (d.causativeAgent && d.causativeAgent.toLowerCase().includes(q))
        );
      }
      return list;
    },
    getById: async (id: string) => {
      await latency(40);
      return DISEASES_DATABASE.find(d => d.id === id);
    }
  },

  // Cases & Triage
  cases: {
    list: async (params?: { status?: CaseStatus; priority?: string; search?: string }) => {
      await latency(90);
      let list = store.getCases();
      if (params?.status) {
        list = list.filter(c => c.status === params.status);
      }
      if (params?.priority) {
        list = list.filter(c => c.priority === params.priority);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          c =>
            (c.caseNumber && c.caseNumber.toLowerCase().includes(q)) ||
            (c.villageName && c.villageName.toLowerCase().includes(q)) ||
            (c.ownerName && c.ownerName.toLowerCase().includes(q)) ||
            (c.suspectedDiseases && c.suspectedDiseases.some(s => s.diseaseName && s.diseaseName.toLowerCase().includes(q)))
        );
      }
      return list;
    },
    getById: async (id: string) => {
      await latency(50);
      return store.getCaseById(id);
    },
    create: async (data: any) => {
      await latency(150);
      return store.createCase(data);
    },
    updateStatus: async (caseId: string, status: CaseStatus, notes?: string) => {
      await latency(100);
      return store.updateCaseStatus(caseId, status, notes);
    }
  },

  // Risk Engine
  risk: {
    assess: async (params: {
      species: Species;
      symptoms: SymptomObservation[];
      affectedCount: number;
      totalAnimalsInHerd?: number;
      deadCount: number;
      latitude: number;
      longitude: number;
      vaccinationStatus?: 'UP_TO_DATE' | 'OVERDUE' | 'UNVACCINATED';
    }): Promise<RiskCalculationResult> => {
      await latency(100);
      return assessLivestockRisk({
        ...params,
        existingCases: store.getCases(),
        activeOutbreaks: store.getOutbreaks(),
        config: store.getSystemConfig()
      });
    }
  },

  // Outbreaks
  outbreaks: {
    list: async () => {
      await latency(70);
      return store.getOutbreaks();
    },
    getById: async (id: string) => {
      await latency(40);
      return store.getOutbreakById(id);
    }
  },

  // Lab Samples
  laboratory: {
    listSamples: async (params?: { status?: string }) => {
      await latency(80);
      let list = store.getLabSamples();
      if (params?.status) {
        list = list.filter(s => s.status === params.status);
      }
      return list;
    },
    createSample: async (data: any) => {
      await latency(120);
      return store.createLabSample(data);
    },
    submitResult: async (sampleId: string, result: TestResult, resultDetails: string, remarks?: string) => {
      await latency(150);
      return store.submitLabResult(sampleId, result, resultDetails, remarks);
    }
  },

  // Vaccinations
  vaccinations: {
    list: async () => {
      await latency(60);
      return store.getVaccinations();
    },
    create: async (data: any) => {
      await latency(100);
      return store.createVaccinationRecord(data);
    }
  },

  // Treatments
  treatments: {
    list: async () => {
      await latency(60);
      return store.getTreatments();
    },
    create: async (data: any) => {
      await latency(100);
      return store.createTreatmentRecord(data);
    }
  },

  // Mortality
  mortality: {
    list: async () => {
      await latency(70);
      return store.getMortalityReports();
    },
    create: async (data: any) => {
      await latency(120);
      return store.createMortalityReport(data);
    }
  },

  // Alerts & Advisories
  alerts: {
    list: async () => {
      await latency(50);
      return store.getAlerts();
    },
    markRead: async (id: string) => {
      store.markAlertAsRead(id);
    },
    markAllRead: async () => {
      store.markAllAlertsRead();
    }
  },

  // Weather
  weather: {
    getByDistrict: async (districtId: string) => {
      await latency(60);
      return store.getWeather(districtId);
    }
  }
};
