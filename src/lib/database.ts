import { db } from './varity';
import type { Project, Task, TeamMember, UserSettings } from '../types';

export const projects = () => db.collection<Project>('projects');
export const tasks = () => db.collection<Task>('tasks');
export const teamMembers = () => db.collection<TeamMember>('team_members');
export const userSettings = () => db.collection<UserSettings>('user_settings');
