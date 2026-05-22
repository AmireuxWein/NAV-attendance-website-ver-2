import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFirstName = (fullName: string) => {
  if (!fullName) return '';
  const parts = fullName.trim().split(' ');
  return parts[parts.length - 1].toLowerCase();
};

import { DEFAULT_GROUPS } from './constants';

export const sortStudentsGlobal = <T extends { name: string; group?: string }>(students: T[]): T[] => {
  const defaultOrder = DEFAULT_GROUPS;

  return [...students].sort((a, b) => {
    // 1. Sort by group
    const groupAIndex = a.group ? defaultOrder.indexOf(a.group) : -1;
    const groupBIndex = b.group ? defaultOrder.indexOf(b.group) : -1;

    const aVal = groupAIndex === -1 ? 999 : groupAIndex;
    const bVal = groupBIndex === -1 ? 999 : groupBIndex;

    if (aVal !== bVal) {
      return aVal - bVal;
    }

    // 2. Sort by first name A-Z
    const firstNameA = getFirstName(a.name);
    const firstNameB = getFirstName(b.name);
    return firstNameA.localeCompare(firstNameB, 'vi');
  });
};
