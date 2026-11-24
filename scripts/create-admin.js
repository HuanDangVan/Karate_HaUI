const sql = require("mssql/msnodesqlv8");
const bcrypt = require("bcryptjs");

const config = {
  connectionString:
    "Driver={ODBC Driver 17 for SQL Server};Server=.\\SQLEXPRESS;Database=KarateClub;Trusted_Connection=yes;",
};

async function createAdmin() {
  const password = process.env.ADMIN_PASSWORD;

  if (!password || password.length < 8) {
    throw new Error("Mat khau phai co it nhat 8 ky tu.");
  }

  const email = "dangvanhuan.12102006@gmail.com";
  const hoTen = "Quản trị viên ĐVH";

  const pool = await new sql.ConnectionPool(config).connect();

  try {
    const check = await pool.request()
      .input("Email", sql.VarChar(150), email)
      .query("SELECT MaTaiKhoan FROM TaiKhoan WHERE Email = @Email");

    if (check.recordset.length > 0) {
      console.log("Tai khoan nay da ton tai, khong tao trung.");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.request()
      .input("HoTen", sql.NVarChar(150), hoTen)
      .input("Email", sql.VarChar(150), email)
      .input("MatKhauMaHoa", sql.NVarChar(255), passwordHash)
      .input("VaiTro", sql.VarChar(50), "quan_tri_vien")
      .input("TrangThai", sql.VarChar(50), "hoat_dong")
      .query(`
        INSERT INTO TaiKhoan
          (HoTen, Email, MatKhauMaHoa, VaiTro, TrangThai, NgayTao, NgayCapNhat)
        VALUES
          (@HoTen, @Email, @MatKhauMaHoa, @VaiTro, @TrangThai, SYSDATETIME(), SYSDATETIME())
      `);

    console.log("Tao tai khoan Admin thanh cong!");
    console.log("Ho ten:", hoTen);
    console.log("Email:", email);
    console.log("Vai tro: quan_tri_vien");
    console.log("Mat khau da duoc bam bang bcrypt.");
  } finally {
    await pool.close();
  }
}

createAdmin().catch((error) => {
  console.error("Khong the tao tai khoan:", error.message);
  process.exitCode = 1;
});
