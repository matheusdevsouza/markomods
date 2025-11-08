import { executeQuery } from '../config/database.js';
import { logError, logInfo } from '../config/logger.js';

export class RolePermissionsModel {
  static async findByRole(role) {
    try {
      const sql = `
        SELECT role, permissions, updated_at
        FROM role_permissions
        WHERE role = ?
      `;
      
      const [result] = await executeQuery(sql, [role]);
      
      if (!result) {
        return null;
      }
      
      return {
        role: result.role,
        permissions: typeof result.permissions === 'string' 
          ? JSON.parse(result.permissions) 
          : result.permissions,
        updated_at: result.updated_at
      };
    } catch (error) {
      logError('Erro ao buscar permissões do cargo', error, { role });
      throw error;
    }
  }

  static async updatePermissions(role, permissions) {
    try {
      const sql = `
        INSERT INTO role_permissions (role, permissions, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE 
          permissions = ?,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      const permissionsJson = JSON.stringify(permissions);
      await executeQuery(sql, [role, permissionsJson, permissionsJson]);
      
      logInfo('Permissões do cargo atualizadas', { role });
      return true;
    } catch (error) {
      logError('Erro ao atualizar permissões', error, { role });
      throw error;
    }
  }

  static async findAll() {
    try {
      const sql = `
        SELECT role, permissions, updated_at
        FROM role_permissions
        ORDER BY 
          CASE role
            WHEN 'admin' THEN 1
            WHEN 'supervisor' THEN 2
            WHEN 'moderator' THEN 3
            ELSE 4
          END
      `;
      
      const results = await executeQuery(sql);
      
      return results.map(result => ({
        role: result.role,
        permissions: typeof result.permissions === 'string'
          ? JSON.parse(result.permissions)
          : result.permissions,
        updated_at: result.updated_at
      }));
    } catch (error) {
      logError('Erro ao buscar todas as permissões', error);
      throw error;
    }
  }

  static async hasPermission(role, permission) {
    try {
      const rolePermissions = await this.findByRole(role);
      
      if (!rolePermissions) {
        return false;
      }
      
      return rolePermissions.permissions[permission] === true;
    } catch (error) {
      logError('Erro ao verificar permissão', error, { role, permission });
      return false;
    }
  }
}

