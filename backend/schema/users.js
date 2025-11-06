
const createUsersTable = `

  CREATE TABLE IF NOT EXISTS users(
    id UUID PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    salt text NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);
`

export async function ensureUsersTable(pool) {
//   console.log("here's the error");
  await pool.query(createUsersTable);

}