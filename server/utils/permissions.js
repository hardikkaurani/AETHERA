export const writableProjectRoles = ['owner', 'admin', 'manager', 'developer'];
export const memberManagerRoles = ['owner', 'admin', 'manager'];

export const canWriteProjectContent = (role) => writableProjectRoles.includes(role);
export const canManageProjectMembers = (role) => memberManagerRoles.includes(role);
