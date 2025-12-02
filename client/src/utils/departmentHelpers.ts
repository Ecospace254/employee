import { departments } from "@/data/departments";
import { PublicUser } from "@shared/schema";

/**
 * Extract department name from a role/job title
 */
export function extractDepartmentFromRole(role: string): string {
  const dept = departments.find(d => d.roles.includes(role));
  return dept?.name || "";
}

/**
 * Get department by ID
 */
export function getDepartmentById(id: string) {
  return departments.find(d => d.id === id);
}

/**
 * Get department by name
 */
export function getDepartmentByName(name: string) {
  return departments.find(d => d.name === name);
}

/**
 * Filter users by department name
 */
export function filterUsersByDepartment(users: PublicUser[], departmentName: string): PublicUser[] {
  return users.filter(user => user.department === departmentName);
}

/**
 * Get count of users in a department
 */
export function getDepartmentMemberCount(users: PublicUser[], departmentName: string): number {
  return filterUsersByDepartment(users, departmentName).length;
}

/**
 * Group users by department
 */
export function groupUsersByDepartment(users: PublicUser[]): Record<string, PublicUser[]> {
  const grouped: Record<string, PublicUser[]> = {};
  
  departments.forEach(dept => {
    grouped[dept.name] = filterUsersByDepartment(users, dept.name);
  });
  
  return grouped;
}

/**
 * Get all users without a valid department (for cleanup/migration)
 */
export function getUsersWithoutDepartment(users: PublicUser[]): PublicUser[] {
  const validDepartments = departments.map(d => d.name);
  return users.filter(user => !user.department || !validDepartments.includes(user.department));
}
