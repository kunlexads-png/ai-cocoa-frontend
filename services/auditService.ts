
import { AuditLogEntry, UserRole } from '../types';

class AuditService {
  private logs: AuditLogEntry[] = [];

  constructor() {
    // Seed some initial logs with allowed roles
    this.addLog('System', UserRole.PLANT_MANAGER, 'SYSTEM_INIT', 'Core', 'Dashboard services initialized.', 'Success');
    this.addLog('Sarah M.', UserRole.PLANT_MANAGER, 'BATCH_CREATE', 'Intake', 'Created batch INT-2023-001', 'Success');
    this.addLog('John O.', UserRole.OPERATOR, 'DATA_UPLOAD', 'Import', 'Uploaded daily_production.csv', 'Success');
  }

  /**
   * Log a new action to the audit trail.
   */
  log(
    user: string, 
    role: UserRole, 
    action: string, 
    resource: string, 
    details: string, 
    status: 'Success' | 'Failed' | 'Denied' = 'Success'
  ) {
    this.addLog(user, role, action, resource, details, status);
  }

  /**
   * Internal helper to create the log entry object.
   */
  private addLog(
    user: string, 
    role: UserRole, 
    action: string, 
    resource: string, 
    details: string, 
    status: 'Success' | 'Failed' | 'Denied'
  ) {
    const entry: AuditLogEntry = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user,
      role,
      action,
      resource,
      details,
      status,
      // Simulate an IP hash for compliance tracking
      ipHash: Math.random().toString(36).substring(7) 
    };
    
    // Prepend to show newest first
    this.logs = [entry, ...this.logs];
    console.debug(`[Audit] ${action} by ${user} (${role}): ${status}`);
  }

  /**
   * Retrieve all logs. 
   * In a real app, this would fetch from a secure DB endpoint with pagination.
   */
  getLogs(): AuditLogEntry[] {
    return this.logs;
  }

  /**
   * Filter logs by resource or user.
   */
  filterLogs(query: string): AuditLogEntry[] {
    const q = query.toLowerCase();
    return this.logs.filter(log => 
      log.user.toLowerCase().includes(q) || 
      log.action.toLowerCase().includes(q) || 
      log.details.toLowerCase().includes(q)
    );
  }
}

export const auditService = new AuditService();
