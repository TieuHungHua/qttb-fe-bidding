import { getInitialData } from './mockData';
import type {
  User,
  Department,
  Supplier,
  YearBudget,
  ProcurementPlan,
  BiddingProject,
  Contract,
  PurchaseOrder,
  FormTemplate,
  ApprovalDocument,
} from './types';

const STORAGE_KEY = 'qttb_data';
const AUTH_KEY = 'qttb_auth';
const DATA_VERSION = '2.3'; // Bump this when mock data changes significantly
const VERSION_KEY = 'qttb_data_version';

export interface StorageData {
  users: User[];
  departments: Department[];
  suppliers: Supplier[];
  yearBudget: YearBudget;
  procurementPlans: ProcurementPlan[];
  biddingProjects: BiddingProject[];
  contracts: Contract[];
  purchaseOrders: PurchaseOrder[];
  formTemplates: FormTemplate[];
  approvalDocuments: ApprovalDocument[];
}

export interface AuthData {
  userId: string;
  role: string;
  token: string;
}

class LocalStorageManager {
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;

    const existing = localStorage.getItem(STORAGE_KEY);
    const version = localStorage.getItem(VERSION_KEY);
    if (!existing || version !== DATA_VERSION) {
      const initialData = getInitialData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
      localStorage.setItem(VERSION_KEY, DATA_VERSION);
    }

    this.isInitialized = true;
  }

  getData(): StorageData {
    this.initialize();
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getInitialData();
  }

  saveData(data: Partial<StorageData>) {
    this.initialize();
    const existing = localStorage.getItem(STORAGE_KEY);
    const current = existing ? JSON.parse(existing) : getInitialData();
    const updated = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  // Users
  getUsers(): User[] {
    return this.getData().users;
  }

  getUserById(id: string): User | undefined {
    return this.getUsers().find(u => u.id === id);
  }

  saveUsers(users: User[]) {
    this.saveData({ users });
  }

  // Departments
  getDepartments(): Department[] {
    return this.getData().departments;
  }

  getDepartmentById(id: string): Department | undefined {
    return this.getDepartments().find(d => d.id === id);
  }

  saveDepartments(departments: Department[]) {
    this.saveData({ departments });
  }

  // Suppliers
  getSuppliers(): Supplier[] {
    return this.getData().suppliers;
  }

  getSupplierById(id: string): Supplier | undefined {
    return this.getSuppliers().find(s => s.id === id);
  }

  saveSuppliers(suppliers: Supplier[]) {
    this.saveData({ suppliers });
  }

  updateSupplier(supplier: Supplier) {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex(s => s.id === supplier.id);
    if (index !== -1) {
      suppliers[index] = supplier;
      this.saveSuppliers(suppliers);
    }
  }

  // Budget
  getYearBudget(): YearBudget {
    return this.getData().yearBudget;
  }

  saveYearBudget(budget: YearBudget) {
    this.saveData({ yearBudget: budget });
  }

  // Procurement Plans
  getProcurementPlans(): ProcurementPlan[] {
    return this.getData().procurementPlans;
  }

  getProcurementPlanById(id: string): ProcurementPlan | undefined {
    return this.getProcurementPlans().find(p => p.id === id);
  }

  saveProcurementPlans(plans: ProcurementPlan[]) {
    this.saveData({ procurementPlans: plans });
  }

  // Bidding Projects
  getBiddingProjects(): BiddingProject[] {
    return this.getData().biddingProjects;
  }

  getBiddingProjectById(id: string): BiddingProject | undefined {
    return this.getBiddingProjects().find(b => b.id === id);
  }

  saveBiddingProjects(projects: BiddingProject[]) {
    this.saveData({ biddingProjects: projects });
  }

  updateBiddingProject(id: string, updates: Partial<BiddingProject>) {
    const projects = this.getBiddingProjects();
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveBiddingProjects(projects);
    }
  }

  // Contracts
  getContracts(): Contract[] {
    return this.getData().contracts;
  }

  getContractById(id: string): Contract | undefined {
    return this.getContracts().find(c => c.id === id);
  }

  saveContracts(contracts: Contract[]) {
    this.saveData({ contracts });
  }

  // Purchase Orders
  getPurchaseOrders(): PurchaseOrder[] {
    return this.getData().purchaseOrders;
  }

  getPurchaseOrderById(id: string): PurchaseOrder | undefined {
    return this.getPurchaseOrders().find(po => po.id === id);
  }

  savePurchaseOrders(orders: PurchaseOrder[]) {
    this.saveData({ purchaseOrders: orders });
  }

  // Form Templates
  getFormTemplates(): FormTemplate[] {
    return this.getData().formTemplates || [];
  }

  getFormTemplateById(id: string): FormTemplate | undefined {
    return this.getFormTemplates().find(t => t.id === id);
  }

  saveFormTemplate(template: FormTemplate) {
    const templates = this.getFormTemplates();
    const index = templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      templates[index] = template;
    } else {
      templates.push(template);
    }
    this.saveData({ formTemplates: templates });
  }

  deleteFormTemplate(id: string) {
    const templates = this.getFormTemplates().filter(t => t.id !== id);
    this.saveData({ formTemplates: templates });
  }

  // Approval Documents
  getApprovalDocuments(): ApprovalDocument[] {
    return this.getData().approvalDocuments || [];
  }

  getApprovalDocumentById(id: string): ApprovalDocument | undefined {
    return this.getApprovalDocuments().find(d => d.id === id);
  }

  saveApprovalDocument(doc: ApprovalDocument) {
    const docs = this.getApprovalDocuments();
    const index = docs.findIndex(d => d.id === doc.id);
    if (index >= 0) {
      docs[index] = doc;
    } else {
      docs.push(doc);
    }
    this.saveData({ approvalDocuments: docs });
  }

  deleteApprovalDocument(id: string) {
    const docs = this.getApprovalDocuments().filter(d => d.id !== id);
    this.saveData({ approvalDocuments: docs });
  }

  // Auth
  getAuth(): AuthData | null {
    const auth = localStorage.getItem(AUTH_KEY);
    return auth ? JSON.parse(auth) : null;
  }

  saveAuth(auth: AuthData) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  }

  clearAuth() {
    localStorage.removeItem(AUTH_KEY);
  }

  // Clear all data
  clearAll() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(AUTH_KEY);
    this.isInitialized = false;
  }
}

export const storage = new LocalStorageManager();