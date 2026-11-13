import { query } from '@/libs/db';
import { Customer } from '@/types/billing/responses';
import { CreateCustomerDTO, UpdateCustomerDTO, CustomerQueryDTO } from '@/types/billing/dto';

/**
 * Clean Architecture - Service & Database Data Access Layer for Customers
 */
export class CustomerService {
  /**
   * Validation khi tạo hoặc cập nhật Khách hàng (Customer)
   */
  public static validateCustomer(req: Partial<CreateCustomerDTO>): {
    isValid: boolean;
    errorMessage?: string;
  } {
    if ('full_name' in req && req.full_name !== undefined) {
      if (!req.full_name || req.full_name.trim().length === 0) {
        return { isValid: false, errorMessage: 'Họ và tên khách hàng không được để trống.' };
      }
    }
    if (req.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.email)) {
        return { isValid: false, errorMessage: 'Địa chỉ email không đúng định dạng.' };
      }
    }
    return { isValid: true };
  }

  /**
   * Format customer database row to Customer DTO Response
   */
  public static formatCustomerResponse(row: any): Customer {
    return {
      id: String(row.id),
      full_name: row.full_name || '',
      email: row.email || null,
      phone_number: row.phone_number || row.phone || null,
      tax_code: row.tax_code || row.tax || null,
      company_name: row.company_name || null,
      address: row.address || null,
      city: row.city || null,
      country: row.country || 'VN',
      notes: row.notes || null,
      is_active: row.is_active ?? true,
      created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      deleted_at: row.deleted_at ? new Date(row.deleted_at).toISOString() : null,
      subscriptions_count: row.subscriptions_count ? Number(row.subscriptions_count) : 0,
      active_subscription: row.active_subscription || null,
    };
  }

  /**
   * Lấy danh sách khách hàng từ PostgreSQL
   */
  public static async findMany(params: CustomerQueryDTO) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    const conditions: string[] = ['deleted_at IS NULL'];
    const values: any[] = [];
    let paramIdx = 1;

    if (params.search && params.search.trim().length > 0) {
      const searchTerm = `%${params.search.trim()}%`;
      conditions.push(
        `(full_name ILIKE $${paramIdx} OR email ILIKE $${paramIdx} OR phone_number ILIKE $${paramIdx} OR tax_code ILIKE $${paramIdx} OR company_name ILIKE $${paramIdx})`
      );
      values.push(searchTerm);
      paramIdx++;
    }

    if (params.is_active !== undefined) {
      conditions.push(`is_active = $${paramIdx}`);
      values.push(params.is_active);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count total records
    const countResult = await query(
      `SELECT COUNT(*)::int AS total FROM customers ${whereClause}`,
      values
    );
    const totalRecords = countResult.rows[0]?.total || 0;
    const totalPages = Math.ceil(totalRecords / limit) || 1;

    // Query paginated rows with subscriptions_count
    const dataValues = [...values, limit, offset];
    const dataQuery = `
      SELECT c.*, 
        (SELECT COUNT(*)::int FROM subscriptions s WHERE s.customer_id = c.id AND s.deleted_at IS NULL) AS subscriptions_count
      FROM customers c
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${paramIdx} OFFSET $${paramIdx + 1}
    `;

    const result = await query(dataQuery, dataValues);
    const customers = result.rows.map(this.formatCustomerResponse);

    return {
      customers,
      pagination: {
        page,
        limit,
        total_records: totalRecords,
        total_pages: totalPages,
      },
    };
  }

  /**
   * Lấy thông tin khách hàng theo ID
   */
  public static async findById(id: string): Promise<Customer | null> {
    const res = await query(
      `SELECT c.*,
        (SELECT COUNT(*)::int FROM subscriptions s WHERE s.customer_id = c.id AND s.deleted_at IS NULL) AS subscriptions_count
       FROM customers c 
       WHERE c.id = $1 AND c.deleted_at IS NULL`,
      [id]
    );

    if (res.rows.length === 0) {
      return null;
    }

    return this.formatCustomerResponse(res.rows[0]);
  }

  /**
   * Tạo khách hàng mới vào cơ sở dữ liệu Neon
   */
  public static async create(data: CreateCustomerDTO): Promise<Customer> {
    const id = Date.now().toString(); // Generate unique Snowflake-compatible ID
    const res = await query(
      `INSERT INTO customers (
        id, full_name, email, phone_number, address, tax_code, company_name, notes, is_active, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [
        id,
        data.full_name.trim(),
        data.email ? data.email.trim() : null,
        data.phone_number ? data.phone_number.trim() : null,
        data.address ? data.address.trim() : null,
        data.tax_code ? data.tax_code.trim() : null,
        data.company_name ? data.company_name.trim() : null,
        data.notes ? data.notes.trim() : null,
        data.is_active ?? true,
      ]
    );

    return this.formatCustomerResponse(res.rows[0]);
  }

  /**
   * Cập nhật thông tin khách hàng trong cơ sở dữ liệu
   */
  public static async update(id: string, data: UpdateCustomerDTO): Promise<Customer | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.full_name !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(data.full_name.trim());
    }
    if (data.email !== undefined) {
      fields.push(`email = $${idx++}`);
      values.push(data.email ? data.email.trim() : null);
    }
    if (data.phone_number !== undefined) {
      fields.push(`phone_number = $${idx++}`);
      values.push(data.phone_number ? data.phone_number.trim() : null);
    }
    if (data.address !== undefined) {
      fields.push(`address = $${idx++}`);
      values.push(data.address ? data.address.trim() : null);
    }
    if (data.tax_code !== undefined) {
      fields.push(`tax_code = $${idx++}`);
      values.push(data.tax_code ? data.tax_code.trim() : null);
    }
    if (data.company_name !== undefined) {
      fields.push(`company_name = $${idx++}`);
      values.push(data.company_name ? data.company_name.trim() : null);
    }
    if (data.notes !== undefined) {
      fields.push(`notes = $${idx++}`);
      values.push(data.notes ? data.notes.trim() : null);
    }
    if (data.is_active !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(data.is_active);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `UPDATE customers SET ${fields.join(', ')} WHERE id = $${idx} AND deleted_at IS NULL RETURNING *`;
    const res = await query(sql, values);

    if (res.rows.length === 0) {
      return null;
    }

    return this.formatCustomerResponse(res.rows[0]);
  }

  /**
   * Xóa khách hàng (Soft delete)
   */
  public static async delete(id: string): Promise<boolean> {
    const res = await query(
      `UPDATE customers SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
      [id]
    );
    return res.rows.length > 0;
  }
}
