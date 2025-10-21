// src/utils/roles.js

export const ROLES = {
  MESERO: 1,
  ADMINISTRADOR: 2
  // Puedes agregar más después: GERENTE: 3, SUPERVISOR: 4
};

// Permisos basados puramente en el ID del rol
export const PERMISSIONS = {
  // Módulo RH completo
  ACCESS_RH_MODULE: [ROLES.ADMINISTRADOR],
  
  // Gestión de empleados
  MANAGE_EMPLOYEES: [ROLES.ADMINISTRADOR],
  VIEW_EMPLOYEES: [ROLES.ADMINISTRADOR],
  
  // Horarios
  MANAGE_ALL_SCHEDULES: [ROLES.ADMINISTRADOR],
  VIEW_ALL_SCHEDULES: [ROLES.ADMINISTRADOR],
  VIEW_OWN_SCHEDULE: [ROLES.MESERO, ROLES.ADMINISTRADOR], // Meseros solo ven sus horarios
  
  // Reportes y nómina
  VIEW_REPORTS: [ROLES.ADMINISTRADOR],
  MANAGE_PAYROLL: [ROLES.ADMINISTRADOR]
};

// Función simple de verificación
export const hasPermission = (userRoleId, permission) => {
  return PERMISSIONS[permission]?.includes(userRoleId) || false;
};

// Funciones específicas para uso común
export const canAccessRH = (userRoleId) => hasPermission(userRoleId, 'ACCESS_RH_MODULE');
export const canManageEmployees = (userRoleId) => hasPermission(userRoleId, 'MANAGE_EMPLOYEES');
export const canViewAllSchedules = (userRoleId) => hasPermission(userRoleId, 'VIEW_ALL_SCHEDULES');
export const canViewOwnSchedule = (userRoleId) => hasPermission(userRoleId, 'VIEW_OWN_SCHEDULE');