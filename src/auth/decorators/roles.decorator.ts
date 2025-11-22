import { SetMetadata } from '@nestjs/common';
import { Roles } from '../../common/enums';

export const ROLES_KEY = 'roles';
export const RolesAllowed = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
