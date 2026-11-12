import { NextResponse } from "next/server";
import { getConnection } from "@/lib/db";

export async function GET() {
  try {
    const pool = await getConnection();

    // 1. Thong tin database va thoi gian he thong
    const infoResult = await pool.request().query(`
      SELECT
        DB_NAME() AS DatabaseName,
        GETDATE() AS ServerTime,
        COUNT(*) AS TotalTables
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);

    // 2. Thuc hien SELECT TOP 5 * FROM TaiKhoan theo yeu cau
    const taiKhoanResult = await pool.request().query(`
      SELECT TOP 5 * FROM TaiKhoan
    `);

    // 3. Lay danh sach cac cot cua bang TaiKhoan
    const columnsResult = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'TaiKhoan'
      ORDER BY ORDINAL_POSITION
    `);

    return NextResponse.json({
      success: true,
      message: "Ket noi SQL Server va doc du lieu thanh cong",
      database: infoResult.recordset[0],
      queryTest: {
        command: "SELECT TOP 5 * FROM TaiKhoan",
        rowCount: taiKhoanResult.recordset.length,
        rows: taiKhoanResult.recordset,
        tableColumns: columnsResult.recordset.map(
          (col: { COLUMN_NAME: string; DATA_TYPE: string }) =>
            `${col.COLUMN_NAME} (${col.DATA_TYPE})`
        ),
      },
    });
  } catch (error) {
    console.error("Database connection/query error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Khong the ket noi hoac doc du lieu tu SQL Server",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
