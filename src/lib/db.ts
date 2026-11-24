import sql from "mssql/msnodesqlv8";

const connectionString =
  process.env.DATABASE_URL ||
  "Driver={ODBC Driver 17 for SQL Server};Server=.\\SQLEXPRESS;Database=KarateClub;Trusted_Connection=yes;";

const config = {
  connectionString,
  driver: "msnodesqlv8",
  server: ".\\SQLEXPRESS",
  database: "KarateClub",
  options: {
    trustedConnection: true,
  },
} as unknown as sql.config;

let pool: Promise<sql.ConnectionPool> | null = null;

export async function getConnection(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = new sql.ConnectionPool(config)
      .connect()
      .catch((error: unknown) => {
        pool = null;
        throw error;
      });
  }

  return pool;
}

export { sql };
