export const USER_COLUMNS = `
  id, role, first_name AS "firstName", last_name AS "lastName",
  middle_name AS "middleName", student_id AS "studentId", email,
  college, program, year_level AS "yearLevel", department
`

export async function userById(pool, id) {
  const { rows } = await pool.query(`SELECT ${USER_COLUMNS} FROM ct_users WHERE id = $1`, [id])
  return rows[0] || null
}

export async function facultyList(pool) {
  const { rows } = await pool.query(`SELECT ${USER_COLUMNS} FROM ct_users WHERE role = 'faculty' ORDER BY last_name, first_name`)
  return rows
}
